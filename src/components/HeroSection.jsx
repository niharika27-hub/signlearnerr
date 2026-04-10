import { motion } from "framer-motion";
import { PlayCircle, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
      <motion.video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 16, repeat: Infinity, repeatType: "mirror" }}
      >
        <source
          src="https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_24fps.mp4"
          type="video/mp4"
        />
      </motion.video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/72 to-[#04070f]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(85,177,255,0.26),transparent_35%)]" />

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <motion.p
          variants={fadeUp}
          custom={0.1}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs tracking-[0.18em] text-blue-100/90 uppercase backdrop-blur"
        >
          <Sparkles className="h-4 w-4" />
          SignLearn AI
        </motion.p>

        <motion.h1
          variants={fadeUp}
          custom={0.2}
          className="font-display text-4xl leading-tight font-semibold text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          A world where silence
          <span className="mt-1 block bg-gradient-to-r from-cyan-200 via-violet-200 to-emerald-200 bg-clip-text text-transparent">
            speaks louder...
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          custom={0.35}
          className="mt-6 max-w-2xl text-base font-medium text-blue-100/85 sm:text-lg md:text-xl"
        >
          Millions struggle to express themselves every day.
        </motion.p>

        <motion.div
          variants={fadeUp}
          custom={0.5}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <button className="group relative inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 px-6 py-3 font-semibold text-slate-900 shadow-[0_10px_40px_rgba(95,193,255,0.45)] transition duration-300 hover:scale-[1.03] hover:brightness-105">
            <span className="relative z-10">Start Learning</span>
            <span className="absolute inset-0 rounded-2xl bg-white/40 opacity-0 transition group-hover:opacity-30" />
          </button>
          <button className="group inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl border border-white/35 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition duration-300 hover:scale-[1.03] hover:bg-white/20">
            <PlayCircle className="h-5 w-5 transition group-hover:scale-110" />
            Watch Demo
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
