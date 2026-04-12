import { motion } from "framer-motion";
import { BookText, MessageCircle, Signature } from "lucide-react";
import StickySectionLabel from "@/components/StickySectionLabel";

const lessons = [
  {
    icon: Signature,
    title: "A-Z Alphabets",
    description: "Master finger spelling with guided gesture loops.",
    progress: 36,
    color:
      "from-cyan-300/45 via-blue-300/25 to-transparent group-hover:from-cyan-300/55",
  },
  {
    icon: BookText,
    title: "Basic Words",
    description: "Learn everyday essentials for real conversations.",
    progress: 22,
    color:
      "from-violet-300/45 via-indigo-300/25 to-transparent group-hover:from-violet-300/55",
  },
  {
    icon: MessageCircle,
    title: "Daily Sentences",
    description: "Build complete thoughts with practical sentence drills.",
    progress: 14,
    color:
      "from-emerald-300/45 via-teal-300/25 to-transparent group-hover:from-emerald-300/55",
  },
];

function LearningCards() {
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

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson, index) => {
            const Icon = lesson.icon;
            return (
              <motion.article
                key={lesson.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group glass relative overflow-hidden rounded-3xl p-6 shadow-soft"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br transition duration-300 ${lesson.color}`}
                />
                <div className="relative">
                  <div className="mb-6 inline-flex rounded-2xl border border-white/35 bg-white/20 p-3 text-slate-900">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-display text-2xl font-semibold text-slate-950">
                    {lesson.title}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed font-medium text-slate-800/85">
                    {lesson.description}
                  </p>

                  <div className="mt-7">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold tracking-wide text-slate-700/80 uppercase">
                      <span>Progress</span>
                      <span>{lesson.progress}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-300/55">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${lesson.progress}%` }}
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
      </div>
    </section>
  );
}

export default LearningCards;
