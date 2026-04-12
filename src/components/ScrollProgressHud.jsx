import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Gauge, Layers } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const routeNames = {
  "/": "Home",
  "/learn": "Learn",
  "/practice": "Practice",
  "/progress": "Progress",
};

function ScrollProgressHud() {
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);
  const [activeScene, setActiveScene] = useState("Opening");

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setProgress(Math.round(value * 100));
  });

  useEffect(() => {
    const sceneElements = Array.from(document.querySelectorAll("[data-scene]"));
    if (!sceneElements.length) {
      setActiveScene("Opening");
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]) {
          const label = visibleEntries[0].target.getAttribute("data-scene");
          if (label) setActiveScene(label);
        }
      },
      {
        threshold: [0.35, 0.5, 0.75],
        rootMargin: "-12% 0px -18% 0px",
      }
    );

    sceneElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  const routeLabel = useMemo(() => routeNames[pathname] || "Scene", [pathname]);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
      className="pointer-events-none fixed right-4 bottom-5 z-40 hidden w-[190px] rounded-2xl border border-white/70 bg-white/78 p-4 shadow-soft backdrop-blur-xl lg:block"
    >
      <div className="mb-3 flex items-center justify-between text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
        <span className="inline-flex items-center gap-1">
          <Gauge className="h-3 w-3" />
          Scroll
        </span>
        <span>{progress}%</span>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-200/80">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
          Route
        </p>
        <p className="mt-1 font-display text-base font-semibold text-slate-900">
          {routeLabel}
        </p>
        <p className="mt-3 text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
          Active Scene
        </p>
        <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
          <Layers className="h-3.5 w-3.5" />
          {activeScene}
        </p>
      </div>
    </motion.aside>
  );
}

export default ScrollProgressHud;
