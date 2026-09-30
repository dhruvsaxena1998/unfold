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

function tree(grow) {
  const h = 16 + TRUNK * grow
  const top = [BASE_X, BASE_Y - h]
  const w = 3 + 6 * grow
  const trunk = `M${BASE_X - w} ${BASE_Y}Q${BASE_X - w * 0.5} ${BASE_Y - h * 0.5} ${BASE_X - 1} ${top[1]}L${BASE_X + 1} ${top[1]}Q${BASE_X + w * 0.5} ${BASE_Y - h * 0.5} ${BASE_X + w} ${BASE_Y}Z`
  const branches = BRANCHES.map((b) => {
    const p = clamp((grow - b.th) / 0.22)
    const sx = BASE_X
    const sy = BASE_Y - h * b.at
    const a = ((b.angle * Math.PI) / 180) * b.side
    const len = b.len * p * (0.6 + 0.4 * grow)
    return { p, sx, sy, ex: sx + Math.sin(a) * len, ey: sy - Math.cos(a) * len, a, width: 1 + 2.4 * grow * (1 - b.at * 0.6) }
  })
  return { h, top, trunk, branches }
}

function leafAt(leaf, t) {
  if (leaf.b < 0) {
    const [x, y] = t.top
    return { x: x + (leaf.t - 4) * 3, y: y + 2 + Math.abs(leaf.t - 4) * 1.6, rot: leaf.turn }
  }
  const b = t.branches[leaf.b]
  return { x: b.sx + (b.ex - b.sx) * leaf.t, y: b.sy + (b.ey - b.sy) * leaf.t, rot: (b.a * 180) / Math.PI - 90 + leaf.turn }
}

const LEAF = 'M0 0C3 -4.5 9 -5.2 14 0C9 5.2 3 4.5 0 0Z'

function Sapling({ x, level, state }) {
  const lv = Math.min(1, level)
  const h = 4 + 22 * lv
  const y = 280
  const pairs = [
    [0.3, 0.42],
    [0.6, 0.72],
  ]
  return (
    <g className={`sapling is-${state}`} transform={`translate(${x} ${y})`}>
      <ellipse rx="7" ry="2.2" className="plot" />
      {state !== 'todo' && (
        <>
          <path d={`M0 0Q${lv * 2} ${-h / 2} 0 ${-h}`} className="stem" />
          {pairs.map(([at, pos]) => (
            <g key={at} transform={`translate(0 ${-h * pos})`}>
              <g className={`pop${lv >= at ? ' is-on' : ''}`}>
                <path d={LEAF} transform="rotate(-30) scale(0.55)" className="leaf tone-1" />
                <path d={LEAF} transform="rotate(-150) scale(0.55)" className="leaf tone-0" />
              </g>
            </g>
          ))}
          <g transform={`translate(0 ${-h})`}>
            <g className={`pop${lv >= 0.85 ? ' is-on' : ''}`}>
              <path d={LEAF} transform="rotate(-90) scale(0.6)" className="leaf tone-2" />
            </g>
            <g className={`pop${level >= 1 ? ' is-on' : ''}`}>
              <circle r="2.6" className="bud" />
              <circle r="1" className="bud-eye" />
            </g>
          </g>
        </>
      )}
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

  return (
    <div className={`field grove is-${g.phase}${g.paused ? ' is-paused' : ''}`}>
      <div className="grove-face">
        <Face face={g.face} />
        {g.goalMark && g.phase !== 'ended' && <p className="grove-goal">{g.goalLabel}</p>}
      </div>
      <svg className="garden" viewBox="0 0 300 300" aria-hidden="true">
        <path d="M6 270C56 236 244 236 294 270L294 290Q150 306 6 290Z" className="bed" />
        <path d="M6 270C56 236 244 236 294 270" className="grass" />
        <g className="canopy">
          {t.branches.map((b, i) =>
            b.p > 0 ? <path key={i} d={`M${b.sx} ${b.sy}L${b.ex} ${b.ey}`} className="branch" style={{ strokeWidth: b.width }} /> : null,
          )}
          <path d={t.trunk} className="trunk" />
          {LEAVES.map((leaf, i) => {
            const p = leafAt(leaf, t)
            return (
              <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`}>
                <g className={`pop${grow >= leaf.th ? ' is-on' : ''}`}>
                  <path d={LEAF} transform={`scale(${leaf.size})`} className={`leaf tone-${leaf.tone}`} />
                  {i % 3 === 0 && (
                    <g className={`pop blossom${g.session >= 1 ? ' is-on' : ''}`} transform="translate(12 0)">
                      <circle r="3" />
                      <circle r="1.1" className="blossom-eye" />
                    </g>
                  )}
                </g>
              </g>
            )
          })}
        </g>
        {shown.map((r, i) => (
          <Sapling key={g.reps.length - shown.length + i} x={start + step * i} level={r.level} state={r.state} />
        ))}
      </svg>
      <TapBar tap={g.tap} />
    </div>
  )
}
