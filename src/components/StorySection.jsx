import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function StorySection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const opacityOne = useTransform(
    scrollYProgress,
    [0, 0.08, 0.24, 0.34],
    [0, 1, 1, 0]
  );
  const opacityTwo = useTransform(
    scrollYProgress,
    [0.31, 0.41, 0.58, 0.68],
    [0, 1, 1, 0]
  );
  const opacityThree = useTransform(
    scrollYProgress,
    [0.62, 0.72, 0.91, 1],
    [0, 1, 1, 0]
  );
  const yOne = useTransform(scrollYProgress, [0, 0.34], [36, -36]);
  const yTwo = useTransform(scrollYProgress, [0.31, 0.68], [36, -36]);
  const yThree = useTransform(scrollYProgress, [0.62, 1], [36, -36]);

  return (
    <section ref={sectionRef} className="relative h-[190vh] bg-[#05070d]">
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_20%_30%,rgba(64,179,255,0.2),transparent_35%),radial-gradient(circle_at_80%_50%,rgba(115,92,255,0.2),transparent_38%),linear-gradient(to_bottom,#05070d,#0a1020,#060810)]"
      />
      <div className="sticky top-0 flex h-screen items-center justify-center px-6">
        <div className="mx-auto w-full max-w-4xl">
          <motion.h2
            style={{ opacity: opacityOne, y: yOne }}
            className="absolute left-1/2 max-w-3xl -translate-x-1/2 text-center font-display text-3xl leading-tight font-semibold text-white sm:text-4xl md:text-5xl lg:text-6xl"
          >
            They try to speak...
          </motion.h2>
          <motion.h2
            style={{ opacity: opacityTwo, y: yTwo }}
            className="absolute left-1/2 max-w-3xl -translate-x-1/2 text-center font-display text-3xl leading-tight font-semibold text-white sm:text-4xl md:text-5xl lg:text-6xl"
          >
            But no one understands...
          </motion.h2>
          <motion.h2
            style={{ opacity: opacityThree, y: yThree }}
            className="absolute left-1/2 max-w-3xl -translate-x-1/2 text-center font-display text-3xl leading-tight font-semibold text-white sm:text-4xl md:text-5xl lg:text-6xl"
          >
            They feel invisible...
          </motion.h2>
        </div>
      </div>
    </section>
  );
}

export default StorySection;
