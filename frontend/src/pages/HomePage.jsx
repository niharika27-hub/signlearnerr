import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import QuizSection from "@/components/QuizSection";
import RoutePreviewGrid from "@/components/RoutePreviewGrid";
import StorySection from "@/components/StorySection";
import TransformationSection from "@/components/TransformationSection";
import { InfiniteTextMarquee } from "@/components/ui/infinite-text-marquee";

function HomePage() {
  return (
    <>
      <HeroSection />
      <StorySection />
      <RoutePreviewGrid />
      <QuizSection />

      <motion.section
        data-scene="Signature Motion"
        className="border-y border-slate-200/75 bg-white/55 py-2 backdrop-blur"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <InfiniteTextMarquee
          text="Learn. Practice. Express. Connect."
          link="/learn"
          tooltipText="Go to learning modules"
          speed={20}
          fontSize="clamp(2rem, 7vw, 6rem)"
          textColor="rgba(30, 41, 59, 0.9)"
          hoverColor="rgb(79, 70, 229)"
        />
      </motion.section>

      <TransformationSection />
    </>
  );
}

export default HomePage;
