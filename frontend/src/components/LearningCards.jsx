import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useRef } from "react";
import {
  BookOpen,
  ChevronDown,
  Clock3,
  Database,
  Flame,
  GraduationCap,
  Layers,
  Lock,
  Play,
  PlayCircle,
  Sparkles,
  Volume2,
  VolumeX,
  Youtube,
} from "lucide-react";
import StickySectionLabel from "@/components/StickySectionLabel";
import learningContent from "@/data/learning-content.json";

const moduleToneCycle = [
  {
    bg: "from-cyan-100/75 via-blue-100/55 to-cyan-50/80 border-cyan-200/70",
    accent: "from-cyan-400 to-blue-500",
    glow: "bg-cyan-400/15",
    iconBg: "bg-cyan-100 text-cyan-700",
    ring: "ring-cyan-200/60",
  },
  {
    bg: "from-violet-100/75 via-indigo-100/55 to-fuchsia-50/80 border-indigo-200/70",
    accent: "from-violet-400 to-indigo-500",
    glow: "bg-violet-400/15",
    iconBg: "bg-violet-100 text-violet-700",
    ring: "ring-violet-200/60",
  },
  {
    bg: "from-emerald-100/75 via-teal-100/55 to-green-50/80 border-emerald-200/70",
    accent: "from-emerald-400 to-teal-500",
    glow: "bg-emerald-400/15",
    iconBg: "bg-emerald-100 text-emerald-700",
    ring: "ring-emerald-200/60",
  },
  {
    bg: "from-rose-100/75 via-pink-100/55 to-orange-50/80 border-rose-200/70",
    accent: "from-rose-400 to-pink-500",
    glow: "bg-rose-400/15",
    iconBg: "bg-rose-100 text-rose-700",
    ring: "ring-rose-200/60",
  },
  {
    bg: "from-amber-100/75 via-yellow-100/55 to-lime-50/80 border-amber-200/70",
    accent: "from-amber-400 to-yellow-500",
    glow: "bg-amber-400/15",
    iconBg: "bg-amber-100 text-amber-700",
    ring: "ring-amber-200/60",
  },
];

const categoryIcons = {
  alphabets: "🔤",
  numbers: "🔢",
  greetings: "👋",
  "people-family": "👨‍👩‍👧‍👦",
  "daily-objects": "🏠",
  "actions-verbs": "🏃",
  "basic-sentence-patterns": "📝",
  "questions-and-answers": "❓",
  "time-and-place": "⏰",
  "polite-expressions": "🙏",
  "conversation-skills": "💬",
  emotions: "😊",
  storytelling: "📖",
  "real-life-scenarios": "🌍",
  "speed-and-fluency": "⚡",
};

function formatMinutes(totalMinutes = 0) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours}h ${minutes}m`;
}

function getDifficultyPill(difficulty) {
  if (difficulty === "Easy")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (difficulty === "Medium")
    return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function isVideoUrl(url = "") {
  return /\.mp4($|\?)/i.test(url) || /\/video\//i.test(url);
}

/* ── Circular progress ring ──────────────────────────────────── */
function ProgressRing({ progress = 0, size = 56, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.2)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-slate-700">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

/* ── Video preview with play overlay ─────────────────────────── */
function VideoPreview({ url, alt, className = "" }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!isVideoUrl(url)) {
    return (
      <img
        src={url}
        alt={alt}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className="group/video relative h-full w-full" onClick={handlePlayToggle}>
      <video
        ref={videoRef}
        src={url}
        muted={isMuted}
        playsInline
        loop
        autoPlay
        className={`h-full w-full object-cover ${className}`}
      />
      {/* Play/Pause overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity ${
          isPlaying
            ? "opacity-0 group-hover/video:opacity-100"
            : "opacity-100"
        }`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur transition hover:scale-110">
          <Play className="h-4 w-4 text-slate-800 ml-0.5" />
        </div>
      </div>
      {/* Mute toggle */}
      {isPlaying && (
        <button
          type="button"
          onClick={handleMuteToggle}
          className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
        >
          {isMuted ? (
            <VolumeX className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  );
}

/* ── Lesson media with YouTube + Cloudinary toggle ───────────── */
function LessonMedia({ lesson, accentClass = "" }) {
  const [showYT, setShowYT] = useState(false);
  const hasYT = !!lesson.youtubeVideoId;

  return (
    <div className="relative border-b border-slate-100 bg-slate-100">
      {/* Toggle between YouTube and preview */}
      {hasYT && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowYT(!showYT);
            }}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold shadow-sm backdrop-blur transition ${
              showYT
                ? "bg-red-500/90 text-white"
                : "bg-black/40 text-white hover:bg-red-500/80"
            }`}
          >
            <Youtube className="h-3 w-3" />
            {showYT ? "Preview" : "Tutorial"}
          </button>
        </div>
      )}

      {showYT && hasYT ? (
        <div className="relative h-44 w-full">
          <iframe
            src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}?rel=0&modestbranding=1`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      ) : (
        <div className="relative h-32 overflow-hidden">
          <VideoPreview url={lesson.mediaUrl} alt={lesson.title} />
          {/* Duration badge */}
          <span className="absolute left-2 bottom-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            {lesson.durationMinutes} min
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
function LearningCards({
  modules = [],
  loading = false,
  error = null,
  userProgress = {},
}) {
  const [expandedModule, setExpandedModule] = useState("beginner-basics");

  const moduleCards = useMemo(() => {
    const sourceModules = learningContent.modules || [];
    const overallProgress = Number(userProgress.overallProgress ?? 0);

    const withProgress = sourceModules.map((module, index) => {
      const segmentStart = index * (100 / sourceModules.length);
      const segmentEnd = (index + 1) * (100 / sourceModules.length);
      const raw =
        ((overallProgress - segmentStart) / (segmentEnd - segmentStart)) * 100;
      const progressPercentage = Math.max(0, Math.min(100, Math.round(raw)));

      return {
        ...module,
        progressPercentage,
      };
    });

    let previousComplete = true;
    return withProgress.map((module, index) => {
      const locked = index === 0 ? false : !previousComplete;
      previousComplete = module.progressPercentage >= 100;
      return {
        ...module,
        locked,
        estimatedLabel: formatMinutes(module.estimatedCompletionMinutes),
        toneData: moduleToneCycle[index % moduleToneCycle.length],
      };
    });
  }, [userProgress.overallProgress]);

  const continueModule = moduleCards.find(
    (module) =>
      !module.locked &&
      module.progressPercentage > 0 &&
      module.progressPercentage < 100
  );

  return (
    <section
      data-scene="Learning Modules"
      className="relative px-6 py-24 sm:py-28"
    >
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-[#f7fbff] via-[#ecf4ff] to-[#f4f9ff]" />
      <div className="mx-auto w-full max-w-6xl">
        <StickySectionLabel label="Learning Modules" />

        {/* Section header */}
        <motion.div
          className="mb-12 text-slate-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-cyan-800/80 uppercase">
                Interactive Learning
              </p>
              <h3 className="mt-2 font-display text-3xl leading-tight font-semibold sm:text-4xl">
                Structured learning roadmap
              </h3>
              <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
                Progress through modules step by step — each builds on the
                previous one to develop your signing fluency.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex flex-shrink-0 gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur">
                <Flame className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    Streak
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {userProgress.streak ?? 0} days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur">
                <BookOpen className="h-4 w-4 text-cyan-500" />
                <div>
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    Continue
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {continueModule?.title ?? "Beginner Basics"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="relative min-h-72 animate-pulse overflow-hidden rounded-3xl border border-white/60 bg-slate-100/55 p-6 shadow-soft"
              >
                <div className="flex gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                    <div className="h-7 w-48 rounded bg-slate-200" />
                    <div className="h-4 w-full max-w-md rounded bg-slate-200" />
                  </div>
                  <div className="h-36 w-52 rounded-2xl bg-slate-200" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : modules.length === 0 ? (
          <motion.div
            className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-lg font-semibold">
              No modules available yet
            </p>
            <p className="mt-2 text-sm">
              Check back soon for new learning content.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {moduleCards.map((module, index) => {
              const isExpanded = expandedModule === module.moduleKey;
              const lessonsCount = module.categories.reduce(
                (sum, category) => sum + category.lessons.length,
                0
              );
              const tone = module.toneData;

              return (
                <motion.article
                  key={module.moduleKey}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={`group/module relative overflow-hidden rounded-3xl border bg-linear-to-br shadow-soft transition-all hover:shadow-lg ${tone.bg}`}
                >
                  {/* Decorative glow */}
                  <div
                    className={`pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full ${tone.glow} opacity-0 blur-3xl transition-opacity duration-700 group-hover/module:opacity-100`}
                  />

                  <div className="relative p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      {/* Left content */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex items-center gap-3">
                          <span
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${tone.iconBg}`}
                          >
                            {module.orderIndex}
                          </span>
                          <div>
                            <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                              Module {module.orderIndex}
                            </p>
                            {module.locked && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600">
                                <Lock className="h-3 w-3" /> Locked
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
                          {module.title}
                        </h4>
                        <p className="mt-2 max-w-xl text-sm text-slate-700 sm:text-base">
                          {module.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-700">
                            <Layers className="h-3 w-3" />
                            {module.categories.length} categories
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-700">
                            <BookOpen className="h-3 w-3" />
                            {lessonsCount} lessons
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-700">
                            <Clock3 className="h-3 w-3" />
                            {module.estimatedLabel}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200/70 bg-red-50/75 px-3 py-1 text-xs font-semibold text-red-700">
                            <Youtube className="h-3 w-3" />
                            Video lectures
                          </span>
                        </div>

                        {/* Dataset source badges */}
                        {module.datasetSources && module.datasetSources.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {module.datasetSources.map((ds) => (
                              <a
                                key={ds.name}
                                href={ds.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white/60 px-2 py-0.5 text-[10px] font-medium text-slate-500 transition hover:bg-white hover:text-slate-700 hover:border-slate-300"
                              >
                                <Database className="h-2.5 w-2.5" />
                                {ds.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Thumbnail + Progress Ring */}
                      <div className="flex flex-shrink-0 items-start gap-4">
                        <ProgressRing progress={module.progressPercentage} />

                        <div className="w-44 overflow-hidden rounded-2xl border border-white/70 bg-white/55 shadow-sm sm:w-52">
                          <div className="relative h-32 sm:h-36">
                            <VideoPreview
                              url={module.thumbnailPreview.url}
                              alt={`${module.title} preview`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-5">
                      <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold tracking-[0.14em] text-slate-600 uppercase">
                        <span>Progress</span>
                        <span>{module.progressPercentage}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-300/50">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${tone.accent}`}
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${module.progressPercentage}%`,
                          }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7 }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={module.locked}
                        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold tracking-wide shadow-sm transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50 ${
                          module.locked
                            ? "border border-slate-300 bg-white/85 text-slate-600"
                            : `bg-gradient-to-r ${tone.accent} text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]`
                        }`}
                      >
                        {module.locked ? (
                          <>
                            <Lock className="h-3.5 w-3.5" /> Locked
                          </>
                        ) : module.progressPercentage > 0 &&
                          module.progressPercentage < 100 ? (
                          <>
                            <PlayCircle className="h-3.5 w-3.5" /> Continue
                          </>
                        ) : module.progressPercentage >= 100 ? (
                          <>
                            <Sparkles className="h-3.5 w-3.5" /> Review
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5" /> Start Learning
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedModule(
                            isExpanded ? null : module.moduleKey
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white/85 px-4 py-2.5 text-xs font-semibold tracking-wide text-slate-800 transition hover:bg-white hover:shadow-sm"
                      >
                        {isExpanded ? "Hide details" : "View module"}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-5 border-t border-white/50 px-5 py-6 sm:px-6">
                          {module.categories.map((category) => (
                            <details
                              key={category.categoryKey}
                              className={`group/cat rounded-2xl border border-slate-200/80 bg-white/85 shadow-sm backdrop-blur transition-all hover:shadow-md`}
                              open
                            >
                              <summary className="cursor-pointer list-none p-4 sm:p-5">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-xl">
                                      {categoryIcons[
                                        category.categoryKey
                                      ] || "📋"}
                                    </span>
                                    <div>
                                      <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                        Category
                                      </p>
                                      <h5 className="mt-0.5 text-lg font-semibold text-slate-900">
                                        {category.title}
                                      </h5>
                                      <p className="mt-1 text-sm text-slate-600">
                                        {category.description}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="flex-shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                                    {category.lessons.length} lessons
                                  </span>
                                </div>
                              </summary>

                              <div className="border-t border-slate-100 p-4 sm:p-5">
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                  {category.lessons.map((lesson) => (
                                    <motion.article
                                      key={lesson.lessonKey}
                                      whileHover={{
                                        y: -3,
                                        scale: 1.01,
                                      }}
                                      transition={{ duration: 0.2 }}
                                      className="group/lesson overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-lg hover:border-slate-300/80"
                                    >
                                      {/* Lesson media - YouTube embed or Cloudinary preview */}
                                      <LessonMedia
                                        lesson={lesson}
                                        accentClass={tone.accent}
                                      />

                                      <div className="p-3.5">
                                        <h6 className="text-sm font-semibold text-slate-900">
                                          {lesson.title}
                                        </h6>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                          {lesson.shortDescription}
                                        </p>

                                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                                          <span
                                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getDifficultyPill(lesson.difficulty)}`}
                                          >
                                            {lesson.difficulty}
                                          </span>
                                          {lesson.youtubeVideoId && (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                              <Youtube className="h-2.5 w-2.5" />
                                              Video
                                            </span>
                                          )}
                                        </div>

                                        <div className="mt-3 space-y-1.5">
                                          <p className="text-[10px] text-slate-500">
                                            <span className="font-semibold text-slate-600">
                                              Practice:
                                            </span>{" "}
                                            {lesson.practiceActivity.prompt}
                                          </p>
                                          <p className="text-[10px] text-slate-500">
                                            <span className="font-semibold text-slate-600">
                                              Quiz:
                                            </span>{" "}
                                            {lesson.quiz.question}
                                          </p>
                                        </div>

                                        <button
                                          type="button"
                                          className={`mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r ${tone.accent} px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:brightness-105 hover:scale-[1.02]`}
                                        >
                                          <PlayCircle className="h-3.5 w-3.5" />
                                          Start lesson
                                        </button>
                                      </div>
                                    </motion.article>
                                  ))}
                                </div>
                              </div>
                            </details>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default LearningCards;
