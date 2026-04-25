const WIKIMEDIA_FILEPATH_BASE = "https://commons.wikimedia.org/wiki/Special:FilePath";

function wikiVideo(fileName) {
  return `${WIKIMEDIA_FILEPATH_BASE}/${encodeURIComponent(fileName)}`;
}

const LESSON_VIDEO_MAP = {
  "basic alphabets::a-i hand shapes": [
    wikiVideo("American Sign Language demo - Travis Dougherty.ogv"),
    wikiVideo("ASL BOOK justsign.ogv"),
  ],
  "basic alphabets::j-r finger-spelling flow": [
    wikiVideo("ASL BOOK.ogv"),
    wikiVideo("American Sign Language demo - Travis Dougherty.ogv"),
  ],
  "basic alphabets::s-z + recall quiz": [
    wikiVideo("ASL BOOK justsign.ogv"),
    wikiVideo("ASL BOOK.ogv"),
  ],
  "words::common daily words": [
    wikiVideo("ASL Literature - Pointy Three.webm"),
    wikiVideo("ASL Literature - Deaf-Blind Ninja.webm"),
  ],
  "words::people, places, actions": [
    wikiVideo("ASL Literature -The Tortoise and the Hare.webm"),
    wikiVideo("ASL Literature - Pointy Three.webm"),
  ],
  "words::word recognition challenge": [
    wikiVideo("The Night Before Christmas in American Sign Language.webm"),
    wikiVideo("ASL Literature -The Tortoise and the Hare.webm"),
  ],
  "sentences::simple sentence patterns": [
    wikiVideo("The Night Before Christmas in American Sign Language.webm"),
    wikiVideo("ASL Literature -The Tortoise and the Hare.webm"),
  ],
  "sentences::questions and responses": [
    wikiVideo("ASL Literature - Pointy Three.webm"),
    wikiVideo("ASL Literature - Deaf-Blind Ninja.webm"),
  ],
  "sentences::context conversation drill": [
    wikiVideo("ASL Literature -The Tortoise and the Hare.webm"),
    wikiVideo("The Night Before Christmas in American Sign Language.webm"),
  ],
};

const CATEGORY_VIDEO_MAP = {
  alphabet: [wikiVideo("American Sign Language demo - Travis Dougherty.ogv")],
  vocabulary: [wikiVideo("ASL Literature - Pointy Three.webm")],
  sentences: [wikiVideo("The Night Before Christmas in American Sign Language.webm")],
};

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

function lessonKey(moduleTitle, lessonTitle) {
  return `${normalizeKey(moduleTitle)}::${normalizeKey(lessonTitle)}`;
}

export function getLessonVideoSources(moduleTitle, lessonTitle, category) {
  const key = lessonKey(moduleTitle, lessonTitle);
  const fromLesson = LESSON_VIDEO_MAP[key] || [];

  if (fromLesson.length > 0) {
    return fromLesson;
  }

  return CATEGORY_VIDEO_MAP[normalizeKey(category)] || [];
}
