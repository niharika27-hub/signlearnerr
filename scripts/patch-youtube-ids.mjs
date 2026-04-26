/**
 * Patch learning-content.json with YouTube video IDs and dataset references.
 * Run: node scripts/patch-youtube-ids.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = resolve(__dirname, "..", "frontend", "src", "data", "learning-content.json");

const content = JSON.parse(readFileSync(jsonPath, "utf-8"));

// ── YouTube video IDs mapped to lesson keys ──────────────────────────
const ytMap = {
  // Module 1: Beginner Basics – Alphabets
  "alphabet-a-f": "DBQINq0SsAw",
  "alphabet-g-l": "cGavOVNDj1s",
  "alphabet-m-r": "6_gXiBe9y9A",
  "alphabet-s-z": "DBQINq0SsAw",
  "alphabet-recap": "cGavOVNDj1s",
  // Module 1: Numbers
  "numbers-1-10": "cJ6UFIP-Vt0",
  "numbers-11-20": "mX_uS9v7U_k",
  "age-and-time": "cJ6UFIP-Vt0",
  "counting-objects": "mX_uS9v7U_k",
  "number-recap": "cJ6UFIP-Vt0",
  // Module 1: Greetings
  "hello-hi": "y9Rj_X0IsKY",
  "good-morning-evening": "OeQBnxRjCKg",
  "introduce-yourself": "y9Rj_X0IsKY",
  "how-are-you": "OeQBnxRjCKg",
  "greeting-roleplay": "y9Rj_X0IsKY",
  // Module 2: People & Family
  "family-1": "VOnHnaNiVSM",
  "family-2": "N45u5W3rOBc",
  "family-3": "VOnHnaNiVSM",
  "family-4": "N45u5W3rOBc",
  "family-5": "VOnHnaNiVSM",
  // Module 2: Daily Objects
  "objects-1": "0FcwzMq4iWg",
  "objects-2": "ianCxd71xIo",
  "objects-3": "0FcwzMq4iWg",
  "objects-4": "ianCxd71xIo",
  "objects-5": "0FcwzMq4iWg",
  // Module 2: Action Verbs
  "verbs-1": "NXNq_ER2jT4",
  "verbs-2": "A_H-MYti3LQ",
  "verbs-3": "NXNq_ER2jT4",
  "verbs-4": "A_H-MYti3LQ",
  "verbs-5": "NXNq_ER2jT4",
  // Module 3: Sentence Building
  "sb-1": "fDV9Al8Fgjk",
  "sb-2": "rDR3TCT-gzY",
  "sb-3": "fDV9Al8Fgjk",
  "sb-4": "rDR3TCT-gzY",
  "sb-5": "fDV9Al8Fgjk",
  // Module 3: Questions & Answers
  "qa-1": "BopX7gr1BJ8",
  "qa-2": "TLGGDWCSe2Q",
  "qa-3": "gYcW0LUGlCM",
  "qa-4": "BopX7gr1BJ8",
  "qa-5": "TLGGDWCSe2Q",
  // Module 3: Time & Place
  "tp-1": "gYcW0LUGlCM",
  "tp-2": "BopX7gr1BJ8",
  "tp-3": "TLGGDWCSe2Q",
  "tp-4": "gYcW0LUGlCM",
  "tp-5": "BopX7gr1BJ8",
  // Module 4: Polite Expressions
  "pe-1": "zu11AO8HiyI",
  "pe-2": "o5LtCgRpEOk",
  "pe-3": "zu11AO8HiyI",
  "pe-4": "o5LtCgRpEOk",
  "pe-5": "zu11AO8HiyI",
  // Module 4: Conversation Skills
  "cs-1": "_c--P6VRTUo",
  "cs-2": "RhQvlq-mZtA",
  "cs-3": "_c--P6VRTUo",
  "cs-4": "RhQvlq-mZtA",
  "cs-5": "_c--P6VRTUo",
  // Module 4: Emotions
  "em-1": "YuX7-UvZy-8",
  "em-2": "QYYMBAEs6Vg",
  "em-3": "YuX7-UvZy-8",
  "em-4": "QYYMBAEs6Vg",
  "em-5": "YuX7-UvZy-8",
  // Module 5: Storytelling
  "st-1": "oenKmcAkfO4",
  "st-2": "PHUdu7q3Mo0",
  "st-3": "oenKmcAkfO4",
  "st-4": "PHUdu7q3Mo0",
  "st-5": "oenKmcAkfO4",
  // Module 5: Real-life Scenarios
  "rl-1": "_c--P6VRTUo",
  "rl-2": "RhQvlq-mZtA",
  "rl-3": "0FcwzMq4iWg",
  "rl-4": "ianCxd71xIo",
  "rl-5": "_c--P6VRTUo",
  // Module 5: Speed & Fluency
  "sf-1": "DBQINq0SsAw",
  "sf-2": "NXNq_ER2jT4",
  "sf-3": "fDV9Al8Fgjk",
  "sf-4": "_c--P6VRTUo",
  "sf-5": "ianCxd71xIo",
};

// ── Dataset references per module ────────────────────────────────────
const datasetRefs = {
  "beginner-basics": {
    datasets: [
      { name: "ASL Alphabet (Kaggle)", url: "https://www.kaggle.com/datasets/grassknoted/asl-alphabet", license: "GPL 2" },
      { name: "Sign Language MNIST", url: "https://www.kaggle.com/datasets/datamunge/sign-language-mnist/data", license: "CC0" },
    ],
  },
  "essential-vocabulary": {
    datasets: [
      { name: "WLASL", url: "https://dxli94.github.io/WLASL/", license: "C-UDA" },
      { name: "MS-ASL (Microsoft Research)", url: "https://www.microsoft.com/en-us/research/publication/ms-asl-a-large-scale-data-set-and-benchmark-for-understanding-american-sign-language/", license: "Microsoft Research" },
      { name: "ASL Citizen", url: "https://www.microsoft.com/en-us/research/project/asl-citizen/dataset-description/", license: "Microsoft Research" },
    ],
  },
  "sentence-building": {
    datasets: [
      { name: "How2Sign", url: "https://how2sign.github.io/", license: "Research use" },
      { name: "OpenASL", url: "https://github.com/chevalierNoir/OpenASL", license: "CC BY-NC-ND 4.0" },
    ],
  },
  "social-communication": {
    datasets: [
      { name: "WLASL", url: "https://dxli94.github.io/WLASL/", license: "C-UDA" },
      { name: "How2Sign", url: "https://how2sign.github.io/", license: "Research use" },
    ],
  },
  "advanced-practice": {
    datasets: [
      { name: "How2Sign", url: "https://how2sign.github.io/", license: "Research use" },
      { name: "OpenASL", url: "https://github.com/chevalierNoir/OpenASL", license: "CC BY-NC-ND 4.0" },
      { name: "WLASL", url: "https://dxli94.github.io/WLASL/", license: "C-UDA" },
    ],
  },
};

// ── Patch content ────────────────────────────────────────────────────
let patchedLessons = 0;
let patchedModules = 0;

for (const mod of content.modules) {
  // Add dataset references
  if (datasetRefs[mod.moduleKey]) {
    mod.datasetSources = datasetRefs[mod.moduleKey].datasets;
    patchedModules++;
  }

  for (const cat of mod.categories) {
    for (const lesson of cat.lessons) {
      if (ytMap[lesson.lessonKey]) {
        lesson.youtubeVideoId = ytMap[lesson.lessonKey];
        patchedLessons++;
      }
    }
  }
}

writeFileSync(jsonPath, JSON.stringify(content, null, 2) + "\n");
console.log(`✅ Patched ${patchedLessons} lessons with YouTube IDs`);
console.log(`✅ Patched ${patchedModules} modules with dataset references`);
