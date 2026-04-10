import { motion } from "framer-motion";
import { Hand } from "lucide-react";

function TransformationSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#061022] via-[#0f1f35] to-[#f3f8ff]" />
      <div className="absolute inset-0 -z-10 bg-aurora-gradient opacity-90" />

      <motion.div
        className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2"
        initial={{ opacity: 0, scale: 0.94, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-cyan-900/75 uppercase">
            The Turning Point
          </p>
          <h3 className="font-display text-4xl leading-tight font-semibold text-slate-900 sm:text-5xl">
            Sign language
            <span className="mt-1 block bg-gradient-to-r from-cyan-700 via-blue-700 to-emerald-700 bg-clip-text text-transparent">
              changes everything
            </span>
          </h3>
          <p className="mt-6 max-w-xl text-lg font-medium text-slate-700/85">
            From frustration to confidence. One gesture at a time.
          </p>
        </div>

        <motion.div
          className="glass relative overflow-hidden rounded-3xl p-4 shadow-soft"
          initial={{ opacity: 0, rotate: -3 }}
          whileInView={{ opacity: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/30 via-violet-200/20 to-emerald-300/30" />
          <div className="relative flex aspect-video items-center justify-center rounded-2xl bg-black/30">
            <motion.video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover opacity-75"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <source
                src="https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4"
                type="video/mp4"
              />
            </motion.video>
            <div className="relative z-10 rounded-full border border-white/40 bg-white/25 p-5 text-white shadow-glow backdrop-blur">
              <Hand className="h-10 w-10" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default TransformationSection;
