import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getUserBadges, getUserBadgeStats } from "../services/badgeService.js";

const router = express.Router();

/**
 * GET /api/badges/my-badges
 * Get all badges earned by the authenticated user
 */
router.get("/my-badges", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const badges = await getUserBadges(userId);

    res.json({
      success: true,
      badges,
      total: badges.length,
    });
  } catch (error) {
    console.error("Error fetching user badges:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch badges",
      error: error.message,
    });
  }
});

/**
 * GET /api/badges/stats
 * Get badge statistics for the authenticated user
 */
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getUserBadgeStats(userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching badge stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch badge statistics",
      error: error.message,
    });
  }
});

export default router;
