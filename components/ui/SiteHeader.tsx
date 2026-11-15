// "Living sky" site header: logo, nav pill, login.
// Shared by the redesigned pages (Today, Explore). Server Component — just
// links, using the same routes as the global Navbar.

import Link from 'next/link'

const NAV = [
  { href: '/', label: 'Today' },
  { href: '/explore', label: 'Explore' },
  { href: '/dashboard', label: 'Dashboard' },
] as const

export type NavHref = (typeof NAV)[number]['href']

export default function SiteHeader({ active }: { active?: NavHref }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-[22px]">
      <Link
        href="/"
        className="flex items-center gap-2.5 font-display text-[26px] text-[#e9ebf5] hover:text-sky-accent"
      >
        <span
          aria-hidden
          className="size-2.5 rounded-full bg-sky-accent"
          style={{ boxShadow: '0 0 14px oklch(0.86 0.11 var(--sky-h, 265))' }}
        />
        Spaceboard
      </Link>

      <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-[rgba(8,10,20,0.55)] p-[5px] backdrop-blur-[14px]">
        {NAV.map(({ href, label }) => {
          const isActive = href === active
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`rounded-full px-4 py-2 text-sm ${
                isActive ? 'bg-white/10 text-white' : 'text-[#b4b9cf] hover:text-sky-accent'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <Link
        href="/login"
        className="rounded-full border border-white/[0.22] px-5 py-[9px] text-sm font-semibold text-[#e9ebf5] transition-colors hover:bg-white hover:text-[#03040a]"
      >
        Login
      </Link>
    </header>
  )
}
