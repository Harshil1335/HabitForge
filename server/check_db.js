import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const email = 'bhardwajharshil325@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  const habits = await prisma.habit.findMany({ where: { userId: user.id } });
  console.log(`Found ${habits.length} habits`);
  
  const checkins = await prisma.habitCheckIn.findMany({ where: { userId: user.id } });
  console.log(`Found ${checkins.length} checkins`);
  
  if (checkins.length > 0) {
    console.log('Sample check-in:', checkins[0]);
    console.log('Sample check-in date type:', typeof checkins[0].checkInDate, checkins[0].checkInDate instanceof Date);
  }
  
  // Also check if there are multiple users with similar emails?
  const allUsers = await prisma.user.findMany();
  console.log('\nAll users:', allUsers.map(u => ({ id: u.id, email: u.email, name: u.name })));
}

run().catch(console.error).finally(() => prisma.$disconnect());
