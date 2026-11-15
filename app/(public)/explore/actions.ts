'use server'

// "Shuffle the sky" — runs on the server, so the NASA API key never
// reaches the browser. Bypasses the 1-hour cache to get a new batch.

import type { APOD } from '@/types/nasa'
import { getRandomAPODs } from '@/lib/nasa'
import { EXPLORE_BATCH_SIZE } from '@/components/explore/constants'

export async function shuffleApods(): Promise<APOD[] | null> {
  try {
    return await getRandomAPODs(EXPLORE_BATCH_SIZE, { fresh: true })
  } catch (err) {
    console.error('Shuffle failed:', err)
    return null
  }
}
