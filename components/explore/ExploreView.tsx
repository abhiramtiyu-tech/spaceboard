'use client'

// Explore page body: toolbar (filters, layout switcher, status + shuffle)
// and the four layouts — Masonry (default), Grid, Constellation, Timeline.
//
// The first batch is fetched on the server (app/(public)/explore/page.tsx).
// "Shuffle the sky" calls a server action, so the NASA key stays server-side.

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { APOD } from '@/types/nasa'
import { apodPicture, canOptimize } from '@/lib/images'
import { useHydrated } from '@/lib/useHydrated'
import { useFilterStore } from '@/store/useFilterStore'
import { rng } from '@/components/sky/sky'
import { shuffleApods } from '@/app/(public)/explore/actions'
import ApodTile, { STRIPES, type TileItem } from './ApodTile'
import { EXPLORE_BATCH_SIZE } from './constants'

type Filter = 'all' | 'image' | 'video'
type View = 'masonry' | 'grid' | 'field' | 'timeline'

const FILTERS: [Filter, string][] = [
  ['all', 'All'],
  ['image', 'Images'],
  ['video', 'Videos'],
]

const VIEWS: [View, string][] = [
  ['masonry', 'Masonry'],
  ['grid', 'Grid'],
  ['field', 'Constellation'],
  ['timeline', 'Timeline'],
]

// Masonry aspect ratios, cycled by position
const RATIOS = ['4/5', '1/1', '4/3', '3/4', '1/1', '16/10']

// '2001-09-12' → 'Sep 12, 2001'
function shortDate(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function toTile(a: APOD, i: number): TileItem {
  return {
    key: `${a.date}-${i}`,
    placeholder: false,
    date: a.date,
    dateLabel: shortDate(a.date),
    year: Number(a.date.slice(0, 4)),
    title: a.title || '',
    img: apodPicture(a),
    isVideo: !!a.media_type && a.media_type !== 'image',
    href: `/apod/${a.date}`, // our own detail page
  }
}

function placeholderTile(i: number, label: string): TileItem {
  return {
    key: `ph-${i}`,
    placeholder: true,
    date: '',
    dateLabel: label,
    year: 0,
    title: '',
    img: null,
    isVideo: false,
    href: null,
  }
}

const chipClass = (active: boolean) =>
  `h-11 cursor-pointer rounded-full border px-4.5 text-sm font-medium ${
    active
      ? 'border-transparent bg-[#e9ebf5] text-[#03040a]'
      : 'border-white/16 bg-[rgba(8,10,20,0.4)] text-[#e9ebf5]'
  }`

const dashedBox =
  'rounded-[18px] border border-dashed border-white/18 px-5 py-16 text-center font-display text-[30px] leading-[1.15]'

export default function ExploreView({ initialItems }: { initialItems: APOD[] | null }) {
  // null = the batch couldn't be loaded
  const [items, setItems] = useState<APOD[] | null>(initialItems)
  const [shuffleFailed, setShuffleFailed] = useState(false)
  const [view, setView] = useState<View>('masonry')
  // Drives the constellation scatter; fixed at first so SSR and client match
  const [seed, setSeed] = useState(1)
  const [isPending, startTransition] = useTransition()

  // Filter lives in the existing persisted store (remembered across visits).
  // Use 'all' until hydrated so server and client render the same thing.
  const hydrated = useHydrated()
  const storedFilter = useFilterStore((s) => s.mediaType)
  const setFilter = useFilterStore((s) => s.setMediaType)
  const filter: Filter = hydrated ? storedFilter : 'all'

  const shuffle = () =>
    startTransition(async () => {
      const next = await shuffleApods()
      startTransition(() => {
        if (next) {
          setItems(next)
          setShuffleFailed(false)
          setSeed(Date.now() % 1e6)
        } else {
          setShuffleFailed(true)
          setSeed((s) => s + 1)
        }
      })
    })

  const real = Array.isArray(items)

  const list = useMemo(() => {
    const all = real
      ? items!.map(toTile)
      : Array.from({ length: 12 }, (_, i) =>
          placeholderTile(i, isPending ? 'Loading' : 'Picture unavailable')
        )
    // Keep each tile's original index for the masonry ratio cycle
    const withIndex = all.map((tile, i) => ({ tile, i }))
    return filter === 'all'
      ? withIndex
      : withIndex.filter(({ tile }) => !tile.placeholder && tile.isVideo === (filter === 'video'))
  }, [items, real, filter, isPending])

  const n = list.length
  const total = items?.length ?? EXPLORE_BATCH_SIZE

  const status = isPending
    ? 'Scanning the archive…'
    : !real
      ? 'NASA isn’t responding · try shuffling again shortly'
      : (filter === 'all'
          ? `${n} random picks`
          : `${n} of ${total} are ${filter === 'video' ? 'videos' : 'images'}`) +
        (shuffleFailed ? ' · shuffle failed, try again' : '')

  const emptyMsg = !real
    ? 'Pictures are unavailable right now, so there is nothing to filter.'
    : filter === 'video'
      ? 'No videos in this batch.'
      : 'No images in this batch.'

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-white/10 pt-3.5 pb-6">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by media type">
          {FILTERS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={chipClass(filter === value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className="flex flex-wrap gap-0.5 rounded-full border border-white/10 bg-[rgba(8,10,20,0.55)] p-1 backdrop-blur-[14px]"
          role="group"
          aria-label="Layout"
        >
          {VIEWS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => setView(value)}
              className={`h-9 cursor-pointer rounded-full border-0 px-3.5 text-[13px] font-medium ${
                view === value ? 'bg-white/14 text-white' : 'bg-transparent text-[#b4b9cf]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3.5">
          <span className="font-label text-xs text-[#9499b3]" aria-live="polite">
            {status}
          </span>
          <button
            type="button"
            onClick={shuffle}
            disabled={isPending}
            className="h-11 cursor-pointer rounded-full border-0 bg-sky-accent px-5 text-sm font-semibold text-[#03040a] hover:brightness-[1.12] disabled:cursor-progress"
          >
            Shuffle the sky
          </button>
        </div>
      </div>

      {/* Empty state (filter matched nothing) */}
      {n === 0 ? (
        <div className="rounded-[18px] border border-dashed border-white/18 px-5 py-16 text-center">
          <div className="font-display text-[30px] leading-[1.15]">{emptyMsg}</div>
          <button
            type="button"
            onClick={shuffle}
            disabled={isPending}
            className="mt-4.5 h-11 cursor-pointer rounded-full border border-white/22 bg-transparent px-5 text-sm font-semibold text-[#e9ebf5] hover:bg-white/10"
          >
            Shuffle the sky
          </button>
        </div>
      ) : view === 'masonry' ? (
        <main className="columns-[280px] gap-x-4">
          {list.map(({ tile, i }) => (
            <ApodTile
              key={tile.key}
              item={tile}
              aspectRatio={RATIOS[i % RATIOS.length]}
              sizes="(max-width: 640px) 100vw, 320px"
              className="mb-4 break-inside-avoid"
            />
          ))}
        </main>
      ) : view === 'grid' ? (
        <main className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4">
          {list.map(({ tile }) => (
            <ApodTile key={tile.key} item={tile} aspectRatio="1/1" sizes="(max-width: 640px) 100vw, 320px" />
          ))}
        </main>
      ) : view === 'field' ? (
        <ConstellationLayout tiles={list.map((x) => x.tile)} seed={seed} />
      ) : real ? (
        <TimelineLayout tiles={list.map((x) => x.tile)} />
      ) : (
        <div className={dashedBox}>The timeline appears once pictures load.</div>
      )}
    </>
  )
}

// ─── Constellation ─────────────────────────────────────────────────────

function ConstellationLayout({ tiles, seed }: { tiles: TileItem[]; seed: number }) {
  const n = tiles.length

  // Seeded scatter: stable between renders, new on each shuffle
  const points = useMemo(() => {
    const R = rng(seed)
    return tiles.map((_, i) => ({
      x: 16 + (i % 2 ? 40 : 0) + R() * 28, // % of width
      y: ((i + 0.5) / n) * 100, // % of height
      size: Math.round(120 + R() * 70), // px
    }))
  }, [tiles, seed, n])

  return (
    <main className="relative" style={{ height: Math.max(1, n) * 170 }}>
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <polyline
          points={points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={1}
          strokeDasharray="2 5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {tiles.map((tile, i) => {
        const p = points[i]
        const style = { left: `${p.x}%`, top: `${p.y}%`, width: p.size }
        const body = (
          <>
            <span
              className="relative block aspect-square w-full overflow-hidden rounded-full border border-white/25 transition-transform duration-400 group-hover:scale-[1.08]"
              style={{
                background: STRIPES,
                boxShadow: '0 0 40px -6px oklch(0.7 0.14 var(--sky-h, 265) / 0.7)',
              }}
            >
              {tile.img && (
                <Image
                  src={tile.img}
                  alt=""
                  fill
                  sizes="190px"
                  unoptimized={!canOptimize(tile.img)}
                  className="object-cover"
                />
              )}
            </span>
            <span className="block max-w-[200px]">
              <span className="block font-label text-[10px] uppercase tracking-[0.14em] text-[#c3c7da]">
                {tile.dateLabel}
              </span>
              {tile.title && (
                <span className="mt-0.5 block font-display text-lg leading-[1.15]">{tile.title}</span>
              )}
            </span>
          </>
        )
        const cls =
          'group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2.5 text-center text-[#e9ebf5]'
        return tile.href ? (
          <Link key={tile.key} href={tile.href} className={cls} style={style}>
            {body}
          </Link>
        ) : (
          <div key={tile.key} className={cls} style={style} aria-hidden>
            {body}
          </div>
        )
      })}
    </main>
  )
}

// ─── Timeline ──────────────────────────────────────────────────────────

function TimelineLayout({ tiles }: { tiles: TileItem[] }) {
  // Newest first, grouped by year
  const years = useMemo(() => {
    const groups = new Map<number, TileItem[]>()
    for (const t of [...tiles].sort((a, b) => b.date.localeCompare(a.date))) {
      groups.set(t.year, [...(groups.get(t.year) ?? []), t])
    }
    return [...groups.entries()]
  }, [tiles])

  return (
    <main className="flex flex-col">
      {years.map(([year, group]) => (
        <div
          key={year}
          className="grid grid-cols-[minmax(72px,140px)_minmax(0,1fr)] gap-[clamp(14px,3vw,36px)] border-t border-white/10 py-5.5"
        >
          <div className="sticky top-4 self-start">
            <div className="font-display text-[clamp(34px,5vw,60px)] leading-none text-sky-accent">{year}</div>
            <div className="mt-1.5 font-label text-[11px] text-[#9499b3]">
              {group.length} {group.length > 1 ? 'entries' : 'entry'}
            </div>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-3.5">
            {group.map((tile) => (
              <ApodTile key={tile.key} item={tile} aspectRatio="4/3" sizes="(max-width: 640px) 100vw, 300px" />
            ))}
          </div>
        </div>
      ))}
    </main>
  )
}
