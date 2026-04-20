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

function ProgressSection({ progress = null, loading = false, error = null }) {
  // Create stat objects with real data or defaults
  const stats = [
    {
      label: "Streak",
      value: `${progress?.streak ?? 0} Days`,
      percent: Math.min(progress?.streak ?? 0, 100),
      icon: Flame,
      color: "from-orange-300 to-amber-300",
    },
    {
      label: "XP Points",
      value: `${progress?.totalXp ?? 0} XP`,
      percent: Math.min((progress?.totalXp ?? 0) / 50, 100), // Scale for display
      icon: Zap,
      color: "from-cyan-300 to-blue-300",
    },
    {
      label: "Overall Progress",
      value: `${Math.round(progress?.overallProgress ?? 0)}%`,
      percent: progress?.overallProgress ?? 0,
      icon: Trophy,
      color: "from-emerald-300 to-teal-300",
    },
  ];

  // Create continue modules from module progress
  const continueModules = [];
  if (progress?.modulesCompleted !== undefined && progress?.totalModules !== undefined) {
    continueModules.push({
      title: `${progress.modulesCompleted} of ${progress.totalModules} modules completed`,
      progress: progress.totalModules > 0 ? (progress.modulesCompleted / progress.totalModules) * 100 : 0,
      eta: `${progress.lessonsCompleted ?? 0} lessons done`,
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
            className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700"
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
                        <span>Weekly Goal</span>
                        <span>{Math.round(stat.percent)}%</span>
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
            <div className="mt-5 -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
              {continueModules.map((module, index) => (
                <motion.article
                  key={module.title}
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="glass min-w-[280px] snap-start rounded-3xl p-5 shadow-soft sm:min-w-[320px]"
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
                  <button className="mt-5 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                    Continue Learning
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.article>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default ProgressSection;
