import { PrismaClient } from "@prisma/client";
import readline from "readline";
import { achievementService } from "../src/services/achievementService.js";
import { todayCalendarDate, addDays, isScheduled } from "../src/utils/dates.js";

const prisma = new PrismaClient();

const habitsToCreate = [
  { name: "Drink 2L Water", description: "Stay hydrated", frequencyType: "DAILY", icon: "droplet", color: "#3b82f6", targetCompletion: 0.92 },
  { name: "Morning Exercise", description: "Get moving early", frequencyType: "DAILY", icon: "activity", color: "#f59e0b", targetCompletion: 0.75 },
  { name: "Read 30 Minutes", description: "Fiction or non-fiction", frequencyType: "DAILY", icon: "book", color: "#8b5cf6", targetCompletion: 0.65 },
  { name: "Study DSA", description: "Data structures and algorithms", frequencyType: "WEEKDAYS", icon: "code", color: "#10b981", targetCompletion: 0.85 },
  { name: "Deep Work", description: "Uninterrupted focus", frequencyType: "WEEKDAYS", icon: "monitor", color: "#6366f1", targetCompletion: 0.60 },
  { name: "Gym", description: "Weight lifting", frequencyType: "CUSTOM", targetDays: [1, 3, 5], icon: "zap", color: "#ef4444", targetCompletion: 0.70 },
  { name: "Journaling", description: "Reflect on the day", frequencyType: "DAILY", icon: "pen-tool", color: "#ec4899", targetCompletion: 0.80 },
  { name: "Meditate", description: "10 minutes of mindfulness", frequencyType: "DAILY", icon: "cloud", color: "#60a5fa", targetCompletion: 0.50 },
  { name: "Walk 10k Steps", description: "Daily step goal", frequencyType: "DAILY", icon: "map", color: "#22c55e", targetCompletion: 0.65 },
  { name: "Stretch", description: "Morning stretching routine", frequencyType: "DAILY", icon: "maximize", color: "#f97316", targetCompletion: 0.90 },
  { name: "Read Tech News", description: "Stay updated", frequencyType: "WEEKDAYS", icon: "globe", color: "#14b8a6", targetCompletion: 0.75 },
  { name: "No Sugar", description: "Avoid refined sugar", frequencyType: "DAILY", icon: "shield", color: "#eab308", targetCompletion: 0.55 },
  { name: "Duolingo", description: "Learn Spanish", frequencyType: "DAILY", icon: "message-circle", color: "#84cc16", targetCompletion: 0.88 },
  { name: "Inbox Zero", description: "Clear emails", frequencyType: "WEEKDAYS", icon: "mail", color: "#64748b", targetCompletion: 0.72 },
  { name: "Yoga", description: "Evening yoga flow", frequencyType: "CUSTOM", targetDays: [2, 4], icon: "heart", color: "#f43f5e", targetCompletion: 0.60 },
  { name: "Call Family", description: "Catch up", frequencyType: "CUSTOM", targetDays: [0, 6], icon: "phone", color: "#a855f7", targetCompletion: 0.85 },
  { name: "Review Finances", description: "Check budget", frequencyType: "CUSTOM", targetDays: [5], icon: "dollar-sign", color: "#22c55e", targetCompletion: 0.95 },
  { name: "Plan Week", description: "Schedule tasks", frequencyType: "CUSTOM", targetDays: [0], icon: "calendar", color: "#3b82f6", targetCompletion: 0.90 },
  { name: "Clean Desk", description: "Tidy workspace", frequencyType: "WEEKDAYS", icon: "layout", color: "#0ea5e9", targetCompletion: 0.78 },
  { name: "Vitamins", description: "Morning supplements", frequencyType: "DAILY", icon: "sun", color: "#f59e0b", targetCompletion: 0.94 },
  { name: "Floss", description: "Dental hygiene", frequencyType: "DAILY", icon: "smile", color: "#06b6d4", targetCompletion: 0.82 },
];

async function run() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ ERROR: Cannot run demo seeder in production environment.");
    process.exit(1);
  }

  const email = process.argv[2];
  const timezone = process.argv[3] || "Asia/Kolkata";

  if (!email) {
    console.error("❌ ERROR: Target user email is required.");
    console.error("Usage: node prisma/seedDemoData.js <email> [timezone]");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`❌ ERROR: User with email '${email}' not found.`);
    process.exit(1);
  }

  const existingHabits = await prisma.habit.count({ where: { userId: user.id } });
  const existingCheckIns = await prisma.habitCheckIn.count({ where: { userId: user.id } });

  console.log(`\n==================================================`);
  console.log(`🎯 TARGET USER: ${user.name} (${user.email})`);
  console.log(`📈 EXISTING HABITS: ${existingHabits}`);
  console.log(`✅ EXISTING CHECK-INS: ${existingCheckIns}`);
  console.log(`==================================================\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("This will delete the selected user's existing habits and check-ins and replace them with demo data. Continue? (yes/no): ", async (answer) => {
    rl.close();
    
    if (answer.toLowerCase() !== "yes") {
      console.log("Aborted.");
      process.exit(0);
    }

    console.log("\n🧹 Cleaning existing data for user...");
    // Safely delete in order (UserAchievement has cascade to User, but safe to delete explicitly)
    await prisma.userAchievement.deleteMany({ where: { userId: user.id } });
    await prisma.habitCheckIn.deleteMany({ where: { userId: user.id } });
    await prisma.habit.deleteMany({ where: { userId: user.id } });

    const startDate = addDays(todayCalendarDate(timezone), -365);
    const startDateObj = new Date(`${startDate}T00:00:00Z`);

    console.log("🌱 Generating habits...");
    const createdHabits = [];
    for (const data of habitsToCreate) {
      const h = await prisma.habit.create({
        data: {
          userId: user.id,
          name: data.name,
          description: data.description,
          frequencyType: data.frequencyType,
          targetDays: data.targetDays || null,
          icon: data.icon,
          color: data.color,
          createdAt: startDateObj
        }
      });
      createdHabits.push({ dbId: h.id, ...data });
    }

    console.log(`📅 Generating 365 days of check-ins (Timezone: ${timezone})...`);
    
    const today = todayCalendarDate(timezone);
    const dates = [];
    // Generate dates: T-365 to T-0
    for (let i = 365; i >= 0; i--) {
      dates.push(addDays(today, -i));
    }

    const checkInsToCreate = [];
    const checkInCounts = {};
    const streaks = {};

    for (let hIndex = 0; hIndex < createdHabits.length; hIndex++) {
      const habit = createdHabits[hIndex];
      checkInCounts[habit.name] = 0;
      let currentStreak = 0;
      let maxStreak = 0;

      for (let dIndex = 0; dIndex < dates.length; dIndex++) {
        const dateStr = dates[dIndex];
        
        if (!isScheduled(habit, dateStr)) {
          continue; // Not scheduled today
        }

        // Better pseudo-random using Math.sin
        const seed = (hIndex + 1) * (dIndex + 1) * 12345;
        const x = Math.sin(seed) * 10000;
        const rand = x - Math.floor(x);

        let shouldCheckIn = rand <= habit.targetCompletion;

        // Force a guaranteed 30+ day streak for "Drink 2L Water" in the middle
        if (habit.name === "Drink 2L Water" && dIndex >= 40 && dIndex <= 80) {
          shouldCheckIn = true;
        }
        
        // Force a guaranteed 7+ day streak for "Morning Exercise"
        if (habit.name === "Morning Exercise" && dIndex >= 10 && dIndex <= 20) {
          shouldCheckIn = true;
        }

        if (shouldCheckIn) {
          checkInsToCreate.push({
            userId: user.id,
            habitId: habit.dbId,
            checkInDate: new Date(`${dateStr}T00:00:00Z`)
          });
          checkInCounts[habit.name]++;
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          currentStreak = 0;
        }
      }
      
      streaks[habit.name] = maxStreak;
    }

    await prisma.habitCheckIn.createMany({ data: checkInsToCreate });
    console.log(`✅ Inserted ${checkInsToCreate.length} historical check-ins.`);

    console.log("🏆 Evaluating achievements...");
    const result = await achievementService.evaluateAchievements(user.id, timezone);

    console.log(`\n==================================================`);
    console.log(`📊 DEMO DATA SUMMARY`);
    console.log(`==================================================`);
    console.log(`User                 : ${user.name} (${user.email})`);
    console.log(`Timezone             : ${timezone}`);
    console.log(`Historical Range     : ${dates[0]} to ${dates[dates.length - 1]}`);
    console.log(`Habits Created       : ${createdHabits.length}`);
    console.log(`Total Check-ins      : ${checkInsToCreate.length}`);
    console.log(`Achievements Unlocked: ${result.summary.unlocked} / ${result.summary.total}`);
    
    console.log(`\n--- HABIT BREAKDOWN ---`);
    for (const habit of createdHabits) {
      console.log(`${habit.name.padEnd(20)}: ${checkInCounts[habit.name].toString().padEnd(3)} check-ins (Best Streak: ${streaks[habit.name]})`);
    }
    
    console.log(`\n🎉 Seeding complete. Open HabitForge in your browser to view the demo data.`);
    process.exit(0);
  });
}

run().catch((e) => {
  console.error("❌ Fatal Error:", e);
  process.exit(1);
});
