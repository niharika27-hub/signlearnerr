import mongoose from "mongoose";

/**
 * ModuleProgress Schema - Denormalized user progress per module
 * Cached for fast queries; recalculated when lessons are completed
 * Provides instant access to module completion percentage
 */
const moduleProgressSchema = new mongoose.Schema(
	{
		userId: {
			type: String, // Reference to User.id (UUID string)
			required: true,
			index: true,
		},
		moduleId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Module",
			required: true,
			index: true,
		},
		lessonsCompleted: {
			type: Number,
			default: 0,
			min: 0,
		},
		totalLessons: {
			type: Number,
			default: 0,
			min: 0,
		},
		progressPercentage: {
			type: Number, // Calculated: (lessonsCompleted / totalLessons) * 100
			default: 0,
			min: 0,
			max: 100,
			index: true,
		},
		completedAt: {
			type: Date, // When module was completed (100%)
			default: null,
		},
		lastAccessedAt: {
			type: Date, // Last time user accessed this module
			default: Date.now,
			index: true,
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

// Compound index for efficient queries
moduleProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });
// Index for finding user's in-progress modules
moduleProgressSchema.index({ userId: 1, progressPercentage: 1 });

export const ModuleProgress = mongoose.model("ModuleProgress", moduleProgressSchema);
