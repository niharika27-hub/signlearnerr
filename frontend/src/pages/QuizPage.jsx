import { motion } from "framer-motion";
import { BookCheck, CircleCheckBig, Clock3, Crosshair, Target } from "lucide-react";
import StickySectionLabel from "@/components/StickySectionLabel";
import { Particles } from "@/components/ui/particles";

const cards = [
  {
    title: "Speed Quiz",
    detail: "15 questions, 60 seconds each round",
    icon: Clock3,
  },
  {
    title: "Accuracy Quiz",
    detail: "Focus on form precision and hand-shape matching",
    icon: Target,
  },
  {
    title: "Scenario Quiz",
    detail: "Conversation-driven prompts for real-world signing",
    icon: BookCheck,
  },
];

function QuizPage() {
  return (
    <div className="relative pt-20">
      <Particles
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        quantity={60}
        color="#b387e5"
      />

      <motion.section
        data-scene="Quiz Intro"
        className="px-6 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-6xl">
          <StickySectionLabel label="Quiz Intro" />
          <p className="text-xs font-semibold tracking-[0.18em] text-fuchsia-900/80 uppercase">
            Quiz Arena
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
            Test what you retain
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Measure your understanding with adaptive quizzes designed to improve
            recognition speed and signing confidence.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Quiz Bank: 200+ items
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Target Accuracy: 90%
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Recommended Rounds: 3/day
            </div>
          </div>
        </div>
      </motion.section>

      <section data-scene="Quiz Modes" className="px-6 pb-20">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ delay: index * 0.07, duration: 0.45 }}
                className="glass rounded-3xl border border-slate-200/80 p-6 shadow-soft"
              >
                <div className="inline-flex rounded-xl border border-slate-200 bg-white/85 p-2 text-fuchsia-800">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold text-slate-900">{card.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{card.detail}</p>
                <button
                  type="button"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
                >
                  <CircleCheckBig className="h-4 w-4" />
                  Start Mode
                </button>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white/75 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Quiz Tip</p>
              <p className="mt-2 text-sm text-slate-700">
                Use a short daily quiz to improve long-term retention faster than
                single long sessions.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-900">
              <Crosshair className="h-4 w-4" />
              Streak Bonus Active
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default QuizPage;
