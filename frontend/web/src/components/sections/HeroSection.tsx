export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div aria-hidden="true" className="hero-orb hero-orb-violet bg-violet-600/30" />
      <div aria-hidden="true" className="hero-orb hero-orb-indigo bg-indigo-800/40" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-900/70" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <p
          className="animate-fade-up inline-flex rounded-full bg-white/10 px-4 py-1 text-xs text-white"
          style={{ animationDelay: '0ms' }}
        >
          10M+ people face this daily
        </p>

        <h1
          className="animate-fade-up mt-8 text-5xl font-bold tracking-tight text-white md:text-7xl"
          style={{ animationDelay: '100ms' }}
        >
          <span className="block">A world where silence</span>
          <span className="block">speaks louder</span>
        </h1>

        <p
          className="animate-fade-up mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70"
          style={{ animationDelay: '200ms' }}
        >
          Millions struggle to express themselves. Sign language changes that.
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: '300ms' }}
        >
          <button
            type="button"
            className="hover-lift rounded-full bg-violet-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-colors hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            Start Learning
          </button>
          <button
            type="button"
            className="hover-lift rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            Watch Demo
          </button>
        </div>
      </div>

      <div className="animate-fade-up absolute bottom-10 z-10 flex flex-col items-center text-white/60" style={{ animationDelay: '300ms' }}>
        <span className="text-xs tracking-[0.2em]">SCROLL</span>
        <svg
          className="scroll-chevron mt-2 h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </section>
  )
}
