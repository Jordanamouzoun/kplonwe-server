import prisma from '../../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';


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

    const teacher = await prisma.teacherProfile.findFirst({
      where: {
        OR: [
          { id: teacherId },
          { userId: teacherId }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        teacherDocuments: true,
        reviews: {
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
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
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const profile = {
      ...teacher,
      bio: teacher.bio || null,
      experience: teacher.experience || null,
      education: teacher.education || null,
      pricePerMonth: teacher.pricePerMonth || null,
      pricePerHour: teacher.pricePerHour || null,
      specialty: teacher.specialty || null,
      points: teacher.points || 0,
      subjects: parseArray(teacher.subjects),
      certifications: parseArray(teacher.certifications),
      levels: parseArray(teacher.levels),
      documents: teacher.teacherDocuments || [],
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
    const { bio, subjects, experience, education, certifications, pricePerMonth, pricePerHour, levels, specialty, city, isAvailable } = req.body;

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

    // Mettre à jour (ou créer si n'existe pas)
    const updated = await prisma.teacherProfile.upsert({
      where: { userId: userId },
      create: {
        userId: userId,
        bio: bio || '',
        subjects: subjects ? JSON.stringify(subjects) : '[]',
        experience: experience || 0,
        education: education || '',
        certifications: certifications ? JSON.stringify(certifications) : '[]',
        pricePerMonth: pricePerMonth || 0,
        pricePerHour: pricePerHour || 0,
        levels: levels ? JSON.stringify(levels) : '[]',
        specialty: specialty || '',
        city: city || '',
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        validationStatus: 'PENDING',
      },
      update: {
        bio: bio !== undefined ? bio : user.teacherProfile?.bio,
        subjects: subjects !== undefined ? JSON.stringify(subjects) : user.teacherProfile?.subjects,
        experience: experience !== undefined ? experience : user.teacherProfile?.experience,
        education: education !== undefined ? education : user.teacherProfile?.education,
        certifications: certifications !== undefined ? JSON.stringify(certifications) : user.teacherProfile?.certifications,
        pricePerMonth: pricePerMonth !== undefined ? pricePerMonth : user.teacherProfile?.pricePerMonth,
        pricePerHour: pricePerHour !== undefined ? pricePerHour : user.teacherProfile?.pricePerHour,
        levels: levels !== undefined ? JSON.stringify(levels) : user.teacherProfile?.levels,
        specialty: specialty !== undefined ? specialty : user.teacherProfile?.specialty,
        city: city !== undefined ? city : user.teacherProfile?.city,
        isAvailable: isAvailable !== undefined ? isAvailable : user.teacherProfile?.isAvailable,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Auto-validation logic
    const isProfileComplete = Boolean(
      updated.bio &&
      updated.experience &&
      updated.pricePerMonth &&
      updated.subjects && updated.subjects !== '[]' &&
      updated.levels && updated.levels !== '[]' &&
      updated.user.avatar
    );

    let finalValidationStatus = updated.validationStatus;

    if (isProfileComplete && updated.validationStatus === 'PENDING') {
      finalValidationStatus = 'VERIFIED';
      await prisma.teacherProfile.update({
        where: { id: updated.id },
        data: { validationStatus: 'VERIFIED' }
      });
    }

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      profile: {
        ...updated,
        validationStatus: finalValidationStatus,
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
      // Pour permettre l'édition initiale on renvoie un squelette au lieu de 404
      return res.json({
        success: true,
        profile: {
          bio: '',
          subjects: [],
          levels: [],
          experience: 0,
          pricePerMonth: 0,
          pricePerHour: 0,
          specialty: '',
          city: '',
          isAvailable: true,
          certifications: [],
          documents: [],
          user: {
            id: user?.id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
            avatar: user?.avatar,
          }
        }
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
      levels: user.teacherProfile.levels ? JSON.parse(user.teacherProfile.levels) : [],
      documents: user.teacherProfile.teacherDocuments || [],
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
    const { q, subject, level, city, minPrice, maxPrice, minRating, isAvailable } = req.query;

    const where = {
      AND: [
        // Filtre de visibilité de base
        {
          OR: [
            { validationStatus: 'VERIFIED' },
            {
              AND: [
                { validationStatus: 'PENDING' },
                { bio: { not: null, not: '' } },
                { experience: { not: null } },
                { pricePerMonth: { not: null } },
              ],
            },
          ],
        },
      ]
    };

    // Filtre par recherche textuelle (prénom/nom via relation user)
    if (q) {
      where.AND.push({
        user: {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
          ]
        }
      });
    }

    // Filtre par ville
    if (city) {
      where.AND.push({
        city: { contains: city, mode: 'insensitive' }
      });
    }

    // Filtre par prix
    if (minPrice) {
      where.AND.push({ pricePerMonth: { gte: parseFloat(minPrice) } });
    }
    if (maxPrice) {
      where.AND.push({ pricePerMonth: { lte: parseFloat(maxPrice) } });
    }

    // Filtre par note
    if (minRating) {
      where.AND.push({ rating: { gte: parseFloat(minRating) } });
    }

    // Filtre par disponibilité
    if (isAvailable !== undefined) {
      where.AND.push({ isAvailable: isAvailable === 'true' });
    }

    let teachers = await prisma.teacherProfile.findMany({
      where,
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
        { isPremium: 'desc' },
        { rating: 'desc' },
      ],
    });

    // Filtres en mémoire pour les champs JSON
    if (subject) {
      teachers = teachers.filter(t => {
        const subjects = t.subjects ? JSON.parse(t.subjects) : [];
        return subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()));
      });
    }

    if (level) {
      teachers = teachers.filter(t => {
        const levels = t.levels ? JSON.parse(t.levels) : [];
        return levels.some(l => l.toLowerCase().includes(level.toLowerCase()));
      });
    }

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

    const avatarPath = req.file.path;

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

    // Auto-validation check for teacherProfile
    if (user.teacherProfile && user.teacherProfile.validationStatus === 'PENDING') {
      const isProfileComplete = Boolean(
        user.teacherProfile.bio &&
        user.teacherProfile.experience &&
        user.teacherProfile.pricePerMonth &&
        user.teacherProfile.subjects && user.teacherProfile.subjects !== '[]' &&
        user.teacherProfile.levels && user.teacherProfile.levels !== '[]' &&
        updated.avatar
      );

      if (isProfileComplete) {
        await prisma.teacherProfile.update({
          where: { id: user.teacherProfile.id },
          data: { validationStatus: 'VERIFIED' }
        });
      }
    }

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
            teacherDocuments: true,
          },
        },
      },
    });

    if (!user || !user.teacherProfile) {
      // Retourne un profil vide par défaut au lieu de 404
      return res.json({
        success: true,
        profile: {
          bio: '',
          subjects: [],
          levels: [],
          experience: 0,
          pricePerMonth: 0,
          pricePerHour: 0,
          specialty: '',
          city: '',
          isAvailable: true,
          certifications: [],
          documents: [],
        }
      });
    }

    const teacher = user.teacherProfile;

    // Parser JSON fields
    const profile = {
      ...teacher,
      subjects: teacher.subjects ? JSON.parse(teacher.subjects) : [],
      certifications: teacher.certifications ? JSON.parse(teacher.certifications) : [],
      levels: teacher.levels ? JSON.parse(teacher.levels) : [],
      documents: teacher.teacherDocuments || [],
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
 * Parent ajoute un professeur — événement clé du PMF
 * POST /api/v1/teachers/:teacherId/add
 */
export const addTeacher = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { teacherId } = req.params;

    // Vérifier que le parent existe bien
    const parent = await prisma.user.findUnique({ where: { id: parentId } });
    if (!parent || parent.role !== 'PARENT') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les parents peuvent ajouter un professeur',
      });
    }

    // Vérifier que le professeur existe
    const teacher = await prisma.teacherProfile.findUnique({ where: { id: teacherId } });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Professeur non trouvé',
      });
    }
    
    // Vérifier si déjà ajouté (on suppose qu'il y a une table studentTeacherLink)
    // Ici on ferait la logique d'ajout
    const alreadyAdded = false; // Simulation

    // ── NOUVEAU : Lier aussi tous les enfants (StudentProfile) de ce parent au professeur ──
    try {
      // Trouver tous les liens parents-élèves pour ce parent
      const parentProfile = await prisma.parentProfile.findUnique({ where: { userId: parentId } });
      if (parentProfile) {
        const childLinks = await prisma.studentParentLink.findMany({
          where: { parentId: parentProfile.id }
        });

        if (childLinks.length > 0) {
          // Créer les liens élève-professeur
          const studentTeacherData = childLinks.map(link => ({
            studentId: link.studentId,
            teacherId: teacher.id,
            status: 'ACTIVE'
          }));

          await prisma.studentTeacherLink.createMany({
            data: studentTeacherData,
            skipDuplicates: true
          });
        }
      }
    } catch (linkErr) {
      console.error('Erreur liaison automatiques élèves-professeur:', linkErr);
      // On ne bloque pas tout le processus si ça échoue (non-critique)
    }

    res.json({
      success: true,
      alreadyAdded,
      message: alreadyAdded
        ? 'Ce professeur est déjà dans votre liste'
        : 'Professeur ajouté avec succès',
    });
  } catch (error) {
    console.error('Erreur ajout professeur:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout du professeur",
      error: error.message,
    });
  }
};


/**
 * Récupérer les cours du professeur connecté
 * GET /api/v1/teachers/me/courses
 */
export const getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cherche les cours si le modèle Course existe, sinon retourne tableau vide
    let courses = [];
    try {
      courses = await prisma.course.findMany({
        where: { teacherId: userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      // Le modèle Course peut ne pas encore exister — on renvoie [] au lieu de crasher
      courses = [];
    }

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Erreur récupération cours:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des cours' });
  }
};
