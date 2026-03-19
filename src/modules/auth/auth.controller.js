import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../../utils/email.js';
import { v4 as uuidv4 } from 'uuid';
import { validatePasswordStrength } from '../../utils/password.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        firstName,
        lastName,
        verificationCode,
        verificationCodeExpiresAt: expiresAt,
        isActive: true,
        wallet: { create: { balance: 0 } }
      }
    });

    // Envoyer l'email de vérification
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie. Veuillez vérifier votre email.',
      data: { userId: user.id, email: user.email }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email déjà vérifié' });
    }

    if (user.verificationCode !== code || user.verificationCodeExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Code invalide ou expiré' });
    }

    const updateData = {
      isVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null
    };

    // Créer le profil associé en fonction du rôle
    if (user.role === 'TEACHER') {
      updateData.teacherProfile = {
        create: {
          subjects: '[]',
          levels: '[]',
          validationStatus: 'PENDING'
        }
      };
    } else if (user.role === 'PARENT') {
      updateData.parentProfile = { create: {} };
    } else if (user.role === 'STUDENT') {
      updateData.studentProfile = { create: {} };
    } else if (user.role === 'SCHOOL') {
      updateData.schoolProfile = { create: {} };
    }

    await prisma.user.update({
      where: { email },
      data: updateData
    });

    res.json({ success: true, message: 'Email vérifié avec succès' });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email déjà vérifié' });
    }
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    
    await prisma.user.update({
      where: { email },
      data: {
        verificationCode,
        verificationCodeExpiresAt: expiresAt
      }
    });
    
    await sendVerificationEmail(email, verificationCode);
    
    res.json({ success: true, message: 'Nouveau code envoyé avec succès' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
        schoolProfile: true
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Veuillez vérifier votre email avant de vous connecter', needsVerification: true });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = uuidv4();
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          teacherProfile: user.teacherProfile,
          studentProfile: user.studentProfile,
          parentProfile: user.parentProfile,
          schoolProfile: user.schoolProfile
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.session.deleteMany({ where: { refreshToken } });
    }
    res.json({ success: true, message: 'Déconnexion réussie' });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
        schoolProfile: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1h

    await prisma.user.update({
      where: { email },
      data: {
        resetCode,
        resetCodeExpiresAt: expiresAt
      }
    });

    await sendResetPasswordEmail(email, resetCode);

    res.json({ 
      success: true, 
      message: 'Un code de récupération a été envoyé sur votre email',
      data: { email }
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetCode !== code || user.resetCodeExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Code invalide ou expiré' });
    }

    // Valider la force du mot de passe
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le mot de passe ne respecte pas les critères',
        errors: passwordCheck.errors 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiresAt: null
      }
    });

    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token manquant' });
    }

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(403).json({ success: false, message: 'Session invalide ou expirée' });
    }

    const newAccessToken = jwt.sign(
      { userId: session.user.id, role: session.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: { accessToken: newAccessToken }
    });
  } catch (error) {
    next(error);
  }
};