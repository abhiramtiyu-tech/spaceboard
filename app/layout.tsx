// No "use client" here — this is a Server Component by default
// Server Components render on the server — no JavaScript sent to browser
// for this file itself. Only the interactive children get JS.

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/ui/Navbar'

// next/font automatically optimises fonts — downloads at build time,
// no layout shift, no extra network request from the browser
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Static metadata — same for every page
// generateMetadata() in individual pages overrides this
export const metadata: Metadata = {
  title: {
    // %s is replaced by page-specific titles
    // e.g. "The Tarantula Nebula | Spaceboard"
    template: '%s | Spaceboard',
    default: 'Spaceboard — NASA APOD Explorer',
  },
  description: 'Explore NASA\'s Astronomy Picture of the Day archive. Browse, save and analyse cosmic imagery from 1995 to today.',
  openGraph: {
    title: 'Spaceboard — NASA APOD Explorer',
    description: 'Explore NASA\'s Astronomy Picture of the Day archive.',
    type: 'website',
    // When someone shares your site on Slack/Twitter, this image shows
    images: ['/og-image.png'],
  },
  // Tells crawlers they can index all pages
  robots: {
    index: true,
    follow: true,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Navbar is a Server Component — no useState, no useEffect */}
        {/* It renders on server and ships as plain HTML */}
        <Navbar />

        {/* children is whatever page.tsx or layout.tsx is active */}
        {/* Next.js injects it here automatically */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}