import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
	getModulesForUser,
	getModuleWithLessons,
	completeLesson,
	updateUserProgress,
} from "../services/moduleService.js";
import mongoose from "mongoose";

const learningRoutes = Router();

async function buildUserProgressPayload(userId) {
	const { UserProgress } = await import("../models/UserProgress.js");
	const { ModuleProgress } = await import("../models/ModuleProgress.js");

	// Keep denormalized UserProgress aligned with current module scope.
	await updateUserProgress(userId);

	const userProgress = await UserProgress.findOne({ userId }).lean();
	const moduleProgress = await ModuleProgress.find({ userId })
		.populate("moduleId", "title icon category")
		.lean();

	if (!userProgress) {
		return {
			streak: 0,
			xpThisWeek: 0,
			totalXp: 0,
			overallProgressPercentage: 0,
			modulesCompleted: 0,
			totalModules: 0,
			lessonsCompleted: 0,
			moduleProgress: [],
		};
	}

	return {
		...userProgress,
		moduleProgress,
	};
}

// All learning routes require authentication
learningRoutes.use(authMiddleware);

/**
 * Get all available modules for the user's role
 */
learningRoutes.get("/modules", async (req, res) => {
	try {
		const { id: userId, roleCategory } = req.user;
		const modules = await getModulesForUser(userId, roleCategory);

		res.json({
			success: true,
			data: modules,
		});
	} catch (error) {
		console.error("Error fetching modules:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch modules",
			error: error.message,
		});
	}
});

/**
 * Get detailed module with lessons and completion status
 */
learningRoutes.get("/modules/:moduleId", async (req, res) => {
	try {
		const { moduleId } = req.params;
		const { id: userId } = req.user;

		const module = await getModuleWithLessons(moduleId, userId);

		if (!module) {
			return res.status(404).json({
				success: false,
				message: "Module not found",
			});
		}

		res.json({
			success: true,
			data: module,
		});
	} catch (error) {
		console.error("Error fetching module:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch module",
			error: error.message,
		});
	}
});

/**
 * Complete a lesson
 */
learningRoutes.post("/lessons/:lessonId/complete", async (req, res) => {
	try {
		const { lessonId } = req.params;
		const { id: userId } = req.user;
		const { score } = req.body; // Optional score

		const progress = await completeLesson(userId, lessonId, score);

		res.json({
			success: true,
			data: progress,
		});
	} catch (error) {
		console.error("Error completing lesson:", error);

		if (error.statusCode) {
			return res.status(error.statusCode).json({
				success: false,
				message: error.message,
			});
		}

		res.status(500).json({
			success: false,
			message: "Failed to complete lesson",
			error: error.message,
		});
	}
});

/**
 * Get user's overall progress
 */
learningRoutes.get("/progress", async (req, res) => {
	try {
		const { id: userId } = req.user;
		const data = await buildUserProgressPayload(userId);

		res.json({
			success: true,
			data,
		});
	} catch (error) {
		console.error("Error fetching progress:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch progress",
			error: error.message,
		});
	}
});

/**
 * Compatibility alias used by frontend clients
 */
learningRoutes.get("/user/progress", async (req, res) => {
	try {
		const { id: userId } = req.user;
		const data = await buildUserProgressPayload(userId);

		res.json({
			success: true,
			data,
		});
	} catch (error) {
		console.error("Error fetching user progress:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch user progress",
			error: error.message,
		});
	}
});

/**
 * Get per-module progress for current user
 */
learningRoutes.get("/user/progress/modules", async (req, res) => {
	try {
		const { id: userId } = req.user;
		const { ModuleProgress } = await import("../models/ModuleProgress.js");

		const modules = await ModuleProgress.find({ userId })
			.populate("moduleId", "title icon category")
			.sort({ lastAccessedAt: -1 })
			.lean();

		res.json({
			success: true,
			data: {
				modules,
			},
		});
	} catch (error) {
		console.error("Error fetching module progress:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch module progress",
			error: error.message,
		});
	}
});

/**
 * Save a quiz attempt for the current user
 */
learningRoutes.post("/quiz/attempts", async (req, res) => {
	try {
		const { id: userId } = req.user;
		const {
			lessonId = null,
			lessonTitle = "",
			modeId = "",
			modeTitle = "",
			score,
			correctCount,
			totalQuestions,
			syncedToProgress = false,
			completedAt,
		} = req.body || {};

		if (!modeId || !modeTitle) {
			return res.status(400).json({
				success: false,
				message: "modeId and modeTitle are required",
			});
		}

		const normalizedScore = Number(score);
		const normalizedCorrectCount = Number(correctCount);
		const normalizedTotalQuestions = Number(totalQuestions);

		if (!Number.isFinite(normalizedScore) || normalizedScore < 0 || normalizedScore > 100) {
			return res.status(400).json({
				success: false,
				message: "score must be between 0 and 100",
			});
		}

		if (
			!Number.isFinite(normalizedCorrectCount) ||
			normalizedCorrectCount < 0 ||
			!Number.isFinite(normalizedTotalQuestions) ||
			normalizedTotalQuestions < 1 ||
			normalizedCorrectCount > normalizedTotalQuestions
		) {
			return res.status(400).json({
				success: false,
				message: "Invalid quiz result counts",
			});
		}

		const { QuizAttempt } = await import("../models/QuizAttempt.js");

		const attempt = await QuizAttempt.create({
			userId,
			lessonId:
				lessonId && mongoose.Types.ObjectId.isValid(lessonId)
					? lessonId
					: null,
			lessonTitle: String(lessonTitle || ""),
			modeId: String(modeId),
			modeTitle: String(modeTitle),
			score: Math.round(normalizedScore),
			correctCount: Math.round(normalizedCorrectCount),
			totalQuestions: Math.round(normalizedTotalQuestions),
			syncedToProgress: Boolean(syncedToProgress),
			completedAt: completedAt ? new Date(completedAt) : new Date(),
		});

		const recentAttempts = await QuizAttempt.find({ userId })
			.sort({ completedAt: -1, createdAt: -1 })
			.limit(5)
			.lean();

		res.status(201).json({
			success: true,
			data: {
				attempt,
				recentAttempts,
			},
		});
	} catch (error) {
		console.error("Error saving quiz attempt:", error);
		res.status(500).json({
			success: false,
			message: "Failed to save quiz attempt",
			error: error.message,
		});
	}
});

/**
 * Get recent quiz attempts for the current user
 */
learningRoutes.get("/quiz/attempts", async (req, res) => {
	try {
		const { id: userId } = req.user;
		const limit = Math.max(1, Math.min(Number(req.query.limit) || 5, 20));

		const { QuizAttempt } = await import("../models/QuizAttempt.js");
		const attempts = await QuizAttempt.find({ userId })
			.sort({ completedAt: -1, createdAt: -1 })
			.limit(limit)
			.lean();

		res.json({
			success: true,
			data: {
				attempts,
			},
		});
	} catch (error) {
		console.error("Error fetching quiz attempts:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch quiz attempts",
			error: error.message,
		});
	}
});

export default learningRoutes;