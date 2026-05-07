// Server Component — no interactivity needed for the nav links
// Links are just anchor tags — no onClick, no state

import Link from 'next/link'
import { headers } from 'next/headers'

// Why headers()? We read the current pathname to highlight active link
// headers() is a dynamic function — it opts this component into
// dynamic rendering (not cached). Fine for a navbar.

export default async function Navbar() {
  // We'll add session check here in Phase 6 (auth)
  // For now, just the navigation structure

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo — always links to home */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-sm text-gray-900"
        >
          {/* Simple dot — represents a star/planet */}
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          Spaceboard
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Today
          </Link>
          <Link
            href="/explore"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {/* Auth section — Login for now, avatar after Phase 6 */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Login
          </Link>
        </div>

      </div>
    </nav>
  )
}