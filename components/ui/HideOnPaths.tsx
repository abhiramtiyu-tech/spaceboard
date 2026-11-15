'use client'

// Renders children everywhere except the given paths.
// Used to hide the global Navbar on pages that draw their own header
// (the Today page). Children can still be Server Components.

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export default function HideOnPaths({ paths, children }: { paths: string[]; children: ReactNode }) {
  const pathname = usePathname()
  return paths.includes(pathname) ? null : children
}
