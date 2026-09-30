import { clock, fine, tenth } from './format.js'

// Count-up reading for the manual stretch timer.
export function stretchFace({ phase, hold, rest, repNo }) {
  const resting = phase === 'rest'
  const value = resting ? rest : hold
  const text = resting ? fine(rest) : `${clock(hold)}.${tenth(hold)}`
  const [whole, frac] = value < 60000 ? text.split('.') : [clock(value), null]
  const status = { idle: 'Ready', hold: `Hold ${repNo}`, rest: 'Resting', ended: `Last hold · ${repNo}` }[phase]
  const sub = resting ? `Hold ${repNo} was ${fine(hold)} s` : value >= 60000 ? 'minutes : seconds' : 'seconds'
  return { whole, frac, status, sub }
}

// The big reading: status line, numeral, unit line.
export function Face({ face }) {
  const { whole, frac, status, sub } = face
  return (
    <div className="face">
      <p className="face-status">{status}</p>
      <p className="numeral" style={{ '--chars': whole.length + (frac ? 0.52 : 0) }}>
        {whole}
        {frac && <span className="numeral-tenth">.{frac}</span>}
      </p>
      <p className="face-unit">{sub}</p>
    </div>
  )
}

export function TapBar({ tap }) {
  return (
    <p className="tapbar" aria-hidden="true">
      <span>{tap.hint}</span>
      <strong>{tap.action}</strong>
    </p>
  )
}
