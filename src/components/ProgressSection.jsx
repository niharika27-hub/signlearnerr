import { motion } from "framer-motion";
import { ArrowRight, Clock3, Flame, Trophy, Zap } from "lucide-react";

const stats = [
  {
    label: "Streak",
    value: "12 Days",
    percent: 68,
    icon: Flame,
    color: "from-orange-300 to-amber-300",
  },
  {
    label: "XP Points",
    value: "2,340 XP",
    percent: 74,
    icon: Zap,
    color: "from-cyan-300 to-blue-300",
  },
  {
    label: "Overall Progress",
    value: "67%",
    percent: 67,
    icon: Trophy,
    color: "from-emerald-300 to-teal-300",
  },
];

const continueModules = [
  { title: "A-Z Alphabets", progress: 78, eta: "8 min left" },
  { title: "Basic Words", progress: 52, eta: "14 min left" },
  { title: "Daily Sentences", progress: 31, eta: "22 min left" },
];

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
        className="stroke-white/15"
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

function ProgressSection() {
  return (
    <section className="relative px-6 py-20 sm:py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#060a16] via-[#070f1d] to-[#05070d]" />
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-200/80 uppercase">
            Your Momentum
          </p>
          <h3 className="mt-2 font-display text-3xl leading-tight font-semibold text-white sm:text-4xl">
            Keep the streak alive
          </h3>
        </motion.div>

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
                    <p className="text-xs font-semibold tracking-[0.16em] text-blue-100/75 uppercase">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
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
                    <div className="mb-2 flex justify-between text-xs font-semibold text-blue-100/80">
                      <span>Weekly Goal</span>
                      <span>{stat.percent}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mt-14"
        >
          <h4 className="font-display text-2xl font-semibold text-white sm:text-3xl">
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
                <p className="text-lg font-semibold text-white">{module.title}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-100/85">
                  <Clock3 className="h-4 w-4" />
                  {module.eta}
                </div>
                <div className="mt-4 h-2.5 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300"
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
                <button className="mt-5 inline-flex items-center gap-1 rounded-xl border border-white/35 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                  Resume
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ProgressSection;
