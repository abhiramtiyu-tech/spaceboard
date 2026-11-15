// This is a Route Handler — Next.js's replacement for Pages Router API routes
// It runs on the server — NASA_API_KEY is safe here
// Browser calls /api/apod?count=20 → this handler calls NASA → returns data

import { NextRequest, NextResponse } from 'next/server'
import { getRandomAPODs } from '@/lib/nasa'

export async function GET(request: NextRequest) {
  // Read query params from the URL
  // e.g. /api/apod?count=20&media_type=image
  const searchParams = request.nextUrl.searchParams
  const count = Number(searchParams.get('count')) || 20
  const mediaType = searchParams.get('media_type')

  try {
    // Shared NASA client — adds the API key server-side and repairs
    // placeholder entries (see lib/apod-fallback.ts)
    const data = await getRandomAPODs(count)

    // Filter by media_type if requested
    const filtered = mediaType
      ? data.filter((apod) => apod.media_type === mediaType)
      : data

    return NextResponse.json(filtered)
  } catch {
    return NextResponse.json({ error: 'NASA API error' }, { status: 502 })
  }
}
