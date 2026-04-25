import { Router } from "express";
import mongoose from "mongoose";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { teacherMiddleware } from "../middleware/teacherMiddleware.js";
import { Module } from "../models/Module.js";
import { Lesson } from "../models/Lesson.js";

const VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const teacherRoutes = Router();

teacherRoutes.use(authMiddleware);
teacherRoutes.use(teacherMiddleware);

async function buildModulesForTeacherPanel(modules) {
	return modules.map((entry) => ({
		...entry,
		lessons: entry.lessons || [],
	}));
}

teacherRoutes.get("/modules", async (_request, response) => {
	try {
		const modules = await Module.find({})
			.sort({ orderIndex: 1, createdAt: 1 })
			.populate({
				path: "lessons",
				select: "title description contentUrl duration order difficultyLevel isActive createdAt",
				options: { sort: { order: 1 } },
			})
			.lean();

		const payload = await buildModulesForTeacherPanel(modules);

		return response.json({
			success: true,
			data: payload,
		});
	} catch (error) {
		console.error("Teacher list modules error:", error);
		return response.status(500).json({ success: false, message: "Failed to fetch modules." });
	}
});

teacherRoutes.post("/modules/:moduleId/lessons", async (request, response) => {
	try {
		const { moduleId } = request.params;
		if (!mongoose.Types.ObjectId.isValid(moduleId)) {
			return response.status(400).json({ success: false, message: "Invalid module id." });
		}

		const moduleDoc = await Module.findById(moduleId);
		if (!moduleDoc) {
			return response.status(404).json({ success: false, message: "Module not found." });
		}

		const {
			title,
			description = "",
			contentUrl = "",
			duration = 5,
			order,
			difficultyLevel = "beginner",
			isActive = true,
		} = request.body ?? {};

		if (!title || Number.isNaN(Number(order))) {
			return response.status(400).json({ success: false, message: "title and order are required." });
		}

		if (!VALID_DIFFICULTIES.includes(difficultyLevel)) {
			return response.status(400).json({ success: false, message: "Invalid difficulty level." });
		}

		const createdLesson = await Lesson.create({
			moduleId,
			title: String(title).trim(),
			description: String(description || "").trim(),
			contentUrl: String(contentUrl || "").trim(),
			duration: Number(duration),
			order: Number(order),
			difficultyLevel,
			isActive: Boolean(isActive),
			prerequisites: [],
		});

		moduleDoc.lessons.push(createdLesson._id);
		await moduleDoc.save();

		return response.status(201).json({ success: true, data: createdLesson });
	} catch (error) {
		console.error("Teacher create lesson error:", error);
		return response.status(500).json({ success: false, message: "Failed to create lesson." });
	}
});

teacherRoutes.patch("/lessons/:lessonId", async (request, response) => {
	try {
		const { lessonId } = request.params;
		if (!mongoose.Types.ObjectId.isValid(lessonId)) {
			return response.status(400).json({ success: false, message: "Invalid lesson id." });
		}

		const payload = request.body ?? {};
		const update = {};

		if (payload.title !== undefined) update.title = String(payload.title).trim();
		if (payload.description !== undefined) update.description = String(payload.description).trim();
		if (payload.contentUrl !== undefined) update.contentUrl = String(payload.contentUrl).trim();
		if (payload.duration !== undefined) update.duration = Number(payload.duration);
		if (payload.order !== undefined) update.order = Number(payload.order);
		if (payload.isActive !== undefined) update.isActive = Boolean(payload.isActive);

		if (payload.difficultyLevel !== undefined) {
			if (!VALID_DIFFICULTIES.includes(payload.difficultyLevel)) {
				return response.status(400).json({ success: false, message: "Invalid difficulty level." });
			}
			update.difficultyLevel = payload.difficultyLevel;
		}

		const updatedLesson = await Lesson.findByIdAndUpdate(lessonId, update, { new: true, runValidators: true });
		if (!updatedLesson) {
			return response.status(404).json({ success: false, message: "Lesson not found." });
		}

		return response.json({ success: true, data: updatedLesson });
	} catch (error) {
		console.error("Teacher update lesson error:", error);
		return response.status(500).json({ success: false, message: "Failed to update lesson." });
	}
});

teacherRoutes.delete("/lessons/:lessonId", async (request, response) => {
	try {
		const { lessonId } = request.params;
		if (!mongoose.Types.ObjectId.isValid(lessonId)) {
			return response.status(400).json({ success: false, message: "Invalid lesson id." });
		}

		const lesson = await Lesson.findByIdAndDelete(lessonId);
		if (!lesson) {
			return response.status(404).json({ success: false, message: "Lesson not found." });
		}

		await Module.findByIdAndUpdate(lesson.moduleId, { $pull: { lessons: lesson._id } });

		return response.json({ success: true, message: "Lesson deleted." });
	} catch (error) {
		console.error("Teacher delete lesson error:", error);
		return response.status(500).json({ success: false, message: "Failed to delete lesson." });
	}
});

export default teacherRoutes;