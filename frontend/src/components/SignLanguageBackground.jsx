import { motion, useScroll, useTransform } from "framer-motion";
import { Hand } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

const routeScenes = {
  "/": [
    "https://images.pexels.com/photos/9017429/pexels-photo-9017429.jpeg?auto=compress&cs=tinysrgb&w=2000",
    "https://images.pexels.com/photos/9017418/pexels-photo-9017418.jpeg?auto=compress&cs=tinysrgb&w=2000",
    "https://images.pexels.com/photos/9017051/pexels-photo-9017051.jpeg?auto=compress&cs=tinysrgb&w=2000",
  ],
  "/learn": [
    "https://images.pexels.com/photos/9017377/pexels-photo-9017377.jpeg?auto=compress&cs=tinysrgb&w=2000",
    "https://images.pexels.com/photos/9017567/pexels-photo-9017567.jpeg?auto=compress&cs=tinysrgb&w=2000",
    "https://images.pexels.com/photos/9017435/pexels-photo-9017435.jpeg?auto=compress&cs=tinysrgb&w=2000",
  ],
  "/practice": [
    "https://images.pexels.com/photos/9017433/pexels-photo-9017433.jpeg?auto=compress&cs=tinysrgb&w=2000",
    "https://images.pexels.com/photos/9017576/pexels-photo-9017576.jpeg?auto=compress&cs=tinysrgb&w=2000",
    "https://images.pexels.com/photos/9017569/pexels-photo-9017569.jpeg?auto=compress&cs=tinysrgb&w=2000",
  ],
  "/progress": [
    "https://images.pexels.com/photos/9017570/pexels-photo-9017570.jpeg?auto=compress&cs=tinysrgb&w=2000",
    "https://images.pexels.com/photos/9017435/pexels-photo-9017435.jpeg?auto=compress&cs=tinysrgb&w=2000",
    "https://images.pexels.com/photos/9017567/pexels-photo-9017567.jpeg?auto=compress&cs=tinysrgb&w=2000",
  ],
};

function SignLanguageBackground() {
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const images = useMemo(() => routeScenes[pathname] ?? routeScenes["/"], [pathname]);

  const sceneOneOpacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.34, 0.45],
    [0.68, 0.82, 0.82, 0]
  );
  const sceneTwoOpacity = useTransform(
    scrollYProgress,
    [0.28, 0.45, 0.62, 0.76],
    [0, 0.86, 0.86, 0]
  );
  const sceneThreeOpacity = useTransform(scrollYProgress, [0.58, 0.76, 1], [0, 0.9, 0.9]);

  const yOne = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const yTwo = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const yThree = useTransform(scrollYProgress, [0, 1], [-90, 20]);

  const stripX = useTransform(scrollYProgress, [0, 1], [-220, 180]);
  const stripY = useTransform(scrollYProgress, [0, 1], [70, -80]);
  const stripRotate = useTransform(scrollYProgress, [0, 1], [-8, 11]);

  const videoScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14]);
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const glyphBladeY = useTransform(scrollYProgress, [0, 1], [-50, 180]);
  const glyphBladeX = useTransform(scrollYProgress, [0, 1], [40, -20]);
  const glyphBladeRotate = useTransform(scrollYProgress, [0, 1], [-16, 12]);
  const glyphOrbY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const glyphOrbX = useTransform(scrollYProgress, [0, 1], [0, -35]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
    >
      <motion.video
        autoPlay
        muted
        loop
        playsInline
        style={{ scale: videoScale, y: videoY }}
        className="absolute inset-0 h-full w-full object-cover opacity-32"
      >
        <source src="/media/sign-language-bg-8s.mp4" type="video/mp4" />
      </motion.video>

      <motion.div style={{ opacity: sceneOneOpacity, y: yOne }} className="absolute inset-0">
        <div
          className="h-full w-full bg-cover bg-center opacity-18 blur-[1px]"
          style={{ backgroundImage: `url("${images[0]}")` }}
        />
      </motion.div>
      <motion.div style={{ opacity: sceneTwoOpacity, y: yTwo }} className="absolute inset-0">
        <div
          className="h-full w-full bg-cover bg-center opacity-15 blur-[1px]"
          style={{ backgroundImage: `url("${images[1]}")` }}
        />
      </motion.div>
      <motion.div style={{ opacity: sceneThreeOpacity, y: yThree }} className="absolute inset-0">
        <div
          className="h-full w-full bg-cover bg-center opacity-13 blur-[1.5px]"
          style={{ backgroundImage: `url("${images[2]}")` }}
        />
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.18),transparent_46%),linear-gradient(to_bottom,rgba(248,251,255,0.08),rgba(243,248,255,0.18),rgba(237,245,255,0.28))]" />

      <motion.div
        style={{ x: stripX, y: stripY, rotate: stripRotate }}
        className="absolute top-[64%] left-[6%] hidden gap-2 rounded-2xl border border-white/65 bg-white/70 p-2 shadow-soft backdrop-blur md:flex"
      >
        <span className="rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-xs font-semibold text-slate-700">
          ASL A
        </span>
        <span className="rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-xs font-semibold text-slate-700">
          HELLO
        </span>
        <span className="rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-xs font-semibold text-slate-700">
          THANK YOU
        </span>
        <span className="rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-xs font-semibold text-slate-700">
          BYE
        </span>
      </motion.div>

      <motion.div
        style={{ x: glyphBladeX, y: glyphBladeY, rotate: glyphBladeRotate }}
        className="absolute top-[10%] right-[9%] hidden lg:block"
      >
        <div className="relative h-[520px] w-[34px] rounded-full border border-cyan-100/70 bg-gradient-to-b from-cyan-200/80 via-indigo-200/70 to-emerald-200/75 shadow-[0_30px_70px_rgba(88,130,200,0.25)] backdrop-blur">
          <div className="absolute top-5 left-1/2 h-[72%] w-[4px] -translate-x-1/2 rounded-full bg-white/80" />
          <div className="absolute bottom-4 left-1/2 h-10 w-10 -translate-x-1/2 rounded-full border border-white/80 bg-white/85 shadow-md">
            <div className="flex h-full w-full items-center justify-center text-[11px] font-bold text-slate-700">
              ASL
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        style={{ x: glyphOrbX, y: glyphOrbY }}
        className="absolute top-[20%] right-[13%] hidden items-center gap-2 rounded-full border border-white/75 bg-white/82 px-3 py-2 text-[11px] font-semibold tracking-wide text-slate-700 shadow-soft backdrop-blur lg:inline-flex"
      >
        <Hand className="h-3.5 w-3.5 text-cyan-700" />
        A · B · C
      </motion.div>
    </div>
  );
}

export default SignLanguageBackground;
