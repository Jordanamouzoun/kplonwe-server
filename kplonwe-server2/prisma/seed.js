import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // 1. Créer l'admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@educonnect.bj';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecure@2025';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
        lastName: process.env.ADMIN_LAST_NAME || 'System',
        isVerified: true,
        isActive: true,
        termsAccepted: true,
        wallet: {
          create: {
            balance: 0
          }
        }
      }
    });

    console.log(`✅ Admin créé: ${admin.email}`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
  } else {
    console.log(`ℹ️  Admin existe déjà: ${adminEmail}`);
  }

  // 2. Créer le wallet plateforme
  const platformEmail = 'platform@educonnect.system';
  const existingPlatform = await prisma.user.findUnique({ where: { email: platformEmail } });

  if (!existingPlatform) {
    const platform = await prisma.user.create({
      data: {
        email: platformEmail,
        password: await hashPassword('platform-internal-only'),
        role: 'ADMIN',
        firstName: 'Platform',
        lastName: 'Wallet',
        isVerified: true,
        isActive: true,
        termsAccepted: true,
        wallet: {
          create: {
            balance: 0
          }
        }
      }
    });

    console.log(`✅ Wallet plateforme créé`);
    console.log(`🆔 PLATFORM_WALLET_ID: ${platform.id}`);
    console.log(`⚠️  Ajoute cet ID dans ton .env: PLATFORM_WALLET_ID=${platform.id}`);
  } else {
    console.log(`ℹ️  Wallet plateforme existe déjà`);
    console.log(`🆔 PLATFORM_WALLET_ID: ${existingPlatform.id}`);
  }

  console.log('\\n🎉 Seeding terminé!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur de seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
