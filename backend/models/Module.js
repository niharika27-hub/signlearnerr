import mongoose from "mongoose";

/**
 * Module Schema - Learning modules/courses for sign language learning
 * Each module contains multiple lessons and tracks are groups of modules
 */
const moduleSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			index: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		icon: {
			type: String, // Icon name (e.g., "Signature", "BookText", "MessageCircle")
			required: true,
		},
		category: {
			type: String,
			required: true,
			enum: ["alphabet", "vocabulary", "sentences", "conversation"],
			index: true,
		},
		orderIndex: {
			type: Number,
			required: true,
			index: true, // For sequencing modules in UI
		},
		isSequential: {
			type: Boolean,
			default: false, // If true, must complete lessons in order
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},
		lessons: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Lesson",
			},
		],
		roleCategories: [
			{
				type: String,
				enum: ["learner", "support-circle", "accessibility-needs"],
			},
		],
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

export const Module = mongoose.model("Module", moduleSchema);
