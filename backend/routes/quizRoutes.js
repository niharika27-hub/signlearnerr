import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { QuizQuestion } from "../models/QuizQuestion.js";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import mongoose from "mongoose";

const quizRoutes = Router();

function requireQuizManager(req, res, next) {
	const role = String(req.user?.role || "").trim().toLowerCase();

	if (role === "admin" || role === "teacher") {
		return next();
	}

	return res.status(403).json({
		success: false,
		message: "Quiz management access denied.",
	});
}

/**
 * Get all quiz questions for a lesson
 * @route GET /api/quiz/lessons/:lessonId/questions
 * @access Private (requires authentication)
 */
quizRoutes.get("/lessons/:lessonId/questions", authMiddleware, async (req, res) => {
	try {
		const { lessonId } = req.params;

		// Validate ObjectId
		if (!mongoose.Types.ObjectId.isValid(lessonId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid lesson ID format",
			});
		}

		// Fetch questions sorted by order
		const questions = await QuizQuestion.find({
			lessonId: new mongoose.Types.ObjectId(lessonId),
			isActive: true,
		})
			.sort({ order: 1 })
			.lean();

		if (!questions || questions.length === 0) {
			return res.json({
				success: true,
				message: "No quiz questions found for this lesson",
				data: [],
				count: 0,
			});
		}

		res.json({
			success: true,
			data: questions,
			count: questions.length,
		});
	} catch (error) {
		console.error("Error fetching quiz questions:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch quiz questions",
			error: error.message,
		});
	}
});

/**
 * Get quiz questions for a module (all questions across lessons)
 * @route GET /api/quiz/modules/:moduleId/questions
 * @access Private (requires authentication)
 */
quizRoutes.get("/modules/:moduleId/questions", authMiddleware, async (req, res) => {
	try {
		const { moduleId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(moduleId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid module ID format",
			});
		}

		const questions = await QuizQuestion.find({
			moduleId: new mongoose.Types.ObjectId(moduleId),
			isActive: true,
		})
			.populate("lessonId", "title")
			.sort({ order: 1 })
			.lean();

		res.json({
			success: true,
			data: questions,
			count: questions.length,
		});
	} catch (error) {
		console.error("Error fetching module quiz questions:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch module quiz questions",
			error: error.message,
		});
	}
});

/**
 * Get a specific quiz question by ID
 * @route GET /api/quiz/questions/:questionId
 * @access Private (requires authentication)
 */
quizRoutes.get("/questions/:questionId", authMiddleware, async (req, res) => {
	try {
		const { questionId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(questionId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid question ID format",
			});
		}

		const question = await QuizQuestion.findById(questionId).lean();

		if (!question) {
			return res.status(404).json({
				success: false,
				message: "Quiz question not found",
			});
		}

		res.json({
			success: true,
			data: question,
		});
	} catch (error) {
		console.error("Error fetching quiz question:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch quiz question",
			error: error.message,
		});
	}
});

/**
 * Get quiz questions by type (e.g., alphabet-recognition)
 * @route GET /api/quiz/questions/type/:questionType
 * @access Private (requires authentication)
 */
quizRoutes.get("/questions/type/:questionType", authMiddleware, async (req, res) => {
	try {
		const { questionType } = req.params;
		const { limit = 10 } = req.query;

		const validTypes = ["alphabet-recognition", "handshape-to-letter", "text-based", "image-to-text"];
		if (!validTypes.includes(questionType)) {
			return res.status(400).json({
				success: false,
				message: `Invalid question type. Valid types: ${validTypes.join(", ")}`,
			});
		}

		const questions = await QuizQuestion.find({
			questionType,
			isActive: true,
		})
			.limit(parseInt(limit))
			.sort({ createdAt: -1 })
			.lean();

		res.json({
			success: true,
			data: questions,
			count: questions.length,
		});
	} catch (error) {
		console.error("Error fetching questions by type:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch questions by type",
			error: error.message,
		});
	}
});

/**
 * Browse Cloudinary quiz images for the image picker
 * @route GET /api/quiz/cloudinary/images
 * @access Private (admin/teacher)
 */
quizRoutes.get("/cloudinary/images", authMiddleware, requireQuizManager, async (req, res) => {
	try {
		if (!isCloudinaryConfigured()) {
			return res.status(503).json({
				success: false,
				message: "Cloudinary is not configured.",
			});
		}

		const folder = String(req.query.folder || "signlearnerr/alphabets").trim() || "signlearnerr/alphabets";
		const maxResults = Math.max(1, Math.min(Number(req.query.limit) || 50, 100));

		let resources = [];

		// Cloudinary Media Library folders can be backed by `asset_folder` (dynamic folders),
		// which may not match the public_id prefix. Search by asset_folder first.
		try {
			const safeFolder = folder.replace(/"/g, '\\"');
			const searchExpression = `resource_type:image AND asset_folder="${safeFolder}"`;
			const searchResponse = await cloudinary.search
				.expression(searchExpression)
				.sort_by("created_at", "desc")
				.max_results(maxResults)
				.execute();

			resources = Array.isArray(searchResponse?.resources) ? searchResponse.resources : [];
		} catch (searchError) {
			console.warn("Cloudinary asset_folder search failed, falling back to prefix lookup:", searchError?.message || searchError);
		}

		if (resources.length === 0) {
			const prefix = folder.endsWith("/") ? folder : `${folder}/`;
			const fallbackResponse = await cloudinary.api.resources({
				resource_type: "image",
				type: "upload",
				prefix,
				max_results: maxResults,
				direction: "asc",
			});

			resources = Array.isArray(fallbackResponse?.resources) ? fallbackResponse.resources : [];
		}

		const images = resources.map((item) => ({
			publicId: item.public_id,
			secureUrl: item.secure_url,
			url: item.url,
			folder,
			format: item.format,
			width: item.width,
			height: item.height,
			originalFilename: item.original_filename,
		}));

		return res.json({
			success: true,
			data: {
				folder,
				count: images.length,
				images,
			},
		});
	} catch (error) {
		console.error("Error browsing Cloudinary images:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to load Cloudinary images.",
			error: error.message,
		});
	}
});

/**
 * Create a new quiz question (admin/teacher only)
 * @route POST /api/quiz/questions
 * @access Private (admin/teacher)
 */
quizRoutes.post("/questions", authMiddleware, requireQuizManager, async (req, res) => {
	try {
		const { lessonId, moduleId, questionType, questionText, questionImage, options, difficulty, order, tags, explanation } = req.body;

		// Validation
		if (!lessonId || !moduleId) {
			return res.status(400).json({
				success: false,
				message: "lessonId and moduleId are required",
			});
		}

		if (!questionText || !options || options.length < 2) {
			return res.status(400).json({
				success: false,
				message: "questionText and at least 2 options are required",
			});
		}

		// Ensure at least one option is marked as correct
		const hasCorrectOption = options.some((opt) => opt.isCorrect === true);
		if (!hasCorrectOption) {
			return res.status(400).json({
				success: false,
				message: "At least one option must be marked as correct",
			});
		}

		const newQuestion = new QuizQuestion({
			lessonId,
			moduleId,
			questionType,
			questionText,
			questionImage,
			options,
			difficulty,
			order,
			tags,
			explanation,
			createdBy: req.user.id,
		});

		await newQuestion.save();

		res.status(201).json({
			success: true,
			message: "Quiz question created successfully",
			data: newQuestion,
		});
	} catch (error) {
		console.error("Error creating quiz question:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create quiz question",
			error: error.message,
		});
	}
});

/**
 * Update a quiz question (admin/teacher only)
 * @route PUT /api/quiz/questions/:questionId
 * @access Private (admin/teacher)
 */
quizRoutes.put("/questions/:questionId", authMiddleware, requireQuizManager, async (req, res) => {
	try {
		const { questionId } = req.params;
		const updates = req.body;

		if (!mongoose.Types.ObjectId.isValid(questionId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid question ID format",
			});
		}

		const question = await QuizQuestion.findByIdAndUpdate(questionId, { ...updates, updatedAt: new Date() }, { new: true });

		if (!question) {
			return res.status(404).json({
				success: false,
				message: "Quiz question not found",
			});
		}

		res.json({
			success: true,
			message: "Quiz question updated successfully",
			data: question,
		});
	} catch (error) {
		console.error("Error updating quiz question:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update quiz question",
			error: error.message,
		});
	}
});

/**
 * Delete a quiz question (admin only)
 * @route DELETE /api/quiz/questions/:questionId
 * @access Private (admin)
 */
quizRoutes.delete("/questions/:questionId", authMiddleware, requireQuizManager, async (req, res) => {
	try {
		const { questionId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(questionId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid question ID format",
			});
		}

		const question = await QuizQuestion.findByIdAndDelete(questionId);

		if (!question) {
			return res.status(404).json({
				success: false,
				message: "Quiz question not found",
			});
		}

		res.json({
			success: true,
			message: "Quiz question deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting quiz question:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete quiz question",
			error: error.message,
		});
	}
});

export default quizRoutes;





