import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware d'authentification optionnelle
 * Vérifie le token s'il existe, mais ne bloque pas si absent
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Si pas de token, continuer sans authentification
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Charger l'utilisateur complet avec ses profils
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          teacherProfile: true,
          parentProfile: true,
          studentProfile: true,
          schoolProfile: true,
        },
      });
      
      if (user) {
        req.user = user;
      }
    } catch (err) {
      // Token invalide, continuer sans authentification
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, continuer sans authentification
    next();
  }
};
