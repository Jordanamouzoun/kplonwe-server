/**
 * Script de création du premier compte administrateur.
 *
 * Usage :
 *   node scripts/create-admin.js
 *
 * Variables d'environnement optionnelles :
 *   ADMIN_EMAIL    (défaut: admin@educonnect.com)
 *   ADMIN_PASSWORD (défaut: Admin1234!)
 *   ADMIN_FIRST    (défaut: Super)
 *   ADMIN_LAST     (défaut: Admin)
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const email    = process.env.ADMIN_EMAIL    || 'admin@educonnect.com';
const password = process.env.ADMIN_PASSWORD || 'Admin1234!';
const firstName = process.env.ADMIN_FIRST  || 'Super';
const lastName  = process.env.ADMIN_LAST   || 'Admin';

async function main() {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role === 'ADMIN') {
      console.log(`✅ Admin déjà créé : ${email}`);
    } else {
      // Promouvoir en admin
      await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
      console.log(`✅ Utilisateur promu admin : ${email}`);
    }
    return;
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
      termsAccepted: true,
      wallet: { create: { balance: 0 } },
    },
  });

  console.log('');
  console.log('══════════════════════════════════════════');
  console.log('✅ Compte administrateur créé avec succès');
  console.log('══════════════════════════════════════════');
  console.log(`   Email    : ${email}`);
  console.log(`   Mot de passe : ${password}`);
  console.log(`   URL     : http://localhost:5173/login`);
  console.log('══════════════════════════════════════════');
  console.log('');
  console.log('⚠️  Changez le mot de passe en production !');
}

main()
  .catch(e => { console.error('❌ Erreur :', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
