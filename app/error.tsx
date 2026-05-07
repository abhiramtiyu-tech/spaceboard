'use client'
// MUST be 'use client' — Error Boundaries are a client React concept
// Next.js will throw a build error if you forget this

import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  // digest is a hash Next.js adds in production
  // it lets you match client errors to server logs
  // without exposing sensitive error details to users

  reset: () => void
  // reset() re-renders the page segment that failed
  // it's like a "try again" button — retries the failed render
}

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    // Log to your error tracking service here
    // e.g. Sentry.captureException(error)
    // For now just console.error
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          We couldn't load the astronomy data. NASA's API may be
          temporarily unavailable.
        </p>

        {/* Error detail — only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs font-mono text-red-400 bg-red-50 rounded-lg px-3 py-2 mb-6 text-left break-all">
            {error.message}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={reset}
            className="text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Go home
          </a>
        </div>

      </div>
    </div>
  )
}