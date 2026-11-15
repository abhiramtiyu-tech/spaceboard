// TEMPORARY WORKAROUND — remove once NASA fixes the APOD API.
//
// Since NASA moved APOD to science.nasa.gov, api.nasa.gov/planetary/apod
// returns the same placeholder ("NASA Science" + NASA logo) for every date.
// The real content still exists: the legacy page apod.nasa.gov/apod/apYYMMDD.html
// redirects to a science.nasa.gov article that we can read the data from.
//
// This module detects the placeholder and rebuilds the APOD from that page.
// It depends on NASA's HTML structure, so every step fails soft: if anything
// can't be parsed we return the original (placeholder) APOD instead of throwing.

import type { APOD } from '@/types/nasa'

// Assets for real APOD entries live under this path; generic NASA images don't
const APOD_ASSET_RE =
  /https:\/\/assets\.science\.nasa\.gov\/content\/dam\/science\/cds\/apod\/[^"'\s?]+/g

export function isPlaceholderAPOD(apod: Pick<APOD, 'title' | 'url'>): boolean {
  return apod.title === 'NASA Science' || apod.url?.includes('nasa-logo') === true
}

// "2024-01-01" → "https://apod.nasa.gov/apod/ap240101.html"
function legacyPageUrl(date: string): string {
  return `https://apod.nasa.gov/apod/ap${date.replace(/-/g, '').slice(2)}.html`
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

// Strip tags, decode entities, collapse whitespace, tidy " ," / " ." left by links
function toPlainText(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function findVideo(html: string): { embedUrl: string; thumbnail?: string } | null {
  const youtube = html.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/
  )
  if (youtube) {
    const id = youtube[1]
    return {
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    }
  }
  const vimeo = html.match(/player\.vimeo\.com\/video\/(\d+)|vimeo\.com\/(\d+)/)
  if (vimeo) return { embedUrl: `https://player.vimeo.com/video/${vimeo[1] ?? vimeo[2]}` }

  const mp4 = html.match(/https:\/\/[^"'\s]+\.mp4/)
  if (mp4) return { embedUrl: mp4[0] }

  return null
}

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

// Fetch the science.nasa.gov article HTML for a date, or null if not found.
async function fetchArticleHtml(date: string): Promise<string | null> {
  // 1. Legacy URL — redirects to the article for most of the archive
  const res = await fetch(legacyPageUrl(date), {
    // Past entries don't change, so cache for 30 days
    next: { revalidate: 86400 * 30, tags: [`apod-page-${date}`] },
  })
  if (res.ok && res.url.includes('/image-article/')) return res.text()

  // 2. Recent entries have no legacy page (it redirects to the APOD landing
  //    page instead). Look the article up via science.nasa.gov's public
  //    WordPress API. Slugs look like "apod-2026-november-14-apollo-12-and-...".
  const [y, m, d] = date.split('-').map(Number)
  const slugPrefix = `apod-${y}-${MONTHS[m - 1]}-${d}-`
  const search = new URL('https://science.nasa.gov/wp-json/wp/v2/image-article')
  search.searchParams.set('search', slugPrefix.slice(0, -1))
  search.searchParams.set('per_page', '20')
  search.searchParams.set('_fields', 'slug,link')
  const lookup = await fetch(search.toString(), { next: { revalidate: 3600 } })
  if (!lookup.ok) return null
  const posts: { slug: string; link: string }[] = await lookup.json()
  const link = posts.find((p) => p.slug.startsWith(slugPrefix))?.link
  if (!link) return null

  const article = await fetch(link, {
    next: { revalidate: 86400, tags: [`apod-page-${date}`] },
  })
  return article.ok ? article.text() : null
}

async function rebuildFromSite<T extends APOD>(apod: T): Promise<T> {
  const html = await fetchArticleHtml(apod.date)
  if (!html) return apod

  // Only look at the hero (head + media + explanation), not related-content
  // sections further down that link to other APODs
  const explanationStart = html.indexOf('Explanation:')
  const explanationEnd = html.indexOf('</p>', explanationStart)
  const hero = explanationStart >= 0 ? html.slice(0, explanationEnd) : html

  const title = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]
  if (!title) return apod

  // Explanation paragraph — drop extra notices after a double <br>
  let explanation = apod.explanation
  if (explanationStart >= 0) {
    const raw = html
      .slice(explanationStart + 'Explanation:'.length, explanationEnd)
      .split(/<br\s*\/?>\s*<br\s*\/?>/)[0]
    explanation = toPlainText(raw) || explanation
  }

  // "Image Credit & Copyright: Jane Doe" → "Jane Doe"
  const creditCell = html.match(/>\s*Credit\s*<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/)?.[1]
  const copyright = creditCell
    ? toPlainText(creditCell).replace(/^[^:]*Credit[^:]*:\s*/i, '') || undefined
    : apod.copyright

  const assets = [...new Set(hero.match(APOD_ASSET_RE) ?? [])]
  // Original file (no "/jcr:content/") is the HD version; the 1280px rendition
  // is lighter for display. Fall back to the original if there's no rendition.
  const original = assets.find((a) => !a.includes('/jcr:content/'))
  const rendition = assets.find((a) => a.includes('/jcr:content/renditions/'))

  const base = {
    ...apod,
    title: toPlainText(title).replace(/^Video:\s*/i, ''),
    explanation,
    copyright,
  }

  if (original || rendition) {
    return {
      ...base,
      media_type: 'image',
      url: rendition ?? original!,
      hdurl: original ?? rendition,
    }
  }

  const video = findVideo(hero)
  if (video) {
    return {
      ...base,
      media_type: 'video',
      url: video.embedUrl,
      hdurl: undefined,
      thumbnail_url: video.thumbnail,
    }
  }

  // Found text but no media — still better than the placeholder title
  return base
}

// Use on every APOD coming back from the API. No-op for healthy responses.
export async function repairAPOD<T extends APOD>(apod: T): Promise<T> {
  if (!isPlaceholderAPOD(apod)) return apod
  try {
    return await rebuildFromSite(apod)
  } catch (err) {
    console.warn(`[apod-fallback] could not rebuild ${apod.date}:`, err)
    return apod
  }
}
