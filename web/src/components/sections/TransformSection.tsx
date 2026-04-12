import { useEffect, useRef, useState } from 'react'

export function TransformSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const target = sectionRef.current

    if (!target) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.35 },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-gradient-to-b from-slate-900 to-violet-950">
      <div ref={sectionRef} className="mx-auto max-w-6xl px-6 py-24">
        <div className={`in-view-reveal mx-auto max-w-2xl text-center ${isVisible ? 'is-visible' : ''}`}>
          <div className="transform-hand text-7xl" aria-hidden="true">
            🤟
          </div>
          <h2 className="mt-6 text-3xl font-semibold text-white md:text-4xl">
            Sign language changes everything
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            A complete visual language. Expressive, beautiful, and learnable.
          </p>
        </div>
      </div>
    </section>
  )
}
