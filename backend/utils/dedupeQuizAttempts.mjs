import "dotenv/config";
import mongoose from "mongoose";
import { QuizAttempt } from "../models/QuizAttempt.js";

function getMongoUri() {
  return process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/signlearn";
}

async function main() {
  await mongoose.connect(getMongoUri());

  // Keep the newest row when duplicate attempts share same user + mode + score + counts + completedAt.
  const duplicateGroups = await QuizAttempt.aggregate([
    {
      $group: {
        _id: {
          userId: "$userId",
          lessonId: "$lessonId",
          modeId: "$modeId",
          score: "$score",
          correctCount: "$correctCount",
          totalQuestions: "$totalQuestions",
          completedAt: "$completedAt",
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

  let deletedCount = 0;

  for (const group of duplicateGroups) {
    const ids = Array.isArray(group.ids) ? group.ids.map((id) => String(id)) : [];
    if (ids.length < 2) {
      continue;
    }

    // Sort ids lexicographically and keep the latest object id.
    ids.sort();
    const idsToDelete = ids.slice(0, -1);

    if (idsToDelete.length > 0) {
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
        duplicateGroups: duplicateGroups.length,
        deletedCount,
        totalAttempts,
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
