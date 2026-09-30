import { useEffect, useReducer, useRef } from 'react'

// Automatic sessions (routines and breathing) as a list of timed segments.
// kinds: lead, hold, rest, gap (between exercises), wait (until a tap),
// in, holdIn, out, holdOut. A segment with dur null waits for continue().

export function routinePlan(r) {
  const segs = [{ kind: 'lead', dur: 5, ex: 0, rep: 0 }]
  r.exercises.forEach((e, ex) => {
    for (let rep = 0; rep < e.reps; rep++) {
      segs.push({ kind: 'hold', dur: e.hold, ex, rep })
      const lastRep = rep === e.reps - 1
      if (!lastRep) segs.push({ kind: 'rest', dur: e.rest, ex, rep })
      else if (ex < r.exercises.length - 1)
        segs.push(r.waitBetween ? { kind: 'wait', dur: null, ex: ex + 1, rep: 0 } : { kind: 'gap', dur: r.transition, ex: ex + 1, rep: 0 })
    }
  })
  return segs
}

export function breathPlan(p, minutes) {
  const cycle = p.in + p.holdIn + p.out + p.holdOut
  const cycles = Math.max(1, Math.round((minutes * 60) / cycle))
  const segs = [{ kind: 'lead', dur: 3, rep: 0 }]
  for (let rep = 0; rep < cycles; rep++) {
    segs.push({ kind: 'in', dur: p.in, rep })
    if (p.holdIn) segs.push({ kind: 'holdIn', dur: p.holdIn, rep })
    segs.push({ kind: 'out', dur: p.out, rep })
    if (p.holdOut) segs.push({ kind: 'holdOut', dur: p.holdOut, rep })
  }
  return segs
}

export class Runner {
  constructor(segs) {
    this.segs = segs.map((s) => ({ ...s }))
    this.status = 'ready' // ready | running | done
    this.i = 0
    this.log = [] // actual ms spent in each finished segment, by index
  }

  get seg() {
    return this.segs[this.i]
  }

  start(now) {
    this.status = 'running'
    this.startedAt = now
    this.segStart = now
    this.pausedAt = null
    this.pausedMs = 0
    return [{ type: 'enter', seg: this.seg }]
  }

  elapsed(now) {
    if (this.status === 'ready') return 0
    if (this.status === 'done') return this.log[this.segs.length - 1] ?? 0
    return (this.pausedAt ?? now) - this.segStart
  }

  remaining(now) {
    const s = this.seg
    return s?.dur == null ? null : Math.max(0, s.dur * 1000 - this.elapsed(now))
  }

  // Wall time since start, not counting pauses.
  total(now) {
    if (this.status === 'ready') return 0
    const end = this.status === 'done' ? this.endedAt : (this.pausedAt ?? now)
    return end - this.startedAt - this.pausedMs
  }

  held(now) {
    const done = this.log.reduce((s, ms, i) => (this.segs[i].kind === 'hold' ? s + ms : s), 0)
    return done + (this.status === 'running' && this.seg.kind === 'hold' ? this.elapsed(now) : 0)
  }

  advance(at) {
    const events = []
    this.log[this.i] = at - this.segStart
    events.push({ type: 'leave', seg: this.seg })
    this.i++
    this.segStart = at
    if (this.i >= this.segs.length) {
      this.status = 'done'
      this.i = this.segs.length - 1
      this.endedAt = at
      events.push({ type: 'done' })
    } else events.push({ type: 'enter', seg: this.seg })
    return events
  }

  tick(now) {
    const events = []
    while (this.status === 'running' && this.pausedAt == null && this.seg.dur != null) {
      const end = this.segStart + this.seg.dur * 1000
      if (now < end) break
      events.push(...this.advance(end))
    }
    return events
  }

  pause(now) {
    if (this.status === 'running' && this.pausedAt == null) this.pausedAt = now
  }

  resume(now) {
    if (this.pausedAt == null) return
    this.segStart += now - this.pausedAt
    this.pausedMs += now - this.pausedAt
    this.pausedAt = null
  }

  skip(now) {
    if (this.status !== 'running') return []
    const at = this.pausedAt ?? now
    const events = this.advance(at)
    if (this.pausedAt != null) this.pausedAt = at
    return events
  }

  // Back: restart this segment, or if just begun, the previous hold.
  back(now) {
    if (this.status !== 'running') return []
    const at = this.pausedAt ?? now
    let j = this.i
    if (this.elapsed(now) < 2000 || this.seg.kind !== 'hold') {
      for (let k = this.i - 1; k >= 0; k--)
        if (this.segs[k].kind === 'hold') {
          j = k
          break
        }
    }
    this.i = j
    this.log.length = j
    this.segStart = at
    return [{ type: 'enter', seg: this.seg }]
  }

  extend(sec) {
    if (this.seg?.dur != null) this.seg.dur += sec
  }

  finish(now) {
    if (this.status !== 'running') return []
    const at = this.pausedAt ?? now
    this.log[this.i] = at - this.segStart
    this.pausedAt = null
    this.status = 'done'
    this.endedAt = at
    return [{ type: 'done', early: true }]
  }
}

// React wrapper: ticks every frame while running and hands events to onEvent.
export function useRunner(makeSegs, onEvent) {
  const ref = useRef(null)
  ref.current ??= new Runner(makeSegs())
  const [, bump] = useReducer((n) => n + 1, 0)
  const handler = useRef(onEvent)
  handler.current = onEvent
  const r = ref.current

  const emit = (events) => {
    events.forEach((e) => handler.current(e, r))
    bump()
  }

  useEffect(() => {
    if (r.status !== 'running') return
    let id
    const frame = () => {
      const now = performance.now()
      const events = r.tick(now)
      if (events.length) events.forEach((e) => handler.current(e, r))
      bump()
      id = requestAnimationFrame(frame)
    }
    id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, [r, r.status])

  const now = () => performance.now()
  return {
    r,
    now: now(),
    start: () => emit(r.start(now())),
    pause: () => emit((r.pause(now()), [])),
    resume: () => emit((r.resume(now()), [])),
    skip: () => emit(r.skip(now())),
    back: () => emit(r.back(now())),
    extend: (s) => emit((r.extend(s), [])),
    finish: () => emit(r.finish(now())),
    cont: () => emit(r.skip(now())),
    reset: () => {
      ref.current = new Runner(makeSegs())
      bump()
    },
  }
}
