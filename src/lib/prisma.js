import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Client
 * 
 * On utilise une variable globale pour éviter la création de multiples instances
 * lors des hot-reloads (nodemon). Cela garantit qu'une seule connexion pool
 * est ouverte par processus Node, évitant MaxClientsInSessionMode sur Supabase.
 */

const globalForPrisma = globalThis;

if (!globalForPrisma.__prisma) {
  globalForPrisma.__prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

const prisma = globalForPrisma.__prisma;

export default prisma;
