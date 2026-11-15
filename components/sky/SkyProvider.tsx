'use client'

// Shared state for the "living sky" (Today and Explore pages):
// - the selected date (drives moon, constellation, planet, starfield)
// - the time-of-day palette (visitor's local hour, or a preview override)
// - date navigation (← / →), with a pending flag while NASA data loads
//
// It also sets the --sky-* CSS variables every child styles itself with.

import {
  createContext,
  useContext,
  useMemo,
  useOptimistic,
  useState,
  useSyncExternalStore,
  useTransition,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { skyForDate, todForHour, TOD, type SkyInfo, type Tod, type Palette } from './sky'

interface SkyContextValue {
  date: string // selected APOD date, YYYY-MM-DD
  today: string // latest APOD date (US Eastern) — → is disabled here
  sky: SkyInfo
  tod: Tod // effective palette
  palette: Palette
  previewTod: Tod | null // null = live local time
  setPreviewTod: (tod: Tod | null) => void
  goToDate: (date: string) => void
  isPending: boolean // a new date's APOD is loading
}

const SkyContext = createContext<SkyContextValue | null>(null)

export function useSky() {
  const ctx = useContext(SkyContext)
  if (!ctx) throw new Error('useSky must be used inside <SkyProvider>')
  return ctx
}

// Live time-of-day from the visitor's clock, re-checked every minute.
// The server snapshot is 'night', so the server HTML and the first client
// render match; React then switches to the real local value after hydration.
function subscribeToClock(onChange: () => void) {
  const id = setInterval(onChange, 60_000)
  return () => clearInterval(id)
}
const localTod = () => todForHour(new Date().getHours())
const serverTod = (): Tod => 'night'

interface Props {
  date: string
  today: string
  className?: string
  children: ReactNode
}

export default function SkyProvider({ date, today, className = '', children }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  // Show the new date's sky immediately while the server fetches its APOD;
  // falls back to the `date` prop once navigation finishes
  const [shownDate, setShownDate] = useOptimistic(date)

  const liveTod = useSyncExternalStore(subscribeToClock, localTod, serverTod)
  const [previewTod, setPreviewTod] = useState<Tod | null>(null)
  const tod = previewTod ?? liveTod
  const palette = TOD[tod]

  const sky = useMemo(() => skyForDate(shownDate), [shownDate])

  const value: SkyContextValue = {
    date: shownDate,
    today,
    sky,
    tod,
    palette,
    previewTod,
    setPreviewTod,
    isPending,
    goToDate: (next) =>
      startTransition(() => {
        setShownDate(next)
        router.push(`${pathname}?date=${next}`, { scroll: false })
      }),
  }

  const vars = {
    '--sky-h': palette.h,
    '--sky-h2': palette.h2,
    '--sky-top': palette.top,
    '--sky-bot': palette.bot,
  } as CSSProperties

  return (
    <SkyContext.Provider value={value}>
      <div
        data-sky-page
        style={vars}
        className={`relative min-h-screen overflow-hidden bg-[#03040a] font-ui text-[#e9ebf5] ${className}`}
      >
        {children}
      </div>
    </SkyContext.Provider>
  )
}
