import { motion } from "framer-motion";
import ProgressSection from "@/components/ProgressSection";
import StickySectionLabel from "@/components/StickySectionLabel";

function ProgressPage() {
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
              Current streak: 12 days
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              XP this week: +420
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Completed modules: 7/12
            </div>
          </div>
        </div>
      </motion.section>
      <ProgressSection />
    </div>
  );
}

export default ProgressPage;
