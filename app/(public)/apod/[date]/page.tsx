import { getAPODByDate } from '@/lib/nasa'
import { notFound } from 'next/navigation'
import type { Metadata, ResolvingMetadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

// Props type for App Router dynamic pages
// params is a Promise in Next.js 15 — must be awaited
interface Props {
  params: Promise<{ date: string }>
}

// generateMetadata runs BEFORE the page renders
// Next.js calls this to build the <head> tags
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata // lets you access parent metadata
): Promise<Metadata> {
  // Await params — required in Next.js 15
  const { date } = await params

  // Validate date format before hitting NASA
  // NASA expects YYYY-MM-DD — anything else is a 400
  if (!isValidDate(date)) {
    return { title: 'Not Found' }
  }

  try {
    // This fetch is deduplicated with the page component's fetch
    // React cache() ensures NASA is only called once
    const apod = await getAPODByDate(date)

    return {
      // %s | Spaceboard comes from layout.tsx template
      title: apod.title,
      description: apod.explanation.slice(0, 160),
      openGraph: {
        title: apod.title,
        description: apod.explanation.slice(0, 160),
        type: 'article',
        publishedTime: apod.date,
        // OG image — when shared on Slack/Twitter shows the NASA image
        images: apod.media_type === 'image'
          ? [{ url: apod.url, alt: apod.title }]
          : [],
      },
    }
  } catch {
    // If fetch fails, return minimal metadata
    // Don't crash the metadata — page will handle the error
    return { title: 'APOD' }
  }
}

// Date validation — NASA started June 16, 1995
function isValidDate(date: string): boolean {
  // Must match YYYY-MM-DD format
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(date)) return false

  const parsed = new Date(date)
  const nasaStart = new Date('1995-06-16')
  const today = new Date()

  // Must be a real date, after NASA start, not in the future
  return (
    !isNaN(parsed.getTime()) &&
    parsed >= nasaStart &&
    parsed <= today
  )
}

export default async function APODDetailPage({ params }: Props) {
  const { date } = await params

  // Validate date first — before hitting NASA
  if (!isValidDate(date)) {
    // notFound() throws a special Next.js error
    // caught by not-found.tsx — not error.tsx
    // This is intentional — we chose to show 404
    notFound()
  }

  // Fetch the APOD — deduplicated with generateMetadata()
  const apod = await getAPODByDate(date)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        ← Back to today
      </Link>

      {/* Dark header */}
      <div className="rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-[#04080f] px-6 pt-8 pb-0">

          {/* Type badge */}
          <span className={`inline-block text-xs px-2.5 py-1 rounded-full mb-4 font-medium ${
            apod.media_type === 'video'
              ? 'bg-purple-500/20 text-purple-300'
              : 'bg-emerald-500/20 text-emerald-300'
          }`}>
            {apod.media_type}
          </span>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-white leading-snug mb-3">
            {apod.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
            <span>{apod.date}</span>
            {apod.copyright && (
              <span>© {apod.copyright.trim()}</span>
            )}
          </div>

          {/* Media */}
          {apod.media_type === 'image' ? (
            <div className="relative w-full h-[480px] rounded-t-xl overflow-hidden">
              <Image
                src={apod.url}
                alt={apod.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 900px"
              />
            </div>
          ) : apod.url.includes('.mp4') ? (
            <div className="relative w-full h-[480px] rounded-t-xl overflow-hidden bg-black">
              <video
                src={apod.url}
                controls
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="relative w-full h-[480px] rounded-t-xl overflow-hidden">
              <iframe
                src={apod.url}
                title={apod.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* White content area */}
        <div className="bg-white px-6 py-6">

          {/* Full explanation */}
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            {apod.explanation}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            {apod.hdurl && (
              <a
                href={apod.hdurl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                View HD image ↗
              </a>
            )}
            <span className="text-gray-200">|</span>
            <a
              href={`https://apod.nasa.gov/apod/ap${date.replace(/-/g, '').slice(2)}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              View on NASA ↗
            </a>
          </div>

        </div>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between mt-6">
        <Link
          href={`/apod/${previousDay(date)}`}
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← Previous day
        </Link>
        <Link
          href={`/apod/${nextDay(date)}`}
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          Next day →
        </Link>
      </div>

    </div>
  )
}

// Date navigation helpers
function previousDay(date: string): string {
  const d = new Date(date)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function nextDay(date: string): string {
  const d = new Date(date)
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}