// Date helpers for APOD dates ("YYYY-MM-DD" strings).
// All maths is done in UTC so server and client always agree.

export const APOD_START = '1995-06-16'

// "Today" for APOD means today in US Eastern time — NASA publishes at
// midnight ET. Returns YYYY-MM-DD, `daysBack` days before today (ET).
export function easternDate(daysBack = 0): string {
  const d = new Date(Date.now() - daysBack * 86400000)
  // en-CA formats as YYYY-MM-DD
  return d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

function toUTC(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

// Real calendar date, in YYYY-MM-DD format, between APOD's start and `today`
export function isValidApodDate(date: string, today = easternDate()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  // Round-trip rejects impossible dates like 2026-02-31
  if (toUTC(date).toISOString().slice(0, 10) !== date) return false
  return date >= APOD_START && date <= today
}

// shiftDate('2026-11-15', -1) → '2026-11-14'
export function shiftDate(date: string, days: number): string {
  const d = toUTC(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// '2026-11-15' → 'Sunday, November 15, 2026'
export function formatLongDate(date: string): string {
  return toUTC(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// '2026-11-15' → 'Sunday'
export function weekdayName(date: string): string {
  return toUTC(date).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
}
