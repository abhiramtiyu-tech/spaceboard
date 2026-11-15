// Fonts for the "Living sky" design (Today and Explore pages).
// next/font downloads these at build time and self-hosts them —
// no request to Google from the browser, no layout shift.
//
// Each exposes a CSS variable; globals.css maps them to Tailwind
// utilities: font-display, font-ui, font-label.

import { Instrument_Serif, Manrope, IBM_Plex_Mono } from 'next/font/google'

// Display — headings, logo, fact values
export const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-instrument-serif',
})

// UI / body — variable font, so 400/500/600 are all included
export const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

// Labels — uppercase mono captions
export const plexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-plex-mono',
})

export const skyFontVariables = [
  instrumentSerif.variable,
  manrope.variable,
  plexMono.variable,
].join(' ')
