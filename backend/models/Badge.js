import mongoose from "mongoose";

/**
 * Badge Schema - User achievements and badges earned
 * Tracks which badges a user has earned and when
 */
const badgeSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Reference to User.id (UUID string)
      required: true,
      index: true,
    },
    badgeId: {
      type: String, // Badge identifier (e.g., 'first-lesson', 'ten-lessons', 'perfect-quiz')
      required: true,
    },
    badgeName: {
      type: String, // Display name (e.g., 'Getting Started', 'Committed Learner')
      required: true,
    },
    badgeDescription: {
      type: String, // Description of what was achieved
      required: true,
    },
    badgeIcon: {
      type: String, // Icon name or emoji (e.g., 'star', 'flame', '🏆')
      required: true,
    },
    category: {
      type: String, // Category of badge: 'progress', 'streak', 'performance', 'milestone'
      enum: ["progress", "streak", "performance", "milestone"],
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for quick lookup
badgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export default mongoose.model("Badge", badgeSchema);
