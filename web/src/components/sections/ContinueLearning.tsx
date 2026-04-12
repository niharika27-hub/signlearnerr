import type { ModuleItem } from './types'

type ContinueLearningProps = {
  modules: ModuleItem[]
}

export function ContinueLearning({ modules }: ContinueLearningProps) {
  const inProgressModules = modules.filter((module) => module.progress > 0)

  return (
    <section>
      <h2 className="text-3xl font-semibold text-white md:text-4xl">Pick up where you left off</h2>

      {inProgressModules.length === 0 ? (
        <p className="mt-6 text-base text-white/70">No modules started yet — begin above</p>
      ) : (
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {inProgressModules.map((module) => (
            <article
              key={module.id}
              className="hover-glow hover-lift w-72 shrink-0 snap-start rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">
                  {module.icon}
                </span>
                <h3 className="text-lg font-semibold text-white">{module.title}</h3>
              </div>

              <div
                className="mt-5 h-2 rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={module.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${module.title} progress`}
              >
                <div className="h-full rounded-full bg-violet-400" style={{ width: `${module.progress}%` }} />
              </div>

              <p className="mt-3 text-sm text-white/60">~{module.timeMin} min remaining</p>

              <button
                type="button"
                className="mt-5 rounded-full border border-violet-400 px-4 py-2 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                Resume
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
