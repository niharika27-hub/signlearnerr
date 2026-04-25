import { motion } from "framer-motion";
import { BookText, MessageCircle, Signature, Zap, Eye, Users, Briefcase, Globe, Play, Award, Heart, Accessibility } from "lucide-react";
import StickySectionLabel from "@/components/StickySectionLabel";

// Map icon names to Lucide components
const iconMap = {
  Signature,
  BookText,
  MessageCircle,
  Zap,
  Eye,
  Users,
  Briefcase,
  Globe,
  Play,
  Award,
  Heart,
  Accessibility,
};

// Map categories to gradient colors
const gradientMap = {
  alphabet: "from-cyan-300/45 via-blue-300/25 to-transparent group-hover:from-cyan-300/55",
  vocabulary: "from-violet-300/45 via-indigo-300/25 to-transparent group-hover:from-violet-300/55",
  sentences: "from-emerald-300/45 via-teal-300/25 to-transparent group-hover:from-emerald-300/55",
  conversation: "from-pink-300/45 via-rose-300/25 to-transparent group-hover:from-pink-300/55",
};

function LearningCards({ modules = [], loading = false, error = null }) {
  // Fallback gradient
  const getGradient = (category) => gradientMap[category] || gradientMap.vocabulary;

  // Get icon component or fallback
  const getIcon = (iconName) => iconMap[iconName] || BookText;

  return (
    <section data-scene="Learning Modules" className="relative px-6 py-24 sm:py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f7fbff] via-[#ecf4ff] to-[#f4f9ff]" />
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
            Start with the basics
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
                className="glass relative overflow-hidden rounded-3xl p-6 shadow-soft bg-slate-100/40 animate-pulse"
                style={{ height: "280px" }}
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
            <p className="text-sm mt-2">Check back soon for new learning content!</p>
          </motion.div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module, index) => {
              const Icon = getIcon(module.icon);
              const gradient = getGradient(module.category);
              const moduleKey = module.id || module._id || `${module.title || "module"}-${index}`;

              return (
                <motion.article
                  key={moduleKey}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="group glass relative overflow-hidden rounded-3xl p-6 shadow-soft cursor-pointer transition-all"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br transition duration-300 ${gradient}`}
                  />
                  <div className="relative">
                    <div className="mb-6 inline-flex rounded-2xl border border-white/35 bg-white/20 p-3 text-slate-900">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-display text-2xl font-semibold text-slate-950">
                      {module.title}
                    </h4>
                    <p className="mt-3 text-sm leading-relaxed font-medium text-slate-800/85">
                      {module.description}
                    </p>

                    <div className="mt-7">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold tracking-wide text-slate-700/80 uppercase">
                        <span>{module.lessonsCount} Lessons</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-300/55">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500"
                          initial={{ width: 0 }}
                          whileInView={{ width: "0%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
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
