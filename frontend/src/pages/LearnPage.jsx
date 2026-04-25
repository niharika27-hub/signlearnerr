import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import LearningCards from "@/components/LearningCards";
import StickySectionLabel from "@/components/StickySectionLabel";
import { getModules } from "@/lib/authApi";

function LearnPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const data = await getModules();
        setModules(data.data || data.modules || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch modules:", err);
        setError("Failed to load learning modules");
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  return (
    <div className="pt-20">
      <motion.section
        data-scene="Learn Intro"
        className="relative overflow-hidden px-6 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f8fbff] via-[#eef6ff] to-[#f2f8ff]" />
        <div className="mx-auto max-w-6xl">
          <StickySectionLabel label="Learn Intro" />
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">
            Learning Journey
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
            Build your signing foundation
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Pick a track, learn visually, and keep momentum every day.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {modules.length > 0 ? `${modules.length} active tracks` : "Loading tracks..."}
            </span>
            <span className="rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-600">
              Visual drills
            </span>
            <span className="rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-600">
              Micro lessons
            </span>
          </div>
        </div>
      </motion.section>
      <LearningCards modules={modules} loading={loading} error={error} />
    </div>
  );
}

export default LearnPage;
