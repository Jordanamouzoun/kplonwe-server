import bcrypt from 'bcryptjs';
import prisma from './lib/prisma.js';

async function main() {
  const email = 'kplonwe@gmail.com';
  const password = 'Admin@1234';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log('L\'admin existe déjà.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'Kplonwe',
      isVerified: true,
      isActive: true,
      wallet: {
        create: {
          balance: 0
        }
      }
    }
  });

  console.log('Compte admin créé avec succès !');
  console.log(`Email : ${admin.email}`);
  console.log('Mot de passe : Admin@1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
