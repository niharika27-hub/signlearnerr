import mongoose from "mongoose";

/**
 * QuizQuestion Schema - Centralized quiz question management
 * Supports image-based and text-based questions with flexible option types
 */
const quizQuestionSchema = new mongoose.Schema(
	{
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
		questionType: {
			type: String,
			enum: [
				"alphabet-recognition", // Show image, choose letter
				"handshape-to-letter", // Show letter, choose handshape image
				"text-based", // Traditional text question
				"image-to-text", // Show image, choose text
			],
			default: "text-based",
		},
		questionText: {
			type: String,
			required: true,
			trim: true,
		},
		questionImage: {
			type: String, // URL to image (e.g., /uploads/alphabets/A.png)
			default: null,
		},
		questionImageAlt: {
			type: String, // Accessibility: alt text for image
			default: "",
		},
		options: [
			{
				_id: false,
				text: {
					type: String, // Text content of option
					default: "",
				},
				image: {
					type: String, // Image path (e.g., /uploads/alphabets/B.png)
					default: null,
				},
				imageAlt: {
					type: String,
					default: "",
				},
				isCorrect: {
					type: Boolean,
					default: false,
				},
				explanation: {
					type: String, // Why this is correct/incorrect
					default: "",
				},
			},
		],
		difficulty: {
			type: String,
			enum: ["easy", "medium", "hard"],
			default: "medium",
		},
		order: {
			type: Number, // Question order within lesson quiz
			default: 0,
		},
		tags: [
			{
				type: String, // e.g., "vowels", "consonants", "numbers"
			},
		],
		explanation: {
			type: String, // General explanation shown after answering
			default: "",
		},
		createdBy: {
			type: String, // User ID who created this question
			default: null,
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true,
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

// Compound indexes for efficient queries
quizQuestionSchema.index({ lessonId: 1, order: 1 });
quizQuestionSchema.index({ moduleId: 1, isActive: 1 });
quizQuestionSchema.index({ questionType: 1, isActive: 1 });

export const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);
