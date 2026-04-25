const LESSON_MEDIA_QUERIES = {
  "basic alphabets::a-i hand shapes": "ASL alphabet A through I lesson Bill Vicars",
  "basic alphabets::j-r finger-spelling flow": "ASL alphabet J through R lesson Bill Vicars",
  "basic alphabets::s-z + recall quiz": "ASL alphabet S through Z practice Bill Vicars",
  "words::common daily words": "ASL common daily words for beginners Bill Vicars",
  "words::people, places, actions": "ASL signs people places actions lesson",
  "words::word recognition challenge": "ASL receptive practice common words beginner",
  "sentences::simple sentence patterns": "ASL simple sentence patterns for beginners",
  "sentences::questions and responses": "ASL question and answer sentence practice",
  "sentences::context conversation drill": "ASL beginner conversation practice dialogues",
};

const CATEGORY_DEFAULT_QUERIES = {
  alphabet: "ASL alphabet lesson for beginners Bill Vicars",
  vocabulary: "ASL vocabulary lesson for beginners",
  sentences: "ASL sentence practice for beginners",
};

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

function toYouTubeSearchEmbed(query) {
  const clean = String(query || "").trim();
  if (!clean) {
    return "";
  }

  return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(clean)}`;
}

export function getCuratedLessonMedia(moduleTitle, lessonTitle, category) {
  const lessonKey = `${normalizeKey(moduleTitle)}::${normalizeKey(lessonTitle)}`;
  const lessonQuery = LESSON_MEDIA_QUERIES[lessonKey];
  if (lessonQuery) {
    return toYouTubeSearchEmbed(lessonQuery);
  }

  const categoryQuery = CATEGORY_DEFAULT_QUERIES[normalizeKey(category)] || "";
  return toYouTubeSearchEmbed(categoryQuery);
}
