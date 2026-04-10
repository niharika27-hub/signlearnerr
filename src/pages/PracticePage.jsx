import { motion } from "framer-motion";
import PracticeSection from "@/components/PracticeSection";
import StickySectionLabel from "@/components/StickySectionLabel";
import { Particles } from "@/components/ui/particles";

function PracticePage() {
  return (
    <div className="relative pt-20">
      <Particles
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        quantity={55}
        color="#84a6cf"
      />
      <motion.section
        data-scene="Practice Intro"
        className="px-6 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-6xl">
          <StickySectionLabel label="Practice Intro" />
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">
            Camera Lab
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
            Train in real time
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Practice your gestures with instant visual feedback and confidence
            tracking.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Hand Tracking: Active
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Accuracy Goal: 85%
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Daily Sessions: 2
            </div>
          </div>
        </div>
      </motion.section>
      <PracticeSection />
    </div>
  );
}

export default PracticePage;
