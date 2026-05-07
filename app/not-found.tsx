// No 'use client' needed — this is a Server Component
// not-found.tsx is intentional, not unexpected
// You explicitly call notFound() to trigger this

import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* 404 number */}
        <p className="text-6xl font-semibold text-gray-100 mb-2">404</p>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Page not found
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          This page doesn't exist. If you were looking for a specific
          APOD, check that the date format is correct (YYYY-MM-DD) and
          that it's after June 16, 1995 — when NASA started the program.
        </p>

        <Link
          href="/"
          className="text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors inline-block"
        >
          View today's image
        </Link>

      </div>
    </div>
  )
}