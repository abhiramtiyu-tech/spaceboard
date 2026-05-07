'use client'

// SWR lives here — this is a Client Component
// useSWR watches the key — when key changes (filter changes)
// it automatically refetches with the new params

import useSWR from 'swr'
import { useFilterStore } from '@/store/useFilterStore'
import APODCard from './APODCard'
import { APOD } from '@/types/nasa'

// SWR fetcher — just a function that takes a URL and returns data
// SWR calls this automatically when the key changes
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  })

export default function ExploreGrid() {
  // Read filter state from Zustand
  const { mediaType, count } = useFilterStore()

  // Build the API URL based on current filter state
  // This URL IS the SWR cache key
  // When mediaType or count changes → new URL → SWR refetches
  const url = mediaType === 'all'
    ? `/api/apod?count=${count}`
    : `/api/apod?count=${count}&media_type=${mediaType}`

  // useSWR(key, fetcher)
  // key   → the URL — also acts as cache key
  // fetcher → function that fetches and returns data
  // data   → the fetched APODs (undefined while loading)
  // error  → any error thrown by fetcher
  // isLoading → true while first fetch is in flight
  const { data, error, isLoading } = useSWR<APOD[]>(url, fetcher, {
    // Revalidate when user comes back to the tab
    revalidateOnFocus: false,
    // Keep showing old data while refetching
    keepPreviousData: true,
  })

  // Loading state — SWR equivalent of loading.tsx
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          // Skeleton cards
          <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="h-48 bg-gray-100 animate-pulse" />
            <div className="p-4">
              <div className="h-3 bg-gray-100 rounded animate-pulse mb-2 w-20" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state — SWR equivalent of error.tsx
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm mb-4">
          Failed to load images. NASA API may be unavailable.
        </p>
        <button
          // mutate() with no args re-triggers the fetch
          onClick={() => window.location.reload()}
          className="text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Results count */}
      <p className="text-xs text-gray-400 mb-4">
        {data?.length ?? 0} images loaded
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((apod) => (
          <APODCard key={`${apod.date}-${apod.url}`} apod={apod} />
        ))}
      </div>
    </div>
  )
}