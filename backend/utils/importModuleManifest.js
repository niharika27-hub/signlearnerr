import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { Module } from "../models/Module.js";
import { Lesson } from "../models/Lesson.js";

const VALID_CATEGORIES = ["alphabet", "vocabulary", "sentences"];
const VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const VALID_ROLE_CATEGORIES = ["learner", "support-circle", "accessibility-needs"];

function parseArgs(argv) {
  const args = {
    file: "",
    mode: "upsert",
    dryRun: false,
  };
  const positionals = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--file" && argv[index + 1]) {
      args.file = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === "--mode" && argv[index + 1]) {
      args.mode = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (!token.startsWith("--")) {
      positionals.push(token);
    }
  }

  if (!args.file && positionals[0]) {
    args.file = positionals[0];
  }

  if (args.mode === "upsert" && positionals[1]) {
    args.mode = positionals[1];
  }

  if (!args.dryRun && positionals.some((token) => token === "dry-run" || token === "dryrun")) {
    args.dryRun = true;
  }

  return args;
}

function parseBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value ?? "").trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "n"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseRoleCategories(value) {
  if (Array.isArray(value)) {
    const filtered = value
      .map((entry) => String(entry || "").trim())
      .filter((entry) => VALID_ROLE_CATEGORIES.includes(entry));
    return filtered.length ? filtered : [...VALID_ROLE_CATEGORIES];
  }

  const parsed = String(value || "")
    .split(/[|,]/)
    .map((entry) => entry.trim())
    .filter((entry) => VALID_ROLE_CATEGORIES.includes(entry));

  return parsed.length ? parsed : [...VALID_ROLE_CATEGORIES];
}

function normalizeCategory(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "conversation") {
    return "sentences";
  }

  return VALID_CATEGORIES.includes(raw) ? raw : "sentences";
}

function normalizeDifficulty(value) {
  const raw = String(value || "").trim().toLowerCase();
  return VALID_DIFFICULTIES.includes(raw) ? raw : "beginner";
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map((entry) => entry.trim());
}

function parseCsv(content) {
  const rawLines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!rawLines.length) {
    return [];
  }

  const headers = parseCsvLine(rawLines[0]);
  const rows = [];

  for (let index = 1; index < rawLines.length; index += 1) {
    const values = parseCsvLine(rawLines[index]);
    const row = {};

    headers.forEach((header, i) => {
      row[header] = values[i] ?? "";
    });

    rows.push(row);
  }

  return rows;
}

function mapCsvRowsToModules(rows) {
  const moduleMap = new Map();

  for (const row of rows) {
    const moduleTitle = String(row.moduleTitle || "").trim();
    if (!moduleTitle) {
      continue;
    }

    const moduleCategory = normalizeCategory(row.moduleCategory);
    const moduleKey = `${moduleTitle}::${moduleCategory}`;

    if (!moduleMap.has(moduleKey)) {
      moduleMap.set(moduleKey, {
        title: moduleTitle,
        description: String(row.moduleDescription || "").trim() || `${moduleTitle} module`,
        icon: String(row.moduleIcon || "BookText").trim() || "BookText",
        category: moduleCategory,
        orderIndex: parseNumber(row.moduleOrderIndex, 1),
        isSequential: parseBoolean(row.moduleIsSequential, false),
        isActive: parseBoolean(row.moduleIsActive, true),
        roleCategories: parseRoleCategories(row.moduleRoleCategories),
        lessons: [],
      });
    }

    const lessonTitle = String(row.lessonTitle || "").trim();
    if (!lessonTitle) {
      continue;
    }

    moduleMap.get(moduleKey).lessons.push({
      title: lessonTitle,
      description: String(row.lessonDescription || "").trim(),
      contentUrl: String(row.lessonContentUrl || "").trim(),
      duration: parseNumber(row.lessonDuration, 8),
      order: parseNumber(row.lessonOrder, moduleMap.get(moduleKey).lessons.length + 1),
      difficultyLevel: normalizeDifficulty(row.lessonDifficultyLevel),
      isActive: parseBoolean(row.lessonIsActive, true),
    });
  }

  return [...moduleMap.values()]
    .map((module) => ({
      ...module,
      lessons: [...module.lessons].sort((a, b) => a.order - b.order),
    }))
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

function normalizeModule(module, fallbackOrderIndex = 1) {
  const title = String(module?.title || "").trim();
  if (!title) {
    return null;
  }

  const lessons = Array.isArray(module.lessons)
    ? module.lessons
        .map((lesson, index) => {
          const lessonTitle = String(lesson?.title || "").trim();
          if (!lessonTitle) {
            return null;
          }

          return {
            title: lessonTitle,
            description: String(lesson?.description || "").trim(),
            contentUrl: String(lesson?.contentUrl || "").trim(),
            duration: parseNumber(lesson?.duration, 8),
            order: parseNumber(lesson?.order, index + 1),
            difficultyLevel: normalizeDifficulty(lesson?.difficultyLevel),
            isActive: parseBoolean(lesson?.isActive, true),
          };
        })
        .filter(Boolean)
        .sort((left, right) => left.order - right.order)
    : [];

  return {
    title,
    description: String(module?.description || "").trim() || `${title} module`,
    icon: String(module?.icon || "BookText").trim() || "BookText",
    category: normalizeCategory(module?.category),
    orderIndex: parseNumber(module?.orderIndex, fallbackOrderIndex),
    isSequential: parseBoolean(module?.isSequential, false),
    isActive: parseBoolean(module?.isActive, true),
    roleCategories: parseRoleCategories(module?.roleCategories),
    lessons,
  };
}

async function readManifest(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const content = await fs.readFile(absolutePath, "utf8");
  const extension = path.extname(absolutePath).toLowerCase();

  if (extension === ".csv") {
    const rows = parseCsv(content);
    return mapCsvRowsToModules(rows);
  }

  if (extension === ".json") {
    const parsed = JSON.parse(content);
    const modules = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.modules)
        ? parsed.modules
        : [];

    return modules
      .map((module, index) => normalizeModule(module, index + 1))
      .filter(Boolean)
      .sort((left, right) => left.orderIndex - right.orderIndex);
  }

  throw new Error("Unsupported manifest format. Use .json or .csv");
}

async function replaceAllModules(modules) {
  await Lesson.deleteMany({});
  await Module.deleteMany({});

  const summary = {
    modulesCreated: 0,
    modulesUpdated: 0,
    lessonsCreated: 0,
  };

  for (const modulePayload of modules) {
    const moduleDoc = await Module.create({
      title: modulePayload.title,
      description: modulePayload.description,
      icon: modulePayload.icon,
      category: modulePayload.category,
      orderIndex: modulePayload.orderIndex,
      isSequential: modulePayload.isSequential,
      isActive: modulePayload.isActive,
      roleCategories: modulePayload.roleCategories,
      lessons: [],
    });

    summary.modulesCreated += 1;

    const lessonIds = [];
    for (const lessonPayload of modulePayload.lessons) {
      const lessonDoc = await Lesson.create({
        moduleId: moduleDoc._id,
        ...lessonPayload,
        prerequisites: [],
      });
      lessonIds.push(lessonDoc._id);
      summary.lessonsCreated += 1;
    }

    moduleDoc.lessons = lessonIds;
    await moduleDoc.save();
  }

  return summary;
}

async function upsertModules(modules) {
  const summary = {
    modulesCreated: 0,
    modulesUpdated: 0,
    lessonsCreated: 0,
  };

  for (const modulePayload of modules) {
    let moduleDoc = await Module.findOne({
      title: modulePayload.title,
      category: modulePayload.category,
    });

    if (!moduleDoc) {
      moduleDoc = await Module.create({
        title: modulePayload.title,
        description: modulePayload.description,
        icon: modulePayload.icon,
        category: modulePayload.category,
        orderIndex: modulePayload.orderIndex,
        isSequential: modulePayload.isSequential,
        isActive: modulePayload.isActive,
        roleCategories: modulePayload.roleCategories,
        lessons: [],
      });
      summary.modulesCreated += 1;
    } else {
      moduleDoc.description = modulePayload.description;
      moduleDoc.icon = modulePayload.icon;
      moduleDoc.orderIndex = modulePayload.orderIndex;
      moduleDoc.isSequential = modulePayload.isSequential;
      moduleDoc.isActive = modulePayload.isActive;
      moduleDoc.roleCategories = modulePayload.roleCategories;
      await moduleDoc.save();
      summary.modulesUpdated += 1;

      await Lesson.deleteMany({ moduleId: moduleDoc._id });
      moduleDoc.lessons = [];
      await moduleDoc.save();
    }

    const lessonIds = [];
    for (const lessonPayload of modulePayload.lessons) {
      const lessonDoc = await Lesson.create({
        moduleId: moduleDoc._id,
        ...lessonPayload,
        prerequisites: [],
      });

      lessonIds.push(lessonDoc._id);
      summary.lessonsCreated += 1;
    }

    moduleDoc.lessons = lessonIds;
    await moduleDoc.save();
  }

  return summary;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.file) {
    console.error("Usage: node backend/utils/importModuleManifest.js --file <path-to-json-or-csv> [--mode upsert|replace] [--dry-run]");
    console.error("Alt usage: node backend/utils/importModuleManifest.js <path-to-json-or-csv> [upsert|replace] [dry-run]");
    process.exit(1);
  }

  const mode = args.mode === "replace" ? "replace" : "upsert";

  console.log(`Reading manifest: ${args.file}`);
  const modules = await readManifest(args.file);

  if (!modules.length) {
    console.error("No modules found in manifest.");
    process.exit(1);
  }

  const lessonTotal = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  console.log(`Parsed ${modules.length} modules and ${lessonTotal} lessons.`);

  if (args.dryRun) {
    console.log("Dry run enabled. No database writes were made.");
    process.exit(0);
  }

  await connectDB();

  try {
    const summary = mode === "replace"
      ? await replaceAllModules(modules)
      : await upsertModules(modules);

    console.log("Import complete:");
    console.log(`- Modules created: ${summary.modulesCreated}`);
    console.log(`- Modules updated: ${summary.modulesUpdated}`);
    console.log(`- Lessons created: ${summary.lessonsCreated}`);
  } finally {
    await disconnectDB();
  }
}

main().catch(async (error) => {
  console.error("Import failed:", error);
  try {
    await disconnectDB();
  } catch (_error) {
    // no-op
  }
  process.exit(1);
});
