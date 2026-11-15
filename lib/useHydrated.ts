import { useSyncExternalStore } from 'react'

// false during SSR and the first (hydration) render, true afterwards.
// Use it before showing anything read from localStorage (e.g. persisted
// Zustand stores), so the server HTML and first client render match.
const noopSubscribe = () => () => {}

export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}
