import Badge from "../models/Badge.js";
import UserProgress from "../models/UserProgress.js";

// Define all available badges with their criteria
const BADGE_DEFINITIONS = [
  {
    id: "first-lesson",
    name: "Getting Started",
    description: "Completed your first lesson",
    icon: "✨",
    category: "progress",
    criteria: (progress) => progress.lessonsCompleted >= 1,
  },
  {
    id: "five-lessons",
    name: "Sign Enthusiast",
    description: "Completed 5 lessons",
    icon: "📚",
    category: "progress",
    criteria: (progress) => progress.lessonsCompleted >= 5,
  },
  {
    id: "ten-lessons",
    name: "Committed Learner",
    description: "Completed 10 lessons",
    icon: "🎯",
    category: "progress",
    criteria: (progress) => progress.lessonsCompleted >= 10,
  },
  {
    id: "twenty-lessons",
    name: "Dedicated Scholar",
    description: "Completed 20 lessons",
    icon: "🔥",
    category: "progress",
    criteria: (progress) => progress.lessonsCompleted >= 20,
  },
  {
    id: "fifty-lessons",
    name: "Master Learner",
    description: "Completed 50 lessons",
    icon: "👑",
    category: "progress",
    criteria: (progress) => progress.lessonsCompleted >= 50,
  },
  {
    id: "first-module",
    name: "Module Victor",
    description: "Completed your first full module",
    icon: "🏅",
    category: "progress",
    criteria: (progress) => progress.modulesCompleted >= 1,
  },
  {
    id: "three-modules",
    name: "Module Master",
    description: "Completed 3 modules",
    icon: "🏆",
    category: "progress",
    criteria: (progress) => progress.modulesCompleted >= 3,
  },
  {
    id: "three-day-streak",
    name: "On Fire",
    description: "Maintained a 3-day learning streak",
    icon: "🔥",
    category: "streak",
    criteria: (progress) => progress.streak >= 3,
  },
  {
    id: "seven-day-streak",
    name: "Week Warrior",
    description: "Maintained a 7-day learning streak",
    icon: "⚔️",
    category: "streak",
    criteria: (progress) => progress.streak >= 7,
  },
  {
    id: "thirty-day-streak",
    name: "Unstoppable",
    description: "Maintained a 30-day learning streak",
    icon: "💪",
    category: "streak",
    criteria: (progress) => progress.streak >= 30,
  },
  {
    id: "hundred-xp",
    name: "XP Starter",
    description: "Earned 100 XP",
    icon: "⭐",
    category: "performance",
    criteria: (progress) => progress.totalXp >= 100,
  },
  {
    id: "thousand-xp",
    name: "XP Accumulator",
    description: "Earned 1,000 XP",
    icon: "💫",
    category: "performance",
    criteria: (progress) => progress.totalXp >= 1000,
  },
  {
    id: "five-thousand-xp",
    name: "XP Legend",
    description: "Earned 5,000 XP",
    icon: "🌟",
    category: "performance",
    criteria: (progress) => progress.totalXp >= 5000,
  },
];

/**
 * Check and award badges to a user based on their progress
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of newly earned badges
 */
export async function checkAndAwardBadges(userId) {
  try {
    // Get user's current progress
    const userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      return [];
    }

    const newlyEarned = [];

    // Check each badge definition
    for (const badgeDef of BADGE_DEFINITIONS) {
      // Check if criteria is met
      if (!badgeDef.criteria(userProgress)) {
        continue;
      }

      // Check if badge already earned
      const existingBadge = await Badge.findOne({
        userId,
        badgeId: badgeDef.id,
      });

      if (existingBadge) {
        continue; // Already earned
      }

      // Award the badge
      const newBadge = await Badge.create({
        userId,
        badgeId: badgeDef.id,
        badgeName: badgeDef.name,
        badgeDescription: badgeDef.description,
        badgeIcon: badgeDef.icon,
        category: badgeDef.category,
        earnedAt: new Date(),
      });

      newlyEarned.push(newBadge);
    }

    return newlyEarned;
  } catch (error) {
    console.error(`Error checking badges for user ${userId}:`, error);
    return [];
  }
}

/**
 * Get all badges earned by a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of earned badges
 */
export async function getUserBadges(userId) {
  try {
    const badges = await Badge.find({ userId })
      .sort({ earnedAt: -1 })
      .lean();
    return badges;
  } catch (error) {
    console.error(`Error fetching badges for user ${userId}:`, error);
    return [];
  }
}

/**
 * Get badge statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Badge statistics
 */
export async function getUserBadgeStats(userId) {
  try {
    const badges = await Badge.find({ userId }).lean();

    const stats = {
      totalBadges: badges.length,
      byCategory: {
        progress: badges.filter((b) => b.category === "progress").length,
        streak: badges.filter((b) => b.category === "streak").length,
        performance: badges.filter((b) => b.category === "performance").length,
        milestone: badges.filter((b) => b.category === "milestone").length,
      },
      recentBadges: badges.slice(0, 3),
      allBadges: badges,
    };

    return stats;
  } catch (error) {
    console.error(`Error getting badge stats for user ${userId}:`, error);
    return {
      totalBadges: 0,
      byCategory: { progress: 0, streak: 0, performance: 0, milestone: 0 },
      recentBadges: [],
      allBadges: [],
    };
  }
}
