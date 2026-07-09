/*
  Warnings:

  - The values [FIRST_CHECKIN,CURRENT_STREAK,PERFECT_WEEK] on the enum `Achievement_requirementType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Achievement` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `achievement` MODIFY `requirementType` ENUM('HABIT_COUNT', 'TOTAL_CHECKINS', 'HABIT_BEST_STREAK', 'OVERALL_BEST_STREAK') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Achievement_name_key` ON `Achievement`(`name`);
