import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import app from './app.js';
import logger from './utils/logger.js';
import { startSubscriptionCron } from './cron/subscriptions.cron.js';

dotenv.config();

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Fonction pour vérifier/créer dossiers uploads
function ensureUploadDirectories() {
  const uploadDirs = [
    'uploads',
    'uploads/documents',
    'uploads/avatars',
  ];
  
  logger.info('🔍 Vérification dossiers uploads...');
  
  uploadDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      logger.info(`✅ Créé: ${dir}`);
    }
  });
  
  logger.info('✅ Dossiers uploads prêts');
}

async function startServer() {
  try {
    // Vérifier/créer dossiers uploads
    ensureUploadDirectories();
    
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Démarrer les cron jobs
    startSubscriptionCron();

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 API: http://localhost:${PORT}/api/v1`);
      logger.info(`💚 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
