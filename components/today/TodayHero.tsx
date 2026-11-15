'use client'

// Today hero: date stepper, title, explanation, actions, image card.
// The APOD comes from the server (app/(home)/page.tsx); this component only
// adds interactivity — stepping dates, "Read more", "Save to board".

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { APOD } from '@/types/nasa'
import { formatLongDate, shiftDate } from '@/lib/dates'
import { useBookmarkStore } from '@/store/useBookmarkStore'
import { useSky } from '@/components/sky/SkyProvider'
import { apodPicture, canOptimize } from '@/lib/images'
import { useHydrated } from '@/lib/useHydrated'

const circleBtn =
  'grid size-11 place-items-center rounded-full border border-white/[0.16] bg-[rgba(8,10,20,0.4)] text-base text-[#e9ebf5] transition-colors enabled:cursor-pointer enabled:hover:bg-white/[0.12] disabled:opacity-35'

const pillBtn = 'inline-flex h-[46px] items-center rounded-full px-[22px] text-sm font-semibold'

export default function TodayHero({ apod }: { apod: APOD | null }) {
  const { date, today, goToDate, isPending } = useSky()
  // Reset "Read more" whenever the date changes (adjust state during render)
  const [more, setMore] = useState(false)
  const [moreFor, setMoreFor] = useState(date)
  if (moreFor !== date) {
    setMoreFor(date)
    setMore(false)
  }

  // While stepping dates, show the loading copy instead of the stale APOD
  const a = isPending ? undefined : apod
  const isImage = a?.media_type === 'image'

  const img = a ? apodPicture(a) : null
  const isVideo = !!a && !isImage

  const title =
    a === undefined
      ? 'Tuning in to NASA…'
      : a === null
        ? 'Astronomy Picture of the Day'
        : !isImage && /^nasa/i.test(a.title)
          ? 'Today’s feature is a video'
          : a.title

  const explanation =
    a === undefined
      ? ''
      : a === null
        ? 'NASA hasn’t answered for this date yet. The sky behind this page is still drawn for it — step back a day to see an earlier picture.'
        : a.explanation

  const hdUrl = a ? a.hdurl || a.url : undefined
  const imgNote = a === undefined ? 'Loading picture' : isVideo ? 'Video · watch on NASA' : 'APOD image'
  const isToday = date >= today

  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-center gap-[clamp(28px,4vw,56px)] pt-[clamp(28px,7vh,80px)] pb-10">
      <div>
        {/* Date stepper */}
        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            aria-label="Previous day"
            onClick={() => goToDate(shiftDate(date, -1))}
            className={circleBtn}
          >
            ←
          </button>
          <div className="font-label text-xs uppercase tracking-[0.14em] text-sky-accent">
            {formatLongDate(date)}
          </div>
          <button
            type="button"
            aria-label="Next day"
            disabled={isToday}
            onClick={() => goToDate(shiftDate(date, 1))}
            className={circleBtn}
          >
            →
          </button>
        </div>

        <h1
          aria-live="polite"
          className="m-0 font-display text-[clamp(44px,6.4vw,92px)] font-normal leading-[0.98] tracking-[-0.02em] text-balance"
        >
          {title}
        </h1>

        <p
          className={`mt-[22px] max-w-[56ch] text-base leading-[1.65] text-pretty text-[#c3c7da] ${
            more ? '' : 'line-clamp-5'
          }`}
        >
          {explanation}
        </p>

        {a && (
          <button
            type="button"
            onClick={() => setMore(!more)}
            aria-expanded={more}
            className="mt-2 h-11 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-sky-accent"
          >
            {more ? 'Show less' : 'Read more'}
          </button>
        )}

        <div className="mt-[18px] flex flex-wrap items-center gap-2.5">
          {hdUrl && (
            <a
              href={hdUrl}
              target="_blank"
              rel="noreferrer"
              className={`${pillBtn} bg-sky-accent text-[#03040a] hover:brightness-[1.12]`}
            >
              View in HD
            </a>
          )}
          <SaveButton apod={a ?? null} />
          <Link
            href="/explore"
            className="inline-flex h-[46px] items-center px-3.5 text-sm text-[#c3c7da] hover:text-sky-accent"
          >
            Explore the archive →
          </Link>
        </div>

        {a && (
          <div className="mt-[18px] font-label text-xs text-[#9499b3]">
            Credit · {a.copyright ? a.copyright.trim().replace(/\s+/g, ' ') : 'NASA / public domain'}
          </div>
        )}
      </div>

      {/* Image card — links to the HD image */}
      <a
        href={hdUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={hdUrl ? `Open ${title} in HD` : undefined}
        className="relative block aspect-[4/3] overflow-hidden rounded-[20px] border border-white/[0.14] transition-transform duration-500 hover:scale-[1.012]"
        style={{
          background:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 10px, rgba(255,255,255,0.015) 10px 20px), #0a0c18',
          boxShadow:
            '0 40px 120px -30px oklch(0.55 0.18 var(--sky-h, 265) / 0.7), 0 0 0 8px rgba(255,255,255,0.03)',
        }}
      >
        {img ? (
          <Image
            src={img}
            alt={title}
            fill
            priority
            unoptimized={!canOptimize(img)}
            sizes="(max-width: 800px) 100vw, 640px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-5 text-center font-label text-xs uppercase tracking-[0.12em] text-[#9499b3]">
            {imgNote}
          </div>
        )}

        {isVideo && img && (
          <span className="absolute top-3.5 left-3.5 rounded-full bg-[rgba(3,4,10,0.78)] px-2.5 py-[5px] font-label text-[11px] uppercase tracking-[0.12em]">
            Video · watch on NASA
          </span>
        )}
      </a>
    </section>
  )
}

// "Save to board" — toggles the APOD in the bookmark store.
// Saved state comes from localStorage, so it's only shown after hydration
// (the server can't know it, and a mismatch would break hydration).
function SaveButton({ apod }: { apod: APOD | null }) {
  const hydrated = useHydrated()
  const toggle = useBookmarkStore((s) => s.toggle)
  const saved = useBookmarkStore((s) => !!apod && s.bookmarks.some((b) => b.date === apod.date))
  const isSaved = hydrated && saved

  return (
    <button
      type="button"
      disabled={!apod}
      aria-pressed={isSaved}
      onClick={() =>
        apod &&
        toggle({ date: apod.date, title: apod.title, url: apod.url, media_type: apod.media_type })
      }
      className={`${pillBtn} cursor-pointer border border-white/[0.22] bg-transparent text-[#e9ebf5] transition-colors hover:bg-white/10 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent`}
    >
      {isSaved ? 'Saved to board ✓' : 'Save to board'}
    </button>
  )
}
