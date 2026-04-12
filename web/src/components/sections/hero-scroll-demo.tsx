import { ContainerScroll } from '@/components/ui/container-scroll-animation'

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-24 pt-40 md:pb-36 md:pt-[28rem]">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-zinc-100 md:text-6xl">
              Learn sign language with motion-driven lessons
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-300 md:text-xl">
              Practice visually, track progress, and build confidence with a React-first
              experience.
            </p>
          </>
        }
      >
        <img
          src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80"
          alt="Learner practicing sign language"
          className="mx-auto h-full w-full rounded-2xl object-cover object-center"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  )
}
