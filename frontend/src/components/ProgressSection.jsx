import { motion } from "framer-motion";
import { ArrowRight, Clock3, Flame, Trophy, Zap } from "lucide-react";
import StickySectionLabel from "@/components/StickySectionLabel";

function CircleMeter({ percent }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg viewBox="0 0 90 90" className="h-20 w-20">
      <circle
        cx="45"
        cy="45"
        r={radius}
        className="stroke-slate-200"
        strokeWidth="8"
        fill="none"
      />
      <motion.circle
        cx="45"
        cy="45"
        r={radius}
        strokeWidth="8"
        fill="none"
        stroke="url(#ringGradient)"
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        whileInView={{ strokeDashoffset: offset }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          strokeDasharray: circumference,
          transformOrigin: "50% 50%",
          transform: "rotate(-90deg)",
        }}
      />
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8AE2FF" />
          <stop offset="55%" stopColor="#7E9DFF" />
          <stop offset="100%" stopColor="#84F4C8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ProgressSection({
  progress = null,
  loading = false,
  error = null,
  onContinueLearning = null,
}) {
  const streak = Number(progress?.streak ?? 0);
  const rawTotalXp = Number(progress?.totalXp ?? 0);
  const rawXpThisWeek = Number(progress?.xpThisWeek ?? 0);
  const overallProgress = Math.max(0, Math.min(100, Number(progress?.overallProgress ?? 0)));
  const lessonsCompleted = Number(progress?.lessonsCompleted ?? 0);
  const totalLessons = Number(progress?.totalLessons ?? 0);
  const moduleProgressList = Array.isArray(progress?.moduleProgress) ? progress.moduleProgress : [];

  // Keep XP display internally consistent even when payload fields are briefly out of sync.
  const totalXp = Math.max(rawTotalXp, lessonsCompleted);
  const xpThisWeek = Math.min(rawXpThisWeek, totalXp);

  const topModuleProgress = [...moduleProgressList]
    .map((entry) => {
      const moduleName =
        entry?.moduleId?.title ||
        entry?.moduleTitle ||
        entry?.title ||
        "Untitled module";
      const percentage = Math.max(
        0,
        Math.min(100, Math.round(Number(entry?.progressPercentage ?? 0)))
      );

      return {
        id: String(entry?._id || entry?.moduleId?._id || moduleName),
        name: moduleName,
        percentage,
        lessonsCompleted: Number(entry?.lessonsCompleted ?? 0),
        totalLessons: Number(entry?.totalLessons ?? 0),
      };
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 6);

  // Create stat objects with real data or defaults
  const stats = [
    {
      label: "Streak",
      value: `${streak} Day${streak === 1 ? "" : "s"}`,
      percent: Math.min(streak, 100),
      metricLabel: "Streak goal",
      metricValue: `${Math.min(streak, 100)}%`,
      contextText: streak > 0 ? "You practiced recently. Keep momentum." : "Start today to build your streak.",
      icon: Flame,
      color: "from-orange-300 to-amber-300",
    },
    {
      label: "XP",
      value: `${totalXp} XP`,
      percent: Math.min((totalXp / 50) * 100, 100),
      metricLabel: "This week",
      metricValue: `+${xpThisWeek} XP`,
      contextText: `${lessonsCompleted}/${Math.max(totalLessons, lessonsCompleted)} lessons converted to XP`,
      icon: Zap,
      color: "from-cyan-300 to-blue-300",
    },
    {
      label: "Course Completion",
      value: `${Math.round(overallProgress)}%`,
      percent: overallProgress,
      metricLabel: "Completed",
      metricValue: `${Math.round(overallProgress)}%`,
      contextText: `${lessonsCompleted}/${Math.max(totalLessons, lessonsCompleted)} lessons complete`,
      icon: Trophy,
      color: "from-emerald-300 to-teal-300",
    },
  ];

  // Create continue modules from module progress
  const continueModules = [];
  if (progress?.modulesCompleted !== undefined && progress?.totalModules !== undefined) {
    const modulesCompleted = Number(progress.modulesCompleted ?? 0);
    const totalModules = Math.max(Number(progress.totalModules ?? 0), modulesCompleted);
    const hasAnyCompletion = modulesCompleted > 0 || lessonsCompleted > 0;

    continueModules.push({
      title: hasAnyCompletion
        ? `${modulesCompleted} of ${totalModules} modules completed`
        : "No modules completed yet",
      progress: totalModules > 0 ? (modulesCompleted / totalModules) * 100 : 0,
      eta: hasAnyCompletion
        ? `${lessonsCompleted}/${Math.max(totalLessons, lessonsCompleted)} lessons done`
        : "Complete your first lesson to start visible progress.",
      ctaLabel: hasAnyCompletion ? "Continue Learning" : "Start Learning",
    });
  }

  return (
    <section data-scene="Momentum Dashboard" className="relative px-6 py-20 sm:py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f8fbff] via-[#eef5ff] to-[#f4f9ff]" />
      <div className="mx-auto w-full max-w-6xl">
        <StickySectionLabel label="Momentum Dashboard" />
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">
            Your Momentum
          </p>
          <h3 className="mt-2 font-display text-3xl leading-tight font-semibold text-slate-900 sm:text-4xl">
            Keep the streak alive
          </h3>
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
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="glass rounded-3xl p-5 shadow-soft bg-slate-100/40 animate-pulse"
                style={{ height: "220px" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.article
                  key={stat.label}
                  className="glass rounded-3xl p-5 shadow-soft"
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{stat.contextText}</p>
                    </div>
                    <div
                      className={`rounded-2xl bg-gradient-to-br p-3 text-slate-900 ${stat.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="mr-4 flex-1">
                      <div className="mb-2 flex justify-between text-xs font-semibold text-slate-600">
                        <span>{stat.metricLabel}</span>
                        <span>{stat.metricValue}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-200/70">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${stat.percent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.2 + index * 0.08 }}
                        />
                      </div>
                    </div>
                    <CircleMeter percent={stat.percent} />
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {continueModules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mt-14"
          >
            <h4 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
              Continue learning
            </h4>
            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(320px,380px)_1fr]">
              {continueModules.map((module, index) => (
                <motion.article
                  key={module.title}
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="glass rounded-3xl p-5 shadow-soft"
                >
                  <p className="text-lg font-semibold text-slate-900">{module.title}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <Clock3 className="h-4 w-4" />
                    {module.eta}
                  </div>
                  <div className="mt-4 h-2.5 rounded-full bg-slate-200/75">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${module.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onContinueLearning || undefined}
                    className="mt-5 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    {module.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.article>
              ))}

              <motion.article
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="glass rounded-3xl p-5 shadow-soft"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold tracking-[0.12em] text-slate-500 uppercase">
                    Module Snapshot
                  </p>
                  <span className="rounded-full border border-slate-200 bg-white/85 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {topModuleProgress.length} visible
                  </span>
                </div>

                {topModuleProgress.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">
                    Module-level progress appears after your first lesson completion.
                  </p>
                ) : (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {topModuleProgress.map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                        <p className="truncate text-sm font-semibold text-slate-900">{entry.name}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {entry.lessonsCompleted}/{Math.max(entry.totalLessons, entry.lessonsCompleted)} lessons
                        </p>
                        <div className="mt-2 h-2 rounded-full bg-slate-200/80">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-300 via-blue-300 to-cyan-300"
                            style={{ width: `${entry.percentage}%` }}
                          />
                        </div>
                        <p className="mt-1 text-right text-xs font-semibold text-slate-600">{entry.percentage}%</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.article>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default ProgressSection;
