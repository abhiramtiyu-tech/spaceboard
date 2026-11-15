// Explore tile — shared by the Masonry, Grid and Timeline layouts.
// Links to our own detail page (/apod/[date]). Placeholder tiles
// (loading / unavailable) render without a link, title or hover.

import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { canOptimize } from '@/lib/images'

export interface TileItem {
  key: string
  placeholder: boolean
  date: string // YYYY-MM-DD ('' for placeholders)
  dateLabel: string // "Sep 12, 2001", or "Loading" / "Picture unavailable"
  year: number
  title: string
  img: string | null
  isVideo: boolean
  href: string | null
}

export const STRIPES =
  'repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 10px, rgba(255,255,255,0.015) 10px 20px), #0a0c18'

const HOVER =
  'hover:-translate-y-1 hover:border-[oklch(0.86_0.11_var(--sky-h,265)/0.6)] hover:shadow-[0_18px_50px_-18px_oklch(0.6_0.16_var(--sky-h,265)/0.7)]'

interface Props {
  item: TileItem
  aspectRatio: string // e.g. '4/5'
  sizes: string // next/image sizes hint for this layout
  className?: string
}

export default function ApodTile({ item, aspectRatio, sizes, className = '' }: Props) {
  const style: CSSProperties = { aspectRatio, background: STRIPES }
  const classes = `relative block overflow-hidden rounded-[14px] border border-white/12 transition-[translate,border-color,box-shadow] duration-350 ${
    item.href ? HOVER : ''
  } ${className}`

  const content = (
    <>
      {item.img && (
        <Image
          src={item.img}
          alt=""
          fill
          sizes={sizes}
          unoptimized={!canOptimize(item.img)}
          className="object-cover"
        />
      )}

      {item.isVideo && (
        <span className="absolute top-3 left-3 rounded-full bg-[rgba(3,4,10,0.78)] px-2.25 py-1 font-label text-[10px] uppercase tracking-[0.12em]">
          Video
        </span>
      )}

      <div
        className="absolute inset-x-0 bottom-0 px-3.5 pt-11 pb-3"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(3,4,10,0.88))' }}
      >
        <div className="font-label text-[10px] uppercase tracking-[0.14em] text-[#c3c7da]">
          {item.dateLabel}
        </div>
        {item.title && (
          <div className="mt-0.75 font-display text-xl leading-[1.15] text-balance text-white">
            {item.title}
          </div>
        )}
      </div>
    </>
  )

  return item.href ? (
    <Link href={item.href} className={classes} style={style}>
      {content}
    </Link>
  ) : (
    <div className={classes} style={style} aria-hidden>
      {content}
    </div>
  )
}
