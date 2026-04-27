export const CORE_MODULE_CATEGORIES = ["alphabet", "vocabulary", "sentences"];

export const MODULE_CATEGORY_LABELS = {
	alphabet: "Basic Alphabets",
	vocabulary: "Words",
	sentences: "Sentences",
};

export function normalizeModuleCategory(category) {
	const raw = String(category || "").toLowerCase();

	if (raw === "conversation") {
		return "sentences";
	}

	if (CORE_MODULE_CATEGORIES.includes(raw)) {
		return raw;
	}

	return "sentences";
}

export function formatCategoryLabel(category) {
	const normalized = normalizeModuleCategory(category);
	return MODULE_CATEGORY_LABELS[normalized] || MODULE_CATEGORY_LABELS.sentences;
}
