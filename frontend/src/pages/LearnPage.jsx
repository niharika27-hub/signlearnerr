import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LearningCards from "@/components/LearningCards";
import StickySectionLabel from "@/components/StickySectionLabel";
<<<<<<< HEAD
import { getModules } from "@/lib/authApi";
import {
  CORE_MODULE_CATEGORIES,
  normalizeModuleCategory,
} from "@/lib/moduleCategories";
=======
import { getModules, getUserProgress } from "@/lib/authApi";

const coreLearningSections = [
  {
    id: "learn-words",
    title: "Learn Words",
    subtitle: "Essential Vocabulary",
    description:
      "Build daily-use vocabulary with short visual drills for greetings, objects, actions, and emotions.",
    chips: ["Basics", "Everyday words", "Pronunciation cues"],
    tone: "from-cyan-100/80 via-blue-100/55 to-cyan-50/70 border-cyan-200/70",
  },
  {
    id: "learn-sentences",
    title: "Learn Sentences",
    subtitle: "Sentence Building",
    description:
      "Practice sentence flow, grammar patterns, and expression timing to communicate complete thoughts.",
    chips: ["Structure", "Context", "Conversation flow"],
    tone: "from-violet-100/80 via-indigo-100/55 to-fuchsia-50/70 border-indigo-200/70",
  },
  {
    id: "proper-greetings",
    title: "Proper Greetings",
    subtitle: "Social Communication",
    description:
      "Master polite greetings and social phrases for introductions, responses, and respectful interactions.",
    chips: ["Introductions", "Politeness", "Real scenarios"],
    tone: "from-emerald-100/80 via-teal-100/55 to-green-50/70 border-emerald-200/70",
  },
];
>>>>>>> 408f45b7bb6a527d8d0ee055bc1ebc331495150e

function LearnPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [userProgress, setUserProgress] = useState({
    streak: 0,
    overallProgress: 0,
    modulesCompleted: 0,
    totalModules: 5,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

<<<<<<< HEAD
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
=======
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const [modulesResponse, progressResponse] = await Promise.all([
          getModules(),
          getUserProgress(),
        ]);

        setModules(modulesResponse.data || modulesResponse.modules || []);
        setUserProgress(progressResponse.progress || {
          streak: 0,
          overallProgress: 0,
          modulesCompleted: 0,
          totalModules: 5,
        });
        setError(null);
      } catch (err) {
        console.error("Failed to fetch modules:", err);
        setError("Failed to load learning modules");
        setModules([]);
      } finally {
        setLoading(false);
      }
    };
>>>>>>> 408f45b7bb6a527d8d0ee055bc1ebc331495150e

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
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-[#f8fbff] via-[#eef6ff] to-[#f2f8ff]" />
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

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full border border-cyan-300/70 bg-cyan-100/70 px-4 py-2 text-xs font-semibold tracking-wide text-cyan-900 transition hover:bg-cyan-100"
            >
              Visual Drills
            </button>
            <button
              type="button"
              className="rounded-full border border-indigo-300/70 bg-indigo-100/70 px-4 py-2 text-xs font-semibold tracking-wide text-indigo-900 transition hover:bg-indigo-100"
            >
              Micro Lessons
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {modules.length > 0 ? `${modules.length} active tracks` : "Loading tracks..."}
            </span>
            <span className="rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-600">
              Daily streak: {userProgress.streak ?? 0} days
            </span>
            <span className="rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-600">
              Progress: {Math.round(userProgress.overallProgress ?? 0)}%
            </span>
          </div>
        </div>
      </motion.section>

<<<<<<< HEAD
      <LearningCards
        modules={modules}
        loading={loading}
        error={error}
        onSelectModule={handleSelectModule}
      />
=======
      <motion.section
        data-scene="Core Learning Sections"
        className="relative px-6 pb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">
              Core Sections
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
              Learn with focused pathways
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Follow these structured sections to steadily improve from single signs to complete social conversations.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coreLearningSections.map((section, index) => (
              <motion.article
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`relative overflow-hidden rounded-3xl border bg-linear-to-br p-6 shadow-soft transition-all ${section.tone}`}
              >
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-700/80 uppercase">
                  {section.subtitle}
                </p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-slate-900">
                  {section.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  {section.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {section.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/70 bg-white/70 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-700"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      <LearningCards modules={modules} loading={loading} error={error} userProgress={userProgress} />
>>>>>>> 408f45b7bb6a527d8d0ee055bc1ebc331495150e
    </div>
  );
}

export default LearnPage;
