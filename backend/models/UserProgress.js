import mongoose from "mongoose";

/**
 * UserProgress Schema - Aggregated user statistics and achievements
 * Tracks streak, XP, module completion counts, and motivational metrics
 */
const userProgressSchema = new mongoose.Schema(
	{
		userId: {
			type: String, // Reference to User.id (UUID string)
			required: true,
			unique: true,
			index: true,
		},
		streak: {
			type: Number, // Consecutive days practiced
			default: 0,
			min: 0,
		},
		longestStreak: {
			type: Number, // All-time longest streak
			default: 0,
			min: 0,
		},
		lastActivityDate: {
			type: Date, // Last date user completed a lesson
			default: null,
		},
		xpThisWeek: {
			type: Number, // XP earned this week (Mon-Sun)
			default: 0,
			min: 0,
		},
		xpThisMonth: {
			type: Number, // XP earned this month
			default: 0,
			min: 0,
		},
		totalXp: {
			type: Number, // All-time XP
			default: 0,
			min: 0,
		},
		modulesCompleted: {
			type: Number, // Number of modules fully completed (100%)
			default: 0,
			min: 0,
		},
		totalModules: {
			type: Number, // Total modules available to user (based on role)
			default: 0,
			min: 0,
		},
		lessonsCompleted: {
			type: Number, // Total lessons completed (across all modules)
			default: 0,
			min: 0,
		},
		totalLessons: {
			type: Number, // Total lessons available to user
			default: 0,
			min: 0,
		},
		overallProgressPercentage: {
			type: Number, // (lessonsCompleted / totalLessons) * 100
			default: 0,
			min: 0,
			max: 100,
		},
		level: {
			type: Number, // User level based on XP (e.g., 1-50)
			default: 1,
			min: 1,
		},
		achievements: [
			{
				type: String, // Achievement IDs/names ("first_lesson", "7day_streak", etc.)
			},
		],
		lastStreakResetDate: {
			type: Date, // Date when streak was last reset
			default: null,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

// Index for leaderboard queries
userProgressSchema.index({ totalXp: -1, streak: -1 });
// Index for level-based queries
userProgressSchema.index({ level: -1 });

export const UserProgress = mongoose.model("UserProgress", userProgressSchema);
