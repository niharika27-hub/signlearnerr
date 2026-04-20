import mongoose from "mongoose";

/**
 * LessonCompletion Schema - Tracks when users complete lessons
 * Records completion timestamp, score (optional), and other metrics
 */
const lessonCompletionSchema = new mongoose.Schema(
	{
		userId: {
			type: String, // Reference to User.id (UUID string)
			required: true,
			index: true,
		},
		lessonId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Lesson",
			required: true,
			index: true,
		},
		moduleId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Module",
			required: true,
			index: true,
		},
		completedAt: {
			type: Date,
			default: Date.now,
			index: true,
		},
		score: {
			type: Number, // Score if assessment-based (0-100)
			min: 0,
			max: 100,
			default: null,
		},
		timeSpent: {
			type: Number, // Time spent on lesson in seconds
			default: null,
		},
		attempts: {
			type: Number, // Number of attempts to complete
			default: 1,
		},
		isRetake: {
			type: Boolean, // Whether this is a retake/re-attempt
			default: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

// Compound index for efficient queries by user + lesson
lessonCompletionSchema.index({ userId: 1, lessonId: 1 });
// Index for finding all completions by user
lessonCompletionSchema.index({ userId: 1, completedAt: -1 });

export const LessonCompletion = mongoose.model("LessonCompletion", lessonCompletionSchema);
