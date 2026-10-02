// Shared hold -> picture mappings for the gauges.

// Seconds on a graduated scale (Tide staff, Vessel bottle) for a hold with no
// target: it shows a minute and extends in 30 s steps for long holds.
export const scaleFor = (holdSec) => Math.max(60, Math.ceil((holdSec + 10) / 30) * 30)

// Graduation step for a scale.
const blockFor = (scale) => (scale <= 60 ? 5 : scale <= 150 ? 10 : 30)

// Closed smooth path through points (Catmull-Rom as cubic Béziers).
export function smoothPath(pts) {
  const n = pts.length
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return d + 'Z'
}

// A wobbly ring: radius r modulated by a few sine lobes.
export function wobble(r, lobes, t = 0, n = 28) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    let k = 1
    for (const [freq, amp, phase, speed] of lobes) k += amp * Math.sin(freq * a + phase + t * speed)
    pts.push([Math.cos(a) * r * k, Math.sin(a) * r * k])
  }
  return smoothPath(pts)
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// Graduations in level units (1 = the rep's goal), for staffs and glasses.
export function marksFor(spanSec, { block, max = 1.2 } = {}) {
  const scale = spanSec * max
  const step = block ?? blockFor(scale)
  const marks = []
  for (let v = 0; v + 1e-6 < scale; v += step) marks.push({ from: v / spanSec, to: Math.min(v + step, scale) / spanSec, sec: v + step })
  return marks
}
