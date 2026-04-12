import { useEffect, useRef, useState } from 'react'

const STORY_SCENES = [
  { text: 'They try to speak...', tone: 'text-white' },
  { text: 'But no one understands...', tone: 'text-white/80' },
  { text: 'Until they find another way.', tone: 'text-violet-300' },
]

export function StorySection() {
  const [activeScene, setActiveScene] = useState(0)
  const sceneRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          const index = Number(entry.target.getAttribute('data-scene-index'))
          setActiveScene(index)
        })
      },
      {
        threshold: 0.6,
      },
    )

    sceneRefs.current.forEach((scene) => {
      if (scene) {
        observer.observe(scene)
      }
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none sticky top-0 h-screen" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/90 via-violet-950/80 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(167,139,250,0.25),transparent_60%)]" />
      </div>

      <div className="relative -mt-[100vh]">
        {STORY_SCENES.map((scene, index) => (
          <div
            key={scene.text}
            data-scene-index={index}
            ref={(node) => {
              sceneRefs.current[index] = node
            }}
            className="relative flex min-h-screen items-center justify-center px-6"
          >
            <p
              className={`story-copy max-w-lg text-center text-4xl font-bold ${scene.tone} ${
                activeScene === index ? 'is-visible opacity-100' : 'opacity-0'
              }`}
              aria-live={activeScene === index ? 'polite' : undefined}
            >
              {scene.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
