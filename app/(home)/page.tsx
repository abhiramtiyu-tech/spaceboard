// Today page ("Living sky") — the home route `/`.
//
// Server Component: fetches the APOD server-side with our NASA key.
// `/?date=YYYY-MM-DD` shows an earlier day (the ← / → buttons navigate there).
//
// Why the (home) route group? The root app/loading.tsx spinner would
// otherwise replace the whole page — sky included — every time the date
// changes. Inside the group, the sky stays mounted and the hero shows
// "Tuning in to NASA…" while the next day loads.

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import type { APOD } from '@/types/nasa'
import { getAPODByDate, getTodayAPOD } from '@/lib/nasa'
import { easternDate, isValidApodDate } from '@/lib/dates'
import { plexMono, skyFontVariables } from '@/lib/fonts'
import SkyProvider from '@/components/sky/SkyProvider'
import SkyBackground from '@/components/sky/SkyBackground'
import SiteHeader from '@/components/ui/SiteHeader'
import TodayHero from '@/components/today/TodayHero'
import SkyFacts from '@/components/today/SkyFacts'

export const metadata: Metadata = {
  title: 'Today',
  description: 'NASA Astronomy Picture of the Day — explore the cosmos daily',
}

interface Props {
  searchParams: Promise<{ date?: string | string[] }>
}

export default async function HomePage({ searchParams }: Props) {
  const { date: param } = await searchParams
  const today = easternDate()
  const requested = typeof param === 'string' ? param : undefined

  // Bad or future dates → plain home page
  if (requested !== undefined && !isValidApodDate(requested, today)) {
    redirect('/')
  }

  // If NASA is down we render the "no entry" state instead of throwing —
  // the page still works and the sky is still drawn for the date.
  let apod: APOD | null
  let date: string
  if (requested) {
    date = requested
    apod = await getAPODByDate(requested).catch((err) => {
      console.error(`Could not load APOD for ${requested}:`, err)
      return null
    })
  } else {
    apod = await getTodayAPOD().catch((err) => {
      console.error('Could not load today\'s APOD:', err)
      return null
    })
    // Today's entry may not be published yet — then this is yesterday's
    date = apod?.date ?? today
  }

  return (
    <SkyProvider date={date} today={today} className={skyFontVariables}>
      <SkyBackground labelFont={plexMono.style.fontFamily} />

      <div className="relative z-[1] mx-auto max-w-[1320px] px-[clamp(18px,4vw,48px)] pb-20">
        <SiteHeader active="/" />
        <TodayHero apod={apod} />
        <SkyFacts />
      </div>
    </SkyProvider>
  )
}
