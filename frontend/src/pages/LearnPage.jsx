import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LearningCards from "@/components/LearningCards";
import StickySectionLabel from "@/components/StickySectionLabel";
import { getModules } from "@/lib/authApi";
import {
  CORE_MODULE_CATEGORIES,
  normalizeModuleCategory,
} from "@/lib/moduleCategories";

function LearnPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchModules() {
    const data = await getModules();
    const modules = data.data || data.modules || [];
    return modules
      .map((module) => ({
        ...module,
        category: normalizeModuleCategory(module.category),
      }))
      .filter((module) => CORE_MODULE_CATEGORIES.includes(module.category));
  }

  async function loadModules() {
    try {
      setLoading(true);
      const nextModules = await fetchModules();
      setModules(nextModules);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch modules:", err);
      setError("Failed to load learning modules");
      setModules([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelectModule(module) {
    if (!module) {
      return;
    }

    const nextModuleId = module._id || module.id;
    if (!nextModuleId) {
      return;
    }

    navigate(`/learn/module/${nextModuleId}`);
  }

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

      <LearningCards
        modules={modules}
        loading={loading}
        error={error}
        onSelectModule={handleSelectModule}
      />
    </div>
  );
}

export default LearnPage;
