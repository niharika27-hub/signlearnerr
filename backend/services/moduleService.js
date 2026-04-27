import { Module } from "../models/Module.js";
import { Lesson } from "../models/Lesson.js";
import { LessonCompletion } from "../models/LessonCompletion.js";
import { ModuleProgress } from "../models/ModuleProgress.js";
import { UserProgress } from "../models/UserProgress.js";
import { UserModuleAssignment } from "../models/UserModuleAssignment.js";
import mongoose from "mongoose";
import User from "../models/User.js";

function createHttpError(statusCode, message) {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
}

function buildUserIdentifiers(inputUserId, userDoc = null) {
	const values = new Set();

	if (inputUserId) {
		values.add(String(inputUserId));
	}

	if (userDoc?.id) {
		values.add(String(userDoc.id));
	}

	if (userDoc?._id) {
		values.add(String(userDoc._id));
	}

	return Array.from(values);
}

/**
 * Get all modules filtered by user's role category
 * @param {string} roleCategory - User's role category (learner, support-circle, accessibility-needs)
 * @returns {Promise<Array>} Array of modules with lesson count
 */
export async function getModulesByRole(roleCategory) {
	try {
		const modules = await Module.find({
			roleCategories: roleCategory,
			$or: [{ isActive: true }, { isActive: { $exists: false } }],
		})
			.sort({ orderIndex: 1 })
			.populate("lessons", "title order");

		return modules;
	} catch (error) {
		console.error("Error fetching modules by role:", error);
		throw error;
	}
}

/**
 * Get modules visible to a user using both role-based and explicit per-user assignment.
 * @param {string} userId - User ID
 * @param {string} roleCategory - Role category
 * @returns {Promise<Array>} Modules for this user
 */
export async function getModulesForUser(userId, roleCategory) {
	try {
		const assignments = await UserModuleAssignment.find({ userId }).select("moduleId").lean();
		const assignedModuleIds = assignments.map((entry) => entry.moduleId);

		const filters = [{ roleCategories: roleCategory }];
		if (assignedModuleIds.length > 0) {
			filters.push({ _id: { $in: assignedModuleIds } });
		}

		const modules = await Module.find({
			$and: [
				{ $or: filters },
				{ $or: [{ isActive: true }, { isActive: { $exists: false } }] },
			],
		})
			.sort({ orderIndex: 1 })
			.populate("lessons", "title order");

		return modules;
	} catch (error) {
		console.error("Error fetching modules for user:", error);
		throw error;
	}
}

/**
 * Get module with all lessons and their completion status for a user
 * @param {string} moduleId - Module ID
 * @param {string} userId - User ID for completion tracking
 * @returns {Promise<Object>} Module with lessons and completion status
 */
export async function getModuleWithLessons(moduleId, userId) {
	try {
		const module = await Module.findById(moduleId).populate("lessons");

		if (!module) {
			return null;
		}

		// Get completions for this user in this module
		const completions = await LessonCompletion.find({
			userId,
			moduleId,
		}).select("lessonId");

		const completedLessonIds = new Set(completions.map((c) => c.lessonId.toString()));

		// Enrich lessons with completion status
		const lessonsWithStatus = module.lessons.map((lesson) => ({
			...lesson.toObject(),
			isCompleted: completedLessonIds.has(lesson._id.toString()),
		}));

		return {
			...module.toObject(),
			lessons: lessonsWithStatus,
		};
	} catch (error) {
		console.error("Error fetching module with lessons:", error);
		throw error;
	}
}

/**
 * Complete a lesson and update related progress documents
 * @param {string} userId - User ID
 * @param {string} lessonId - Lesson ID
 * @param {number} score - Optional score (0-100)
 * @returns {Promise<Object>} Updated progress information
 */
export async function completeLesson(userId, lessonId, score = null) {
	try {
		if (!mongoose.Types.ObjectId.isValid(lessonId)) {
			throw createHttpError(400, "Invalid lesson ID");
		}

		// Get lesson details
		const lesson = await Lesson.findById(lessonId);
		if (!lesson) {
			throw createHttpError(404, "Lesson not found");
		}

		let moduleId = lesson.moduleId;
		if (!moduleId) {
			const parentModule = await Module.findOne({ lessons: lesson._id }).select("_id").lean();
			if (!parentModule?._id) {
				throw createHttpError(404, "Module not found for lesson");
			}
			moduleId = parentModule._id;
		}

		const normalizedScore =
			score === null || score === undefined
				? null
				: Number.isFinite(Number(score))
					? Math.round(Number(score))
					: null;

		// Check if already completed
		const existingCompletion = await LessonCompletion.findOne({
			userId,
			lessonId,
		});

		let lessonCompletion;

		if (existingCompletion) {
			// Update existing completion (retry/retake)
			lessonCompletion = existingCompletion;
			const currentAttempts = Number.isFinite(existingCompletion.attempts)
				? existingCompletion.attempts
				: 0;
			lessonCompletion.attempts = currentAttempts + 1;
			lessonCompletion.isRetake = true;
			lessonCompletion.completedAt = new Date();
			if (normalizedScore !== null) {
				lessonCompletion.score = normalizedScore;
			}
			await lessonCompletion.save();
		} else {
			// Create new completion record
			lessonCompletion = await LessonCompletion.create({
				userId,
				lessonId,
				moduleId,
				score: normalizedScore,
			});
		}

		// Update ModuleProgress
		const moduleProgress = await updateModuleProgress(userId, moduleId);

		// Update UserProgress
		const userProgress = await updateUserProgress(userId);

		return {
			lesson: {
				id: lessonCompletion.lessonId,
				completedAt: lessonCompletion.completedAt,
			},
			moduleProgress: {
				percentage: moduleProgress.progressPercentage,
				lessonsCompleted: moduleProgress.lessonsCompleted,
				totalLessons: moduleProgress.totalLessons,
			},
			userProgress: {
				streak: userProgress.streak,
				xpThisWeek: userProgress.xpThisWeek,
				totalXp: userProgress.totalXp,
				overallProgress: userProgress.overallProgressPercentage,
			},
		};
	} catch (error) {
		console.error("Error completing lesson:", error);
		throw error;
	}
}

/**
 * Update module progress based on completions
 * @param {string} userId - User ID
 * @param {string} moduleId - Module ID
 * @returns {Promise<Object>} Updated module progress
 */
export async function updateModuleProgress(userId, moduleId) {
	try {
		if (!mongoose.Types.ObjectId.isValid(moduleId)) {
			throw createHttpError(400, "Invalid module ID");
		}

		// Get module to know total lessons
		const module = await Module.findById(moduleId);
		if (!module) {
			throw createHttpError(404, "Module not found");
		}

		const totalLessons = Array.isArray(module.lessons) ? module.lessons.length : 0;

		// Count unique completed lessons to keep progress bounded even if legacy duplicate rows exist.
		const completedLessonIds = await LessonCompletion.distinct("lessonId", {
			userId,
			moduleId,
		});
		const completedCount = completedLessonIds.length;

		const boundedCompletedCount = Math.min(completedCount, totalLessons);
		const progressPercentage =
			totalLessons > 0 ? (boundedCompletedCount / totalLessons) * 100 : 0;
		const isCompleted = boundedCompletedCount === totalLessons && totalLessons > 0;

		// Update or create ModuleProgress
		let moduleProgress = await ModuleProgress.findOneAndUpdate(
			{ userId, moduleId },
			{
				lessonsCompleted: completedCount,
				totalLessons,
				progressPercentage: Math.round(progressPercentage),
				completedAt: isCompleted ? new Date() : null,
				lastAccessedAt: new Date(),
				updatedAt: new Date(),
			},
			{ upsert: true, new: true }
		);

		return moduleProgress;
	} catch (error) {
		console.error("Error updating module progress:", error);
		throw error;
	}
}

/**
 * Update user overall progress and streak
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user progress
 */
export async function updateUserProgress(userId) {
	try {
		const userFilters = [{ id: userId }];
		if (mongoose.Types.ObjectId.isValid(userId)) {
			userFilters.push({ _id: userId });
		}

		// Resolve the user by app-level id and legacy _id where needed.
		const user = await User.findOne({ $or: userFilters }).select("id roleCategory").lean();
		const userIdentifiers = buildUserIdentifiers(userId, user);

		// Aggregate module progress using all known identifiers for resilience.
		const moduleProgresses = await ModuleProgress.find({
			userId: { $in: userIdentifiers },
		});

		// Resolve all modules visible to this user so overall progress is calculated against full scope.
		let availableModules = [];
		if (user?.roleCategory) {
			const canonicalUserId = user?.id ? String(user.id) : String(userId);
			availableModules = await getModulesForUser(canonicalUserId, user.roleCategory);
		}

		const totalModules = availableModules.length;
		const availableModuleIds = availableModules.map((moduleDoc) => moduleDoc._id);
		const totalLessons = availableModules.reduce(
			(sum, moduleDoc) => sum + (Array.isArray(moduleDoc.lessons) ? moduleDoc.lessons.length : 0),
			0
		);

		const completedLessonIds = await LessonCompletion.distinct("lessonId", {
			userId: { $in: userIdentifiers },
			moduleId: { $in: availableModuleIds },
		});

		// Calculate totals
		const completedLessonsRaw = completedLessonIds.length;
		const completedLessons = Math.min(completedLessonsRaw, totalLessons);
		const availableModuleIdSet = new Set(availableModuleIds.map((value) => String(value)));
		const completedModules = moduleProgresses.filter(
			(mp) =>
				availableModuleIdSet.has(String(mp.moduleId)) && Number(mp.progressPercentage) === 100
		).length;

		const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

		// XP rule: 1 XP for each first-time unique lesson completion.
		const totalXp = completedLessons;
		const xpThisWeek = await calculateXpThisWeek(userIdentifiers);
		const xpThisMonth = await calculateXpThisMonth(userIdentifiers);

		// Calculate streak
		const streak = await calculateStreak(userIdentifiers);

		// Update or create UserProgress
		let userProgress = await UserProgress.findOneAndUpdate(
			{ userId },
			{
				totalLessons,
				lessonsCompleted: completedLessons,
				totalModules,
				modulesCompleted: completedModules,
				overallProgressPercentage: Math.round(overallProgress),
				totalXp,
				xpThisWeek,
				xpThisMonth,
				streak,
				lastActivityDate: new Date(),
				updatedAt: new Date(),
			},
			{ upsert: true, new: true }
		);

		return userProgress;
	} catch (error) {
		console.error("Error updating user progress:", error);
		throw error;
	}
}

/**
 * Calculate XP earned this week (Mon-Sun)
 * @param {string} userId - User ID
 * @returns {Promise<number>} XP earned this week
 */
export async function calculateXpThisWeek(userId) {
	try {
		const userIds = Array.isArray(userId)
			? userId.map((value) => String(value))
			: [String(userId)];

		// Get start of current week (Monday)
		const now = new Date();
		const dayOfWeek = now.getDay();
		const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
		const weekStart = new Date(now);
		weekStart.setDate(now.getDate() - daysFromMonday);
		weekStart.setHours(0, 0, 0, 0);

		// Count first-time completed lessons this week; retakes do not mint new XP.
		const completedLessonIdsThisWeek = await LessonCompletion.distinct("lessonId", {
			userId: { $in: userIds },
			createdAt: { $gte: weekStart },
		});

		return completedLessonIdsThisWeek.length;
	} catch (error) {
		console.error("Error calculating XP this week:", error);
		return 0;
	}
}

/**
 * Calculate XP earned this month (first day to now)
 * @param {string} userId - User ID
 * @returns {Promise<number>} XP earned this month
 */
export async function calculateXpThisMonth(userId) {
	try {
		const userIds = Array.isArray(userId)
			? userId.map((value) => String(value))
			: [String(userId)];

		const now = new Date();
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		monthStart.setHours(0, 0, 0, 0);

		const completedLessonIdsThisMonth = await LessonCompletion.distinct("lessonId", {
			userId: { $in: userIds },
			createdAt: { $gte: monthStart },
		});

		return completedLessonIdsThisMonth.length;
	} catch (error) {
		console.error("Error calculating XP this month:", error);
		return 0;
	}
}

/**
 * Calculate current streak (consecutive days of practice)
 * @param {string} userId - User ID
 * @returns {Promise<number>} Current streak in days
 */
export async function calculateStreak(userId) {
	try {
		const userIds = Array.isArray(userId)
			? userId.map((value) => String(value))
			: [String(userId)];

		// Get all unique dates user completed lessons, sorted descending
		const completions = await LessonCompletion.aggregate([
			{
				$match: { userId: { $in: userIds } },
			},
			{
				$group: {
					_id: {
						$dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
					},
				},
			},
			{
				$sort: { _id: -1 },
			},
		]);

		if (completions.length === 0) {
			return 0;
		}

		// Check if last activity was today or yesterday
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);

		const lastActivityDate = new Date(completions[0]._id);
		const lastActivity = new Date(lastActivityDate);
		lastActivity.setHours(0, 0, 0, 0);

		// If last activity is not today or yesterday, streak is broken
		if (lastActivity < yesterday) {
			return 0;
		}

		// Count consecutive days
		let streak = 0;
		// If the latest completion was yesterday, streak should start from yesterday
		// (not from today), otherwise a valid 1-day streak incorrectly becomes 0.
		let currentDate = new Date(lastActivity);

		for (const completion of completions) {
			const completionDate = new Date(completion._id);
			completionDate.setHours(0, 0, 0, 0);

			if (completionDate.getTime() === currentDate.getTime()) {
				streak++;
				currentDate.setDate(currentDate.getDate() - 1);
			} else {
				break;
			}
		}

		return streak;
	} catch (error) {
		console.error("Error calculating streak:", error);
		return 0;
	}
}

/**
 * Get user's aggregated progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User progress stats
 */
export async function getUserProgress(userId) {
	try {
		let userProgress = await UserProgress.findOne({ userId });

		if (!userProgress) {
			// Initialize if doesn't exist
			userProgress = await UserProgress.create({ userId });
		}

		return {
			streak: userProgress.streak,
			xpThisWeek: userProgress.xpThisWeek,
			xpThisMonth: userProgress.xpThisMonth,
			totalXp: userProgress.totalXp,
			modulesCompleted: userProgress.modulesCompleted,
			totalModules: userProgress.totalModules,
			lessonsCompleted: userProgress.lessonsCompleted,
			totalLessons: userProgress.totalLessons,
			overallProgress: userProgress.overallProgressPercentage,
			level: userProgress.level,
		};
	} catch (error) {
		console.error("Error getting user progress:", error);
		throw error;
	}
}

/**
 * Get user's module progress breakdown
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Module progress list
 */
export async function getUserModuleProgress(userId) {
	try {
		const moduleProgresses = await ModuleProgress.find({ userId }).populate("moduleId", "title icon");

		return moduleProgresses.map((mp) => ({
			module: {
				id: mp.moduleId._id,
				title: mp.moduleId.title,
				icon: mp.moduleId.icon,
			},
			lessonsCompleted: mp.lessonsCompleted,
			totalLessons: mp.totalLessons,
			progressPercentage: mp.progressPercentage,
			completedAt: mp.completedAt,
			lastAccessedAt: mp.lastAccessedAt,
		}));
	} catch (error) {
		console.error("Error getting user module progress:", error);
		throw error;
	}
}

/**
 * Create a new module (admin endpoint)
 * @param {Object} data - Module data
 * @returns {Promise<Object>} Created module
 */
export async function createModule(data) {
	try {
		const module = await Module.create(data);
		return module;
	} catch (error) {
		console.error("Error creating module:", error);
		throw error;
	}
}

/**
 * Create a lesson (admin endpoint)
 * @param {Object} data - Lesson data
 * @returns {Promise<Object>} Created lesson
 */
export async function createLesson(data) {
	try {
		const lesson = await Lesson.create(data);

		// Add lesson to module's lessons array
		if (data.moduleId) {
			await Module.findByIdAndUpdate(
				data.moduleId,
				{ $push: { lessons: lesson._id } },
				{ new: true }
			);
		}

		return lesson;
	} catch (error) {
		console.error("Error creating lesson:", error);
		throw error;
	}
}
