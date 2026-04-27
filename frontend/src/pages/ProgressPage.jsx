import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProgressSection from "@/components/ProgressSection";
import StickySectionLabel from "@/components/StickySectionLabel";
import { getApiErrorMessage, getModules, getUserProgress } from "@/lib/authApi";

function formatRelativeSyncTime(lastUpdatedAt, nowMs) {
  if (!lastUpdatedAt) {
    return "Not synced yet";
  }

  const deltaSeconds = Math.max(0, Math.floor((nowMs - lastUpdatedAt.getTime()) / 1000));

  if (deltaSeconds < 5) {
    return "Synced just now";
  }

  if (deltaSeconds < 60) {
    return `Synced ${deltaSeconds}s ago`;
  }

  const deltaMinutes = Math.floor(deltaSeconds / 60);
  if (deltaMinutes < 60) {
    return `Synced ${deltaMinutes}m ago`;
  }

  const deltaHours = Math.floor(deltaMinutes / 60);
  return `Synced ${deltaHours}h ago`;
}

function normalizeProgressPayload(rawProgress, availableModulesCount = 0) {
  const safeProgress = rawProgress || {};
  const moduleProgressList = Array.isArray(safeProgress.moduleProgress)
    ? safeProgress.moduleProgress
    : [];

  const modulesCompleted = Number(safeProgress.modulesCompleted ?? 0);
  const totalModulesFromPayload = Number(safeProgress.totalModules ?? 0);

  const inferredTotalModules = Math.max(
    totalModulesFromPayload,
    availableModulesCount,
    moduleProgressList.length,
    modulesCompleted
  );

  return {
    ...safeProgress,
    modulesCompleted,
    totalModules: inferredTotalModules,
  };
}

function ProgressPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());

  async function fetchProgress({ silent = false } = {}) {
    try {
      if (!silent) {
        setLoading(true);
      }

      const [progressData, modulesData] = await Promise.all([
        getUserProgress(),
        getModules(),
      ]);

      const modules = modulesData?.data || modulesData?.modules || [];
      const normalizedProgress = normalizeProgressPayload(
        progressData?.progress || {},
        Array.isArray(modules) ? modules.length : 0
      );

      setProgress(normalizedProgress);
      setError(null);
      setLastUpdatedAt(new Date());
    } catch (err) {
      console.error("Failed to fetch progress:", err);
      setError(getApiErrorMessage(err, "Failed to load progress data"));
      setProgress(null);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchProgress();
  }, []);

  useEffect(() => {
    function handleWindowFocus() {
      fetchProgress({ silent: true });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchProgress({ silent: true });
      }
    }

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 15000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  // Use real data or fallback defaults
  const streak = progress?.streak ?? 0;
  const modulesCompleted = progress?.modulesCompleted ?? 0;
  const totalModules = progress?.totalModules ?? 0;
  const lessonsCompleted = progress?.lessonsCompleted ?? 0;
  const totalLessons = progress?.totalLessons ?? 0;
  const totalXp = Math.max(Number(progress?.totalXp ?? 0), Number(lessonsCompleted ?? 0));
  const xpThisWeek = Math.min(Number(progress?.xpThisWeek ?? 0), totalXp);
  const isGettingStarted = modulesCompleted === 0 && lessonsCompleted === 0;
  const syncLabel = formatRelativeSyncTime(lastUpdatedAt, nowMs);

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
          {isGettingStarted ? (
            <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-900">
              You are at the starting line. Complete your first lesson to unlock live progress insights.
            </div>
          ) : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Current streak: {streak} days
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Total XP: {totalXp} (week +{xpThisWeek})
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Completed modules: {modulesCompleted}/{totalModules}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Lessons completed: {lessonsCompleted}/{totalLessons}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fetchProgress()}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh progress"}
            </button>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {syncLabel}
            </span>
            <p className="text-xs font-semibold text-slate-500">
              Last updated at {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString() : "--"}
            </p>
          </div>
        </div>
      </motion.section>
      <ProgressSection
        progress={progress}
        loading={loading}
        error={error}
        onContinueLearning={() => navigate("/learn")}
      />
    </div>
  );
}

export default ProgressPage;
