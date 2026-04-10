import { motion } from "framer-motion";
import { Camera, Play } from "lucide-react";

function PracticeSection() {
  return (
    <section className="relative px-6 py-20">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          className="gradient-border glass relative overflow-hidden rounded-[28px] p-6 shadow-soft sm:p-8 lg:p-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(58,197,255,0.25),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(111,91,255,0.28),transparent_42%)]" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-cyan-100/85 uppercase">
                Real-Time Practice
              </p>
              <h3 className="mt-2 font-display text-3xl leading-tight font-semibold text-white sm:text-4xl">
                Practice with your camera
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed font-medium text-blue-50/80 sm:text-base">
                Receive instant feedback as you sign. Build confidence through
                daily camera-based practice sessions.
              </p>
              <button className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-300 px-6 py-3 font-semibold text-slate-900 transition duration-300 hover:scale-[1.03] hover:shadow-[0_12px_32px_rgba(72,221,224,0.5)]">
                <Play className="h-4 w-4" />
                Start Practice
              </button>
            </div>

            <div className="relative rounded-3xl border border-white/35 bg-[#09111f]/80 p-4 backdrop-blur">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-[#111d35]">
                <motion.div
                  className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:24px_24px]"
                  animate={{ opacity: [0.25, 0.45, 0.25] }}
                  transition={{ duration: 3.8, repeat: Infinity }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.45)_100%)]" />
                <div className="relative flex h-full items-center justify-center">
                  <div className="rounded-full border border-cyan-200/40 bg-cyan-200/20 p-4 backdrop-blur">
                    <Camera className="h-8 w-8 text-cyan-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PracticeSection;
