import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Module } from "../models/Module.js";
import { Lesson } from "../models/Lesson.js";

dotenv.config();

const WIKIMEDIA_FILEPATH_BASE = "https://commons.wikimedia.org/wiki/Special:FilePath";

function wikiVideo(fileName) {
	return `${WIKIMEDIA_FILEPATH_BASE}/${encodeURIComponent(String(fileName || "").trim())}`;
}

const seedData = [
	{
		title: "Basic Alphabets",
		description:
			"Master ASL finger-spelling from A-Z with static hand-shape drills and recognition practice.",
		icon: "Signature",
		category: "alphabet",
		orderIndex: 1,
		isSequential: true,
		roleCategories: ["learner", "support-circle", "accessibility-needs"],
		lessons: [
			{
				title: "A-I Hand Shapes",
				duration: 10,
				contentUrl: wikiVideo("American Sign Language demo - Travis Dougherty.ogv"),
				description:
					"Static alphabet signs using classroom-style images from ASL Alphabet and Sign Language MNIST style examples.",
			},
			{
				title: "J-R Finger-spelling Flow",
				duration: 10,
				contentUrl: wikiVideo("ASL BOOK justsign.ogv"),
				description:
					"Blend static and motion-aware letters with emphasis on smooth transitions.",
			},
			{
				title: "S-Z + Recall Quiz",
				duration: 10,
				contentUrl: wikiVideo("ASL BOOK.ogv"),
				description:
					"Speed and accuracy drill for complete alphabet recall.",
			},
		],
	},
	{
		title: "Words",
		description:
			"Learn high-frequency ASL vocabulary words from word-level datasets used in modern sign recognition research.",
		icon: "BookText",
		category: "vocabulary",
		orderIndex: 2,
		isSequential: true,
		roleCategories: ["learner", "support-circle", "accessibility-needs"],
		lessons: [
			{
				title: "Common Daily Words",
				duration: 12,
				contentUrl: wikiVideo("ASL Literature - Pointy Three.webm"),
				description:
					"Core vocabulary inspired by WLASL and MS-ASL frequent classes.",
			},
			{
				title: "People, Places, Actions",
				duration: 12,
				contentUrl: wikiVideo("ASL Literature -The Tortoise and the Hare.webm"),
				description:
					"Vocabulary sets for everyday communication contexts.",
			},
			{
				title: "Word Recognition Challenge",
				duration: 12,
				contentUrl: wikiVideo("ASL Literature - Deaf-Blind Ninja.webm"),
				description:
					"Multi-signer recognition practice inspired by ASL Citizen diversity.",
			},
		],
	},
	{
		title: "Sentences",
		description:
			"Move from isolated signs to sentence-level understanding with continuous ASL clips and translation-oriented drills.",
		icon: "MessageCircle",
		category: "sentences",
		orderIndex: 3,
		isSequential: true,
		roleCategories: ["learner", "support-circle", "accessibility-needs"],
		lessons: [
			{
				title: "Simple Sentence Patterns",
				duration: 15,
				contentUrl: wikiVideo("The Night Before Christmas in American Sign Language.webm"),
				description:
					"Continuous signing clips inspired by How2Sign sentence structure.",
			},
			{
				title: "Questions and Responses",
				duration: 15,
				contentUrl: wikiVideo("ASL Literature - Pointy Three.webm"),
				description:
					"Practice sentence comprehension and response timing.",
			},
			{
				title: "Context Conversation Drill",
				duration: 15,
				contentUrl: wikiVideo("ASL Literature -The Tortoise and the Hare.webm"),
				description:
					"Longer phrase decoding with real-world pacing and signer variation.",
			},
		],
	},
];

async function seedDatabase() {
	try {
		console.log("Starting database seed...");

		await connectDB();
		console.log("Connected to MongoDB");

		await Module.deleteMany({});
		await Lesson.deleteMany({});
		console.log("Cleared existing modules and lessons");

		let totalLessonsCreated = 0;

		for (const moduleData of seedData) {
			const { lessons, ...moduleInfo } = moduleData;

			const module = await Module.create(moduleInfo);
			console.log(`Created module: ${module.title}`);

			for (const [index, lesson] of lessons.entries()) {
				const lessonData = {
					moduleId: module._id,
					title: lesson.title,
					description: lesson.description,
					contentUrl: lesson.contentUrl || "",
					duration: lesson.duration,
					order: index + 1,
					difficultyLevel: index === 0 ? "beginner" : index === 1 ? "intermediate" : "advanced",
					prerequisites: [],
				};

				const createdLesson = await Lesson.create(lessonData);
				module.lessons.push(createdLesson._id);
				totalLessonsCreated += 1;
			}

			await module.save();
		}

		console.log("Seed completed successfully.");
		console.log(`Created ${seedData.length} modules and ${totalLessonsCreated} lessons.`);

		process.exit(0);
	} catch (error) {
		console.error("Seed failed:", error);
		process.exit(1);
	}
}

seedDatabase();
