import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			index: true,
		},
		lessonId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Lesson",
			default: null,
			index: true,
		},
		lessonTitle: {
			type: String,
			default: "",
			trim: true,
		},
		modeId: {
			type: String,
			required: true,
			trim: true,
		},
		modeTitle: {
			type: String,
			required: true,
			trim: true,
		},
		score: {
			type: Number,
			required: true,
			min: 0,
			max: 100,
		},
		correctCount: {
			type: Number,
			required: true,
			min: 0,
		},
		totalQuestions: {
			type: Number,
			required: true,
			min: 1,
		},
		syncedToProgress: {
			type: Boolean,
			default: false,
		},
		completedAt: {
			type: Date,
			default: Date.now,
			index: true,
		},
	},
	{ timestamps: true }
);

quizAttemptSchema.index({ userId: 1, completedAt: -1 });

export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
