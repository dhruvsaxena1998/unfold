import { useCallback, useEffect, useRef, useState } from 'react'

// phase: idle -> hold <-> rest -> ended
export function useSession() {
  const [phase, setPhase] = useState('idle')
  const [reps, setReps] = useState([]) // { start, end? }
  const [endedAt, setEndedAt] = useState(null)
  const [now, setNow] = useState(() => performance.now())
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  useEffect(() => {
    if (phase !== 'hold' && phase !== 'rest') return
    let id
    const tick = () => {
      setNow(performance.now())
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [phase])

  const toggle = useCallback(() => {
    const t = performance.now()
    setNow(t)
    const p = phaseRef.current
    if (p === 'idle' || p === 'rest') {
      setReps((r) => [...r, { start: t }])
      setPhase('hold')
    } else if (p === 'hold') {
      setReps((r) => r.map((rep, i) => (i === r.length - 1 ? { ...rep, end: t } : rep)))
      setPhase('rest')
    }
  }, [])

  const finish = useCallback(() => {
    const t = performance.now()
    setNow(t)
    setEndedAt(t)
    setReps((r) => r.map((rep, i) => (i === r.length - 1 && rep.end == null ? { ...rep, end: t } : rep)))
    setPhase('ended')
  }, [])

  const clear = useCallback(() => {
    setReps([])
    setEndedAt(null)
    setPhase('idle')
  }, [])

  const at = phase === 'ended' ? endedAt : now
  const last = reps[reps.length - 1]
  const rows = reps.map((rep, i) => ({
    hold: (rep.end ?? at) - rep.start,
    rest: reps[i + 1] ? reps[i + 1].start - rep.end : phase === 'rest' && i === reps.length - 1 ? at - rep.end : null,
  }))

  return {
    phase,
    rows,
    hold: last ? (last.end ?? at) - last.start : 0,
    rest: phase === 'rest' ? at - last.end : 0,
    lastRest: reps.length > 1 ? reps.at(-1).start - reps.at(-2).end : null,
    total: reps.length ? at - reps[0].start : 0,
    holdTotal: rows.reduce((sum, r) => sum + r.hold, 0),
    toggle,
    finish,
    clear,
  }
}
