import prisma from '../lib/prisma.js';


export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    next();
  };
};

export const requireVerifiedTeacher = async (req, res, next) => {
  try {
    if (req.user.role !== 'TEACHER') {
      return res.status(403).json({ success: false, message: 'Réservé aux enseignants' });
    }
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: req.user.id },
      select: { validationStatus: true }
    });
    if (!profile || profile.validationStatus !== 'VERIFIED') {
      return res.status(403).json({ success: false, message: 'Profil non validé' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur de vérification' });
  }
};

export default { requireRole, requireVerifiedTeacher };
