import { useLayoutEffect, useRef } from 'react'
import { Face, TapBar } from '../Face.jsx'
import { mmss } from '../format.js'
import { reducedMotion } from '../progress.js'

// The bottle is the whole session: each hold fills the small glass beside it,
// and when the hold ends the glass pours into the bottle.
const FLOOR = 177
const FULL = 66
const H = 190
const bottleY = (f) => FLOOR - (FLOOR - FULL) * Math.min(f, 1.08)

const GLASS = 'M38 14V30C38 41 10 46 10 64V166Q10 180 24 180H76Q90 180 90 166V64C90 46 62 41 62 30V14Z'
const INSIDE = 'M40.5 16V31C40.5 43 12.5 48 12.5 65V165Q12.5 177.5 25 177.5H75Q87.5 177.5 87.5 165V65C87.5 48 59.5 43 59.5 31V16Z'
const WAVE = 'M0 0Q12.5 -2.6 25 0T50 0T75 0T100 0T125 0T150 0T175 0T200 0V6H0Z'
const BUBBLES = [[24, 0], [36, 1.3], [52, 0.6], [63, 2.1], [72, 0.9], [44, 2.8], [80, 1.8], [30, 3.4]]

// Tumbler, 60 x 90: level 1 (the rep's goal) sits at CUP_GOAL.
const CUP_FLOOR = 84
const CUP_GOAL = 22
const cupY = (lv) => CUP_FLOOR - (CUP_FLOOR - CUP_GOAL) * Math.min(lv, 1.18)
const CUP = 'M6 6H54L49 84Q48.5 88 44.5 88H15.5Q11.5 88 11 84Z'
const CUP_IN = 'M8.4 8H51.6L46.9 83.4Q46.5 86 44 86H16Q13.5 86 13.1 83.4Z'

// The pour, as fractions of POUR_MS: the glass lifts to the bottle's mouth,
// tips, empties while the stream runs, then sets back down. The cap, stream,
// ripples and the bottle's rise are timed to the same beats in vessel.css.
const POUR_MS = 2800
const LIP = [6, 6] // the glass's pouring corner, in its own viewBox
const MOUTH = [50, 7] // where that corner is held, just over the bottle's neck
const REACH = 64 // how far the tipped glass rises above its lip, in glass units
// Tilt keys the whole pour. Height and sideways travel run on separate curves,
// so the glass arcs up and over the shoulder instead of cutting through it.
const TILT = [
  { offset: 0, rotate: '0deg', easing: 'cubic-bezier(0.45, 0, 0.2, 1)' },
  { offset: 0.27, rotate: '-18deg', easing: 'cubic-bezier(0.5, 0, 0.3, 1)' },
  { offset: 0.38, rotate: '-108deg', easing: 'linear' },
  { offset: 0.7, rotate: '-116deg', easing: 'cubic-bezier(0.45, 0, 0.2, 1)' },
  { offset: 1, rotate: '0deg' },
]
const RISE = ['cubic-bezier(0.1, 0.8, 0.2, 1)', 'cubic-bezier(0.5, 0, 0.3, 1)']
const ACROSS = ['cubic-bezier(0.7, 0, 0.3, 1)', 'cubic-bezier(0.2, 0.6, 0.35, 1)']
const travel = (value, [out, back]) => [
  { offset: 0, easing: out, translate: '0 0' },
  { offset: 0.27, translate: value },
  { offset: 0.7, easing: back, translate: value },
  { offset: 1, translate: '0 0' },
]

function pour(scene, glass, level, top) {
  const box = glass.parentElement
  scene.dataset.pour = ''
  for (const el of [box, glass, level, level.firstChild]) el.getAnimations().forEach((a) => a.cancel())
  const field = scene.closest('.field').getBoundingClientRect()
  const cup = glass.getBoundingClientRect()
  const bottle = scene.querySelector('.bottle svg').getBoundingClientRect()
  const k = cup.width / 60
  const lip = [cup.left + LIP[0] * k, cup.top + LIP[1] * k]
  const mouth = [bottle.left + (MOUTH[0] / 100) * bottle.width, bottle.top + (MOUTH[1] / 190) * bottle.height]
  // Shrink the glass in flight only as far as the headroom above the bottle needs.
  const scale = Math.max(0.6, Math.min(1, (mouth[1] - field.top - 4) / (REACH * k)))
  const opts = { duration: POUR_MS }
  box.animate(travel(`${mouth[0] - lip[0]}px 0`, ACROSS), opts)
  glass.animate(
    travel(`0 ${mouth[1] - lip[1]}px`, RISE).map((f, i) => ({ ...f, scale: i === 0 || i === 3 ? '1' : String(scale) })),
    opts,
  )
  glass.animate(TILT, opts)
  // The water stays level while the glass turns, then runs out over the lip.
  level.animate(TILT.map(({ offset, rotate, easing }) => ({ offset, easing, rotate: `${-parseFloat(rotate)}deg` })), opts)
  level.firstChild.animate(
    [
      { offset: 0, translate: `0 ${top}px` },
      { offset: 0.27, translate: `0 ${top}px`, easing: 'ease-in' },
      { offset: 0.38, translate: '0 -24px' },
      { offset: 0.52, translate: '0 -9px', easing: 'ease-in' },
      { offset: 0.68, translate: '0 9px' },
      { offset: 0.78, translate: `0 ${CUP_FLOOR + 2}px` },
      { offset: 1, translate: `0 ${CUP_FLOOR + 2}px` },
    ],
    opts,
  ).finished.then(() => delete scene.dataset.pour, () => {})
}

// Tapping into the next hold mid-pour sets the glass down from wherever it is.
function settle(scene, glass, level) {
  if (!('pour' in scene.dataset)) return
  delete scene.dataset.pour
  for (const el of [glass.parentElement, glass, level, level.firstChild]) {
    const now = getComputedStyle(el)
    const from = { translate: now.translate, rotate: now.rotate, scale: now.scale }
    el.getAnimations().forEach((a) => a.cancel())
    if (el !== level.firstChild) el.animate([from, { translate: '0 0', rotate: '0deg', scale: '1' }], { duration: 380, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' })
  }
}

export default function Vessel({ g }) {
  const top = bottleY(g.banked)
  const wetPct = ((H - top) / H) * 100
  const holding = g.phase === 'hold'
  // Breathing fills and empties the glass with each breath; timed reps pour it out at rest.
  const cup = g.phase === 'idle' || g.phase === 'ended' ? CUP_FLOOR + 2 : g.mode === 'breath' || holding ? cupY(g.level) : CUP_FLOOR + 2
  const quarter = g.sessionGoal / 4
  const scene = useRef(null)
  const glass = useRef(null)
  const level = useRef(null)
  const was = useRef(g.phase)
  const lastCup = useRef(cup)

  useLayoutEffect(() => {
    const from = was.current
    was.current = g.phase
    const refs = [scene.current, glass.current, level.current]
    if (from === 'hold' && (g.phase === 'rest' || g.phase === 'ended') && g.mode !== 'breath' && !reducedMotion()) pour(...refs, lastCup.current)
    else if (g.phase === 'hold') settle(...refs)
  }, [g.phase, g.mode])
  useLayoutEffect(() => {
    if (g.phase === 'hold') lastCup.current = cup
  })

  return (
    <div className={`field vessel is-${g.phase} mode-${g.mode}${g.paused ? ' is-paused' : ''}`}>
      <div className="vessel-scene" ref={scene}>
        <div className="bottle" style={{ '--wet': `${wetPct}%` }}>
          <svg viewBox="0 0 100 190" aria-hidden="true">
            <defs>
              <clipPath id="inside">
                <path d={INSIDE} />
              </clipPath>
              {/* In user space, so the wave strip shades as one body with the water under it */}
              <linearGradient id="water-fill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="200">
                <stop offset="0" className="w0" />
                <stop offset="1" className="w1" />
              </linearGradient>
            </defs>
            <path d={GLASS} className="glass" />
            <path d={`M${MOUTH[0]} ${MOUTH[1]}V${FLOOR}`} pathLength="1" className="stream" />
            <g clipPath="url(#inside)">
              <g className="bottle-water" style={{ '--top': `${top}px` }}>
                <rect x="0" y="0" width="100" height="200" fill="url(#water-fill)" />
                <path d={WAVE} className="wave" fill="url(#water-fill)" />
                <g className="splash" transform={`translate(${MOUTH[0]} 1)`}>
                  <ellipse rx="7" ry="1.5" />
                  <ellipse rx="7" ry="1.5" />
                  {[[-2.4, 14], [1.8, 22], [-0.6, 30], [2.6, 12]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r={i % 2 ? 0.8 : 1.2} />
                  ))}
                </g>
              </g>
            </g>
            <g className="marks">
              {[1, 2, 3, 4].map((q) => (
                <g key={q} transform={`translate(0 ${bottleY(q / 4)})`}>
                  <path d={q === 4 ? 'M12.5 0H24' : 'M12.5 0H18'} />
                  <text x="6" y="1.9" className={q === 4 ? 'is-goal' : ''}>{mmss(quarter * q)}</text>
                </g>
              ))}
            </g>
            <path d="M82 76V156" className="glint" />
            <g className="lid">
              <rect x="35.5" y="3" width="29" height="13" rx="2.5" className="cap" />
              <path d="M40 6V13M45 6V13M50 6V13M55 6V13M60 6V13" className="cap-ridge" />
            </g>
          </svg>
          <div className="face-dry">
            <Face face={g.face} />
          </div>
          <div className="face-wet">
            <Face face={g.face} />
          </div>
        </div>

        <div className="cup">
          <svg viewBox="0 0 60 90" aria-hidden="true" ref={glass}>
            <defs>
              <clipPath id="cup-in">
                <path d={CUP_IN} />
              </clipPath>
            </defs>
            <path d={CUP} className="glass" />
            <g clipPath="url(#cup-in)">
              <g className="cup-level" ref={level}>
                <g className="cup-water" style={{ '--top': `${cup}px` }}>
                  <rect x="-100" y="0" width="260" height="200" fill="url(#water-fill)" />
                  <path d={WAVE} className="wave" fill="url(#water-fill)" transform="scale(0.6 1)" />
                </g>
              </g>
              <g className="bubbles" style={{ '--rise': Math.max(0, CUP_FLOOR - cup - 4) }}>
                {BUBBLES.slice(0, 5).map(([x, delay], i) => (
                  <circle key={i} cx={x * 0.5 + 5} cy={CUP_FLOOR - 3} r={i % 2 ? 0.7 : 1.1} style={{ animationDelay: `${delay}s` }} />
                ))}
              </g>
            </g>
            <g className="marks">
              {g.marks.map((m) => (
                <path key={m.to} d={`M44 ${cupY(m.to)}H49`} />
              ))}
            </g>
            {g.goalMark && (
              <g className={`fill-line${g.reached ? ' is-reached' : ''}`}>
                <path d={`M9 ${CUP_GOAL}H51`} />
              </g>
            )}
          </svg>
          <p className="cup-label">{g.goalMark ? g.goalLabel : g.mode === 'breath' ? 'Breath' : 'This hold'}</p>
        </div>
      </div>
      <TapBar tap={g.tap} />
    </div>
  )
}
