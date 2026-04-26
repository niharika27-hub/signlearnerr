function yt(videoId) {
  return `https://www.youtube.com/embed/${videoId}`;
}

const LESSON_MEDIA_URLS = {
  "basic alphabets::a-i hand shapes": yt("M7lc1UVf-VE"),
  "basic alphabets::j-r finger-spelling flow": yt("aqz-KE-bpKQ"),
  "basic alphabets::s-z + recall quiz": yt("ysz5S6PUM-U"),
  "words::common daily words": yt("M7lc1UVf-VE"),
  "words::people, places, actions": yt("aqz-KE-bpKQ"),
  "words::word recognition challenge": yt("ysz5S6PUM-U"),
  "sentences::simple sentence patterns": yt("M7lc1UVf-VE"),
  "sentences::questions and responses": yt("aqz-KE-bpKQ"),
  "sentences::context conversation drill": yt("ysz5S6PUM-U"),
};

const CATEGORY_DEFAULT_URLS = {
  alphabet: yt("M7lc1UVf-VE"),
  alphabets: yt("M7lc1UVf-VE"),
  vocabulary: yt("aqz-KE-bpKQ"),
  words: yt("aqz-KE-bpKQ"),
  sentences: yt("ysz5S6PUM-U"),
};

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

export function getCuratedLessonMedia(moduleTitle, lessonTitle, category) {
  const lessonKey = `${normalizeKey(moduleTitle)}::${normalizeKey(lessonTitle)}`;
  const lessonUrl = LESSON_MEDIA_URLS[lessonKey];
  if (lessonUrl) {
    return lessonUrl;
  }

  return CATEGORY_DEFAULT_URLS[normalizeKey(category)] || "";
}
