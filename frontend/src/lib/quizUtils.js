/**
 * Quiz utilities for handling both text-based and image-based quiz options
 */

/**
 * Determine if an option is an image-based option
 * @param {string|Object} option - The option to check
 * @returns {boolean} - True if option is an image path
 */
export function isImageOption(option) {
	if (typeof option === "string") {
		return /\.(png|jpg|jpeg|gif|webp)$/i.test(option);
	}
	if (typeof option === "object" && option !== null) {
		return Boolean(option.image);
	}
	return false;
}

/**
 * Get the image URL from an option
 * @param {string|Object} option - The option to extract image from
 * @returns {string|null} - The image URL or null
 */
export function getOptionImage(option) {
	if (typeof option === "string" && /\.(png|jpg|jpeg|gif|webp)$/i.test(option)) {
		return option;
	}
	if (typeof option === "object" && option !== null) {
		return option.image || null;
	}
	return null;
}

/**
 * Get the text content from an option
 * @param {string|Object} option - The option to extract text from
 * @returns {string} - The text content
 */
export function getOptionText(option) {
	if (typeof option === "string") {
		return option;
	}
	if (typeof option === "object" && option !== null) {
		return option.text || "";
	}
	return "";
}

/**
 * Get the alt text from an option (for accessibility)
 * @param {string|Object} option - The option to extract alt text from
 * @returns {string} - The alt text
 */
export function getOptionAlt(option) {
	if (typeof option === "object" && option !== null) {
		return option.imageAlt || getOptionText(option) || "Option image";
	}
	return "Option image";
}

/**
 * Determine the question type from options and question image
 * @param {Array} options - The options array
 * @param {string} questionImage - The question image URL (if any)
 * @returns {string} - The question type: "image-options" | "mixed" | "text"
 */
export function determineQuestionType(options = [], questionImage = null) {
	const hasImageOptions = options.some((opt) => isImageOption(opt));
	const hasTextOptions = options.some((opt) => {
		const text = getOptionText(opt);
		return text && text.trim().length > 0;
	});

	if (hasImageOptions && !hasTextOptions) {
		return "image-options";
	}
	if (hasImageOptions && hasTextOptions) {
		return "mixed";
	}
	if (questionImage) {
		return "image-question";
	}
	return "text";
}

/**
 * Normalize a question from database format to UI format
 * @param {Object} dbQuestion - Question from database
 * @returns {Object} - Normalized question for UI
 */
export function normalizeQuestionFromDB(dbQuestion) {
	return {
		id: dbQuestion._id || dbQuestion.id,
		moduleTitle: dbQuestion.moduleId?.title || "Module",
		lessonTitle: dbQuestion.lessonId?.title || "Lesson",
		question: dbQuestion.questionText,
		questionImage: dbQuestion.questionImage || null,
		questionImageAlt: dbQuestion.questionImageAlt || "",
		options: (dbQuestion.options || []).map((opt) => ({
			text: opt.text || "",
			image: opt.image || null,
			imageAlt: opt.imageAlt || "",
		})),
		correctOptionIndex: dbQuestion.options?.findIndex((opt) => opt.isCorrect === true) ?? -1,
		explanation: dbQuestion.explanation || "",
		questionType: dbQuestion.questionType || "text-based",
	};
}

/**
 * Get the display type for rendering options
 * @param {Array} options - The options array
 * @returns {string} - "image-grid" | "text-buttons"
 */
export function getOptionDisplayType(options = []) {
	const hasImageOptions = options.some((opt) => isImageOption(opt));
	return hasImageOptions ? "image-grid" : "text-buttons";
}
