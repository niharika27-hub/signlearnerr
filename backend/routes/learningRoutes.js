import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
	getModulesByRole,
	getModuleWithLessons,
	completeLesson,
} from "../services/moduleService.js";

const learningRoutes = Router();

// All learning routes require authentication
learningRoutes.use(authMiddleware);

/**
 * Get all available modules for the user's role
 */
learningRoutes.get("/modules", async (req, res) => {
	try {
		const { roleCategory } = req.user;
		const modules = await getModulesByRole(roleCategory);

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

		if (error.message === "Lesson not found") {
			return res.status(404).json({
				success: false,
				message: "Lesson not found",
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

		// Import UserProgress model
		const { UserProgress } = await import("../models/UserProgress.js");

		const userProgress = await UserProgress.findOne({ userId }).populate({
			path: "moduleProgress",
			populate: {
				path: "moduleId",
				select: "title icon category",
			},
		});

		if (!userProgress) {
			return res.json({
				success: true,
				data: {
					streak: 0,
					xpThisWeek: 0,
					totalXp: 0,
					overallProgressPercentage: 0,
					moduleProgress: [],
				},
			});
		}

		res.json({
			success: true,
			data: userProgress,
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

export default learningRoutes;