import { APOD } from '@/types/nasa'
import { cache } from 'react'
import { repairAPOD } from '@/lib/apod-fallback'
import { easternDate } from '@/lib/dates'
const BASE_URL = 'https://api.nasa.gov/planetary/apod'
const API_KEY = process.env.NASA_API_KEY

// Why a helper? So every fetch shares the same base URL and API key.
// If NASA changes their URL, we fix it in one place.
function buildUrl(params: Record<string, string>): string {
  const url = new URL(BASE_URL)
  url.searchParams.set('api_key', API_KEY!)

  // Spread any extra params — date, count, start_date etc.
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return url.toString()
}

// NASA's API intermittently returns 500/503 (or drops the connection).
// Retry those a few times with a short backoff before giving up.
// 4xx errors (bad key, bad date) are not retried — they won't fix themselves.
const MAX_ATTEMPTS = 3

async function fetchNASA<T>(url: string, init?: RequestInit): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, init)
      // Always check res.ok — throwing triggers the nearest error.tsx boundary
      if (res.ok) return res.json()

      lastError = new Error(`NASA API error: ${res.status}`)
      if (res.status < 500) break
    } catch (err) {
      // Network failure / connection reset
      lastError = err
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, 500 * attempt))
    }
  }

  throw lastError
}

// Fetch today's APOD — called from the home page Server Component
// Notice: no 'use client' — this runs on the server only
export async function getTodayAPOD(): Promise<APOD> {
  // next.revalidate tells Next.js how long to cache this response.
  // This is Next.js's extended fetch API — not standard browser fetch
  const init = { next: { revalidate: 86400, tags: ['apod-today'] } }

  try {
    const apod = await fetchNASA<APOD>(buildUrl({ thumbs: 'true' }), init)
    // repairAPOD: temporary workaround for NASA's placeholder responses
    return repairAPOD(apod)
  } catch (err) {
    // The "no date" request is the flakiest one. Ask for today's date
    // explicitly, then yesterday's (today's may not be published yet).
    for (const date of [easternDate(0), easternDate(1)]) {
      try {
        return await getAPODByDate(date)
      } catch {
        // try the next one
      }
    }
    throw err
  }
}

// Fetch a specific date — called from /apod/[date] page
export const getAPODByDate = cache(async (date: string): Promise<APOD> => {
  const apod = await fetchNASA<APOD>(buildUrl({ date, thumbs: 'true' }), {
    next: { revalidate: 86400 * 30, tags: [`apod-${date}`] }
  })
  return repairAPOD(apod)
})

// Fetch a random batch — used by the /explore page, its "Shuffle the sky"
// server action, and /api/apod.
// By default the batch is cached for 1 hour (same URL → same batch).
// Pass { fresh: true } to skip the cache and get a genuinely new batch.
export async function getRandomAPODs(
  count: number = 20,
  { fresh = false }: { fresh?: boolean } = {}
): Promise<APOD[]> {
  const url = buildUrl({ count: count.toString(), thumbs: 'true' })
  const apods = await fetchNASA<APOD[]>(
    url,
    fresh ? { cache: 'no-store' } : { next: { revalidate: 3600 } }
  )
  // Per-entry repair lookups are still cached per date (lib/apod-fallback.ts)
  return Promise.all(apods.map(repairAPOD))
}

// Fetch a date range for the D3 chart
export async function getAPODRange(
  startDate: string,
  endDate: string
): Promise<APOD[]> {
  const apods = await fetchNASA<APOD[]>(
    buildUrl({ start_date: startDate, end_date: endDate }),
    { next: { revalidate: 86400 } }
  )
  return Promise.all(apods.map(repairAPOD))
}
