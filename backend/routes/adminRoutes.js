import { Router } from "express";
import mongoose from "mongoose";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { Module } from "../models/Module.js";
import { Lesson } from "../models/Lesson.js";
import User from "../models/User.js";
import { UserModuleAssignment } from "../models/UserModuleAssignment.js";

const VALID_CATEGORIES = ["alphabet", "vocabulary", "sentences", "conversation"];
const VALID_ROLE_CATEGORIES = ["learner", "support-circle", "accessibility-needs"];
const VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const adminRoutes = Router();

adminRoutes.use(authMiddleware);
adminRoutes.use(adminMiddleware);

async function buildModulesWithAssignments(modules) {
	const moduleIds = modules.map((entry) => entry._id);
	const assignments = await UserModuleAssignment.find({ moduleId: { $in: moduleIds } }).lean();

	const userIds = [...new Set(assignments.map((entry) => entry.userId))];
	const users = await User.find({ id: { $in: userIds }, isActive: true })
		.select("id fullName email roleCategory role")
		.lean();

	const userById = new Map(users.map((entry) => [entry.id, entry]));
	const assignmentsByModuleId = new Map();

	for (const assignment of assignments) {
		const list = assignmentsByModuleId.get(String(assignment.moduleId)) || [];
		const assignedUser = userById.get(assignment.userId);

		if (assignedUser) {
			list.push({
				id: assignedUser.id,
				fullName: assignedUser.fullName,
				email: assignedUser.email,
				roleCategory: assignedUser.roleCategory,
				role: assignedUser.role,
				assignedAt: assignment.createdAt,
			});
		}

		assignmentsByModuleId.set(String(assignment.moduleId), list);
	}

	return modules.map((entry) => ({
		...entry,
		assignedUsers: assignmentsByModuleId.get(String(entry._id)) || [],
	}));
}

adminRoutes.get("/users", async (_request, response) => {
	try {
		const users = await User.find({ isActive: true })
			.select("id fullName email roleCategory role roleLabel")
			.sort({ fullName: 1 })
			.lean();

		return response.json({
			success: true,
			data: users,
		});
	} catch (error) {
		console.error("Admin list users error:", error);
		return response.status(500).json({ success: false, message: "Failed to fetch users." });
	}
});

adminRoutes.get("/modules", async (_request, response) => {
	try {
		const modules = await Module.find({})
			.sort({ orderIndex: 1, createdAt: 1 })
			.populate({
				path: "lessons",
				select: "title description duration order difficultyLevel isActive createdAt",
				options: { sort: { order: 1 } },
			})
			.lean();

		const modulesWithAssignments = await buildModulesWithAssignments(modules);

		return response.json({
			success: true,
			data: modulesWithAssignments,
		});
	} catch (error) {
		console.error("Admin list modules error:", error);
		return response.status(500).json({ success: false, message: "Failed to fetch modules." });
	}
});

adminRoutes.post("/modules/:moduleId/assignments", async (request, response) => {
	try {
		const { moduleId } = request.params;
		const { userId } = request.body ?? {};

		if (!mongoose.Types.ObjectId.isValid(moduleId)) {
			return response.status(400).json({ success: false, message: "Invalid module id." });
		}

		if (!userId) {
			return response.status(400).json({ success: false, message: "userId is required." });
		}

		const [moduleDoc, userDoc] = await Promise.all([
			Module.findById(moduleId),
			User.findOne({ id: userId, isActive: true }).select("id fullName email role roleCategory"),
		]);

		if (!moduleDoc) {
			return response.status(404).json({ success: false, message: "Module not found." });
		}

		if (!userDoc) {
			return response.status(404).json({ success: false, message: "User not found." });
		}

		await UserModuleAssignment.findOneAndUpdate(
			{ userId: userDoc.id, moduleId },
			{ userId: userDoc.id, moduleId, assignedBy: request.adminUser?.email || null },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);

		return response.status(201).json({
			success: true,
			message: "Module assigned to user.",
		});
	} catch (error) {
		console.error("Admin assign module error:", error);
		return response.status(500).json({ success: false, message: "Failed to assign module." });
	}
});

adminRoutes.delete("/modules/:moduleId/assignments/:userId", async (request, response) => {
	try {
		const { moduleId, userId } = request.params;

		if (!mongoose.Types.ObjectId.isValid(moduleId)) {
			return response.status(400).json({ success: false, message: "Invalid module id." });
		}

		await UserModuleAssignment.findOneAndDelete({ userId, moduleId });

		return response.json({
			success: true,
			message: "Module assignment removed.",
		});
	} catch (error) {
		console.error("Admin unassign module error:", error);
		return response.status(500).json({ success: false, message: "Failed to remove assignment." });
	}
});

adminRoutes.post("/modules", async (request, response) => {
	try {
		const {
			title,
			description,
			icon,
			category,
			orderIndex,
			isSequential = false,
			roleCategories = VALID_ROLE_CATEGORIES,
			isActive = true,
		} = request.body ?? {};

		if (!title || !description || !icon || !category || Number.isNaN(Number(orderIndex))) {
			return response.status(400).json({
				success: false,
				message: "title, description, icon, category and orderIndex are required.",
			});
		}

		if (!VALID_CATEGORIES.includes(category)) {
			return response.status(400).json({ success: false, message: "Invalid category." });
		}

		const filteredRoleCategories = Array.isArray(roleCategories)
			? roleCategories.filter((value) => VALID_ROLE_CATEGORIES.includes(value))
			: [];

		if (filteredRoleCategories.length === 0) {
			return response.status(400).json({ success: false, message: "At least one valid role category is required." });
		}

		const createdModule = await Module.create({
			title: String(title).trim(),
			description: String(description).trim(),
			icon: String(icon).trim(),
			category,
			orderIndex: Number(orderIndex),
			isSequential: Boolean(isSequential),
			roleCategories: filteredRoleCategories,
			isActive: Boolean(isActive),
			lessons: [],
		});

		return response.status(201).json({ success: true, data: createdModule });
	} catch (error) {
		console.error("Admin create module error:", error);
		return response.status(500).json({ success: false, message: "Failed to create module." });
	}
});

adminRoutes.patch("/modules/:moduleId", async (request, response) => {
	try {
		const { moduleId } = request.params;
		if (!mongoose.Types.ObjectId.isValid(moduleId)) {
			return response.status(400).json({ success: false, message: "Invalid module id." });
		}

		const payload = request.body ?? {};
		const update = {};

		if (payload.title !== undefined) update.title = String(payload.title).trim();
		if (payload.description !== undefined) update.description = String(payload.description).trim();
		if (payload.icon !== undefined) update.icon = String(payload.icon).trim();
		if (payload.orderIndex !== undefined) update.orderIndex = Number(payload.orderIndex);
		if (payload.isSequential !== undefined) update.isSequential = Boolean(payload.isSequential);
		if (payload.isActive !== undefined) update.isActive = Boolean(payload.isActive);

		if (payload.category !== undefined) {
			if (!VALID_CATEGORIES.includes(payload.category)) {
				return response.status(400).json({ success: false, message: "Invalid category." });
			}
			update.category = payload.category;
		}

		if (payload.roleCategories !== undefined) {
			if (!Array.isArray(payload.roleCategories)) {
				return response.status(400).json({ success: false, message: "roleCategories must be an array." });
			}

			const filtered = payload.roleCategories.filter((value) => VALID_ROLE_CATEGORIES.includes(value));
			if (filtered.length === 0) {
				return response.status(400).json({ success: false, message: "At least one valid role category is required." });
			}
			update.roleCategories = filtered;
		}

		const updatedModule = await Module.findByIdAndUpdate(moduleId, update, { new: true, runValidators: true });
		if (!updatedModule) {
			return response.status(404).json({ success: false, message: "Module not found." });
		}

		return response.json({ success: true, data: updatedModule });
	} catch (error) {
		console.error("Admin update module error:", error);
		return response.status(500).json({ success: false, message: "Failed to update module." });
	}
});

adminRoutes.delete("/modules/:moduleId", async (request, response) => {
	try {
		const { moduleId } = request.params;
		if (!mongoose.Types.ObjectId.isValid(moduleId)) {
			return response.status(400).json({ success: false, message: "Invalid module id." });
		}

		const deletedModule = await Module.findByIdAndDelete(moduleId);
		if (!deletedModule) {
			return response.status(404).json({ success: false, message: "Module not found." });
		}

		await Lesson.deleteMany({ moduleId });
		await UserModuleAssignment.deleteMany({ moduleId });

		return response.json({ success: true, message: "Module deleted." });
	} catch (error) {
		console.error("Admin delete module error:", error);
		return response.status(500).json({ success: false, message: "Failed to delete module." });
	}
});

adminRoutes.post("/modules/:moduleId/lessons", async (request, response) => {
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
		console.error("Admin create lesson error:", error);
		return response.status(500).json({ success: false, message: "Failed to create lesson." });
	}
});

adminRoutes.patch("/lessons/:lessonId", async (request, response) => {
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
		console.error("Admin update lesson error:", error);
		return response.status(500).json({ success: false, message: "Failed to update lesson." });
	}
});

adminRoutes.delete("/lessons/:lessonId", async (request, response) => {
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
		console.error("Admin delete lesson error:", error);
		return response.status(500).json({ success: false, message: "Failed to delete lesson." });
	}
});

export default adminRoutes;