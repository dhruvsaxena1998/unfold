import { Face, TapBar } from '../Face.jsx'
import { mmss } from '../format.js'

// The staff floods with the rep; the harbour behind it rises with the whole
// session, and its swell builds as the session goes on.
const BASE = 11
const SPAN = 80
const y = (lv) => BASE + SPAN * Math.min(lv / 1.2, 1.1)

export default function Tide({ g }) {
  const live = g.phase === 'hold' || g.phase === 'rest'
  const water = live ? y(g.level) : 2.5
  const s = Math.min(g.session, 1)
  const swells = 1 + (s > 0.33) + (s > 0.66)
  const face = <Face face={g.face} />

  return (
    <div
      className={`field tide is-${g.phase}${g.paused ? ' is-paused' : ''}`}
      style={{ '--water': `${water}%`, '--sea-level': s, '--swell-h': `${10 + 26 * s}px` }}
    >
      <div className="water" aria-hidden="true">
        {Array.from({ length: swells }, (_, i) => (
          <svg key={i} className={`swell swell-${i}`} viewBox="0 0 200 12" preserveAspectRatio="none">
            <path d="M0 6 Q25 0 50 6 T100 6 T150 6 T200 6 V12 H0 Z" />
          </svg>
        ))}
        <span className="sea-mark">
          {g.session >= 1 ? 'High water' : `Session ${mmss(g.session * g.sessionGoal)} of ${mmss(g.sessionGoal)}`}
        </span>
      </div>

      <div className="staff" aria-hidden="true">
        {g.marks.map((m, i) => (
          <div
            key={m.from}
            className={`e-block${i % 2 ? ' is-red' : ''}`}
            style={{ bottom: `${y(m.from)}%`, height: `${y(m.to) - y(m.from)}%`, '--bh': y(m.to) - y(m.from) }}
          >
            <span className="e" />
            <span className="e-num">{m.sec >= 60 ? mmss(m.sec * 1000) : Math.round(m.sec * 10) / 10}</span>
          </div>
        ))}
        {g.goalMark && (
          <div className={`target-line${g.reached ? ' is-reached' : ''}`} style={{ bottom: `${y(1)}%` }}>
            <span>{g.goalLabel}</span>
          </div>
        )}
        <div className="submerged" />
        <div className="face-dry">{face}</div>
        <div className="face-wet">{face}</div>
      </div>

      <TapBar tap={g.tap} />
    </div>
  )
}
