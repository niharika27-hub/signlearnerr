import { motion } from "framer-motion";
import { BrainCircuit, CheckCircle2, TimerReset } from "lucide-react";
import { Link } from "react-router-dom";
import StickySectionLabel from "@/components/StickySectionLabel";

const quizModes = [
  {
    title: "Rapid Recall",
    detail: "60-second rounds to improve instant sign recognition.",
    icon: TimerReset,
  },
  {
    title: "Scenario Quiz",
    detail: "Context-based prompts using real conversation patterns.",
    icon: BrainCircuit,
  },
  {
    title: "Checkpoint Test",
    detail: "Track accuracy and unlock next module recommendations.",
    icon: CheckCircle2,
  },
];

function QuizSection() {
  return (
    <section data-scene="Quiz Section" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <StickySectionLabel label="Quiz Section" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl border border-slate-200/80 bg-white/80 p-7 shadow-soft sm:p-10"
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">
            Quiz Arena
          </p>
          <h3 className="mt-3 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
            Challenge what you learned
          </h3>
          <p className="mt-4 max-w-2xl text-slate-600">
            Validate your progress with timed quizzes, scenario prompts, and
            adaptive checkpoints tuned to your current level.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {quizModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <article
                  key={mode.title}
                  className="rounded-2xl border border-slate-200 bg-white/85 p-5"
                >
                  <div className="inline-flex rounded-xl border border-slate-200/90 bg-white p-2 text-indigo-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-slate-900">{mode.title}</h4>
                  <p className="mt-2 text-sm text-slate-600">{mode.detail}</p>
                </article>
              );
            })}
          </div>

          <Link
            to="/quiz"
            className="mt-8 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Start Quiz
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default QuizSection;