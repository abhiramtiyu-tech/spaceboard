import { APOD } from '@/types/nasa'
import { cache } from 'react'
import { repairAPOD } from '@/lib/apod-fallback'
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

// Fetch today's APOD — called from the home page Server Component
// Notice: no 'use client' — this runs on the server only
export async function getTodayAPOD(): Promise<APOD> {
    
  const url = buildUrl({})
  
  const res = await fetch(url, {
    // next.revalidate tells Next.js how long to cache this response
    // 86400 seconds = 24 hours — APOD only updates once per day
    // This is Next.js's extended fetch API — not standard browser fetch
    next: { revalidate: 86400, tags: ['apod-today'] }
  })

  // Always check res.ok — NASA returns 200 even for some errors
  if (!res.ok) {
    // Throwing here triggers the nearest error.tsx boundary
    throw new Error(`NASA API error: ${res.status}`)
  }

  // repairAPOD: temporary workaround for NASA's placeholder responses
  return repairAPOD(await res.json())
}

// Fetch a specific date — called from /apod/[date] page
export const getAPODByDate = cache(async (date: string): Promise<APOD> => {
  const url = buildUrl({ date })

  const res = await fetch(url, {
    next: { revalidate: 86400 * 30, tags: [`apod-${date}`] }
  })

  if (!res.ok) {
    throw new Error(`NASA API error: ${res.status}`)
  }

  return repairAPOD(await res.json())
})

// Fetch random images for the explore grid — used by /api/apod,
// which the client calls via SWR
export async function getRandomAPODs(count: number = 20): Promise<APOD[]> {
  const url = buildUrl({ count: count.toString() })

  const res = await fetch(url, {
    // Cache random batches for 1 hour
    next: { revalidate: 3600 }
  })

  if (!res.ok) {
    throw new Error(`NASA API error: ${res.status}`)
  }

  const apods: APOD[] = await res.json()
  return Promise.all(apods.map(repairAPOD))
}


// Fetch a date range for the D3 chart
export async function getAPODRange(
  startDate: string,
  endDate: string
): Promise<APOD[]> {
  const url = buildUrl({
    start_date: startDate,
    end_date: endDate
  })

  const res = await fetch(url, {
    next: { revalidate: 86400 }
  })

  if (!res.ok) {
    throw new Error(`NASA API error: ${res.status}`)
  }

  const apods: APOD[] = await res.json()
  return Promise.all(apods.map(repairAPOD))
}