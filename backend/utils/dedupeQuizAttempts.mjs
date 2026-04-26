import "dotenv/config";
import mongoose from "mongoose";
import { QuizAttempt } from "../models/QuizAttempt.js";

function getMongoUri() {
  return process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/signlearn";
}

function parseArgs(argv = []) {
  const tokens = Array.isArray(argv) ? argv : [];
  const options = {
    apply: false,
    userId: "",
    limitGroups: 0,
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const token = String(tokens[index] || "").trim();

    if (token === "--apply") {
      options.apply = true;
      continue;
    }

    if (token === "--preview") {
      options.apply = false;
      continue;
    }

    if (token === "--user" || token === "--user-id") {
      const value = String(tokens[index + 1] || "").trim();
      if (value) {
        options.userId = value;
        index += 1;
      }
      continue;
    }

    if (token === "--limit") {
      const value = Number(tokens[index + 1]);
      if (Number.isFinite(value) && value > 0) {
        options.limitGroups = Math.floor(value);
        index += 1;
      }
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await mongoose.connect(getMongoUri());

  // Duplicate key: same payload for the same user, completed within the same second.
  // This targets accidental double-submits while keeping legitimate separate attempts.
  const matchStage = options.userId ? { userId: options.userId } : {};
  const duplicateGroups = await QuizAttempt.aggregate([
    {
      $match: matchStage,
    },
    {
      $sort: {
        createdAt: -1,
        _id: -1,
      },
    },
    {
      $group: {
        _id: {
          userId: "$userId",
          lessonId: "$lessonId",
          modeId: "$modeId",
          score: "$score",
          correctCount: "$correctCount",
          totalQuestions: "$totalQuestions",
          syncedToProgress: "$syncedToProgress",
          completedAtSecond: {
            $dateToString: {
              date: "$completedAt",
              format: "%Y-%m-%dT%H:%M:%S",
              timezone: "UTC",
            },
          },
        },
        ids: { $push: "$_id" },
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ]);

  const groupsToProcess =
    options.limitGroups > 0 ? duplicateGroups.slice(0, options.limitGroups) : duplicateGroups;

  let deletedCount = 0;
  let duplicateRowCount = 0;

  for (const group of groupsToProcess) {
    const ids = Array.isArray(group.ids) ? group.ids.map((id) => String(id)) : [];
    if (ids.length < 2) {
      continue;
    }

    // Pipeline sorted newest first, so keep the first id and remove older duplicates.
    const idsToDelete = ids.slice(1);
    duplicateRowCount += idsToDelete.length;

    if (options.apply && idsToDelete.length > 0) {
      const result = await QuizAttempt.deleteMany({
        _id: { $in: idsToDelete },
      });
      deletedCount += Number(result.deletedCount || 0);
    }
  }

  const totalAttempts = await QuizAttempt.countDocuments({});

  console.log(
    JSON.stringify(
      {
        mode: options.apply ? "apply" : "preview",
        filter: {
          userId: options.userId || null,
          groupLimit: options.limitGroups || null,
        },
        duplicateGroups: groupsToProcess.length,
        duplicateRows: duplicateRowCount,
        deletedCount,
        totalAttempts,
        samples: groupsToProcess.slice(0, 5).map((group) => ({
          key: group._id,
          rowCount: group.count,
          keepId: String(group.ids?.[0] || ""),
          deleteIds: (group.ids || []).slice(1).map((id) => String(id)),
        })),
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Failed to dedupe quiz attempts:", error);
  try {
    await mongoose.disconnect();
  } catch (_error) {
    // ignore disconnect failures
  }
  process.exit(1);
});
