// This page starts as a Server Component for metadata
// The actual data fetching happens client-side via SWR
import type { Metadata } from 'next'
import ExploreGrid from '@/components/apod/ExploreGrid'
import FilterPills from '@/components/ui/FilterPills'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Browse the full NASA APOD archive — thousands of astronomy images and videos since 1995',
}

export default function ExplorePage() {
  // This component is a Server Component
  // It renders the shell — FilterPills and ExploreGrid
  // ExploreGrid is a Client Component that uses SWR

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Explore the archive
        </h1>
        <p className="text-sm text-gray-500">
          Random selection from NASA's collection since June 1995
        </p>
      </div>

      {/* Filters — client component */}
      <div className="mb-6">
        <FilterPills />
      </div>

      {/* Grid — client component with SWR */}
      <ExploreGrid />

    </div>
  )
}