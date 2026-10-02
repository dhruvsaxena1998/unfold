import { stretchFace } from './Face.jsx'
import { mmss } from './format.js'
import { marksFor, scaleFor } from './progress.js'
import { routineSec } from './store.js'

// Every mode reduces to one gauge model the themes draw:
// phase     idle | hold | rest | ended  (colour and motion state)
// level     the current rep, 1 = its goal (target or planned hold)
// restMs    time into a rest, so gauges can exhale
// session   0..1 of the whole session's goal (live); banked counts finished holds only
// reps      [{ level, state: done | live | todo }] one per rep, for the grove
// face, tap the reading and the tap-bar text

export const SPACE = 'Tap anywhere or press Space'
export const STRETCH_ACTION = { idle: 'Start hold', hold: 'End hold', rest: 'Start next hold', ended: 'Session finished' }

export function stretchModel(s, target, goalSec) {
  const holdSec = s.hold / 1000
  const span = target || scaleFor(holdSec) / 1.2
  const live = s.phase === 'hold' || s.phase === 'rest'
  const goal = goalSec * 1000
  const finished = s.rows.reduce((sum, r, i) => (i === s.rows.length - 1 && s.phase === 'hold' ? sum : sum + r.hold), 0)
  return {
    mode: 'stretch',
    phase: s.phase,
    level: live ? holdSec / span : 0,
    restMs: s.phase === 'rest' ? s.rest : 0,
    goalMark: target > 0,
    goalLabel: target > 0 && s.hold >= target * 1000 ? 'Target reached' : `Target ${target} s`,
    reached: target > 0 && s.hold >= target * 1000,
    marks: marksFor(span),
    session: s.holdTotal / goal,
    banked: finished / goal,
    sessionGoal: goal,
    reps: s.rows.map((r, i) => ({
      level: r.hold / 1000 / (target || 30),
      state: i === s.rows.length - 1 && s.phase === 'hold' ? 'live' : 'done',
    })),
    face: stretchFace({ phase: s.phase, hold: s.hold, rest: s.rest, repNo: s.rows.length }),
    tap: {
      hint: s.phase === 'ended' ? '' : SPACE,
      action: STRETCH_ACTION[s.phase],
    },
  }
}

const secs = (ms) => String(Math.ceil(ms / 1000 - 1e-6))

function repsOf(run, match, perRep) {
  const reps = []
  run.segs.forEach((seg, k) => {
    if (!match(seg)) return
    const state = k < run.i || run.status === 'done' ? (run.log[k] != null ? 'done' : 'todo') : k === run.i && run.status === 'running' ? 'live' : 'todo'
    reps.push({ k, seg, state })
  })
  return reps.map(perRep)
}

export function routineModel(run, routine, now) {
  const seg = run.seg
  const ex = routine.exercises[seg.ex] ?? routine.exercises.at(-1)
  const goal = routine.exercises.reduce((s, e) => s + e.hold * e.reps, 0) * 1000
  const e = run.elapsed(now)
  const left = run.remaining(now)
  const held = run.held(now)
  const finishedHeld = held - (run.status === 'running' && seg.kind === 'hold' ? e : 0)
  const paused = run.pausedAt != null

  // Level of the most recent hold, kept through the rest that follows it.
  let lastHold = 0
  for (let k = run.i; k >= 0; k--)
    if (run.segs[k].kind === 'hold') {
      lastHold = k === run.i ? e / (seg.dur * 1000) : (run.log[k] ?? 0) / (run.segs[k].dur * 1000)
      break
    }

  const status = run.status
  const kind = status === 'ready' ? 'ready' : status === 'done' ? 'done' : seg.kind
  const phase = { ready: 'idle', lead: 'idle', hold: 'hold', rest: 'rest', gap: 'rest', wait: 'rest', done: 'ended' }[kind]
  const next = routine.exercises[seg.ex]
  const face = {
    ready: { status: routine.name, whole: mmss(routineSec(routine) * 1000), frac: null, sub: 'minutes · tap to begin' },
    lead: { status: 'Get ready', whole: secs(left), frac: null, sub: ex.name },
    hold: { status: `Rep ${seg.rep + 1} of ${ex.reps}`, whole: secs(left), frac: null, sub: 'seconds left' },
    rest: { status: 'Rest', whole: secs(left), frac: null, sub: `Next: rep ${seg.rep + 2} of ${ex.reps}` },
    gap: { status: 'Next exercise', whole: secs(left), frac: null, sub: next?.name ?? '' },
    wait: { status: `Next: ${next?.name ?? ''}`, whole: `${seg.ex + 1}/${routine.exercises.length}`, frac: null, sub: 'Tap when you are in position' },
    done: { status: 'Routine done', whole: mmss(held), frac: null, sub: 'held in total' },
  }[kind]
  if (paused) face.status = `Paused · ${face.status}`

  return {
    mode: 'routine',
    phase,
    paused,
    kind,
    level: phase === 'hold' || phase === 'rest' ? lastHold : kind === 'done' ? 1 : 0,
    restMs: phase === 'rest' ? e : 0,
    goalMark: kind === 'hold' || kind === 'lead' || kind === 'ready',
    goalLabel: `Hold ${(kind === 'hold' ? seg.dur : ex.hold)} s`,
    reached: false,
    marks: marksFor(kind === 'hold' ? seg.dur : ex.hold),
    session: held / goal,
    banked: finishedHeld / goal,
    sessionGoal: goal,
    reps: repsOf(run, (s) => s.kind === 'hold', ({ k, seg: s, state }) => ({
      state,
      level: state === 'done' ? run.log[k] / (s.dur * 1000) : state === 'live' ? e / (s.dur * 1000) : 0,
    })),
    face,
    tap: {
      hint: kind === 'done' ? '' : paused ? 'Paused' : SPACE,
      action:
        kind === 'ready' ? 'Start routine' : kind === 'done' ? 'Routine finished' : kind === 'wait' ? 'Continue' : paused ? 'Resume' : 'Pause',
    },
  }
}

const ease = (p) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, p)))

export function breathModel(run, pattern, now) {
  const seg = run.seg
  const e = run.elapsed(now)
  const left = run.remaining(now)
  const p = seg.dur ? e / (seg.dur * 1000) : 0
  const status = run.status
  const kind = status === 'ready' ? 'ready' : status === 'done' ? 'done' : seg.kind
  const paused = run.pausedAt != null
  const planned = run.segs.reduce((s, x) => (x.kind === 'lead' ? s : s + x.dur), 0) * 1000
  const total = Math.max(0, run.total(now) - (run.log[0] ?? (seg.kind === 'lead' ? e : 0)))
  const cycles = run.segs.at(-1).rep + 1
  const level = { ready: 0, lead: 0, in: ease(p), holdIn: 1, out: 1 - ease(p), holdOut: 0, done: 0 }[kind]
  const phase = { ready: 'idle', lead: 'idle', in: 'hold', holdIn: 'hold', out: 'rest', holdOut: 'rest', done: 'ended' }[kind]
  const cycle = pattern.in + pattern.holdIn + pattern.out + pattern.holdOut
  const label = { in: 'Breathe in', holdIn: 'Hold', out: 'Breathe out', holdOut: 'Hold' }
  const face = {
    ready: { status: pattern.name, whole: mmss(planned), frac: null, sub: 'minutes · tap to begin' },
    lead: { status: 'Settle in', whole: secs(left), frac: null, sub: 'breathe in first' },
    done: { status: 'Well breathed', whole: String(cycles), frac: null, sub: 'breaths' },
  }[kind] ?? { status: label[kind], whole: secs(left), frac: null, sub: `Breath ${seg.rep + 1} of ${cycles}` }
  if (paused) face.status = `Paused · ${face.status}`

  // Each breath is a rep: finished breaths are full, the current one fills through the cycle.
  const inCycle = run.segs.reduce((s, x, k) => (x.rep === seg.rep && x.kind !== 'lead' && k < run.i ? s + x.dur : s), 0) * 1000 + (kind === 'lead' ? 0 : e)
  const reps = []
  for (let c = 0; c < cycles; c++) {
    const state = status === 'done' || c < seg.rep ? 'done' : c === seg.rep && kind !== 'lead' && status === 'running' ? 'live' : 'todo'
    reps.push({ state, level: state === 'done' ? 1 : state === 'live' ? inCycle / (cycle * 1000) : 0 })
  }

  return {
    mode: 'breath',
    phase,
    paused,
    kind,
    level,
    restMs: 0,
    goalMark: false,
    goalLabel: '',
    reached: false,
    marks: marksFor(pattern.in, { block: 1, max: 1 }),
    session: kind === 'done' ? 1 : total / planned,
    banked: kind === 'done' ? 1 : total / planned,
    sessionGoal: planned,
    reps,
    face,
    tap: {
      hint: kind === 'done' ? '' : paused ? 'Paused' : SPACE,
      action: kind === 'ready' ? 'Begin' : kind === 'done' ? 'Session finished' : paused ? 'Resume' : 'Pause',
    },
  }
}
