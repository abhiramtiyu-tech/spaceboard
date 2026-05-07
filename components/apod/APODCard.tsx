'use client'

import Image from 'next/image'
import Link from 'next/link'
import { APOD } from '@/types/nasa'

interface Props {
  apod: APOD
}

export default function APODCard({ apod }: Props) {
  return (
    <Link
      href={`/apod/${apod.date}`}
      className="group block rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors"
    >
      {/* Image or video thumbnail */}
      <div className="relative h-48 bg-[#04080f] overflow-hidden">
        {apod.media_type === 'image' ? (
          <Image
            src={apod.url}
            alt={apod.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          // Video — show thumbnail if available, else dark placeholder
          <div className="w-full h-full flex items-center justify-center">
            {apod.thumbnail_url ? (
              <Image
                src={apod.thumbnail_url}
                alt={apod.title}
                fill
                className="object-cover"
                sizes="33vw"
              />
            ) : (
              <div className="text-center">
                <div className="text-3xl mb-2">▶</div>
                <p className="text-xs text-gray-400">Video</p>
              </div>
            )}
          </div>
        )}

        {/* Media type badge — top right */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            apod.media_type === 'video'
              ? 'bg-purple-900/80 text-purple-200'
              : 'bg-blue-900/80 text-blue-200'
          }`}>
            {apod.media_type}
          </span>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">{apod.date}</p>
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
          {apod.title}
        </h3>
      </div>
    </Link>
  )
}