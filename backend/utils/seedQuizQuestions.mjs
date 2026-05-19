import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import { QuizQuestion } from "../models/QuizQuestion.js";
import { Lesson } from "../models/Lesson.js";
import { Module } from "../models/Module.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seeds quiz questions from learning-content.json into the database
 * Converts existing quiz data to the new QuizQuestion model
 */
async function seedQuizQuestions() {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/signlearn");
		console.log("✅ Connected to MongoDB");

		// Load learning content JSON
		const learningContentPath = path.join(__dirname, "../../frontend/src/data/learning-content.json");
		const learningContent = JSON.parse(fs.readFileSync(learningContentPath, "utf-8"));

		let questionsCreated = 0;
		let questionsSkipped = 0;

		// Iterate through modules and lessons
		for (const module of learningContent.modules || []) {
			console.log(`\n📚 Processing module: ${module.title}`);

			// Find or create module in DB
			let dbModule = await Module.findOne({ title: module.title }).lean();
			if (!dbModule) {
				console.log(`   ⚠️  Module "${module.title}" not found in database, skipping...`);
				continue;
			}

			for (const category of module.categories || []) {
				for (const lesson of category.lessons || []) {
					// Find lesson in DB
					let dbLesson = await Lesson.findOne({ title: lesson.title, moduleId: dbModule._id }).lean();

					if (!dbLesson) {
						console.log(`   ⚠️  Lesson "${lesson.title}" not found, skipping...`);
						questionsSkipped++;
						continue;
					}

					// Check if quiz data exists
					if (!lesson.quiz || !lesson.quiz.question) {
						questionsSkipped++;
						continue;
					}

					// Check if question already exists
					const existingQuestion = await QuizQuestion.findOne({
						lessonId: dbLesson._id,
						questionText: lesson.quiz.question,
					});

					if (existingQuestion) {
						console.log(
							`   ℹ️  Question for "${lesson.title}" already exists (${dbLesson._id}), skipping...`
						);
						questionsSkipped++;
						continue;
					}

					// Determine if this is an image-based question
					const isImageQuestion = lesson.quiz.options && Array.isArray(lesson.quiz.options) && lesson.quiz.options.some((opt) => opt && opt.startsWith("/"));

					const questionType = isImageQuestion ? "text-based" : "text-based"; // Default for migration

					// Create quiz question
					const quizQuestion = new QuizQuestion({
						lessonId: dbLesson._id,
						moduleId: dbModule._id,
						questionType,
						questionText: lesson.quiz.question,
						options: (lesson.quiz.options || []).map((option, index) => ({
							text: option,
							isCorrect: index === lesson.quiz.correctOptionIndex,
							explanation: "",
						})),
						difficulty: mapDifficultyLevel(lesson.difficulty || "medium"),
						order: lesson.order || 0,
						tags: [category.categoryKey || "general"],
						explanation: lesson.quiz.explanation || "",
						createdBy: "system-migration",
					});

					await quizQuestion.save();
					questionsCreated++;
					console.log(`   ✅ Created question: "${lesson.title}"`);
				}
			}
		}

		console.log("\n========================================");
		console.log(`✅ Seeding completed!`);
		console.log(`   Questions created: ${questionsCreated}`);
		console.log(`   Questions skipped: ${questionsSkipped}`);
		console.log("========================================\n");

		await mongoose.connection.close();
		console.log("✅ Database connection closed");
	} catch (error) {
		console.error("❌ Error seeding quiz questions:", error);
		process.exit(1);
	}
}

/**
 * Map difficulty level from learning content to quiz schema
 */
function mapDifficultyLevel(difficulty) {
	const map = {
		easy: "easy",
		medium: "medium",
		hard: "hard",
		Easy: "easy",
		Medium: "medium",
		Hard: "hard",
	};
	return map[difficulty] || "medium";
}

// Run the seeding
seedQuizQuestions();
