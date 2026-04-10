import { motion } from "framer-motion";
import { PlayCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Particles } from "@/components/ui/particles";

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
    <section
      data-scene="Opening Hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24"
    >
      <motion.video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 16, repeat: Infinity, repeatType: "mirror" }}
      >
        <source src="/media/sign-language-bg-8s.mp4" type="video/mp4" />
      </motion.video>

      <div className="absolute inset-0 bg-gradient-to-b from-white/18 via-white/30 to-[#f2f8ff]/62" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(85,177,255,0.34),transparent_35%)]" />
      <Particles className="absolute inset-0 z-0" quantity={70} color="#7c97bc" />
      <motion.div
        className="pointer-events-none absolute top-30 left-6 z-10 hidden rounded-2xl border border-white/65 bg-white/78 px-4 py-3 text-slate-700 shadow-soft backdrop-blur md:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.2, repeat: Infinity }}
      >
        <p className="text-[11px] tracking-[0.14em] uppercase text-slate-500">
          Today Focus
        </p>
        <p className="mt-1 text-sm font-semibold">Finger Spelling - 18 min</p>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute right-6 bottom-16 z-10 hidden rounded-2xl border border-white/65 bg-white/78 px-4 py-3 text-slate-700 shadow-soft backdrop-blur md:block"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 4.8, repeat: Infinity }}
      >
        <p className="text-[11px] tracking-[0.14em] uppercase text-slate-500">
          Weekly Streak
        </p>
        <p className="mt-1 text-sm font-semibold">12 Days Consistent</p>
      </motion.div>

      <motion.div
        className="glass relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center rounded-4xl border border-white/70 px-6 py-10 text-center shadow-soft md:px-10 md:py-14"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <motion.p
          variants={fadeUp}
          custom={0.1}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs tracking-[0.18em] text-indigo-800 uppercase backdrop-blur"
        >
          <Sparkles className="h-4 w-4" />
          SignLearn AI
        </motion.p>

        <motion.h1
          variants={fadeUp}
          custom={0.2}
          className="font-display text-4xl leading-tight font-semibold text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl"
        >
          A world where silence
          <span className="mt-1 block bg-gradient-to-r from-cyan-200 via-violet-200 to-emerald-200 bg-clip-text text-transparent">
            speaks louder...
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          custom={0.35}
          className="mt-6 max-w-2xl text-base font-medium text-slate-600 sm:text-lg md:text-xl"
        >
          Millions struggle to express themselves every day.
        </motion.p>

        <motion.div
          variants={fadeUp}
          custom={0.5}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            to="/learn"
            className="group relative inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 px-6 py-3 font-semibold text-slate-900 shadow-[0_10px_40px_rgba(95,193,255,0.45)] transition duration-300 hover:scale-[1.03] hover:brightness-105"
          >
            <span className="relative z-10">Start Learning</span>
            <span className="absolute inset-0 rounded-2xl bg-white/40 opacity-0 transition group-hover:opacity-30" />
          </Link>
          <Link
            to="/practice"
            className="group inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/85 px-6 py-3 font-semibold text-slate-800 backdrop-blur transition duration-300 hover:scale-[1.03] hover:bg-white"
          >
            <PlayCircle className="h-5 w-5 transition group-hover:scale-110" />
            Watch Demo
          </Link>
        </motion.div>
      </motion.div>
      <div className="absolute bottom-8 left-1/2 z-20 h-12 w-7 -translate-x-1/2 rounded-full border border-slate-300/90 bg-white/70 backdrop-blur">
        <motion.span
          className="mx-auto mt-2 block h-2 w-2 rounded-full bg-slate-500"
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </div>
    </section>
  );
}

export default HeroSection;
