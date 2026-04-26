/**
 * Upload sign-language learning media to Cloudinary.
 *
 * Uses free stock videos / images from Pexels as source and stores them
 * permanently in the user's Cloudinary account under "signlearn/".
 *
 * Run:  node scripts/upload-cloudinary-media.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

// Load .env from backend
const envPath = join(rootDir, "backend", ".env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  // Remove quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}

// Import cloudinary from backend's node_modules
const require = createRequire(join(rootDir, "backend", "package.json"));
const cloudinaryPkg = require("cloudinary");
const cloudinary = cloudinaryPkg.v2;

// ── Cloudinary config ────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dxcwwdmxl",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

const FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "signlearn";

// ── Source media ─────────────────────────────────────────────────────
// Real Pexels videos and images (all free to use)
const PEXELS_VIDEOS = [
  "https://videos.pexels.com/video-files/9017830/9017830-sd_360_640_24fps.mp4",
  "https://videos.pexels.com/video-files/10374275/10374275-sd_640_360_30fps.mp4",
  "https://videos.pexels.com/video-files/4662095/4662095-sd_960_506_25fps.mp4",
  "https://videos.pexels.com/video-files/9017844/9017844-sd_360_640_24fps.mp4",
  "https://videos.pexels.com/video-files/5212267/5212267-sd_360_640_25fps.mp4",
  "https://videos.pexels.com/video-files/9019574/9019574-sd_360_640_24fps.mp4",
  "https://videos.pexels.com/video-files/9019457/9019457-sd_360_640_24fps.mp4",
  "https://videos.pexels.com/video-files/9019581/9019581-sd_360_640_24fps.mp4",
  "https://videos.pexels.com/video-files/9019571/9019571-sd_360_640_24fps.mp4",
  "https://videos.pexels.com/video-files/9019610/9019610-sd_360_640_24fps.mp4",
  "https://videos.pexels.com/video-files/6322745/6322745-sd_506_960_25fps.mp4",
  "https://videos.pexels.com/video-files/10373877/10373877-sd_640_360_30fps.mp4",
  "https://videos.pexels.com/video-files/4662096/4662096-sd_960_506_25fps.mp4",
  "https://videos.pexels.com/video-files/10374294/10374294-sd_640_360_30fps.mp4",
  "https://videos.pexels.com/video-files/10374301/10374301-sd_640_360_30fps.mp4",
  "https://videos.pexels.com/video-files/10373889/10373889-sd_640_360_30fps.mp4",
];

const PEXELS_IMAGES = [
  "https://images.pexels.com/photos/7516363/pexels-photo-7516363.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/8199160/pexels-photo-8199160.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/7516347/pexels-photo-7516347.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/6001008/pexels-photo-6001008.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/7516509/pexels-photo-7516509.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/7516350/pexels-photo-7516350.jpeg?auto=compress&cs=tinysrgb&w=800",
];

// Map each lesson/module to a Pexels source (cycle through available videos)
const allLessonKeys = [
  // Module 1 – Beginner Basics
  "alphabet-a-f", "alphabet-g-l", "alphabet-m-r", "alphabet-s-z", "alphabet-recap",
  "numbers-1-10", "numbers-11-20", "age-and-time", "counting-objects", "number-recap",
  "hello-hi", "good-morning-evening", "introduce-yourself", "how-are-you", "greeting-roleplay",
  // Module 2 – Essential Vocabulary
  "family-1", "family-2", "family-3", "family-4", "family-5",
  "objects-1", "objects-2", "objects-3", "objects-4", "objects-5",
  "verbs-1", "verbs-2", "verbs-3", "verbs-4", "verbs-5",
  // Module 3 – Sentence Building
  "sb-1", "sb-2", "sb-3", "sb-4", "sb-5",
  "qa-1", "qa-2", "qa-3", "qa-4", "qa-5",
  "tp-1", "tp-2", "tp-3", "tp-4", "tp-5",
  // Module 4 – Social Communication
  "pe-1", "pe-2", "pe-3", "pe-4", "pe-5",
  "cs-1", "cs-2", "cs-3", "cs-4", "cs-5",
  "em-1", "em-2", "em-3", "em-4", "em-5",
  // Module 5 – Advanced Practice
  "st-1", "st-2", "st-3", "st-4", "st-5",
  "rl-1", "rl-2", "rl-3", "rl-4", "rl-5",
  "sf-1", "sf-2", "sf-3", "sf-4", "sf-5",
];

const moduleKeys = [
  "beginner-basics",
  "essential-vocabulary",
  "sentence-building",
  "social-communication",
  "advanced-practice",
];

// ── Upload helper ────────────────────────────────────────────────────
async function upload(publicId, url, resourceType = "video") {
  const fullPublicId = `${FOLDER}/${publicId}`;
  console.log(`  ⬆  [${resourceType}] ${fullPublicId}`);

  try {
    const opts = {
      public_id: fullPublicId,
      resource_type: resourceType,
      overwrite: true,
      type: "upload",
    };

    const result = await cloudinary.uploader.upload(url, opts);
    console.log(`  ✓  → ${result.secure_url}`);
    return { publicId, url: result.secure_url, type: resourceType };
  } catch (err) {
    console.error(`  ✗  ${fullPublicId}: ${err.message}`);
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🚀 SignLearn – Cloudinary media upload\n");
  console.log(`   Cloud: ${cloudinary.config().cloud_name}`);
  console.log(`   Folder: ${FOLDER}/`);
  console.log(`   Module thumbnails: ${moduleKeys.length}`);
  console.log(`   Lesson videos: ${allLessonKeys.length}\n`);

  const results = {};

  // 1. Upload module thumbnail images
  console.log("── Module Thumbnails ──────────────────────\n");
  for (let i = 0; i < moduleKeys.length; i++) {
    const imgUrl = PEXELS_IMAGES[i % PEXELS_IMAGES.length];
    const r = await upload(`modules/${moduleKeys[i]}`, imgUrl, "image");
    if (r) results[r.publicId] = r.url;
  }

  // 2. Upload lesson videos (batches of 2 to avoid rate limits)
  console.log("\n── Lesson Videos ─────────────────────────\n");
  for (let i = 0; i < allLessonKeys.length; i += 2) {
    const batch = allLessonKeys.slice(i, i + 2);
    const batchResults = await Promise.all(
      batch.map((key, j) => {
        const vidUrl = PEXELS_VIDEOS[(i + j) % PEXELS_VIDEOS.length];
        return upload(`lessons/${key}`, vidUrl, "video");
      })
    );
    for (const r of batchResults) {
      if (r) results[r.publicId] = r.url;
    }
  }

  // Write results
  const outPath = resolve(__dirname, "cloudinary-urls.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\n📝 URL map → ${outPath}`);
  console.log(`   Uploaded: ${Object.keys(results).length}/${moduleKeys.length + allLessonKeys.length}\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
