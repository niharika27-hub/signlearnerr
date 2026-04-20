import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ProgressSection from "@/components/ProgressSection";
import StickySectionLabel from "@/components/StickySectionLabel";
import { getUserProgress } from "@/lib/authApi";

function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const data = await getUserProgress();
        setProgress(data.progress || {});
        setError(null);
      } catch (err) {
        console.error("Failed to fetch progress:", err);
        setError("Failed to load progress data");
        setProgress(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // Use real data or fallback defaults
  const streak = progress?.streak ?? 0;
  const xpThisWeek = progress?.xpThisWeek ?? 0;
  const modulesCompleted = progress?.modulesCompleted ?? 0;
  const totalModules = progress?.totalModules ?? 0;

  return (
    <div className="pt-20">
      <motion.section
        data-scene="Progress Intro"
        className="px-6 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-6xl">
          <StickySectionLabel label="Progress Intro" />
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">
            Performance
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
            Track your growth
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Streaks, XP, module completion, and your next best lesson.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Current streak: {streak} days
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              XP this week: +{xpThisWeek}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Completed modules: {modulesCompleted}/{totalModules}
            </div>
          </div>
        </div>
      </motion.section>
      <ProgressSection progress={progress} loading={loading} error={error} />
    </div>
  );
}

export default ProgressPage;
