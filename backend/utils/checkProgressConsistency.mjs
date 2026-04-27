import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import { ModuleProgress } from "../models/ModuleProgress.js";
import { UserProgress } from "../models/UserProgress.js";
import { updateUserProgress } from "../services/moduleService.js";

function getMongoUri() {
  return process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/signlearn";
}

function assertProgressInvariants(progress) {
  const issues = [];

  if (!progress) {
    issues.push("UserProgress document missing.");
    return issues;
  }

  const totalModules = Number(progress.totalModules ?? 0);
  const modulesCompleted = Number(progress.modulesCompleted ?? 0);
  const totalLessons = Number(progress.totalLessons ?? 0);
  const lessonsCompleted = Number(progress.lessonsCompleted ?? 0);
  const overall = Number(progress.overallProgressPercentage ?? 0);
  const totalXp = Number(progress.totalXp ?? 0);
  const xpThisWeek = Number(progress.xpThisWeek ?? 0);
  const xpThisMonth = Number(progress.xpThisMonth ?? 0);

  if (modulesCompleted > totalModules) {
    issues.push(`modulesCompleted (${modulesCompleted}) > totalModules (${totalModules})`);
  }

  if (lessonsCompleted > totalLessons) {
    issues.push(`lessonsCompleted (${lessonsCompleted}) > totalLessons (${totalLessons})`);
  }

  const expectedOverall = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
  if (Math.abs(overall - expectedOverall) > 1) {
    issues.push(`overallProgressPercentage (${overall}) != expected (${expectedOverall})`);
  }

  if (totalXp !== lessonsCompleted) {
    issues.push(`totalXp (${totalXp}) != lessonsCompleted (${lessonsCompleted})`);
  }

  if (xpThisWeek > totalXp) {
    issues.push(`xpThisWeek (${xpThisWeek}) > totalXp (${totalXp})`);
  }

  if (xpThisMonth > totalXp) {
    issues.push(`xpThisMonth (${xpThisMonth}) > totalXp (${totalXp})`);
  }

  return issues;
}

async function validateModuleProgress(userId) {
  const moduleProgressRows = await ModuleProgress.find({ userId }).lean();
  const issues = [];

  for (const row of moduleProgressRows) {
    const completed = Number(row.lessonsCompleted ?? 0);
    const total = Number(row.totalLessons ?? 0);
    const percentage = Number(row.progressPercentage ?? 0);

    if (completed > total) {
      issues.push(
        `Module ${String(row.moduleId)} has lessonsCompleted (${completed}) > totalLessons (${total})`
      );
    }

    const expected = total > 0 ? Math.round((Math.min(completed, total) / total) * 100) : 0;
    if (Math.abs(percentage - expected) > 1) {
      issues.push(
        `Module ${String(row.moduleId)} has progressPercentage (${percentage}) != expected (${expected})`
      );
    }
  }

  return issues;
}

async function main() {
  await mongoose.connect(getMongoUri());

  const users = await User.find({ isActive: true }).select("id email").lean();

  const report = [];
  let hasFailures = false;

  for (const user of users) {
    const userId = String(user.id || "");
    if (!userId) {
      continue;
    }

    await updateUserProgress(userId);

    const userProgress = await UserProgress.findOne({ userId }).lean();
    const userIssues = assertProgressInvariants(userProgress);
    const moduleIssues = await validateModuleProgress(userId);
    const issues = [...userIssues, ...moduleIssues];

    if (issues.length > 0) {
      hasFailures = true;
    }

    report.push({
      userId,
      email: user.email,
      status: issues.length === 0 ? "ok" : "failed",
      issues,
      snapshot: userProgress
        ? {
            totalModules: userProgress.totalModules,
            modulesCompleted: userProgress.modulesCompleted,
            totalLessons: userProgress.totalLessons,
            lessonsCompleted: userProgress.lessonsCompleted,
            overallProgressPercentage: userProgress.overallProgressPercentage,
            totalXp: userProgress.totalXp,
            xpThisWeek: userProgress.xpThisWeek,
            xpThisMonth: userProgress.xpThisMonth,
          }
        : null,
    });
  }

  console.log(JSON.stringify({ checkedUsers: report.length, report }, null, 2));

  await mongoose.disconnect();

  if (hasFailures) {
    process.exitCode = 1;
  }
}

main().catch(async (error) => {
  console.error("Progress consistency check failed:", error);
  try {
    await mongoose.disconnect();
  } catch (_error) {
    // ignore disconnect failure
  }
  process.exit(1);
});
