import { Face, TapBar } from '../Face.jsx'
import { mmss } from '../format.js'

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

export default function Vessel({ g }) {
  const top = bottleY(g.banked)
  const wetPct = ((H - top) / H) * 100
  const holding = g.phase === 'hold'
  // Breathing fills and empties the glass with each breath; timed reps pour it out at rest.
  const cup = g.phase === 'idle' || g.phase === 'ended' ? CUP_FLOOR + 2 : g.mode === 'breath' || holding ? cupY(g.level) : CUP_FLOOR + 2
  const quarter = g.sessionGoal / 4

  return (
    <div className={`field vessel is-${g.phase} mode-${g.mode}${g.paused ? ' is-paused' : ''}`}>
      <div className="vessel-scene">
        <div className="bottle" style={{ '--wet': `${wetPct}%` }}>
          <svg viewBox="0 0 100 190" aria-hidden="true">
            <defs>
              <clipPath id="inside">
                <path d={INSIDE} />
              </clipPath>
              <linearGradient id="water-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" className="w0" />
                <stop offset="1" className="w1" />
              </linearGradient>
            </defs>
            <path d={GLASS} className="glass" />
            <g clipPath="url(#inside)">
              <g className="bottle-water" style={{ '--top': `${top}px` }}>
                <rect x="0" y="0" width="100" height="200" fill="url(#water-fill)" />
                <path d={WAVE} className="wave" fill="url(#water-fill)" />
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
            <rect x="35.5" y="3" width="29" height="13" rx="2.5" className="cap" />
            <path d="M40 6V13M45 6V13M50 6V13M55 6V13M60 6V13" className="cap-ridge" />
          </svg>
          <div className="face-dry">
            <Face face={g.face} />
          </div>
          <div className="face-wet">
            <Face face={g.face} />
          </div>
        </div>

        <div className="cup">
          <svg viewBox="0 0 60 90" aria-hidden="true">
            <defs>
              <clipPath id="cup-in">
                <path d={CUP_IN} />
              </clipPath>
            </defs>
            <path d={CUP} className="glass" />
            <g clipPath="url(#cup-in)">
              <g className="cup-water" style={{ '--top': `${cup}px` }}>
                <rect x="0" y="0" width="60" height="100" fill="url(#water-fill)" />
                <path d={WAVE} className="wave" fill="url(#water-fill)" transform="scale(0.6 1)" />
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
