import React, { useMemo, useRef } from 'react'
import {
  MotionValue,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: React.ReactNode
  children: React.ReactNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const prefersReducedMotion = useReducedMotion()

  const scaleRange = useMemo<[number, number]>(() => {
    if (typeof window === 'undefined') {
      return [1, 1]
    }
    return window.innerWidth <= 768 ? [0.92, 0.98] : [1.04, 1]
  }, [])

  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [20, 0],
  )
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [1, 1] : scaleRange,
  )
  const translate = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -100],
  )

  return (
    <div
      className="relative flex h-[50rem] items-center justify-center p-2 md:h-[72rem] md:p-20"
      ref={containerRef}
    >
      <div
        className="relative w-full py-10 md:py-36"
        style={{
          perspective: '1000px',
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  )
}

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>
  titleComponent: React.ReactNode
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="mx-auto max-w-5xl text-center"
    >
      {titleComponent}
    </motion.div>
  )
}

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>
  scale: MotionValue<number>
  children: React.ReactNode
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
      }}
      className="mx-auto -mt-12 h-[22rem] w-full max-w-5xl rounded-[30px] border-4 border-[#6c6c6c] bg-[#222222] p-2 shadow-2xl md:h-[40rem] md:p-6"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-zinc-950/90 p-2 md:p-4">
        {children}
      </div>
    </motion.div>
  )
}
