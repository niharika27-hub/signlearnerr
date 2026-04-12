import { motion, useScroll, useTransform } from "framer-motion";
import {
  CircleAlert,
  EarOff,
  Handshake,
  MessageSquareWarning,
} from "lucide-react";
import { useRef } from "react";
import StickySectionLabel from "@/components/StickySectionLabel";

function StorySection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.03, 1.16]);

  const opacityOne = useTransform(scrollYProgress, [0, 0.22, 0.42], [1, 1, 0], {
    clamp: true,
  });
  const opacityTwo = useTransform(scrollYProgress, [0.28, 0.5, 0.72], [0, 1, 0], {
    clamp: true,
  });
  const opacityThree = useTransform(scrollYProgress, [0.56, 0.82, 1], [0, 1, 1], {
    clamp: true,
  });

  const yOne = useTransform(scrollYProgress, [0, 0.42], [18, -18]);
  const yTwo = useTransform(scrollYProgress, [0.28, 0.72], [18, -18]);
  const yThree = useTransform(scrollYProgress, [0.56, 1], [18, -18]);

  const progressScale = useTransform(scrollYProgress, [0, 1], [0.1, 1], {
    clamp: true,
  });
  const focusOne = useTransform(scrollYProgress, [0, 0.2, 0.4], [1, 1.04, 0.92], {
    clamp: true,
  });
  const focusTwo = useTransform(scrollYProgress, [0.25, 0.5, 0.72], [0.92, 1.04, 0.92], {
    clamp: true,
  });
  const focusThree = useTransform(scrollYProgress, [0.56, 0.82, 1], [0.92, 1.04, 1], {
    clamp: true,
  });

  return (
    <section ref={sectionRef} data-scene="Struggle Story" className="relative h-[190vh]">
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_20%_30%,rgba(64,179,255,0.24),transparent_35%),radial-gradient(circle_at_80%_50%,rgba(115,92,255,0.2),transparent_38%),linear-gradient(to_bottom,#f7fbff,#ecf5ff,#e9f2ff)]"
      />

      <div className="relative z-10 px-6">
        <StickySectionLabel label="Emotional Storyline" />
      </div>

      <div className="absolute top-[26%] left-[22%] hidden h-40 w-40 rounded-full bg-cyan-200/40 blur-3xl md:block" />
      <div className="absolute right-[20%] bottom-[24%] hidden h-44 w-44 rounded-full bg-violet-200/40 blur-3xl md:block" />

      <div className="sticky top-0 flex h-screen items-center justify-center px-6">
        <div className="relative mx-auto w-full max-w-6xl">
          <div className="glass relative overflow-hidden rounded-[38px] border border-slate-200/90 px-6 py-8 shadow-[0_30px_90px_rgba(72,104,168,0.18)] sm:px-10 sm:py-10">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/35 via-white/40 to-violet-100/35" />
            <div className="absolute inset-4 rounded-[30px] border border-white/70" />

            <div className="relative z-10">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                    Communication Reality
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
                    The struggle before connection
                  </h3>
                </div>
                <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-slate-600 uppercase">
                  Scene Flow
                </div>
              </div>

              <div className="relative mb-8 min-h-[180px] rounded-2xl border border-white/70 bg-white/55 px-4 py-6 sm:min-h-[220px]">
                <motion.h2
                  style={{ opacity: opacityOne, y: yOne }}
                  className="absolute top-1/2 left-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-4 text-center font-display text-3xl leading-tight font-semibold text-slate-800 sm:text-4xl md:text-5xl"
                >
                  They try to speak...
                </motion.h2>
                <motion.h2
                  style={{ opacity: opacityTwo, y: yTwo }}
                  className="absolute top-1/2 left-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-4 text-center font-display text-3xl leading-tight font-semibold text-slate-800 sm:text-4xl md:text-5xl"
                >
                  But no one understands...
                </motion.h2>
                <motion.h2
                  style={{ opacity: opacityThree, y: yThree }}
                  className="absolute top-1/2 left-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-4 text-center font-display text-3xl leading-tight font-semibold text-slate-800 sm:text-4xl md:text-5xl"
                >
                  They feel invisible...
                </motion.h2>
                <p className="absolute right-0 bottom-4 left-0 text-center text-sm font-medium text-slate-500">
                  Communication breaks down before understanding begins.
                </p>
              </div>

              <div className="mb-6 grid gap-3 md:grid-cols-3">
                <motion.div
                  style={{ scale: focusOne }}
                  className="rounded-2xl border border-white/80 bg-white/72 px-4 py-3 shadow-sm"
                >
                  <MessageSquareWarning className="mb-2 h-5 w-5 text-amber-500" />
                  <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">Scene 01</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">Trying to communicate</p>
                </motion.div>
                <motion.div
                  style={{ scale: focusTwo }}
                  className="rounded-2xl border border-white/80 bg-white/72 px-4 py-3 shadow-sm"
                >
                  <EarOff className="mb-2 h-5 w-5 text-indigo-500" />
                  <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">Scene 02</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">Signals misunderstood</p>
                </motion.div>
                <motion.div
                  style={{ scale: focusThree }}
                  className="rounded-2xl border border-white/80 bg-white/72 px-4 py-3 shadow-sm"
                >
                  <Handshake className="mb-2 h-5 w-5 text-emerald-500" />
                  <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">Scene 03</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">Sign language connects</p>
                </motion.div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/72 px-4 py-3">
                <div className="mb-2 flex items-center justify-between text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  <span className="inline-flex items-center gap-1">
                    <CircleAlert className="h-3.5 w-3.5" />
                    Story Progress
                  </span>
                  <span>Scroll</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                  <motion.div
                    style={{ scaleX: progressScale, transformOrigin: "left center" }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StorySection;
