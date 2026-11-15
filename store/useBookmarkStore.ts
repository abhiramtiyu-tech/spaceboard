import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Saved APODs ("Save to board").
// Stored in localStorage for now — move to the database once auth/Prisma
// are set up, and list them on /dashboard.

export interface Bookmark {
  date: string // APOD date, YYYY-MM-DD — unique key
  title: string
  url: string
  media_type?: string
}

interface BookmarkState {
  bookmarks: Bookmark[]
  toggle: (bookmark: Bookmark) => void
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set) => ({
      bookmarks: [],
      toggle: (bookmark) =>
        set((state) => ({
          bookmarks: state.bookmarks.some((b) => b.date === bookmark.date)
            ? state.bookmarks.filter((b) => b.date !== bookmark.date)
            : [bookmark, ...state.bookmarks],
        })),
    }),
    { name: 'spaceboard-bookmarks' }
  )
)
