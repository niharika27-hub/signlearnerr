import { ContainerScroll } from '@/components/ui/container-scroll-animation'

export function FeatureScrollDemo() {
  return (
    <section className="overflow-hidden pb-28 pt-10 md:pb-40">
      <ContainerScroll
        titleComponent={
          <>
            <h2 className="text-3xl font-semibold text-zinc-100 md:text-5xl">
              Camera practice that feels natural
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-zinc-300">
              Reuse the same scroll interaction pattern in additional landing sections for
              visual consistency and stronger storytelling.
            </p>
          </>
        }
      >
        <div className="flex h-full items-center justify-center rounded-2xl border border-zinc-700 bg-gradient-to-br from-indigo-950/70 via-zinc-900 to-zinc-950 p-8 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Feature highlight</p>
            <h3 className="mt-3 text-2xl font-semibold text-zinc-100 md:text-4xl">
              Responsive by design
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-zinc-300">
              Mobile, tablet, and desktop layouts all preserve readability while keeping
              scroll animations smooth and purposeful.
            </p>
          </div>
        </div>
      </ContainerScroll>
    </section>
  )
}
