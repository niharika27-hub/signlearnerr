import mongoose from "mongoose";

/**
 * Lesson Schema - Individual lessons within a module
 * Each lesson has content, duration, and can have prerequisites
 */
const lessonSchema = new mongoose.Schema(
	{
		moduleId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Module",
			required: true,
			index: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
			index: true,
		},
		description: {
			type: String,
			default: "",
			trim: true,
		},
		contentUrl: {
			type: String, // URL to video, image, or content
			default: "", // Can be placeholder or actual media URL
		},
		duration: {
			type: Number, // Duration in minutes
			default: 5,
		},
		order: {
			type: Number, // Order within module
			required: true,
			index: true,
		},
		prerequisites: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Lesson", // Other lessons that must be completed first
			},
		],
		difficultyLevel: {
			type: String,
			enum: ["beginner", "intermediate", "advanced"],
			default: "beginner",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
			index: true,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

export const Lesson = mongoose.model("Lesson", lessonSchema);
