'use client'

// Sky facts strip + time-of-day preview chips, below the hero.

import { weekdayName } from '@/lib/dates'
import { useSky } from '@/components/sky/SkyProvider'
import type { Tod } from '@/components/sky/sky'

const CHIPS: [Tod | null, string][] = [
  [null, 'Now'],
  ['dawn', 'Dawn'],
  ['day', 'Day'],
  ['dusk', 'Dusk'],
  ['night', 'Night'],
]

export default function SkyFacts({ showPreview = true }: { showPreview?: boolean }) {
  const { date, sky, palette, previewTod, setPreviewTod } = useSky()

  const facts = [
    { k: 'Moon tonight', v: sky.moonName, note: `${Math.round(sky.lit * 100)}% illuminated` },
    { k: 'Sun is in', v: sky.zod[0], note: 'Constellation drawn overhead' },
    { k: weekdayName(date), v: sky.planet.n, note: 'The day’s namesake body' },
    { k: 'Sky palette', v: palette.label, note: previewTod ? 'Previewing' : 'From your local time' },
  ]

  return (
    <>
      <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-px overflow-hidden rounded-[18px] border border-white/10 bg-white/10 backdrop-blur-[14px]">
        {facts.map((f) => (
          <div key={f.k} className="bg-[rgba(6,8,18,0.72)] px-5 py-[18px]">
            <div className="font-label text-[10px] uppercase tracking-[0.16em] text-[#9499b3]">{f.k}</div>
            <div className="mt-1.5 font-display text-[26px] leading-[1.15]">{f.v}</div>
            <div className="mt-1 text-[13px] text-[#b4b9cf]">{f.note}</div>
          </div>
        ))}
      </section>

      {/* Demo control from the design — pass showPreview={false} to drop it */}
      {showPreview && (
        <div className="mt-[18px] flex flex-wrap items-center gap-2">
          <span className="mr-1.5 font-label text-[11px] uppercase tracking-[0.14em] text-[#9499b3]">
            Preview sky at
          </span>
          {CHIPS.map(([value, label]) => {
            const active = previewTod === value
            return (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={() => setPreviewTod(value)}
                className={`h-11 cursor-pointer rounded-full border px-4 text-[13px] font-medium ${
                  active
                    ? 'border-transparent bg-[#e9ebf5] text-[#03040a]'
                    : 'border-white/[0.16] bg-[rgba(8,10,20,0.4)] text-[#e9ebf5]'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
