'use client'

export default function APODError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load image
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Could not fetch this APOD. The NASA API may be temporarily unavailable.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs font-mono text-red-400 bg-red-50 rounded px-3 py-2 mb-6">
            {error.message}
          </p>
        )}
        <button
          onClick={reset}
          className="text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}