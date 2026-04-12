import { useEffect, useRef, useState } from 'react'

export function PracticeSection() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const videoElement = videoRef.current

    if (videoElement) {
      videoElement.srcObject = stream
    }
  }, [stream])

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [stream])

  const startPractice = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera unavailable — check browser permissions')
      return
    }

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream?.getTracks().forEach((track) => track.stop())
      setStream(nextStream)
      setCameraError(null)
    } catch {
      setCameraError('Camera unavailable — check browser permissions')
    }
  }

  return (
    <section>
      <div className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 p-[1px]">
        <div className="grid items-center gap-8 rounded-2xl bg-slate-900/80 p-8 md:grid-cols-2">
          <div>
            <p className="inline-flex rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/80">
              LIVE PRACTICE
            </p>
            <h2 className="mt-5 text-3xl font-semibold text-white md:text-4xl">
              Practice with your camera
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              Our AI watches your hands and gives real-time feedback.
            </p>
            <button
              type="button"
              onClick={startPractice}
              className="hover-lift mt-7 rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              Start Practice
            </button>
          </div>

          <div>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/40">
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  aria-label="Camera preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-white/60">
                  <span className="text-4xl" aria-hidden="true">
                    📷
                  </span>
                  <p className="text-sm">Camera preview</p>
                </div>
              )}
            </div>

            {cameraError ? (
              <p className="mt-3 text-sm text-amber-300" role="status" aria-live="polite">
                {cameraError}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
