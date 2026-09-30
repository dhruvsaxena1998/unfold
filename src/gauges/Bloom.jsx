import { useEffect, useRef } from 'react'
import { Face, TapBar } from '../Face.jsx'
import { reducedMotion, wobble } from '../progress.js'

// Radius in viewBox units (the view is 200 across). The seed grows with the
// whole session; each rep swells it further and each rest lets it exhale back.
const SEED = 30
const GROWTH = 36
const SWELL = 16
const LAYERS = [
  { scale: 1.2, lobes: [[3, 0.05, 0.4, 0.5], [5, 0.03, 2.1, -0.7], [2, 0.03, 1, 0.3]] },
  { scale: 1.08, lobes: [[3, 0.04, 2.6, -0.4], [4, 0.03, 0.2, 0.8], [6, 0.015, 1.4, 0.6]] },
  { scale: 1, lobes: [[3, 0.035, 1.2, 0.6], [5, 0.02, 3.1, -0.9], [2, 0.025, 0.5, 0.35]] },
]

const base = (session) => SEED + GROWTH * Math.min(session, 1)

export default function Bloom({ g }) {
  const goal = useRef(SEED)
  const paths = useRef([])
  const face = useRef(null)
  const swell = g.phase === 'ended' || g.phase === 'idle' ? 0 : Math.min(g.level, 1.2) * Math.exp(-g.restMs / 4000)
  goal.current = base(g.session) + SWELL * swell

  useEffect(() => {
    const still = reducedMotion()
    let r = goal.current
    let id
    let last = performance.now()
    const frame = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      r = still ? goal.current : r + (goal.current - r) * (1 - Math.exp(-dt / 0.35))
      const t = still ? 0 : now / 1000
      const breath = still ? 1 : 1 + 0.02 * Math.sin((t * Math.PI * 2) / 10)
      LAYERS.forEach((l, i) => paths.current[i]?.setAttribute('d', wobble(r * l.scale * breath, l.lobes, t)))
      if (face.current) face.current.style.scale = String(Math.min(1.6, (r * breath) / 40))
      id = requestAnimationFrame(frame)
    }
    id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, [])

  const orbit = base(g.session) + SWELL
  return (
    <div className={`field bloom is-${g.phase}${g.paused ? ' is-paused' : ''}`}>
      <svg className="blob" viewBox="-100 -100 200 200" aria-hidden="true">
        <defs>
          <radialGradient id="blob-fill" cx="36%" cy="30%" r="80%">
            <stop offset="0" className="b0" />
            <stop offset="0.55" className="b1" />
            <stop offset="1" className="b2" />
          </radialGradient>
        </defs>
        <circle r={SEED + GROWTH + SWELL + 4} className="full-bloom" />
        {g.goalMark && g.phase !== 'ended' && (
          <g className={`orbit${g.reached ? ' is-reached' : ''}`}>
            <circle r={orbit} />
            <text y={-orbit - 3.5}>{g.goalLabel}</text>
          </g>
        )}
        {LAYERS.map((l, i) => (
          <path key={i} ref={(el) => (paths.current[i] = el)} className={`blob-${i}`} fill="url(#blob-fill)" />
        ))}
      </svg>
      <div className="bloom-face" ref={face}>
        <Face face={g.face} />
      </div>
      <TapBar tap={g.tap} />
    </div>
  )
}
