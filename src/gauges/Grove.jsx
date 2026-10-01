import { Face, TapBar } from '../Face.jsx'

// A garden bed. Every rep plants a sapling at the front that grows while you
// hold; the tree behind grows through the whole session and leafs out, then
// blossoms when the session goal is met. Drawn in a 300 x 300 box.
const BASE_X = 150
const BASE_Y = 248
const TRUNK = 150

// Seeded so the tree has the same shape every time.
const rand = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const BRANCHES = [
  { at: 0.34, side: -1, angle: 58, len: 58, th: 0.12 },
  { at: 0.42, side: 1, angle: 54, len: 62, th: 0.2 },
  { at: 0.55, side: -1, angle: 46, len: 54, th: 0.32 },
  { at: 0.62, side: 1, angle: 42, len: 56, th: 0.42 },
  { at: 0.74, side: -1, angle: 34, len: 42, th: 0.54 },
  { at: 0.8, side: 1, angle: 30, len: 44, th: 0.64 },
  { at: 0.9, side: -1, angle: 20, len: 30, th: 0.74 },
  { at: 0.94, side: 1, angle: 18, len: 28, th: 0.8 },
]

const LEAVES = []
BRANCHES.forEach((b, bi) => {
  for (let k = 0; k < 5; k++) {
    const t = 0.35 + k * 0.16
    LEAVES.push({ b: bi, t, th: Math.min(0.98, b.th + 0.04 + k * 0.035 + rand(bi * 7 + k) * 0.03), turn: (k % 2 ? 1 : -1) * (30 + rand(bi * 3 + k) * 25), size: 0.8 + rand(bi + k * 11) * 0.5, tone: (bi + k) % 3 })
  }
})
for (let k = 0; k < 9; k++) LEAVES.push({ b: -1, t: k, th: 0.1 + k * 0.1, turn: -90 + (k - 4) * 28, size: 0.9 + rand(k + 50) * 0.4, tone: k % 3 })

const clamp = (v) => Math.min(1, Math.max(0, v))
const DEG = 180 / Math.PI

// A point and heading along a quadratic curve.
function along([s, c, e], t) {
  const u = 1 - t
  return {
    x: u * u * s[0] + 2 * u * t * c[0] + t * t * e[0],
    y: u * u * s[1] + 2 * u * t * c[1] + t * t * e[1],
    rot: Math.atan2(2 * u * (c[1] - s[1]) + 2 * t * (e[1] - c[1]), 2 * u * (c[0] - s[0]) + 2 * t * (e[0] - c[0])) * DEG,
  }
}

// A tapered limb along a quadratic: wide at the trunk, fine at the tip.
function limb([s, c, e], base, tip) {
  const dx = e[0] - s[0]
  const dy = e[1] - s[1]
  const l = Math.hypot(dx, dy) || 1
  const [nx, ny] = [-dy / l, dx / l]
  const side = (k) => [s[0] + nx * base * k, s[1] + ny * base * k, c[0] + nx * base * 0.5 * k, c[1] + ny * base * 0.5 * k, e[0] + nx * tip * k, e[1] + ny * tip * k]
  const [a, b] = [side(0.5), side(-0.5)]
  const f = (v) => v.toFixed(2)
  return `M${f(a[0])} ${f(a[1])}Q${f(a[2])} ${f(a[3])} ${f(a[4])} ${f(a[5])}L${f(b[4])} ${f(b[5])}Q${f(b[2])} ${f(b[3])} ${f(b[0])} ${f(b[1])}Z`
}

// The trunk leans a little as it grows and flares into the soil; branches leave
// it flatter than they end, so every limb curves up towards the light.
function tree(grow) {
  const h = 16 + TRUNK * grow
  const lean = 5 * grow
  const bx = BASE_X
  const by = BASE_Y
  const w = 2.2 + 5.8 * grow
  const top = [bx + lean, by - h]
  const trunk = `M${bx - w * 1.9} ${by}Q${bx - w * 0.9} ${by - 1} ${bx - w * 0.85} ${by - h * 0.1}Q${bx - w * 0.5 + lean * 0.2} ${by - h * 0.6} ${top[0] - 0.7} ${top[1]}L${top[0] + 0.7} ${top[1]}Q${bx + w * 0.5 + lean * 0.2} ${by - h * 0.6} ${bx + w * 0.85} ${by - h * 0.1}Q${bx + w * 0.9} ${by - 1} ${bx + w * 1.9} ${by}Z`
  const bark = `M${bx - w * 0.42} ${by - h * 0.06}Q${bx - w * 0.3 + lean * 0.2} ${by - h * 0.5} ${bx + lean * 0.55 - 0.4} ${by - h * 0.82}`
  const branches = BRANCHES.map((b) => {
    const p = clamp((grow - b.th) / 0.22)
    const s = [bx + lean * b.at * b.at, by - h * b.at]
    const a = (b.angle / DEG) * b.side
    const out = Math.sign(a) * Math.min(80 / DEG, Math.abs(a) * 1.45)
    const len = b.len * p * (0.6 + 0.4 * grow)
    const c = [s[0] + Math.sin(out) * len * 0.5, s[1] - Math.cos(out) * len * 0.5]
    const e = [s[0] + Math.sin(a) * len, s[1] - Math.cos(a) * len]
    return { p, curve: [s, c, e], width: 0.9 + 2.6 * grow * (1 - b.at * 0.6) * (0.4 + 0.6 * p) }
  })
  return { h, top, trunk, bark, branches, w }
}

function leafAt(leaf, t) {
  if (leaf.b < 0) {
    const [x, y] = t.top
    return { x: x + (leaf.t - 4) * 3, y: y + 2 + Math.abs(leaf.t - 4) * 1.6, rot: leaf.turn }
  }
  const p = along(t.branches[leaf.b].curve, leaf.t)
  return { ...p, rot: p.rot + leaf.turn }
}

const LEAF = 'M0 0C3 -4.5 9 -5.2 14 0C9 5.2 3 4.5 0 0Z'
const PETALS = [0, 72, 144, 216, 288]

// A leaf opens from a folded, pale bud to full size and colour as growth passes
// its threshold. Driven by the clock, so no transition: the value is live.
function Leaf({ open, size, tone }) {
  if (open <= 0) return null
  return (
    <g transform={`rotate(${(1 - open) * -55}) scale(${(0.25 + 0.75 * open) * size})`}>
      <g className="leaf-f">
        <path d={LEAF} className={`leaf tone-${tone}`} style={{ '--young': 1 - open }} />
      </g>
    </g>
  )
}

function Flower({ r = 3, i }) {
  return (
    <g className="flower" style={{ '--i': i }}>
      {PETALS.map((a) => (
        <ellipse key={a} cx={r * 0.62} rx={r * 0.62} ry={r * 0.42} transform={`rotate(${a})`} className="petal" />
      ))}
      <circle r={r * 0.36} className="blossom-eye" />
    </g>
  )
}

function Sapling({ x, level, state, i }) {
  const lv = Math.min(1, level)
  const h = 4 + 22 * lv
  const y = 280
  const pairs = [
    [0.3, 0.42],
    [0.6, 0.72],
  ]
  const opened = (at) => clamp((lv - at) / 0.14)
  return (
    <g className={`sapling is-${state}`} transform={`translate(${x} ${y})`}>
      <g className="planted" style={{ '--i': Math.min(i, 12) }}>
        <ellipse rx="7" ry="2.2" className="plot" />
        {state !== 'todo' && (
          <>
            <path d={`M0 0Q${lv * 2} ${-h / 2} 0 ${-h}`} className="stem" />
            {pairs.map(([at, pos]) => (
              <g key={at} transform={`translate(${lv * 0.9} ${-h * pos})`}>
                <g transform="rotate(-30)">
                  <Leaf open={opened(at)} size={0.55} tone={1} />
                </g>
                <g transform="rotate(-150) scale(1 -1)">
                  <Leaf open={opened(at)} size={0.55} tone={0} />
                </g>
              </g>
            ))}
            <g transform={`translate(0 ${-h})`}>
              <g transform="rotate(-90)">
                <Leaf open={opened(0.82)} size={0.6} tone={2} />
              </g>
              <g className={`pop${level >= 1 ? ' is-on' : ''}`}>
                <circle r="2.6" className="bud" />
                <circle r="1" className="bud-eye" />
              </g>
            </g>
          </>
        )}
      </g>
    </g>
  )
}

export default function Grove({ g }) {
  const s = Math.min(1, g.session)
  const grow = 1 - Math.pow(1 - s, 1.5)
  const t = tree(grow)
  const shown = g.reps.slice(-16)
  const span = 232
  const step = shown.length > 1 ? Math.min(22, span / (shown.length - 1)) : 0
  const start = BASE_X - (step * (shown.length - 1)) / 2
  const blooming = g.session >= 1
  let flowers = 0

  return (
    <div className={`field grove is-${g.phase} mode-${g.mode}${g.paused ? ' is-paused' : ''}${blooming ? ' is-blooming' : ''}`}>
      <div className="grove-face">
        <Face face={g.face} />
        {g.goalMark && g.phase !== 'ended' && <p className="grove-goal">{g.goalLabel}</p>}
      </div>
      <svg className="garden" viewBox="0 0 300 300" aria-hidden="true">
        <path d="M6 270C56 236 244 236 294 270L294 290Q150 306 6 290Z" className="bed" />
        <path d="M6 270C56 236 244 236 294 270" className="grass" />
        <g className="canopy">
          {t.branches.map((b, i) => (b.p > 0 ? <path key={i} d={limb(b.curve, b.width, 0.35)} className="branch" /> : null))}
          <path d={t.trunk} className="trunk" />
          <path d={t.bark} className="bark" style={{ strokeWidth: 0.4 + t.w * 0.14 }} />
          {/* The growing tip: a seedling's first pair, until the crown takes over */}
          <g transform={`translate(${t.top[0]} ${t.top[1] + 1})`} className="tip" style={{ opacity: clamp((0.3 - grow) / 0.12) }}>
            <g transform="rotate(-35)">
              <Leaf open={1} size={0.75} tone={1} />
            </g>
            <g transform="rotate(-145) scale(1 -1)">
              <Leaf open={1} size={0.75} tone={0} />
            </g>
          </g>
          {LEAVES.map((leaf, i) => {
            const open = clamp((grow - leaf.th) / 0.05)
            if (open <= 0) return null
            const p = leafAt(leaf, t)
            const flower = i % 3 === 0 && open >= 1
            return (
              <g key={i} transform={`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.rot.toFixed(1)})`} style={{ '--f': i }}>
                <Leaf open={open} size={leaf.size} tone={leaf.tone} />
                {flower && (
                  <g transform={`translate(${12 * leaf.size} 0)`}>
                    <Flower i={flowers++} />
                  </g>
                )}
              </g>
            )
          })}
        </g>
        {blooming && (
          <g className="falling">
            {[[-46, 0], [38, 3.2], [-12, 6.1], [58, 8.4]].map(([x, delay], i) => (
              <g key={i} transform={`translate(${BASE_X + x} ${BASE_Y - t.h * 0.75})`}>
                <ellipse rx="1.9" ry="1.2" className="petal" style={{ animationDelay: `${delay}s` }} />
              </g>
            ))}
          </g>
        )}
        {shown.map((r, i) => (
          <Sapling key={g.reps.length - shown.length + i} i={i} x={start + step * i} level={r.level} state={r.state} />
        ))}
      </svg>
      <TapBar tap={g.tap} />
    </div>
  )
}
