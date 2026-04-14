import { motion } from "framer-motion";
import { ArrowRight, Brain, Camera, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import StickySectionLabel from "@/components/StickySectionLabel";

const blocks = [
  {
    title: "Learn Modules",
    desc: "Alphabet drills, core words, sentence builders.",
    to: "/learn",
    icon: Brain,
    glow: "from-cyan-300/35 via-blue-200/20 to-transparent",
  },
  {
    title: "Camera Practice",
    desc: "Real-time feedback with guided repetition loops.",
    to: "/practice",
    icon: Camera,
    glow: "from-violet-300/35 via-indigo-200/20 to-transparent",
  },
  {
    title: "Progress Center",
    desc: "Streak, XP, momentum tracking and resume flow.",
    to: "/progress",
    icon: Trophy,
    glow: "from-emerald-300/35 via-teal-200/20 to-transparent",
  },
];

function RoutePreviewGrid() {
  return (
    <section data-scene="Experience Paths" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <StickySectionLabel label="Experience Paths" />
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
            Experience Paths
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
            Choose your next scene
          </h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {blocks.map((block, index) => {
            const Icon = block.icon;
            return (
              <motion.article
                key={block.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08, duration: 0.55 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className="glass group relative overflow-hidden rounded-3xl p-6 shadow-soft"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${block.glow} transition duration-300`}
                />
                <div className="relative">
                  <div className="mb-6 inline-flex rounded-2xl border border-slate-200 bg-white/80 p-3 text-slate-800">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-display text-2xl font-semibold text-slate-900">
                    {block.title}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {block.desc}
                  </p>
                  <Link
                    to={block.to}
                    className="mt-6 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
                  >
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default RoutePreviewGrid;
