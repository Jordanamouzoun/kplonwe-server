import prisma from './lib/prisma.js';

async function main() {
  const users = await prisma.user.findMany({
    include: {
      teacherProfile: true,
      parentProfile: true,
      studentProfile: true,
      schoolProfile: true
    }
  });

  let createdCount = 0;

  for (const user of users) {
    if (user.role === 'TEACHER' && !user.teacherProfile) {
      await prisma.teacherProfile.create({
        data: {
          userId: user.id,
          subjects: '[]',
          levels: '[]',
          validationStatus: 'PENDING'
        }
      });
      createdCount++;
    } else if (user.role === 'PARENT' && !user.parentProfile) {
      await prisma.parentProfile.create({ data: { userId: user.id } });
      createdCount++;
    } else if (user.role === 'STUDENT' && !user.studentProfile) {
      await prisma.studentProfile.create({ data: { userId: user.id } });
      createdCount++;
    } else if (user.role === 'SCHOOL' && !user.schoolProfile) {
      await prisma.schoolProfile.create({ data: { userId: user.id } });
      createdCount++;
    }
  }

  console.log(`Synchronization complete. Created ${createdCount} missing profiles.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
