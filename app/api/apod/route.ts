// This is a Route Handler — Next.js's replacement for Pages Router API routes
// It runs on the server — NASA_API_KEY is safe here
// Browser calls /api/apod?count=20 → this handler calls NASA → returns data

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Read query params from the URL
  // e.g. /api/apod?count=20&media_type=image
  const searchParams = request.nextUrl.searchParams
  const count = searchParams.get('count') || '20'
  const mediaType = searchParams.get('media_type')

  // Build NASA URL server-side — API key never leaves the server
  const url = new URL('https://api.nasa.gov/planetary/apod')
  url.searchParams.set('api_key', process.env.NASA_API_KEY!)
  url.searchParams.set('count', count)

  const res = await fetch(url.toString(), {
    // Cache random batches for 1 hour
    next: { revalidate: 3600 }
  })

  if (!res.ok) {
    return NextResponse.json(
      { error: 'NASA API error' },
      { status: res.status }
    )
  }

  const data = await res.json()

  // Filter by media_type if requested
  const filtered = mediaType
    ? data.filter((apod: any) => apod.media_type === mediaType)
    : data

  return NextResponse.json(filtered)
}