// No "use client" = Server Component
// This entire file runs on the server — NASA API key is never exposed

import { getTodayAPOD } from '@/lib/nasa'
import APODHero from '@/components/apod/APODHero'
import RecentList from '@/components/apod/RecentList'
import type { Metadata } from 'next'

// Static metadata for home page
// Individual APOD pages use generateMetadata() instead
export const metadata: Metadata = {
  title: 'Today',
  description: 'NASA Astronomy Picture of the Day — explore the cosmos daily',
}

export default async function HomePage() {
  // This await happens on the SERVER
  // The browser never sees this fetch — only the rendered HTML
  // While this is awaited, loading.tsx shows automatically
  //
  // If NASA is down we render a notice instead of throwing. This page is
  // pre-rendered at build time, so throwing would fail the whole deployment.
  // The page is regenerated in the background later, so it recovers itself.
  const apod = await getTodayAPOD().catch((err) => {
    console.error('Could not load today\'s APOD:', err)
    return null
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Hero — today's APOD image */}
      {apod ? (
        <APODHero apod={apod} />
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-[#04080f] px-6 py-16 text-center">
          <p className="text-white font-medium mb-2">
            Today&apos;s image is temporarily unavailable
          </p>
          <p className="text-sm text-gray-400">
            NASA&apos;s APOD service isn&apos;t responding. Please check back shortly.
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="mt-12 mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">RECENT IMAGES</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      {/* Recent list — last 7 days */}
      <RecentList />

    </div>
  )
}