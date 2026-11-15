// "Living sky" maths and canvas drawing for the Today page.
// Ported from the design prototype (Spaceboard Today.dc.html).
//
// Everything except the time-of-day palette is derived from the selected
// APOD date, so it's deterministic — the same on server and client.

// ─── Data ──────────────────────────────────────────────────────────────

type Point = [number, number]
export type Zodiac = [name: string, paths: Point[][]]

// Stylised zodiac stick figures, coordinates in a 0–1 box
const ZOD: Zodiac[] = [
  ['Capricornus', [[[.05, .2], [.35, .35], [.7, .3], [.95, .15], [.75, .6], [.5, .85], [.05, .2]]]],
  ['Aquarius', [[[.05, .3], [.3, .25], [.5, .3], [.6, .2], [.7, .3], [.9, .25]], [[.5, .3], [.45, .6], [.6, .9]], [[.45, .6], [.2, .8]]]],
  ['Pisces', [[[.9, .1], [.8, .3], [.6, .55], [.3, .85], [.1, .6], [.05, .4]], [[.9, .1], [.97, .02], [.85, .02], [.9, .1]]]],
  ['Aries', [[[.08, .62], [.45, .42], [.8, .38], [.93, .5]]]],
  ['Taurus', [[[.05, .1], [.3, .35], [.48, .55], [.62, .78]], [[.95, .15], [.68, .4], [.48, .55]]]],
  ['Gemini', [[[.2, .08], [.25, .4], [.2, .7], [.1, .92]], [[.6, .1], [.6, .42], [.62, .72], [.72, .95]], [[.25, .4], [.6, .42]]]],
  ['Cancer', [[[.5, .1], [.5, .45], [.2, .9]], [[.5, .45], [.85, .8]]]],
  ['Leo', [[[.62, .15], [.75, .08], [.85, .2], [.78, .38], [.7, .55], [.85, .7], [.3, .72], [.08, .6], [.35, .48], [.7, .55]]]],
  ['Virgo', [[[.1, .3], [.35, .4], [.55, .38], [.75, .2], [.95, .1]], [[.35, .4], [.4, .65], [.25, .9]], [[.55, .38], [.65, .62], [.85, .8]]]],
  ['Libra', [[[.5, .1], [.15, .4], [.3, .85]], [[.5, .1], [.85, .45], [.75, .9]], [[.15, .4], [.85, .45]]]],
  ['Scorpius', [[[.9, .05], [.8, .15], [.72, .3], [.6, .42], [.5, .58], [.42, .75], [.3, .88], [.15, .85], [.08, .72], [.15, .62]]]],
  ['Sagittarius', [[[.2, .5], [.4, .35], [.6, .4], [.75, .55], [.65, .75], [.35, .78], [.2, .5]], [[.4, .35], [.5, .15], [.6, .4]], [[.75, .55], [.92, .5]]]],
]

// Day in month m when sign ZOD[m + 1] begins
const ZCUT = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22]

export interface Planet {
  n: string
  c?: string // light colour
  d?: string // dark colour
  sun?: boolean
  moon?: boolean
  bands?: boolean
  ring?: boolean
}

// Weekday namesake bodies, indexed by getUTCDay() (0 = Sunday)
const PLANETS: Planet[] = [
  { n: 'Sun', c: '#ffd98a', d: '#e08a2a', sun: true },
  { n: 'Moon', moon: true },
  { n: 'Mars', c: '#e0855c', d: '#3a1208' },
  { n: 'Mercury', c: '#b9b2a8', d: '#1c1a18' },
  { n: 'Jupiter', c: '#e6c7a2', d: '#2a1a10', bands: true },
  { n: 'Venus', c: '#f1dfb0', d: '#3a2c12' },
  { n: 'Saturn', c: '#e6d2a6', d: '#2b2110', ring: true },
]

export type Tod = 'dawn' | 'day' | 'dusk' | 'night'

export interface Palette {
  h: number
  h2: number
  top: string
  bot: string
  label: string
}

export const TOD: Record<Tod, Palette> = {
  dawn: { h: 20, h2: 70, top: '#070916', bot: '#23122a', label: 'Dawn' },
  day: { h: 230, h2: 200, top: '#06101f', bot: '#0e2742', label: 'Day' },
  dusk: { h: 320, h2: 50, top: '#080716', bot: '#22102a', label: 'Dusk' },
  night: { h: 265, h2: 290, top: '#03040a', bot: '#080a18', label: 'Deep night' },
}

export function todForHour(hr: number): Tod {
  if (hr >= 5 && hr < 8) return 'dawn'
  if (hr >= 8 && hr < 17) return 'day'
  if (hr >= 17 && hr < 20) return 'dusk'
  return 'night'
}

// ─── Sky for a date ────────────────────────────────────────────────────

const MOON_NAMES = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
]

export interface SkyInfo {
  p: number // moon phase, 0 = new, .5 = full
  lit: number // fraction illuminated
  moonName: string
  zod: Zodiac
  planet: Planet
  seed: number // YYYYMMDD — seeds the starfield
}

// date: 'YYYY-MM-DD'
export function skyForDate(date: string): SkyInfo {
  const [y, mo, d] = date.split('-').map(Number)
  const m = mo - 1

  const noon = Date.UTC(y, m, d, 12)
  let p = ((noon - Date.UTC(2000, 0, 6, 18, 14)) / 864e5 / 29.530588853) % 1
  if (p < 0) p += 1
  const lit = (1 - Math.cos(2 * Math.PI * p)) / 2

  const zi = (d >= ZCUT[m] ? m + 1 : m) % 12
  const weekday = new Date(Date.UTC(y, m, d)).getUTCDay()

  return {
    p,
    lit,
    moonName: MOON_NAMES[Math.round(p * 8) % 8],
    zod: ZOD[zi],
    planet: PLANETS[weekday],
    seed: Number(date.replace(/-/g, '')),
  }
}

// ─── Starfield ─────────────────────────────────────────────────────────

export interface Star {
  x: number
  y: number
  r: number
  ph: number // twinkle phase
  z: number // depth: drift speed + parallax
  warm: boolean
}

// Small seeded PRNG (mulberry32) so each date has its own sky.
// Also used by Explore's constellation layout for a stable scatter.
export function rng(seed: number) {
  let s = seed
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeStars(seed: number, count = 320): Star[] {
  const r = rng(seed)
  return Array.from({ length: count }, () => ({
    x: r(),
    y: r(),
    r: 0.3 + r() * r() * 1.6,
    ph: r() * 6.28,
    z: 0.2 + r() * 0.8,
    warm: r() < 0.15,
  }))
}

// ─── Drawing ───────────────────────────────────────────────────────────

export interface DrawFrame {
  w: number // CSS pixels
  h: number
  dpr: number
  t: number // seconds (0 when motion is off)
  mx: number // pointer, -.5 … .5 (0 when motion is off)
  my: number
  stars: Star[]
  sky: SkyInfo
  tod: Tod
  labels: boolean
  labelFont: string // CSS font-family for canvas labels
}

const LABEL = 'rgba(233,235,245,.7)'
const spaced = (s: string) => s.toUpperCase().split('').join(' ')

export function drawSky(ctx: CanvasRenderingContext2D, f: DrawFrame) {
  const { w, h, dpr, t, mx, my, stars, sky: s, tod } = f
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  // Stars — twinkle, drift right, parallax against the pointer
  const dim = tod === 'day' ? 0.6 : 1
  for (const st of stars) {
    const x = (((st.x * w + t * st.z * 3 - mx * 40 * st.z) % w) + w) % w
    const y = (((st.y * h - my * 40 * st.z) % h) + h) % h
    ctx.globalAlpha = dim * (0.35 + 0.65 * Math.abs(Math.sin(st.ph + t * (0.4 + st.z))))
    ctx.fillStyle = st.warm ? '#ffe2c0' : '#fff'
    ctx.beginPath()
    ctx.arc(x, y, st.r, 0, 6.3)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const u = Math.min(w, h)
  // Below 1100px: small constellation bottom-right, no labels — keeps text clear
  const wide = w >= 1100
  const labels = f.labels && wide
  ctx.font = `500 10px ${f.labelFont}`

  // Constellation the sun is in
  const cs = wide ? Math.max(200, u * 0.3) : 130
  const cx0 = (wide ? w * 0.5 - cs / 2 : w - cs - 24) - mx * 18
  const cy0 = (wide ? h * 0.62 : h * 0.72) - my * 18
  ctx.globalAlpha = wide ? 1 : 0.6
  ctx.strokeStyle = 'rgba(255,255,255,.22)'
  ctx.lineWidth = 1
  for (const path of s.zod[1]) {
    ctx.beginPath()
    path.forEach(([px, py], i) => {
      const x = cx0 + px * cs, y = cy0 + py * cs * 0.8
      if (i) ctx.lineTo(x, y)
      else ctx.moveTo(x, y)
    })
    ctx.stroke()
    for (const [px, py] of path) {
      ctx.fillStyle = '#fff'
      ctx.shadowColor = '#fff'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(cx0 + px * cs, cy0 + py * cs * 0.8, 2.2, 0, 6.3)
      ctx.fill()
    }
    ctx.shadowBlur = 0
  }
  if (labels) {
    ctx.fillStyle = LABEL
    ctx.fillText(spaced(s.zod[0]), cx0, cy0 + cs * 0.8 + 22)
  }
  ctx.globalAlpha = 1

  // Moon (real phase) — twice as large on Mondays
  const pl = s.planet
  const mr = u * (pl.moon ? 0.09 : 0.045)
  const mcx = w - mr * 2.2 - mx * 28
  const mcy = 76 + mr * 1.4 - my * 28
  const halo = ctx.createRadialGradient(mcx, mcy, mr, mcx, mcy, mr * 3)
  halo.addColorStop(0, `rgba(220,228,255,${0.05 + 0.22 * s.lit})`)
  halo.addColorStop(1, 'rgba(220,228,255,0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(mcx, mcy, mr * 3, 0, 6.3)
  ctx.fill()

  ctx.fillStyle = 'rgba(28,32,52,.95)'
  ctx.beginPath()
  ctx.arc(mcx, mcy, mr, 0, 6.3)
  ctx.fill()

  ctx.save()
  ctx.translate(mcx, mcy)
  let p = s.p
  if (p > 0.5) {
    // Waning — mirror horizontally
    ctx.scale(-1, 1)
    p = 1 - p
  }
  const k = Math.cos(2 * Math.PI * p)
  ctx.beginPath()
  ctx.arc(0, 0, mr, -Math.PI / 2, Math.PI / 2)
  if (k >= 0) ctx.ellipse(0, 0, mr * k, mr, 0, Math.PI / 2, -Math.PI / 2, true)
  else ctx.ellipse(0, 0, -mr * k, mr, 0, Math.PI / 2, Math.PI * 1.5, false)
  const mg = ctx.createRadialGradient(mr * 0.3, -mr * 0.3, 0, 0, 0, mr)
  mg.addColorStop(0, '#fbfaf2')
  mg.addColorStop(1, '#bfc3d2')
  ctx.fillStyle = mg
  ctx.fill()
  ctx.restore()

  if (labels) {
    ctx.fillStyle = LABEL
    ctx.textAlign = 'center'
    ctx.fillText(s.moonName.toUpperCase(), mcx, mcy + mr + 20)
    ctx.textAlign = 'left'
  }

  // Weekday's namesake body, peeking in from the bottom-left corner
  if (pl.moon) return
  const pr = pl.sun ? u * 0.16 : Math.max(120, u * 0.28)
  const px = -pr * 0.25 - mx * 60
  const py = h + pr * 0.3 - my * 60 + Math.sin(t * 0.15) * 6

  if (pl.sun) {
    const sg = ctx.createRadialGradient(px, py, pr * 0.6, px, py, pr * 3.2)
    sg.addColorStop(0, 'rgba(255,200,110,.3)')
    sg.addColorStop(1, 'rgba(255,200,110,0)')
    ctx.fillStyle = sg
    ctx.beginPath()
    ctx.arc(px, py, pr * 3.2, 0, 6.3)
    ctx.fill()
  }

  const ring = (front: boolean) => {
    ctx.save()
    ctx.translate(px, py)
    ctx.rotate(-0.35)
    ctx.strokeStyle = 'rgba(230,214,170,.55)'
    ctx.lineWidth = pr * 0.16
    ctx.beginPath()
    ctx.ellipse(0, 0, pr * 1.75, pr * 0.42, 0, front ? 0 : Math.PI, front ? Math.PI : 2 * Math.PI)
    ctx.stroke()
    ctx.restore()
  }
  if (pl.ring) ring(false)

  const pg = pl.sun
    ? ctx.createRadialGradient(px, py, 0, px, py, pr)
    : ctx.createRadialGradient(px + pr * 0.45, py - pr * 0.5, pr * 0.05, px, py, pr * 1.05)
  pg.addColorStop(0, pl.sun ? '#fff6d8' : pl.c!)
  if (!pl.sun) pg.addColorStop(0.55, pl.c!)
  pg.addColorStop(1, pl.d!)

  ctx.save()
  ctx.beginPath()
  ctx.arc(px, py, pr, 0, 6.3)
  ctx.clip()
  ctx.fillStyle = pg
  ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2)
  if (pl.bands) {
    ctx.translate(px, py)
    ctx.rotate(-0.25)
    for (let i = -4; i < 5; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(120,70,40,.28)' : 'rgba(255,240,220,.1)'
      ctx.fillRect(-pr, i * pr * 0.22, pr * 2, pr * 0.12)
    }
  }
  ctx.restore()
  if (pl.ring) ring(true)

  if (labels) {
    ctx.fillStyle = LABEL
    ctx.fillText(spaced(pl.n), 16, h - 14)
  }
}
