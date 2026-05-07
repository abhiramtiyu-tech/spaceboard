// "use client" needed here because we have the bookmark button
// which will need onClick later (Phase 6)
// Rule: if it needs interactivity → client component

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { APOD } from '@/types/nasa'

interface Props {
  apod: APOD
}

export default function APODHero({ apod }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100">

      {/* Dark space header */}
      <div className="bg-[#04080f] px-6 pt-8 pb-0">

        {/* Label */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-400 tracking-widest uppercase">
            Astronomy Picture of the Day
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-white leading-snug mb-3 max-w-2xl">
          {apod.title}
        </h1>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
          <span>{apod.date}</span>
          <span className="capitalize">{apod.media_type}</span>
          {apod.copyright && (
            <span>© {apod.copyright.trim()}</span>
          )}
        </div>

        {/* Image or Video */}
        {apod.media_type === 'image' ? (
          <div className="relative w-full h-[420px] rounded-t-xl overflow-hidden">
            <Image
              src={apod.url}
              alt={apod.title}
              fill
              className="object-cover"
              // priority = preload this image — it's the LCP element
              // Always add priority to above-the-fold images
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
        ) :apod.url.includes('.mp4') ? (
  // Direct mp4 file — use HTML video tag
  <div className="relative w-full h-[420px] rounded-t-xl overflow-hidden bg-black">
    <video
      src={apod.url}
      controls
      autoPlay
      muted
      loop
      className="w-full h-full object-cover"
    />
  </div>
) : (
          // NASA sometimes returns YouTube videos
          <div className="relative w-full h-[420px] rounded-t-xl overflow-hidden">
            <iframe
              src={apod.url}
              title={apod.title}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* White content area below image */}
      <div className="bg-white px-6 py-6">

        {/* Explanation — truncated */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {apod.explanation}
        </p>

        {/* Actions row */}
        <div className="flex items-center gap-3 mt-5">
          <Link
            href={`/apod/${apod.date}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Read full explanation →
          </Link>

          {/* HD link — only if available */}
          {apod.hdurl && (
            <a
              href={apod.hdurl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              View HD ↗
            </a>
          )}
        </div>
      </div>

    </div>
  )
}