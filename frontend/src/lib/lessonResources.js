const LIFEPRINT_BASE = "https://www.lifeprint.com/asl101/fingerspelling/oldletters";

const LESSON_IMAGE_MAP = {
  "basic alphabets::a-i hand shapes": [
    `${LIFEPRINT_BASE}/a.jpg`,
    `${LIFEPRINT_BASE}/b.jpg`,
    `${LIFEPRINT_BASE}/c.jpg`,
    `${LIFEPRINT_BASE}/i.jpg`,
  ],
  "basic alphabets::j-r finger-spelling flow": [
    `${LIFEPRINT_BASE}/j.jpg`,
    `${LIFEPRINT_BASE}/k.jpg`,
    `${LIFEPRINT_BASE}/l.jpg`,
    `${LIFEPRINT_BASE}/r.jpg`,
  ],
  "basic alphabets::s-z + recall quiz": [
    `${LIFEPRINT_BASE}/s.jpg`,
    `${LIFEPRINT_BASE}/t.jpg`,
    `${LIFEPRINT_BASE}/u.jpg`,
    `${LIFEPRINT_BASE}/z.jpg`,
  ],
  "words::common daily words": [
    `${LIFEPRINT_BASE}/c.jpg`,
    `${LIFEPRINT_BASE}/d.jpg`,
    `${LIFEPRINT_BASE}/w.jpg`,
    "https://www.lifeprint.com/asl101/fingerspelling/abc-asl-01.gif",
  ],
  "words::people, places, actions": [
    `${LIFEPRINT_BASE}/p.jpg`,
    `${LIFEPRINT_BASE}/l.jpg`,
    `${LIFEPRINT_BASE}/a.jpg`,
  ],
  "words::word recognition challenge": [
    `${LIFEPRINT_BASE}/r.jpg`,
    `${LIFEPRINT_BASE}/c.jpg`,
    `${LIFEPRINT_BASE}/w.jpg`,
  ],
  "sentences::simple sentence patterns": [
    `${LIFEPRINT_BASE}/s.jpg`,
    `${LIFEPRINT_BASE}/p.jpg`,
    "https://www.lifeprint.com/asl101/fingerspelling/abc-asl-01.gif",
  ],
  "sentences::questions and responses": [
    `${LIFEPRINT_BASE}/q.jpg`,
    `${LIFEPRINT_BASE}/r.jpg`,
    `${LIFEPRINT_BASE}/s.jpg`,
  ],
  "sentences::context conversation drill": [
    `${LIFEPRINT_BASE}/c.jpg`,
    `${LIFEPRINT_BASE}/d.jpg`,
    `${LIFEPRINT_BASE}/r.jpg`,
  ],
};

const LESSON_COVERAGE_MAP = {
  "basic alphabets::a-i hand shapes": [
    "Correct A-I handshape formation",
    "Palm orientation and finger placement",
    "Fast recognition of static signs",
  ],
  "basic alphabets::j-r finger-spelling flow": [
    "J and R movement consistency",
    "Smooth transitions across letters",
    "Finger memory for connected spelling",
  ],
  "basic alphabets::s-z + recall quiz": [
    "S-Z handshape recall",
    "Speed practice under timed drills",
    "Accuracy checks with self-review",
  ],
  "words::common daily words": [
    "High-frequency everyday signs",
    "Greeting and routine vocabulary",
    "Meaning-to-sign recall",
  ],
  "words::people, places, actions": [
    "People-related signs",
    "Place/location vocabulary",
    "Action verbs in context",
  ],
  "words::word recognition challenge": [
    "Receptive sign comprehension",
    "Signer variation tolerance",
    "Quick word identification",
  ],
  "sentences::simple sentence patterns": [
    "Basic ASL sentence structure",
    "Topic-comment phrasing",
    "Short phrase comprehension",
  ],
  "sentences::questions and responses": [
    "Question forms in ASL",
    "Facial grammar cues",
    "Response construction practice",
  ],
  "sentences::context conversation drill": [
    "Conversational flow in context",
    "Turn-taking and pacing",
    "Comprehension across longer clips",
  ],
};

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

function toLessonKey(moduleTitle, lessonTitle) {
  return `${normalizeKey(moduleTitle)}::${normalizeKey(lessonTitle)}`;
}

export function getLessonResourceImages(moduleTitle, lessonTitle) {
  const key = toLessonKey(moduleTitle, lessonTitle);
  return LESSON_IMAGE_MAP[key] || ["https://www.lifeprint.com/asl101/fingerspelling/abc-asl-01.gif"];
}

function extractCoveragePointsFromDescription(description) {
  const text = String(description || "").trim();
  if (!text) {
    return [];
  }

  const points = text
    .replace(/\s+/g, " ")
    .split(/[.;]/)
    .flatMap((part) => part.split(/,| and /i))
    .map((part) => part.trim())
    .filter((part) => part.length >= 8)
    .slice(0, 3);

  return points;
}

export function getLessonCoveragePoints(moduleTitle, lessonTitle, description) {
  const key = toLessonKey(moduleTitle, lessonTitle);
  if (LESSON_COVERAGE_MAP[key]) {
    return LESSON_COVERAGE_MAP[key];
  }

  const derived = extractCoveragePointsFromDescription(description);
  if (derived.length > 0) {
    return derived;
  }

  return [
    "Core handshape practice",
    "Visual recognition reinforcement",
    "Repetition for retention",
  ];
}
