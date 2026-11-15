// Helpers for APOD imagery.

// next/image only optimises hosts allowed in next.config.ts (remotePatterns).
// For anything else, pass `unoptimized` so next/image doesn't throw.
export function canOptimize(src: string): boolean {
  try {
    const { hostname } = new URL(src)
    return hostname.endsWith('.nasa.gov') || hostname === 'img.youtube.com'
  } catch {
    return false
  }
}

// The picture to show for an APOD: the image itself, or a video's thumbnail
// when it's a real one (NASA sometimes returns a logo instead). null = none.
export function apodPicture(apod: {
  media_type?: string
  url: string
  thumbnail_url?: string
}): string | null {
  if (apod.media_type === 'image') return apod.url
  const thumb = apod.thumbnail_url
  return thumb && !/logo/i.test(thumb) ? thumb : null
}
