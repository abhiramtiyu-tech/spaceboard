// Explore page ("Living sky") — a random selection from the APOD archive.
//
// Server Component: the first batch is fetched here with our NASA key
// (cached for 1 hour). "Shuffle the sky" fetches a fresh batch through a
// server action (./actions.ts). The sky and header are the same shared
// components the Today page uses; on Explore the sky always shows today.

import type { Metadata } from 'next'
import type { APOD } from '@/types/nasa'
import { getRandomAPODs } from '@/lib/nasa'
import { easternDate } from '@/lib/dates'
import { plexMono, skyFontVariables } from '@/lib/fonts'
import SkyProvider from '@/components/sky/SkyProvider'
import SkyBackground from '@/components/sky/SkyBackground'
import SiteHeader from '@/components/ui/SiteHeader'
import ExploreView from '@/components/explore/ExploreView'
import { EXPLORE_BATCH_SIZE } from '@/components/explore/constants'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Browse the full NASA APOD archive — thousands of astronomy images and videos since 1995',
}

export default async function ExplorePage() {
  const today = easternDate()

  // Don't let a NASA outage break the page (or a build) — ExploreView shows
  // "Picture unavailable" tiles and the visitor can shuffle to retry
  const items: APOD[] | null = await getRandomAPODs(EXPLORE_BATCH_SIZE).catch((err) => {
    console.error('Could not load Explore batch:', err)
    return null
  })

  return (
    <SkyProvider date={today} today={today} className={skyFontVariables}>
      <SkyBackground labelFont={plexMono.style.fontFamily} />

      <div className="relative z-1 mx-auto max-w-[1320px] px-[clamp(18px,4vw,48px)] pb-20">
        <SiteHeader active="/explore" />

        <section className="pt-[clamp(40px,9vh,104px)] pb-10">
          <div className="mb-4.5 font-label text-xs uppercase tracking-[0.16em] text-sky-accent">
            NASA APOD · since June 1995
          </div>
          <h1 className="m-0 font-display text-[clamp(52px,8.5vw,116px)] font-normal leading-[0.94] tracking-[-0.02em] text-balance">
            Explore the <em className="text-sky-accent italic">archive</em>
          </h1>
          <p className="mt-5.5 max-w-[44ch] text-[17px] leading-[1.55] text-pretty text-[#c3c7da]">
            Random selection from NASA&apos;s collection since June 1995.
          </p>
        </section>

        <ExploreView initialItems={items} />
      </div>
    </SkyProvider>
  )
}
