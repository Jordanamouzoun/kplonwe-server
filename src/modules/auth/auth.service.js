import prisma from '../../lib/prisma.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../../utils/password.js';
import { isValidEmail } from '../../utils/validation.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../../config/jwt.js';
import { AppError } from '../../middlewares/error.middleware.js';


export const registerUser = async (data) => {
  const { email, password, role, firstName, lastName, phone } = data;

  if (!email || !isValidEmail(email)) {
    throw new AppError('Email invalide', 400);
  }

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.isValid) {
    throw new AppError(passwordCheck.errors.join(', '), 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Cet email est déjà utilisé', 409);
  }

  const hashedPassword = await hashPassword(password);
  const userData = {
    email,
    password: hashedPassword,
    role: role || 'STUDENT',
    firstName,
    lastName,
    phone,
    wallet: { create: { balance: 0 } }
  };

  // Créer le profil selon le rôle avec valeurs par défaut
  if (role === 'TEACHER') {
    userData.teacherProfile = { 
      create: { 
        subjects: '[]' // JSON array vide par défaut
      } 
    };
  }
  if (role === 'PARENT') userData.parentProfile = { create: {} };
  if (role === 'STUDENT') userData.studentProfile = { create: {} };
  if (role === 'SCHOOL') {
    userData.schoolProfile = { 
      create: {
        schoolName: `${firstName} ${lastName}` // Nom par défaut
      } 
    };
  }

  const user = await prisma.user.create({ 
    data: userData, 
    include: {
      teacherProfile: true,
      parentProfile: true,
      studentProfile: true,
      schoolProfile: true,
    }
  });

  const accessToken = generateToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });

  await prisma.session.create({
    data: { 
      userId: user.id, 
      refreshToken, 
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
    }
  });

  const { password: _pwd, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const loginUser = async (email, password) => {
  // Récupérer user avec tous les profils dès le login
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      teacherProfile: true,
      parentProfile: true,
      studentProfile: true,
      schoolProfile: true,
    }
  });
  if (!user) throw new AppError('Email ou mot de passe incorrect', 401);

  const isValid = await comparePassword(password, user.password);
  if (!isValid) throw new AppError('Email ou mot de passe incorrect', 401);

  if (!user.isActive) throw new AppError('Compte désactivé', 403);

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  const accessToken = generateToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });

  await prisma.session.create({
    data: { 
      userId: user.id, 
      refreshToken, 
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
    }
  });

  const { password: _pwd, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  const session = await prisma.session.findUnique({ where: { refreshToken } });
  
  if (!session || session.expiresAt < new Date()) {
    throw new AppError('Session expirée', 401);
  }

  const user = await prisma.user.findUnique({ 
    where: { id: decoded.userId }, 
    select: { id: true, email: true, role: true } 
  });
  
  if (!user) throw new AppError('Utilisateur introuvable', 401);

  const accessToken = generateToken({ userId: user.id, email: user.email, role: user.role });
  return { accessToken };
};

export const logoutUser = async (userId) => {
  await prisma.session.deleteMany({ where: { userId } });
};

export const getUserProfile = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, 
      email: true, 
      role: true, 
      firstName: true, 
      lastName: true, 
      phone: true,
      avatar: true,          // ← manquait : photo de profil
      isVerified: true, 
      termsAccepted: true, 
      teacherProfile: true, 
      parentProfile: true,
      studentProfile: true, 
      schoolProfile: true, 
      wallet: { select: { balance: true } }
    }
  });
};

export const acceptTerms = async (userId, version) => {
  await prisma.user.update({
    where: { id: userId },
    data: { 
      termsAccepted: true, 
      termsAcceptedAt: new Date(), 
      termsVersion: version || '1.0' 
    }
  });
};