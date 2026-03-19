import prisma from '../../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from '../../utils/email.js';


/**
 * Créer un compte enfant (élève)
 * POST /api/v1/children
 */
export const createChild = async (req, res) => {
  try {
    const { firstName, lastName, email, password, grade } = req.body;
    const parentUserId = req.user.id; // Depuis le token JWT

    // Validation
    if (!firstName || !lastName || !email || !password || !grade) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis (firstName, lastName, email, password, grade)',
      });
    }

    // Vérifier que le parent existe et a bien le rôle PARENT
    const parentUser = await prisma.user.findUnique({
      where: { id: parentUserId },
      include: { parentProfile: true },
    });

    if (!parentUser || parentUser.role !== 'PARENT') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les parents peuvent créer des comptes enfants',
      });
    }

    if (!parentUser.parentProfile) {
      return res.status(500).json({
        success: false,
        message: 'Profil parent non trouvé',
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé',
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur enfant en transaction
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer le User avec role STUDENT
      const childUser = await tx.user.create({
        data: {
          id: uuidv4(),
          email,
          password: hashedPassword,
          role: 'STUDENT',
          firstName,
          lastName,
          isVerified: false, // Doit vérifier son email
          verificationCode,
          verificationCodeExpiresAt: expiresAt,
          isActive: true,
        },
      });

      // 2. Créer le StudentProfile
      const studentProfile = await tx.studentProfile.create({
        data: {
          id: uuidv4(),
          userId: childUser.id,
          grade,
          subjects: JSON.stringify([]),
        },
      });

      // 3. Créer le lien StudentParentLink
      await tx.studentParentLink.create({
        data: {
          id: uuidv4(),
          studentId: studentProfile.id,
          parentId: parentUser.parentProfile.id,
          relationship: 'parent',
        },
      });

      return { childUser, studentProfile };
    });

    // Retourner les infos de l'enfant créé (sans le mot de passe)
    const { password: _, ...childWithoutPassword } = result.childUser;

    // Envoyer l'email de vérification
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      success: true,
      message: 'Compte enfant créé avec succès. Un code de vérification a été envoyé à son adresse email.',
      data: { 
        child: {
          ...childWithoutPassword,
          grade,
        }
      }
    });
  } catch (error) {
    console.error('Erreur création enfant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte enfant',
      error: error.message,
    });
  }
};

/**
 * Récupérer tous les enfants d'un parent
 * GET /api/v1/children
 */
export const getChildren = async (req, res) => {
  try {
    const parentUserId = req.user.id; // Depuis le token JWT

    // Vérifier que le parent existe
    const parentUser = await prisma.user.findUnique({
      where: { id: parentUserId },
      include: { parentProfile: true },
    });

    if (!parentUser || parentUser.role !== 'PARENT') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les parents peuvent accéder aux comptes enfants',
      });
    }

    if (!parentUser.parentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil parent non trouvé',
      });
    }

    // Récupérer tous les enfants liés à ce parent
    const childrenLinks = await prisma.studentParentLink.findMany({
      where: {
        parentId: parentUser.parentProfile.id,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    // Formater les données pour le frontend
    const children = childrenLinks.map((link) => ({
      id: link.student.user.id,
      studentProfileId: link.student.id,
      firstName: link.student.user.firstName,
      lastName: link.student.user.lastName,
      email: link.student.user.email,
      grade: link.student.grade,
      schoolName: link.student.schoolName || 'Non renseigné',
      subjects: link.student.subjects ? JSON.parse(link.student.subjects) : [],
      createdAt: link.student.user.createdAt,
    }));

    res.json({
      success: true,
      children,
      count: children.length,
    });
  } catch (error) {
    console.error('Erreur récupération enfants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des enfants',
      error: error.message,
    });
  }
};

/**
 * Supprimer un compte enfant
 * DELETE /api/v1/children/:childId
 */
export const deleteChild = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentUserId = req.user.id;

    // Vérifier que le parent possède bien cet enfant
    const parentUser = await prisma.user.findUnique({
      where: { id: parentUserId },
      include: { parentProfile: true },
    });

    if (!parentUser || !parentUser.parentProfile) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }

    const childUser = await prisma.user.findUnique({
      where: { id: childId },
      include: { studentProfile: true },
    });

    if (!childUser || childUser.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Enfant non trouvé',
      });
    }

    // Vérifier le lien parent-enfant
    const link = await prisma.studentParentLink.findFirst({
      where: {
        studentId: childUser.studentProfile.id,
        parentId: parentUser.parentProfile.id,
      },
    });

    if (!link) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer cet enfant',
      });
    }

    // Supprimer l'utilisateur (cascade supprimera le profil et les liens)
    await prisma.user.delete({
      where: { id: childId },
    });

    res.json({
      success: true,
      message: 'Compte enfant supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression enfant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'enfant',
      error: error.message,
    });
  }
};
