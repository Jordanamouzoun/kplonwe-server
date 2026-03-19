import prisma from '../../lib/prisma.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { hashPassword } from '../../utils/password.js';


// ── STATS ──────────────────────────────────────────────────────────────────

export const getGlobalStats = async () => {
  const [
    totalTeachers,
    verifiedTeachers,
    pendingTeachers,
    rejectedTeachers,
    totalParents,
    totalSchools,
    totalAdmins,
    totalStudents,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.teacherProfile.count({ where: { validationStatus: 'VERIFIED' } }),
    prisma.teacherProfile.count({ where: { validationStatus: 'PENDING' } }),
    prisma.teacherProfile.count({ where: { validationStatus: 'REJECTED' } }),
    prisma.user.count({ where: { role: 'PARENT' } }),
    prisma.user.count({ where: { role: 'SCHOOL' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
  ]);

  return {
    totalTeachers,
    verifiedTeachers,
    pendingTeachers,
    rejectedTeachers,
    totalParents,
    totalSchools,
    totalAdmins,
    totalStudents,
  };
};

// ── TEACHERS ───────────────────────────────────────────────────────────────

export const getAllTeachers = async () => {
  return await prisma.teacherProfile.findMany({
    include: {
      user: {
        select: {
          id: true, email: true, firstName: true, lastName: true,
          phone: true, avatar: true, createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getPendingTeachers = async () => {
  return await prisma.teacherProfile.findMany({
    where: { validationStatus: 'PENDING' },
    include: {
      user: {
        select: {
          id: true, email: true, firstName: true, lastName: true,
          phone: true, createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getTeacherDetails = async (teacherId) => {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    include: {
      user: {
        select: {
          id: true, email: true, firstName: true, lastName: true,
          phone: true, avatar: true, createdAt: true,
        },
      },
      teacherDocuments: true,
    },
  });
  if (!teacher) throw new AppError('Enseignant introuvable', 404);
  return teacher;
};

export const validateTeacher = async (teacherId, adminId, comment) => {
  const teacher = await prisma.teacherProfile.findUnique({ where: { id: teacherId } });
  if (!teacher) throw new AppError('Enseignant introuvable', 404);

  await prisma.teacherProfile.update({
    where: { id: teacherId },
    data: {
      validationStatus: 'VERIFIED',
      validatedBy: adminId,
      validatedAt: new Date(),
      validationComment: comment || null,
      rating: teacher.rating <= 1.0 ? 3.0 : teacher.rating, // Initial 3 stars upon certification
    },
  });

  // Auto-valider tous les documents PENDING du professeur
  // Sinon les parents/écoles ne voient aucun document (filtre VERIFIED uniquement)
  await prisma.teacherDocument.updateMany({
    where: {
      teacherId,
      status: 'PENDING',
    },
    data: {
      status: 'VERIFIED',
      verifiedBy: adminId,
      verifiedAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: teacher.userId,
      type: 'TEACHER_VALIDATED',
      title: 'Profil validé !',
      message: 'Votre profil enseignant a été validé. Vous apparaissez maintenant dans les recherches.',
    },
  });
};

export const rejectTeacher = async (teacherId, adminId, comment) => {
  const teacher = await prisma.teacherProfile.findUnique({ where: { id: teacherId } });
  if (!teacher) throw new AppError('Enseignant introuvable', 404);

  await prisma.teacherProfile.update({
    where: { id: teacherId },
    data: {
      validationStatus: 'REJECTED',
      validatedBy: adminId,
      validatedAt: new Date(),
      validationComment: comment || 'Profil non conforme',
    },
  });

  await prisma.notification.create({
    data: {
      userId: teacher.userId,
      type: 'TEACHER_REJECTED',
      title: 'Profil refusé',
      message: comment
        ? `Votre profil a été refusé. Raison : ${comment}`
        : "Votre profil n'a pas été accepté. Veuillez le compléter et soumettre à nouveau.",
    },
  });
};

// ── PARENTS ────────────────────────────────────────────────────────────────

export const getAllParents = async () => {
  return await prisma.user.findMany({
    where: { role: 'PARENT' },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, createdAt: true, isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

// ── SCHOOLS ────────────────────────────────────────────────────────────────

export const getAllSchools = async () => {
  return await prisma.user.findMany({
    where: { role: 'SCHOOL' },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, createdAt: true, isActive: true,
      schoolProfile: {
        select: { schoolName: true, address: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// ── ADMINS ─────────────────────────────────────────────────────────────────

export const getAllAdmins = async () => {
  return await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      createdAt: true, isActive: true,
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const createAdmin = async ({ firstName, lastName, email, password }) => {
  if (!email || !firstName || !password) {
    throw new AppError('Nom, email et mot de passe sont requis', 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Cet email est déjà utilisé', 409);

  const hashed = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName: lastName || '',
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
      termsAccepted: true,
      wallet: { create: { balance: 0 } },
    },
    select: {
      id: true, email: true, firstName: true, lastName: true, createdAt: true,
    },
  });

  return admin;
};

export const deleteAdmin = async (adminId, requestingAdminId) => {
  if (adminId === requestingAdminId) {
    throw new AppError('Vous ne pouvez pas supprimer votre propre compte', 400);
  }

  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin) throw new AppError('Administrateur introuvable', 404);
  if (admin.role !== 'ADMIN') throw new AppError('Cet utilisateur n\'est pas administrateur', 400);

  await prisma.user.delete({ where: { id: adminId } });
};

// ── DOCUMENTS ──────────────────────────────────────────────────────────────

export const verifyDocument = async (documentId, adminId) => {
  const doc = await prisma.teacherDocument.findUnique({ where: { id: documentId } });
  if (!doc) throw new AppError('Document introuvable', 404);

  return await prisma.teacherDocument.update({
    where: { id: documentId },
    data: { status: 'VERIFIED', verifiedBy: adminId, verifiedAt: new Date() },
  });
};

export const rejectDocument = async (documentId, adminId) => {
  const doc = await prisma.teacherDocument.findUnique({ where: { id: documentId } });
  if (!doc) throw new AppError('Document introuvable', 404);

  return await prisma.teacherDocument.update({
    where: { id: documentId },
    data: { status: 'REJECTED', verifiedBy: adminId, verifiedAt: new Date() },
  });
};

// ── PMF COHORTS ──────────────────────────────────────────────────────────────

/**
 * Calcule le tableau PMF par cohortes hebdomadaires.
 *
 * PMF cible : 70% des parents inscrits doivent ajouter au moins un professeur.
 *
 * Logique :
 *  - Cohorte = semaine d'inscription du parent (lundi → dimanche)
 *  - Colonne S+N = % cumulatif des parents de la cohorte qui ont ajouté
 *    un prof dans les N semaines suivant leur inscription
 */
export const getPMFCohorts = async () => {
  // 1. Récupérer tous les parents avec leur date d'inscription
  const parents = await prisma.user.findMany({
    where: { role: 'PARENT' },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  if (parents.length === 0) return { cohorts: [], maxWeeks: 8, pmfTarget: 70, pmfWeekWindow: 5 };

  // 2. Récupérer tous les liens parent→prof (événement PMF)
  const links = await prisma.parentTeacherLink.findMany({
    select: { parentId: true, createdAt: true },
  });

  // Index : parentId → [dates d'ajout]
  const linksByParent = {};
  for (const link of links) {
    if (!linksByParent[link.parentId]) linksByParent[link.parentId] = [];
    linksByParent[link.parentId].push(new Date(link.createdAt));
  }

  // 3. Utilitaires dates
  const getMondayOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getUTCDay(); // 0=dim, 1=lun...
    const diff = (day === 0 ? -6 : 1 - day);
    d.setUTCDate(d.getUTCDate() + diff);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  };

  const isoWeekKey = (date) => {
    const monday = getMondayOfWeek(date);
    return monday.toISOString().slice(0, 10); // YYYY-MM-DD du lundi
  };

  const weeksBetween = (d1, d2) => {
    return Math.floor((d2 - d1) / (7 * 24 * 3600 * 1000));
  };

  // 4. Grouper les parents par cohorte (semaine d'inscription)
  const cohortMap = {}; // weekKey → [parentObj]
  for (const parent of parents) {
    const key = isoWeekKey(new Date(parent.createdAt));
    if (!cohortMap[key]) cohortMap[key] = [];
    cohortMap[key].push(parent);
  }

  const now = new Date();

  // On veut voir jusqu'à S+8 systématiquement (donc 9 colonnes)
  const FIXED_MAX_WEEK = 8;

  // 5. Pour chaque cohorte, calculer les pourcentages par semaine S+N
  const cohorts = Object.entries(cohortMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekKey, cohortParents]) => {
      const cohortStart = new Date(weekKey); // lundi de la semaine
      const totalParents = cohortParents.length;

      // Nombre de semaines écoulées depuis le début de la cohorte
      const weeksElapsed = weeksBetween(cohortStart, now);

      // Calcul des colonnes S+0 à S+8
      const weekColumns = [];
      for (let w = 0; w <= FIXED_MAX_WEEK; w++) {
        // Si la période ne s'est pas encore écoulée, on laisse null ou on arrête ?
        // L'utilisateur veut voir la trace, donc on affiche les data dispos.
        if (w > weeksElapsed) {
          weekColumns.push(null);
          continue;
        }

        const deadline = new Date(cohortStart.getTime() + (w + 1) * 7 * 24 * 3600 * 1000);
        let converted = 0;
        for (const parent of cohortParents) {
          const parentLinks = linksByParent[parent.id] || [];
          // Le parent a-t-il ajouté au moins un prof avant deadline ?
          const added = parentLinks.some((d) => d <= deadline);
          if (added) converted++;
        }
        const pct = Math.round((converted / totalParents) * 100);
        weekColumns.push(pct);
      }

      return {
        weekKey,               // "2025-12-30" (lundi ISO)
        totalParents,
        weekColumns,           // [pct_S0, ..., pct_S8]
      };
    });

  return {
    cohorts,
    maxWeeks: FIXED_MAX_WEEK,
    pmfTarget: 70,
    pmfWeekWindow: 0 // S+0 = 1ère semaine
  };
};


