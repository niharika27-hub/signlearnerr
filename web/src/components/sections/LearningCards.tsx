import { useEffect, useState } from 'react'

import type { ModuleItem } from './types'

type LearningCardsProps = {
  modules: ModuleItem[]
}

export function LearningCards({ modules }: LearningCardsProps) {
  const [animateProgress, setAnimateProgress] = useState(false)

  useEffect(() => {
    setAnimateProgress(true)
  }, [])

  return (
    <section>
      <h2 className="text-3xl font-semibold text-white md:text-4xl">Start with the basics</h2>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {modules.map((module) => (
          <article
            key={module.id}
            className="hover-glow hover-lift rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center text-[2.5rem]">
              <span aria-hidden="true">{module.icon}</span>
            </div>

            <h3 className="mt-5 text-center text-lg font-semibold text-white">{module.title}</h3>
            <p className="mt-2 text-center text-sm text-white/60">{module.desc}</p>

            <div className="mt-6">
              <div
                className="h-2 rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={module.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${module.title} progress`}
              >
                <div
                  className="progress-fill h-full rounded-full bg-violet-400"
                  style={{ width: animateProgress ? `${module.progress}%` : '0%' }}
                />
              </div>
            </div>

            <button
              type="button"
              className="mt-5 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              Begin
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
