import type { UserStats } from './types'

type ProgressSectionProps = {
  user: UserStats
}

export function ProgressSection({ user }: ProgressSectionProps) {
  const xpRatio = Math.min(user.xp / user.totalXp, 1)
  const ringLength = 226
  const ringProgress = xpRatio * ringLength

  return (
    <section>
      <h2 className="text-3xl font-semibold text-white md:text-4xl">Your momentum</h2>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-6 sm:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <p className="text-sm text-white/60">Streak</p>
            <p className="mt-3 text-2xl font-semibold text-white">{user.streak} day streak</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <p className="text-sm text-white/60">XP</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {user.xp} / {user.totalXp} XP
            </p>
            <div
              className="mt-4 h-2 rounded-full bg-white/10"
              role="progressbar"
              aria-label="XP progress"
              aria-valuemin={0}
              aria-valuemax={user.totalXp}
              aria-valuenow={user.xp}
            >
              <div className="h-full rounded-full bg-violet-400" style={{ width: `${xpRatio * 100}%` }} />
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <p className="text-sm text-white/60">Level</p>
            <p className="mt-3 text-2xl font-semibold text-white">Level {user.level}</p>
          </article>
        </div>

        <article className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <svg viewBox="0 0 80 80" className="h-24 w-24" role="img" aria-label="Level progress ring">
            <circle cx="40" cy="40" r="36" strokeWidth="4" fill="none" stroke="rgba(255,255,255,0.1)" />
            <circle
              cx="40"
              cy="40"
              r="36"
              strokeWidth="4"
              fill="none"
              stroke="#a78bfa"
              strokeDasharray={`${ringProgress} ${ringLength}`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
            <text x="40" y="45" textAnchor="middle" className="fill-white text-xl font-semibold">
              {user.level}
            </text>
          </svg>
        </article>
      </div>
    </section>
  )
}
