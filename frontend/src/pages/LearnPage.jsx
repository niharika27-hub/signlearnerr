import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Brain,
  Flame,
  GraduationCap,
  HandMetal,
  PlayCircle,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import LearningCards from "@/components/LearningCards";
import StickySectionLabel from "@/components/StickySectionLabel";
import { getModules, getUserProgress } from "@/lib/authApi";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const coreLearningSections = [
  {
    id: "learn-words",
    title: "Learn Words",
    subtitle: "Essential Vocabulary",
    description:
      "Build daily-use vocabulary with short visual drills for greetings, objects, actions, and emotions.",
    chips: ["Basics", "Everyday words", "Pronunciation cues"],
    tone: "from-cyan-100/80 via-blue-100/55 to-cyan-50/70 border-cyan-200/70",
    icon: BookOpen,
    iconColor: "text-cyan-600",
    accentGlow: "bg-cyan-400/20",
  },
  {
    id: "learn-sentences",
    title: "Learn Sentences",
    subtitle: "Sentence Building",
    description:
      "Practice sentence flow, grammar patterns, and expression timing to communicate complete thoughts.",
    chips: ["Structure", "Context", "Conversation flow"],
    tone: "from-violet-100/80 via-indigo-100/55 to-fuchsia-50/70 border-indigo-200/70",
    icon: Brain,
    iconColor: "text-violet-600",
    accentGlow: "bg-violet-400/20",
  },
  {
    id: "proper-greetings",
    title: "Proper Greetings",
    subtitle: "Social Communication",
    description:
      "Master polite greetings and social phrases for introductions, responses, and respectful interactions.",
    chips: ["Introductions", "Politeness", "Real scenarios"],
    tone: "from-emerald-100/80 via-teal-100/55 to-green-50/70 border-emerald-200/70",
    icon: HandMetal,
    iconColor: "text-emerald-600",
    accentGlow: "bg-emerald-400/20",
  },
];

const roadmapSteps = [
  { label: "Alphabets & Numbers", icon: "🔤", status: "complete" },
  { label: "Core Vocabulary", icon: "📚", status: "current" },
  { label: "Sentence Patterns", icon: "💬", status: "upcoming" },
  { label: "Conversations", icon: "🤝", status: "upcoming" },
  { label: "Advanced Fluency", icon: "⭐", status: "upcoming" },
];

function AnimatedCounter({ target, suffix = "", duration = 1.5 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target <= 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration * 60));
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [target, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

function LearnPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [userProgress, setUserProgress] = useState({
    streak: 0,
    overallProgress: 0,
    modulesCompleted: 0,
    totalModules: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const [modulesResponse, progressResponse] = await Promise.all([
          getModules(),
          getUserProgress(),
        ]);

        setModules(modulesResponse.data || modulesResponse.modules || []);
        setUserProgress(
          progressResponse.progress || {
            streak: 0,
            overallProgress: 0,
            modulesCompleted: 0,
            totalModules: 0,
          }
        );
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

  function handleSelectModule(module) {
    if (!module) return;
    const nextModuleId = module._id || module.id;
    if (!nextModuleId) return;
    navigate(`/learn/module/${nextModuleId}`);
  }

  return (
    <div className="pt-20">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <motion.section
        data-scene="Learn Intro"
        className="relative overflow-hidden px-6 py-20 sm:py-24"
        initial="hidden"
        animate="show"
      >
        {/* Ambient background */}
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-[#f0f6ff] via-[#e8f1ff] to-[#f2f8ff]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(96,165,250,0.18),transparent_50%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.14),transparent_50%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_80%,rgba(52,211,153,0.1),transparent_50%)]" />

        {/* Floating decorative orbs */}
        <motion.div
          className="pointer-events-none absolute top-16 left-[10%] h-32 w-32 rounded-full bg-cyan-300/15 blur-2xl"
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute top-32 right-[15%] h-24 w-24 rounded-full bg-violet-300/15 blur-2xl"
          animate={{ y: [0, 15, 0], scale: [1, 0.95, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="mx-auto max-w-6xl">
          <StickySectionLabel label="Learn Intro" />

          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
            {/* Left: Text content */}
            <div className="flex-1">
              <motion.div
                variants={fadeUp}
                custom={0.05}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-cyan-50/80 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-cyan-800 uppercase backdrop-blur"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Learning Journey
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={0.15}
                className="font-display text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl"
              >
                Build your signing{" "}
                <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                  foundation
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={0.25}
                className="mt-5 max-w-xl text-base text-slate-600 sm:text-lg"
              >
                Pick a track, learn visually, and keep momentum every day.
                Master sign language through interactive lessons, practice
                sessions, and real-world scenarios.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={0.35}
                className="mt-7 flex flex-wrap gap-3"
              >
                <button
                  type="button"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(96,165,250,0.35)] transition hover:scale-[1.03] hover:brightness-105"
                >
                  <PlayCircle className="h-4.5 w-4.5 transition group-hover:scale-110" />
                  Continue Learning
                </button>
                <button
                  type="button"
                  className="rounded-2xl border border-slate-300 bg-white/85 px-6 py-3 text-sm font-semibold text-slate-800 backdrop-blur transition hover:scale-[1.02] hover:bg-white"
                >
                  Browse All Modules
                </button>
              </motion.div>
            </div>

            {/* Right: Stats grid */}
            <motion.div
              variants={fadeUp}
              custom={0.4}
              className="grid flex-shrink-0 grid-cols-2 gap-3 sm:gap-4 lg:w-[340px]"
            >
              {[
                {
                  icon: Target,
                  label: "Overall Progress",
                  value: Math.round(userProgress.overallProgress ?? 0),
                  suffix: "%",
                  color: "text-cyan-600",
                  bg: "from-cyan-50 to-blue-50",
                  border: "border-cyan-200/70",
                },
                {
                  icon: Flame,
                  label: "Day Streak",
                  value: userProgress.streak ?? 0,
                  suffix: " days",
                  color: "text-orange-600",
                  bg: "from-orange-50 to-amber-50",
                  border: "border-orange-200/70",
                },
                {
                  icon: GraduationCap,
                  label: "Completed",
                  value: userProgress.modulesCompleted ?? 0,
                  suffix: `/${userProgress.totalModules ?? 5}`,
                  color: "text-violet-600",
                  bg: "from-violet-50 to-fuchsia-50",
                  border: "border-violet-200/70",
                },
                {
                  icon: Zap,
                  label: "Active Tracks",
                  value: modules.length || 5,
                  suffix: "",
                  color: "text-emerald-600",
                  bg: "from-emerald-50 to-teal-50",
                  border: "border-emerald-200/70",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -3, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm backdrop-blur ${stat.bg} ${stat.border}`}
                >
                  <div
                    className={`absolute -right-2 -top-2 h-16 w-16 rounded-full ${stat.bg} opacity-40 blur-xl`}
                  />
                  <stat.icon className={`relative h-5 w-5 ${stat.color}`} />
                  <p className="relative mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                    />
                  </p>
                  <p className="relative mt-0.5 text-xs font-medium text-slate-500">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ── Visual Learning Roadmap ─────────────────────────────── */}
      <motion.section
        data-scene="Learning Roadmap"
        className="relative px-6 py-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">
              Your Path
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
              Learning Roadmap
            </h2>
          </div>

          {/* Roadmap timeline */}
          <div className="relative flex flex-wrap items-center justify-center gap-4 sm:gap-0">
            {roadmapSteps.map((step, i) => (
              <div key={step.label} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border p-4 sm:px-5 sm:py-4 backdrop-blur transition-all ${
                    step.status === "complete"
                      ? "border-emerald-200 bg-emerald-50/80 shadow-sm"
                      : step.status === "current"
                        ? "border-cyan-300 bg-white/90 shadow-[0_4px_20px_rgba(96,165,250,0.2)] ring-2 ring-cyan-200/50"
                        : "border-slate-200 bg-white/60 opacity-60"
                  }`}
                >
                  <span className="text-2xl">{step.icon}</span>
                  <span className="text-center text-xs font-semibold text-slate-700 sm:text-sm">
                    {step.label}
                  </span>
                  {step.status === "complete" && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white shadow-sm">
                      ✓
                    </span>
                  )}
                  {step.status === "current" && (
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-cyan-400 shadow-sm"
                    />
                  )}
                </motion.div>

                {/* Connector line */}
                {i < roadmapSteps.length - 1 && (
                  <div className="hidden h-0.5 w-8 sm:block lg:w-14">
                    <div
                      className={`h-full rounded-full ${
                        step.status === "complete"
                          ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
                          : "bg-slate-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Core Learning Sections ──────────────────────────────── */}
      <motion.section
        data-scene="Core Learning Sections"
        className="relative px-6 pb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">
              Core Sections
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
              Learn with focused pathways
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Follow these structured sections to steadily improve from single
              signs to complete social conversations.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coreLearningSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.article
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`group relative overflow-hidden rounded-3xl border bg-linear-to-br p-6 shadow-soft transition-all ${section.tone}`}
                >
                  {/* Hover glow */}
                  <div
                    className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full ${section.accentGlow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
                  />

                  {/* Icon */}
                  <div
                    className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/70 bg-white/80 shadow-sm ${section.iconColor}`}
                  >
                    <Icon className="h-5.5 w-5.5" />
                  </div>

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

                  {/* Hover arrow */}
                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <span>Explore pathway</span>
                    <TrendingUp className="h-3.5 w-3.5" />
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ── Learning Modules ────────────────────────────────────── */}
      <LearningCards
        modules={modules}
        loading={loading}
        error={error}
        userProgress={userProgress}
      />
    </div>
  );
}

export default LearnPage;
