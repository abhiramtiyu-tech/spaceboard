import Link from 'next/link'

export default function APODNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-semibold text-gray-100 mb-2">404</p>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          No image for this date
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          NASA's APOD program started on June 16, 1995. The date you
          entered either doesn't exist or is in the future.
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