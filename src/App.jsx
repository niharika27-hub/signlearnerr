import HeroSection from "./components/HeroSection";
import StorySection from "./components/StorySection";
import TransformationSection from "./components/TransformationSection";
import LearningCards from "./components/LearningCards";
import PracticeSection from "./components/PracticeSection";
import ProgressSection from "./components/ProgressSection";

function App() {
  return (
    <main className="relative overflow-hidden bg-[#05070d] text-white">
      <div className="noise-overlay" />
      <HeroSection />
      <StorySection />
      <TransformationSection />
      <LearningCards />
      <PracticeSection />
      <ProgressSection />
    </main>
  );
}

export default App;
