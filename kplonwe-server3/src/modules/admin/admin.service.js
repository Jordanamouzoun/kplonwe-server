import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware.js';
import { hashPassword } from '../../utils/password.js';

const prisma = new PrismaClient();

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
