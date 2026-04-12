import { ContinueLearning } from '@/components/sections/ContinueLearning'
import { HeroSection } from '@/components/sections/HeroSection'
import { LearningCards } from '@/components/sections/LearningCards'
import { PracticeSection } from '@/components/sections/PracticeSection'
import { ProgressSection } from '@/components/sections/ProgressSection'
import { StorySection } from '@/components/sections/StorySection'
import { TransformSection } from '@/components/sections/TransformSection'

const MOCK_USER = { name: 'Alex', streak: 7, xp: 840, level: 4, totalXp: 1000 }

const MODULES = [
  {
    id: 1,
    title: 'A–Z Alphabets',
    desc: '26 hand signs',
    progress: 68,
    timeMin: 12,
    icon: '✋',
    category: 'new' as const,
  },
  {
    id: 2,
    title: 'Basic Words',
    desc: '50 daily words',
    progress: 34,
    timeMin: 20,
    icon: '💬',
    category: 'inProgress' as const,
  },
  {
    id: 3,
    title: 'Daily Sentences',
    desc: 'Common phrases',
    progress: 10,
    timeMin: 30,
    icon: '📖',
    category: 'new' as const,
  },
]

function App() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-indigo-950 via-violet-900 to-slate-900 text-white">
      <HeroSection />
      <StorySection />
      <TransformSection />

      <section className="mx-auto max-w-6xl px-6 py-24">
        <LearningCards modules={MODULES} />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <PracticeSection />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <ProgressSection user={MOCK_USER} />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <ContinueLearning modules={MODULES} />
      </section>
    </main>
  )
}

export default App
