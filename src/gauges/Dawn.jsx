import { Face, TapBar } from '../Face.jsx'

// The sun's climb is the whole session, from first light to high morning.
// Each rep makes it blaze: its halo swells with the hold and fades at rest.
// Zenith and horizon from night to high morning: slate, not violet, warming
// through a dull rose-brown glow to apricot and a pale washed blue.
const SKY = [
  [0, '#0d131e', '#1c2533'],
  [0.3, '#16223a', '#5e4447'],
  [0.55, '#2a4262', '#c9744d'],
  [0.8, '#5a82a8', '#eeb271'],
  [1, '#8fb3d0', '#f5d9a8'],
]
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (a, b, t) => {
  const [x, y] = [hex(a), hex(b)]
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(' ')})`
}
function sky(s) {
  let i = 0
  while (i < SKY.length - 2 && s > SKY[i + 1][0]) i++
  const [s0, z0, h0] = SKY[i]
  const [s1, z1, h1] = SKY[i + 1]
  const t = Math.min(1, Math.max(0, (s - s0) / (s1 - s0)))
  return [mix(z0, z1, t), mix(h0, h1, t)]
}

// The sky is printed in hard bands, tighter towards the horizon, like a woodblock.
const BANDS = [0, 0.14, 0.3, 0.46, 0.62, 0.8, 1]
const EDGES = [40, 49, 57, 65, 74, 85]
function bands(zenith, horizon) {
  const stops = BANDS.map((t, i) => {
    const c = `color-mix(in oklab, ${zenith} ${Math.round(t * 100)}%, ${horizon})`
    return `${c} ${i ? EDGES[i - 1] : 0}% ${EDGES[i] ?? 100}%`
  })
  return `linear-gradient(to top, ${stops.join(', ')})`
}

const sunAt = (s) => 30 + 56 * s

export default function Dawn({ g }) {
  const s = Math.min(1, g.session)
  const [zenith, horizon] = sky(0.12 + 0.88 * s)
  const flare = g.phase === 'hold' || g.phase === 'rest' ? Math.min(g.level, 1.2) * Math.exp(-g.restMs / 3000) : 0

  return (
    <div
      className={`field dawn is-${g.phase} mode-${g.mode}${g.paused ? ' is-paused' : ''}`}
      style={{ '--zenith': zenith, '--horizon': horizon, '--bands': bands(zenith, horizon), '--sun': `${sunAt(s)}%`, '--stars': Math.max(0, 1 - s * 2.4), '--flare': flare }}
    >
      <div className="sky" aria-hidden="true">
        <div className="stars" />
        <div className="sun">
          <span className="halo" />
          {g.goalMark && g.phase !== 'ended' && <span className={`sun-goal${g.reached ? ' is-reached' : ''}`} />}
          <span className="disc" />
        </div>
        <p className="sun-label">
          {g.goalMark && g.phase !== 'ended' ? g.goalLabel : s >= 1 ? 'High morning' : ''}
        </p>
      </div>
      <svg className="hills" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true">
        <path className="hill-far" d="M0 40C60 18 110 30 170 22S290 4 400 30V160H0Z" />
        <path className="hill-mid" d="M0 70C70 44 130 62 200 50S320 36 400 58V160H0Z" />
        <path className="hill-near" d="M0 100C80 80 150 96 230 86S350 78 400 92V160H0Z" />
      </svg>
      <div className="dusk" aria-hidden="true" />
      <div className="dawn-face">
        <Face face={g.face} />
      </div>
      <TapBar tap={g.tap} />
    </div>
  )
}
