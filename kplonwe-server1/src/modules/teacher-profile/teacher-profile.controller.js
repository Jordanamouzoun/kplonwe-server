import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * Récupérer le profil public d'un professeur
 * GET /api/v1/teachers/:teacherId/profile
 */
export const getTeacherProfile = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'ID du professeur requis',
      });
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    
    // 404 UNIQUEMENT si le professeur n'existe pas en base
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Professeur non trouvé',
      });
    }
    
    // parseArray: garantit TOUJOURS un vrai tableau (jamais null, string, ou undefined)
    const parseArray = (value) => {
      if (!value) return [];
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const profile = {
      ...teacher,
      bio:            teacher.bio            || null,
      experience:     teacher.experience     || null,
      education:      teacher.education      || null,
      pricePerMonth:  teacher.pricePerMonth  || null,
      subjects:       parseArray(teacher.subjects),
      certifications: parseArray(teacher.certifications),
      levels:         parseArray(teacher.levels),
    };
    
    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message,
    });
  }
};

/**
 * Mettre à jour son propre profil (professeur connecté)
 * PUT /api/v1/teachers/profile
 */
export const updateTeacherProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, subjects, experience, education, certifications, pricePerMonth, levels } = req.body;
    
    // Vérifier que l'utilisateur est professeur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacherProfile: true },
    });
    
    if (!user || user.role !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les professeurs peuvent modifier leur profil',
      });
    }
    
    if (!user.teacherProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil professeur non trouvé',
      });
    }
    
    // Mettre à jour
    const updated = await prisma.teacherProfile.update({
      where: { id: user.teacherProfile.id },
      data: {
        bio: bio || user.teacherProfile.bio,
        subjects: subjects ? JSON.stringify(subjects) : user.teacherProfile.subjects,
        experience: experience !== undefined ? experience : user.teacherProfile.experience,
        education: education || user.teacherProfile.education,
        certifications: certifications ? JSON.stringify(certifications) : user.teacherProfile.certifications,
        pricePerMonth: pricePerMonth !== undefined ? pricePerMonth : user.teacherProfile.pricePerMonth,
        levels: levels ? JSON.stringify(levels) : user.teacherProfile.levels,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    
    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      profile: {
        ...updated,
        subjects: updated.subjects ? JSON.parse(updated.subjects) : [],
        certifications: updated.certifications ? JSON.parse(updated.certifications) : [],
        levels: updated.levels ? JSON.parse(updated.levels) : [],
      },
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message,
    });
  }
};

/**
 * Récupérer son propre profil (professeur connecté)
 * GET /api/v1/teachers/profile
 */
export const getOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          include: {
            teacherDocuments: true,
          },
        },
      },
    });
    
    if (!user || !user.teacherProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil professeur non trouvé',
      });
    }
    
    const profile = {
      ...user.teacherProfile,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
      subjects: user.teacherProfile.subjects ? JSON.parse(user.teacherProfile.subjects) : [],
      certifications: user.teacherProfile.certifications ? JSON.parse(user.teacherProfile.certifications) : [],
    };
    
    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message,
    });
  }
};

/**
 * Rechercher des professeurs (Parents & Écoles)
 * GET /api/v1/teachers/search?subject=xxx&level=xxx
 */
export const searchTeachers = async (req, res) => {
  try {
    const { subject, level, status } = req.query;
    
    // Recherche publique : UNIQUEMENT les professeurs VERIFIED
    let teachers = await prisma.teacherProfile.findMany({
      where: { validationStatus: 'VERIFIED' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { isPremium: 'desc' }, // Premium en premier
        { rating: 'desc' },
      ],
    });
    
    // Filtrer par matière
    if (subject) {
      teachers = teachers.filter(t => {
        const subjects = t.subjects ? JSON.parse(t.subjects) : [];
        return subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()));
      });
    }
    
    // Filtrer par niveau
    if (level) {
      teachers = teachers.filter(t => {
        const levels = t.levels ? JSON.parse(t.levels) : [];
        return levels.some(l => l.toLowerCase().includes(level.toLowerCase()));
      });
    }
    
    // Formater réponse
    const formattedTeachers = teachers.map(t => ({
      ...t,
      subjects: t.subjects ? JSON.parse(t.subjects) : [],
      levels: t.levels ? JSON.parse(t.levels) : [],
      certifications: t.certifications ? JSON.parse(t.certifications) : [],
    }));
    
    res.json({
      success: true,
      teachers: formattedTeachers,
      count: formattedTeachers.length,
    });
  } catch (error) {
    console.error('Erreur recherche professeurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error.message,
    });
  }
};

/**
 * Upload photo de profil
 * POST /api/v1/teachers/profile/avatar
 */
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune photo fournie',
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacherProfile: true },
    });
    
    if (!user || user.role !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les professeurs peuvent uploader une photo',
      });
    }
    
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });
    
    res.json({
      success: true,
      message: 'Photo de profil mise à jour avec succès',
      avatar: avatarPath,
      user: updated,
    });
  } catch (error) {
    console.error('Erreur upload avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload de la photo',
      error: error.message,
    });
  }
};

/**
 * Obtenir son propre profil public (avec ID du profil)
 * GET /api/v1/teachers/me/profile
 */
export const getMyPublicProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Trouver le profil du professeur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    
    if (!user || !user.teacherProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil professeur non trouvé',
      });
    }
    
    const teacher = user.teacherProfile;
    
    // Parser JSON fields
    const profile = {
      ...teacher,
      subjects: teacher.subjects ? JSON.parse(teacher.subjects) : [],
      certifications: teacher.certifications ? JSON.parse(teacher.certifications) : [],
      levels: teacher.levels ? JSON.parse(teacher.levels) : [],
    };
    
    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message,
    });
  }
};
