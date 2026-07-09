import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  {
    name: 'First Step',
    description: 'Create your first habit.',
    icon: '🚀',
    requirementType: 'HABIT_COUNT',
    requirementValue: 1,
  },
  {
    name: 'Getting Started',
    description: 'Complete your first habit check-in.',
    icon: '✓',
    requirementType: 'TOTAL_CHECKINS',
    requirementValue: 1,
  },
  {
    name: '7 Day Streak',
    description: 'Maintain a 7-day streak on any habit.',
    icon: '🔥',
    requirementType: 'HABIT_BEST_STREAK',
    requirementValue: 7,
  },
  {
    name: 'Consistency King',
    description: 'Maintain a 30-day streak on any habit.',
    icon: '🏆',
    requirementType: 'HABIT_BEST_STREAK',
    requirementValue: 30,
  },
  {
    name: 'Momentum',
    description: 'Complete 50 habit check-ins.',
    icon: '⚡',
    requirementType: 'TOTAL_CHECKINS',
    requirementValue: 50,
  },
  {
    name: 'Century Club',
    description: 'Complete 100 habit check-ins.',
    icon: '💯',
    requirementType: 'TOTAL_CHECKINS',
    requirementValue: 100,
  },
  {
    name: 'Habit Builder',
    description: 'Create 5 habits.',
    icon: '🛠️',
    requirementType: 'HABIT_COUNT',
    requirementValue: 5,
  },
  {
    name: 'Perfect Week',
    description: 'Complete every scheduled habit for 7 consecutive eligible days.',
    icon: '⭐',
    requirementType: 'OVERALL_BEST_STREAK',
    requirementValue: 7,
  }
];

async function main() {
  console.log('Seeding achievements...');

  for (const a of achievements) {
    const result = await prisma.achievement.upsert({
      where: { name: a.name },
      update: {
        description: a.description,
        icon: a.icon,
        requirementType: a.requirementType,
        requirementValue: a.requirementValue,
      },
      create: a,
    });
    console.log(`Upserted achievement: ${result.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
