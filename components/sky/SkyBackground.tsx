'use client'

// The animated sky behind the Today page.
// Client-only by nature: it needs window size, the pointer, the visitor's
// local time (via SkyProvider) and requestAnimationFrame.
//
// Layer stack (all fixed, behind content):
//   1. base gradient  2. optional blurred APOD backdrop
//   3–4. two nebula glows  5. canvas (stars, constellation, moon, planet)

import { useEffect, useMemo, useRef } from 'react'
import { useSky } from './SkyProvider'
import { drawSky, makeStars, type DrawFrame } from './sky'

interface Props {
  // Design setting "Today's APOD": pass the image URL to use it as a
  // blurred backdrop. Omit (default) for the plain "Living sky".
  backdropUrl?: string | null
  // Canvas labels (constellation / moon phase / planet names)
  labels?: boolean
  // Set false to freeze drift, twinkle and parallax.
  // prefers-reduced-motion always freezes them.
  motion?: boolean
  // CSS font-family for canvas labels (canvas can't use CSS variables)
  labelFont?: string
}

type FrameInputs = Pick<DrawFrame, 'stars' | 'sky' | 'tod' | 'labels' | 'labelFont'> & {
  motion: boolean
}

export default function SkyBackground({
  backdropUrl = null,
  labels = true,
  motion = true,
  labelFont = 'monospace',
}: Props) {
  const { sky, tod } = useSky()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stars = useMemo(() => makeStars(sky.seed), [sky.seed])

  // The animation loop reads the latest values from this ref,
  // so it never has to restart when the date or palette changes
  const inputs = useRef<FrameInputs | null>(null)
  useEffect(() => {
    inputs.current = { stars, sky, tod, labels, labelFont, motion }
  }, [stars, sky, tod, labels, labelFont, motion])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let w = 0, h = 0, dpr = 1
    const resize = () => {
      dpr = window.devicePixelRatio || 1
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
    }

    const mouse = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5
      mouse.y = e.clientY / window.innerHeight - 0.5
    }

    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    let raf = 0
    const loop = (ms: number) => {
      const f = inputs.current
      if (f) {
        const still = reducedQuery.matches || !f.motion
        drawSky(ctx, {
          ...f,
          w, h, dpr,
          t: still ? 0 : ms / 1000,
          mx: still ? 0 : mouse.x,
          my: still ? 0 : mouse.y,
        })
      }
      raf = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <>
      {/* 1. Base gradient */}
      <div
        aria-hidden
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, var(--sky-top, #03040a), var(--sky-bot, #080a18))',
          transition: 'background 1.2s',
        }}
      />

      {/* 2. Optional blurred APOD backdrop + scrim */}
      {backdropUrl && (
        <>
          <div
            aria-hidden
            className="fixed -inset-10 z-0 bg-cover bg-center opacity-50"
            style={{
              backgroundImage: `url("${backdropUrl.replace(/"/g, '%22')}")`,
              filter: 'blur(28px) saturate(1.2)',
            }}
          />
          <div aria-hidden className="fixed inset-0 z-0 bg-[rgba(3,4,10,0.55)]" />
        </>
      )}

      {/* 3–4. Nebula glows, tinted by the palette hue */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-[-20vw] top-[-30vh] z-0 h-[90vh] w-[90vw]"
        style={{
          background:
            'radial-gradient(closest-side, oklch(0.42 0.14 var(--sky-h, 265) / 0.36), transparent)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed right-[-25vw] bottom-[-40vh] z-0 h-[95vh] w-[95vw]"
        style={{
          background:
            'radial-gradient(closest-side, oklch(0.42 0.13 var(--sky-h2, 290) / 0.3), transparent)',
        }}
      />

      {/* 5. Stars, constellation, moon, planet */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      />
    </>
  )
}
