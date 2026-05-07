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
  const apod = await getTodayAPOD()
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Hero — today's APOD image */}
      <APODHero apod={apod} />

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