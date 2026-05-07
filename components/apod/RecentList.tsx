// This is a Server Component — fetches last 7 days of APODs
// No "use client" needed — no interactivity

import Link from 'next/link'
import { getAPODRange } from '@/lib/nasa'

// Helper to get date N days ago
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0] // "2026-05-07"
}

export default async function RecentList() {
  const endDate = daysAgo(1)   // yesterday
  const startDate = daysAgo(7) // 7 days ago

  const apods = await getAPODRange(startDate, endDate)

  // Reverse so newest is first
  const sorted = [...apods].reverse()

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {sorted.map((apod) => (
        <Link
          key={apod.date}
          href={`/apod/${apod.date}`}
          className="flex items-center gap-4 py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors group"
        >
          {/* Date */}
          <span className="text-xs font-mono text-gray-400 w-24 flex-shrink-0">
            {apod.date}
          </span>

          {/* Title */}
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors flex-1 truncate">
            {apod.title}
          </span>

          {/* Media type badge */}
          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
            apod.media_type === 'video'
              ? 'bg-purple-50 text-purple-600'
              : 'bg-blue-50 text-blue-600'
          }`}>
            {apod.media_type}
          </span>

          {/* Arrow */}
          <span className="text-gray-300 group-hover:text-gray-500 transition-colors text-xs">
            →
          </span>
        </Link>
      ))}
    </div>
  )
}