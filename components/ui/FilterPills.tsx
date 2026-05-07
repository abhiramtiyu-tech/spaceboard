'use client'

// Client component — reads and updates Zustand store
// Zustand store updates trigger SWR refetch in ExplorePage

import { useFilterStore } from '@/store/useFilterStore'

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Images', value: 'image' },
  { label: 'Videos', value: 'video' },
] as const

export default function FilterPills() {
  // Zustand hook — reads mediaType and setMediaType from global store
  const { mediaType, setMediaType } = useFilterStore()

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => setMediaType(filter.value)}
          className={`
            text-sm px-4 py-1.5 rounded-full border transition-colors
            ${mediaType === filter.value
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}