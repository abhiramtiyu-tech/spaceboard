import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// This store manages the explore page filter state
// persist middleware saves it to localStorage
// so if you refresh, your filter is remembered

interface FilterState {
  mediaType: 'all' | 'image' | 'video'
  count: number

  // Actions — functions that update state
  setMediaType: (type: 'all' | 'image' | 'video') => void
  setCount: (count: number) => void
}

export const useFilterStore = create<FilterState>()(
  // persist wraps the store and syncs to localStorage automatically
  persist(
    (set) => ({
      // Initial state
      mediaType: 'all',
      count: 20,

      // Actions — set is Zustand's state updater
      setMediaType: (type) => set({ mediaType: type }),
      setCount: (count) => set({ count }),
    }),
    {
      // Key in localStorage
      name: 'spaceboard-filters',

      // Only persist mediaType — not count
      // count resets on refresh (intentional)
      partialize: (state) => ({ mediaType: state.mediaType }),
    }
  )
)