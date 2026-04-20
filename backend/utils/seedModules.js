import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Module } from "../models/Module.js";
import { Lesson } from "../models/Lesson.js";

dotenv.config();

const seedData = [
	{
		title: "A-Z Alphabets",
		description: "Learn the sign language alphabet from A to Z. Master the foundation of sign language communication.",
		icon: "Signature",
		category: "alphabet",
		orderIndex: 1,
		isSequential: false,
		roleCategories: ["learner", "support-circle", "accessibility-needs"],
		lessons: [
			{ title: "A-H Letters", duration: 8 },
			{ title: "I-P Letters", duration: 8 },
			{ title: "Q-X Letters", duration: 8 },
			{ title: "Y-Z & Numbers", duration: 8 },
		],
	},
	{
		title: "Basic Words",
		description: "Learn essential vocabulary for everyday communication including greetings, emotions, and common objects.",
		icon: "BookText",
		category: "vocabulary",
		orderIndex: 2,
		isSequential: false,
		roleCategories: ["learner", "support-circle", "accessibility-needs"],
		lessons: [
			{ title: "Greetings & Expressions", duration: 10 },
			{ title: "Family & People", duration: 10 },
			{ title: "Objects & Places", duration: 10 },
			{ title: "Emotions & Actions", duration: 10 },
		],
	},
	{
		title: "Daily Sentences",
		description: "Build sentence structure and practice common phrases used in daily conversations.",
		icon: "MessageCircle",
		category: "sentences",
		orderIndex: 3,
		isSequential: false,
		roleCategories: ["learner", "support-circle", "accessibility-needs"],
		lessons: [
			{ title: "Introductions", duration: 12 },
			{ title: "Questions & Answers", duration: 12 },
			{ title: "Requests & Polite Phrases", duration: 12 },
			{ title: "Common Conversations", duration: 12 },
		],
	},
	{
		title: "Advanced Conversations",
		description: "Master complex sentence structures and participate in meaningful conversations about various topics.",
		icon: "Users",
		category: "conversation",
		orderIndex: 4,
		isSequential: true,
		roleCategories: ["learner"],
		lessons: [
			{ title: "Topic: Shopping", duration: 15 },
			{ title: "Topic: Healthcare", duration: 15 },
			{ title: "Topic: Education", duration: 15 },
			{ title: "Topic: Work & Career", duration: 15 },
		],
	},
	{
		title: "Family Communication",
		description: "Specialized module for family members to communicate effectively with deaf/hard of hearing individuals.",
		icon: "Heart",
		category: "conversation",
		orderIndex: 5,
		isSequential: false,
		roleCategories: ["support-circle"],
		lessons: [
			{ title: "Supporting Your Loved One", duration: 12 },
			{ title: "Essential Phrases for Caregivers", duration: 12 },
			{ title: "Building Confidence in Communication", duration: 12 },
			{ title: "Accessibility Tips & Strategies", duration: 12 },
		],
	},
	{
		title: "Inclusive Communication",
		description: "Learn best practices for creating accessible and inclusive communication environments for all abilities.",
		icon: "Accessibility",
		category: "conversation",
		orderIndex: 6,
		isSequential: false,
		roleCategories: ["support-circle"],
		lessons: [
			{ title: "Understanding Deaf Culture", duration: 10 },
			{ title: "Communication Accessibility", duration: 10 },
			{ title: "Technology & Assistive Tools", duration: 10 },
			{ title: "Building Supportive Communities", duration: 10 },
		],
	},
	{
		title: "Adaptive Learning: Alphabet",
		description: "Personalized alphabet learning with flexible pacing and adaptive difficulty levels.",
		icon: "Zap",
		category: "alphabet",
		orderIndex: 7,
		isSequential: false,
		roleCategories: ["accessibility-needs"],
		lessons: [
			{ title: "Alphabet - Slow Pace", duration: 15 },
			{ title: "Alphabet - Repetition Practice", duration: 15 },
			{ title: "Alphabet - Recognition Games", duration: 15 },
			{ title: "Alphabet - Mastery Check", duration: 10 },
		],
	},
	{
		title: "Adaptive Learning: Words",
		description: "Customized vocabulary learning with visual aids and reinforcement techniques suited for various learning styles.",
		icon: "Eye",
		category: "vocabulary",
		orderIndex: 8,
		isSequential: false,
		roleCategories: ["accessibility-needs"],
		lessons: [
			{ title: "Vocabulary - Visual First", duration: 15 },
			{ title: "Vocabulary - Contextual Learning", duration: 15 },
			{ title: "Vocabulary - Interactive Exercises", duration: 15 },
			{ title: "Vocabulary - Application Practice", duration: 15 },
		],
	},
	{
		title: "Professional Sign Language",
		description: "Advanced module for workplace communication and professional settings.",
		icon: "Briefcase",
		category: "conversation",
		orderIndex: 9,
		isSequential: true,
		roleCategories: ["learner"],
		lessons: [
			{ title: "Business Meetings & Presentations", duration: 15 },
			{ title: "Professional Etiquette", duration: 15 },
			{ title: "Technical Vocabulary", duration: 15 },
			{ title: "Negotiation & Persuasion", duration: 15 },
		],
	},
	{
		title: "Cultural Awareness",
		description: "Understand Deaf culture, community norms, and the history of sign language.",
		icon: "Globe",
		category: "conversation",
		orderIndex: 10,
		isSequential: false,
		roleCategories: ["learner", "support-circle"],
		lessons: [
			{ title: "History of Sign Language", duration: 12 },
			{ title: "Deaf Community & Culture", duration: 12 },
			{ title: "Regional Sign Variations", duration: 12 },
			{ title: "Global Deaf Perspectives", duration: 12 },
		],
	},
	{
		title: "Interactive Practice",
		description: "Hands-on practice sessions with interactive exercises and real-time feedback.",
		icon: "Play",
		category: "conversation",
		orderIndex: 11,
		isSequential: false,
		roleCategories: ["learner"],
		lessons: [
			{ title: "Conversation Simulations", duration: 20 },
			{ title: "Sign & Translate Challenges", duration: 20 },
			{ title: "Video Feedback Sessions", duration: 20 },
			{ title: "Peer Practice Activities", duration: 20 },
		],
	},
	{
		title: "Certification Preparation",
		description: "Prepare for official sign language proficiency certifications with comprehensive review modules.",
		icon: "Award",
		category: "conversation",
		orderIndex: 12,
		isSequential: true,
		roleCategories: ["learner"],
		lessons: [
			{ title: "Level 1 Review & Assessment", duration: 20 },
			{ title: "Level 2 Advanced Topics", duration: 20 },
			{ title: "Practice Exams", duration: 20 },
			{ title: "Certification Strategies", duration: 15 },
		],
	},
];

/**
 * Seed the database with modules and lessons
 */
async function seedDatabase() {
	try {
		console.log("🌱 Starting database seed...");

		await connectDB();
		console.log("✅ Connected to MongoDB");

		// Clear existing data
		await Module.deleteMany({});
		await Lesson.deleteMany({});
		console.log("✅ Cleared existing modules and lessons");

		let totalLessonsCreated = 0;

		// Create modules with lessons
		for (const moduleData of seedData) {
			const { lessons, ...moduleInfo } = moduleData;

			// Create module
			const module = await Module.create(moduleInfo);
			console.log(`📚 Created module: ${module.title}`);

			// Create lessons for this module
			for (const [i, lesson] of lessons.entries()) {
				const lessonData = {
					moduleId: module._id,
					title: lesson.title,
					description: `Lesson in ${module.title}`,
					contentUrl: `https://placeholder.com/media/${module._id}/${i + 1}`,
					duration: lesson.duration,
					order: i + 1,
					difficultyLevel: i < 2 ? "beginner" : "intermediate",
					prerequisites: [],
				};

				const createdLesson = await Lesson.create(lessonData);
				module.lessons.push(createdLesson._id);
				totalLessonsCreated++;
			}

			// Save module with lessons array updated
			await module.save();
		}

		console.log(`\n✅ Seed completed successfully!`);
		console.log(`📊 Created:
  - ${seedData.length} modules
  - ${totalLessonsCreated} lessons
  - Total: ${seedData.length} modules × 4 lessons = 48 lessons`);

		process.exit(0);
	} catch (error) {
		console.error("❌ Seed failed:", error);
		process.exit(1);
	}
}

// Run seed
seedDatabase();
