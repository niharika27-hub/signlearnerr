import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ChevronDown, Clock3, Flame, Lock, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StickySectionLabel from "@/components/StickySectionLabel";

const moduleToneCycle = [
  "from-cyan-100/75 via-blue-100/55 to-cyan-50/80 border-cyan-200/70",
  "from-violet-100/75 via-indigo-100/55 to-fuchsia-50/80 border-indigo-200/70",
  "from-emerald-100/75 via-teal-100/55 to-green-50/80 border-emerald-200/70",
  "from-rose-100/75 via-pink-100/55 to-orange-50/80 border-rose-200/70",
  "from-amber-100/75 via-yellow-100/55 to-lime-50/80 border-amber-200/70",
];

function formatMinutes(totalMinutes = 0) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours}h ${minutes}m`;
}

function getDifficultyPill(difficulty) {
  if (difficulty === "Easy") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (difficulty === "Medium") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function isVideoUrl(url = "") {
  return /\.mp4($|\?)/i.test(url) || /\/video\//i.test(url);
}

function isPlaceholderMediaUrl(url = "") {
  return /res\.cloudinary\.com\/demo\/video\/upload\/v1\/signlearn/i.test(String(url || ""));
}

function toYouTubeEmbedUrl(url = "") {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }

  try {
    const parsedUrl = new URL(value, "https://example.com");
    const host = parsedUrl.hostname.toLowerCase();

    if (!host.includes("youtube.com") && !host.includes("youtube-nocookie.com") && !host.includes("youtu.be")) {
      return "";
    }

    if (host.includes("youtu.be")) {
      const id = parsedUrl.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (parsedUrl.pathname.startsWith("/embed/")) {
      return value;
    }

    const id = parsedUrl.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : "";
  } catch (_error) {
    return "";
  }
}

function normalizeTitle(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeBackendModules(modules = []) {
  return (Array.isArray(modules) ? modules : []).map((module, index) => {
    const lessons = Array.isArray(module?.lessons)
      ? module.lessons.map((lesson, lessonIndex) => ({
          lessonKey: String(lesson?._id || lesson?.id || lesson?.lessonKey || `${index}-${lessonIndex}`),
          title: String(lesson?.title || `Lesson ${lessonIndex + 1}`),
          shortDescription: String(lesson?.description || "No description available."),
          difficulty: String(lesson?.difficultyLevel || "Easy").replace(/^./, (char) => char.toUpperCase()),
          durationMinutes: Number(lesson?.duration || lesson?.durationMinutes || 0),
          mediaUrl: String(lesson?.contentUrl || lesson?.mediaUrl || lesson?.videoUrl || ""),
          practiceActivity: {
            prompt: "Open lesson to practice with guided material.",
          },
          quiz: {
            question: "Open lesson to access quiz questions.",
          },
        }))
      : [];

    return {
      moduleKey: String(module?._id || module?.id || module?.moduleKey || `module-${index}`),
      title: String(module?.title || `Module ${index + 1}`),
      description: String(module?.description || "No module description available."),
      orderIndex: Number(module?.orderIndex || index + 1),
      estimatedCompletionMinutes: lessons.reduce((sum, lesson) => sum + Number(lesson.durationMinutes || 0), 0),
      thumbnailPreview: {
        type: "video",
        url: String(module?.thumbnailUrl || module?.thumbnailPreview?.url || lessons[0]?.mediaUrl || ""),
      },
      categories: [
        {
          categoryKey: String(module?.category || "general"),
          title: String(module?.category ? module.category.replace(/^./, (char) => char.toUpperCase()) : "Lessons"),
          description: "Lesson set available for this module.",
          lessons,
        },
      ],
    };
  });
}

function LearningCards({ modules = [], loading = false, error = null, userProgress = {} }) {
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState("beginner-basics");

  const moduleCards = useMemo(() => {
    const sourceModules = normalizeBackendModules(modules);

    if (sourceModules.length === 0) {
      return [];
    }

    const progressByModuleId = new Map(
      (Array.isArray(userProgress.moduleProgress) ? userProgress.moduleProgress : []).map((entry) => [
        String(entry?.moduleId?._id || entry?.moduleId || ""),
        Number(entry?.progressPercentage ?? 0),
      ])
    );

    const withProgress = sourceModules.map((module) => {
      const progressPercentage = Math.max(
        0,
        Math.min(100, Math.round(progressByModuleId.get(String(module.moduleKey)) ?? 0))
      );

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
        tone: moduleToneCycle[index % moduleToneCycle.length],
      };
    });
  }, [modules, userProgress.moduleProgress]);

  const continueModule = moduleCards.find(
    (module) => !module.locked && module.progressPercentage > 0 && module.progressPercentage < 100
  );

  return (
    <section data-scene="Learning Modules" className="relative px-6 py-24 sm:py-28">
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-[#f7fbff] via-[#ecf4ff] to-[#f4f9ff]" />
      <div className="mx-auto w-full max-w-6xl">
        <StickySectionLabel label="Learning Modules" />
        <motion.div
          className="mb-10 text-slate-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-800/80 uppercase">
            Interactive Learning
          </p>
          <h3 className="mt-2 font-display text-3xl leading-tight font-semibold sm:text-4xl">
            Structured learning roadmap
          </h3>
          <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
            Home → Learn Page → Module → Category → Lesson → Practice → Quiz → Progress Update
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <Flame className="mr-1 inline-block h-3.5 w-3.5 text-orange-500" />
              Streak: {userProgress.streak ?? 0} days
            </span>
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700">
              Continue: {continueModule?.title ?? "Beginner Basics"}
            </span>
          </div>
        </motion.div>

        {error && (
          <motion.div
            className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="relative min-h-72 overflow-hidden rounded-3xl border border-white/60 bg-slate-100/55 p-6 shadow-soft animate-pulse"
              />
            ))}
          </div>
        ) : modules.length === 0 ? (
          <motion.div
            className="rounded-xl bg-slate-50 border border-slate-200 p-8 text-center text-slate-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-lg font-semibold">No modules available yet</p>
            <p className="text-sm mt-2">Check back soon for new learning content.</p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {moduleCards.map((module, index) => {
              const isExpanded = expandedModule === module.moduleKey;
              const lessonsCount = module.categories.reduce((sum, category) => sum + category.lessons.length, 0);
              const previewUrl = String(module?.thumbnailPreview?.url || "");
              const hasPreview = previewUrl && !isPlaceholderMediaUrl(previewUrl);
              const modulePreviewEmbed = toYouTubeEmbedUrl(previewUrl);

              function openModule() {
                if (!module?.moduleKey) {
                  return;
                }

                navigate(`/learn/module/${module.moduleKey}`);
              }

              return (
                <motion.article
                  key={module.moduleKey}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={`overflow-hidden rounded-3xl border bg-linear-to-br p-5 shadow-soft sm:p-6 ${module.tone}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-55 flex-1">
                      <p className="text-xs font-semibold tracking-[0.16em] text-slate-600 uppercase">
                        Module {module.orderIndex}
                      </p>
                      <h4 className="mt-1 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
                        {module.title}
                      </h4>
                      <p className="mt-2 max-w-3xl text-sm text-slate-700 sm:text-base">
                        {module.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/70 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-700">
                          {module.categories.length} categories
                        </span>
                        <span className="rounded-full border border-white/70 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-700">
                          {lessonsCount} lessons
                        </span>
                        <span className="rounded-full border border-white/70 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-700">
                          <Clock3 className="mr-1 inline-block h-3.5 w-3.5" />
                          {module.estimatedLabel}
                        </span>
                        {module.locked && (
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                            <Lock className="mr-1 inline-block h-3.5 w-3.5" /> Locked
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full max-w-55 overflow-hidden rounded-2xl border border-white/70 bg-white/55">
                      {!hasPreview ? (
                        <div className="flex h-28 items-center justify-center bg-slate-100 text-xs font-semibold text-slate-500">
                          Preview unavailable
                        </div>
                      ) : modulePreviewEmbed ? (
                        <iframe
                          src={modulePreviewEmbed}
                          title={`${module.title} preview`}
                          className="h-28 w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : isVideoUrl(previewUrl) ? (
                        <video
                          src={previewUrl}
                          muted
                          playsInline
                          loop
                          autoPlay
                          className="h-28 w-full object-cover"
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt={`${module.title} preview`}
                          className="h-28 w-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold tracking-[0.14em] text-slate-700/85 uppercase">
                      <span>Progress</span>
                      <span>{module.progressPercentage}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-300/60">
                      <motion.div
                        className="h-full rounded-full bg-linear-to-r from-cyan-500 via-blue-500 to-violet-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${module.progressPercentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={openModule}
                      disabled={module.locked}
                      className="rounded-full border border-slate-300 bg-white/85 px-4 py-2 text-xs font-semibold tracking-wide text-slate-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {module.locked
                        ? "Locked"
                        : module.progressPercentage > 0 && module.progressPercentage < 100
                          ? "Continue"
                          : module.progressPercentage >= 100
                            ? "Review"
                            : "Start"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedModule(isExpanded ? null : module.moduleKey)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white/85 px-4 py-2 text-xs font-semibold tracking-wide text-slate-800 transition hover:bg-white"
                    >
                      {isExpanded ? "Hide details" : "View module"}
                      <ChevronDown className={`h-4 w-4 transition ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 space-y-4 rounded-2xl border border-white/70 bg-white/55 p-4 sm:p-5"
                    >
                      {module.categories.map((category) => (
                        <details key={category.categoryKey} className="group rounded-xl border border-slate-200/80 bg-white/80 p-3" open>
                          <summary className="cursor-pointer list-none">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">Category</p>
                                <h5 className="mt-1 text-lg font-semibold text-slate-900">{category.title}</h5>
                                <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                              </div>
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                {category.lessons.length} lessons
                              </span>
                            </div>
                          </summary>

                          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {category.lessons.map((lesson) => {
                              const lessonMediaUrl = String(lesson?.mediaUrl || "");
                              const hasLessonPreview = lessonMediaUrl && !isPlaceholderMediaUrl(lessonMediaUrl);
                              const lessonPreviewEmbed = toYouTubeEmbedUrl(lessonMediaUrl);

                              return (
                              <article key={lesson.lessonKey} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                  {!hasLessonPreview ? (
                                    <div className="flex h-24 items-center justify-center bg-slate-100 text-[11px] font-semibold text-slate-500">
                                      Preview unavailable
                                    </div>
                                  ) : lessonPreviewEmbed ? (
                                    <iframe
                                      src={lessonPreviewEmbed}
                                      title={`${lesson.title} preview`}
                                      className="h-24 w-full"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      allowFullScreen
                                    />
                                  ) : isVideoUrl(lessonMediaUrl) ? (
                                    <video src={lessonMediaUrl} muted playsInline loop autoPlay className="h-24 w-full object-cover" />
                                  ) : (
                                    <img src={lessonMediaUrl} alt={lesson.title} className="h-24 w-full object-cover" />
                                  )}
                                </div>

                                <h6 className="mt-3 text-sm font-semibold text-slate-900">{lesson.title}</h6>
                                <p className="mt-1 text-xs leading-relaxed text-slate-600">{lesson.shortDescription}</p>

                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                    {lesson.durationMinutes} min
                                  </span>
                                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getDifficultyPill(lesson.difficulty)}`}>
                                    {lesson.difficulty}
                                  </span>
                                </div>

                                <p className="mt-2 text-[11px] text-slate-600">
                                  <span className="font-semibold text-slate-700">Practice:</span> {lesson.practiceActivity.prompt}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-600">
                                  <span className="font-semibold text-slate-700">Quiz:</span> {lesson.quiz.question}
                                </p>

                                <button
                                  type="button"
                                  onClick={openModule}
                                  className="mt-3 inline-flex items-center gap-1 rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-[11px] font-semibold text-cyan-800 hover:bg-cyan-100"
                                >
                                  <PlayCircle className="h-3.5 w-3.5" /> Start lesson
                                </button>
                              </article>
                            );})}
                          </div>
                        </details>
                      ))}
                    </motion.div>
                  )}
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
