import { useEffect, useRef } from 'react'
import { breathPlan, routinePlan, useRunner } from './runner.js'
import { breathModel, routineModel } from './model.js'
import { mmss } from './format.js'
import { patternText } from './store.js'
import { Icon, SessionShell, useMedia, useSpace, useWakeLock } from './ui.jsx'

const TICKED = new Set(['lead', 'hold', 'rest', 'gap'])

// Routines and breathing: the clock runs itself; you only pause, skip or adjust.
export default function AutoRun({ kind, routine, pattern, minutes, theme, look, feedback, onSave, onHome }) {
  const isBreath = kind === 'breath'
  const compact = useMedia('(max-width: 760px)')
  const saved = useRef(false)
  const title = isBreath ? pattern.name : routine.name

  const save = (r, now, early) => {
    if (saved.current || r.status === 'ready') return
    const held = isBreath ? r.total(now) : r.held(now)
    if (held < 1000) return
    saved.current = true
    const reps = r.log.filter((ms, k) => ms > 0 && (isBreath ? r.segs[k].kind === 'in' : r.segs[k].kind === 'hold')).length
    onSave({ kind, title, reps, held, duration: r.total(now), done: !early })
  }

  const run = useRunner(
    () => (isBreath ? breathPlan(pattern, minutes) : routinePlan(routine)),
    (e, r) => {
      if (e.type === 'done') {
        feedback('finish')
        save(r, performance.now(), e.early)
        return
      }
      if (e.type !== 'enter') return
      const k = e.seg.kind
      if (k === 'hold' || k === 'in') feedback('start', { quiet: k === 'in' })
      else if (k === 'rest' || k === 'gap' || k === 'wait' || k === 'out') feedback('stop', { quiet: k === 'out' })
    },
  )
  const r = run.r
  const now = run.now
  const g = isBreath ? breathModel(r, pattern, now) : routineModel(r, routine, now)
  const Gauge = theme.gauge
  const running = r.status === 'running'
  const paused = r.pausedAt != null

  useWakeLock(running)

  // Soft ticks through the last three seconds of every timed step.
  const tick = useRef({ i: -1, n: 0 })
  useEffect(() => {
    if (!running || paused || !TICKED.has(r.seg.kind)) return
    const n = Math.ceil(r.remaining(now) / 1000)
    if (tick.current.i !== r.i) tick.current = { i: r.i, n: Math.ceil(r.seg.dur) + 1 }
    if (n < tick.current.n) {
      tick.current.n = n
      if (n >= 1 && n <= 3) feedback('tick', { final: n === 1 })
    }
  })

  const latest = useRef(() => {})
  latest.current = () => save(r, performance.now(), true)
  useEffect(() => () => latest.current(), [])

  const main = () => {
    if (r.status === 'ready') {
      feedback('tap')
      return run.start()
    }
    if (r.status === 'done') return
    if (r.seg.kind === 'wait') return run.cont()
    feedback('tap')
    paused ? run.resume() : run.pause()
  }
  useSpace(main)

  const again = () => {
    saved.current = false
    run.reset()
  }

  const kindNow = g.kind
  const action =
    kindNow === 'ready' ? (isBreath ? 'Begin' : 'Start routine') : kindNow === 'done' ? 'Again' : kindNow === 'wait' ? 'Continue' : paused ? 'Resume' : 'Pause'
  const state = paused
    ? 'Paused'
    : {
        ready: 'Ready',
        lead: 'Get ready',
        hold: 'Holding',
        rest: 'Resting',
        gap: 'Next up',
        wait: 'Your pace',
        in: 'Breathe in',
        holdIn: 'Hold',
        out: 'Breathe out',
        holdOut: 'Hold',
        done: isBreath ? 'Done' : 'Routine done',
      }[kindNow]

  // Time still to run: this step plus every timed step after it.
  const left =
    r.status === 'done' ? 0 : (r.remaining(now) ?? 0) + r.segs.slice(r.status === 'ready' ? 0 : r.i + 1).reduce((s, x) => s + (x.dur ?? 0) * 1000, 0)
  const seg = r.seg
  const ex = routine?.exercises[seg.ex]

  const figures = isBreath ? (
    <dl className="figures">
      <div className={`fig fig-rest${running ? ' is-live' : ''}`}>
        <dt>Breath</dt>
        <dd>
          {r.status === 'ready' ? '–' : seg.rep + 1}
          <small> of {r.segs.at(-1).rep + 1}</small>
        </dd>
      </div>
      <div className="fig">
        <dt>Left</dt>
        <dd>{mmss(left)}</dd>
      </div>
      <div className="fig">
        <dt>Pattern</dt>
        <dd className="small-dd">{patternText(pattern)}</dd>
      </div>
      <div className="fig fig-held">
        <dt>Breathed</dt>
        <dd>{mmss(Math.max(0, g.session * g.sessionGoal))}</dd>
      </div>
    </dl>
  ) : (
    <dl className="figures">
      <div className={`fig fig-rest fig-ex${running ? ' is-live' : ''}`}>
        <dt>
          Exercise {seg.ex + 1} of {routine.exercises.length}
        </dt>
        <dd>{ex?.name}</dd>
      </div>
      <div className="fig">
        <dt>Rep</dt>
        <dd>
          {r.status === 'ready' ? '–' : seg.kind === 'gap' || seg.kind === 'wait' ? 0 : seg.rep + 1}
          <small> / {ex?.reps}</small>
        </dd>
      </div>
      <div className="fig">
        <dt>Left</dt>
        <dd>{mmss(left)}</dd>
      </div>
      <div className="fig fig-held">
        <dt>Held</dt>
        <dd>
          {mmss(r.held(now))}
          <small> / {mmss(g.sessionGoal)}</small>
        </dd>
      </div>
    </dl>
  )

  // Routine step controls hold their place before and after the run, so
  // starting it changes no layout; they only work while it runs.
  const controls = !isBreath && (
    <div className="controls" role="group" aria-label="Step controls">
      <button type="button" onClick={() => (feedback('tap'), run.back())} disabled={!running}>
        <Icon name="prev" />
        Back
      </button>
      <button type="button" onClick={() => (feedback('tap'), run.extend(10))} disabled={!running || seg.kind !== 'hold'}>
        <Icon name="plus" />
        10 s
      </button>
      <button type="button" onClick={() => (feedback('tap'), run.skip())} disabled={!running}>
        <Icon name="skip" />
        Skip
      </button>
    </div>
  )

  const plan = isBreath ? (
    <div className="plan">
      <h2>{pattern.name}</h2>
      <ul>
        {[
          ['Breathe in', pattern.in],
          ['Hold', pattern.holdIn],
          ['Breathe out', pattern.out],
          ['Hold', pattern.holdOut],
        ]
          .filter(([, v]) => v)
          .map(([name, v], i) => (
            <li key={i}>
              <span>{name}</span>
              <span className="num">{v} s</span>
            </li>
          ))}
      </ul>
    </div>
  ) : (
    <div className="plan">
      <h2>{theme.log}</h2>
      <ol>
        {routine.exercises.map((x, i) => {
          const done = r.status === 'done' || i < seg.ex
          const current = running && i === seg.ex
          const reps = r.segs.filter((s, k) => s.kind === 'hold' && s.ex === i && r.log[k] != null).length
          return (
            <li key={x.id} className={current ? 'is-current' : done ? 'is-done' : ''}>
              <span>{x.name}</span>
              <span className="plan-dots" aria-label={`${reps} of ${x.reps} reps done`}>
                {Array.from({ length: x.reps }, (_, k) => (
                  <i key={k} className={k < reps ? 'is-on' : ''} />
                ))}
              </span>
              <span className="num">
                {x.hold}/{x.rest} s
              </span>
            </li>
          )
        })}
      </ol>
      {routine.waitBetween && routine.exercises.length > 1 && <p className="empty">Waits for your tap between exercises.</p>}
    </div>
  )

  const end = (
    <div className="secondary">
      <button type="button" onClick={() => run.finish()} disabled={!running}>
        End session
      </button>
      <button type="button" onClick={onHome}>
        {r.status === 'done' ? 'Home' : 'Leave'}
      </button>
    </div>
  )

  return (
    <SessionShell
      phaseClass={`is-${g.phase}${paused ? ' is-paused' : ''}`}
      compact={compact}
      title={title}
      onHome={onHome}
      gauge={<Gauge g={g} />}
      onField={r.status === 'done' ? undefined : main}
      fieldDisabled={r.status === 'done'}
      fieldLabel={action}
      board={({ openSheet }) => (
        <>
          <p className="state" aria-live="polite">
            {state}
          </p>
          {figures}
          {compact ? (
            <div className={`quick${isBreath ? '' : ' quick-wide'}`}>
              {r.status === 'done' ? (
                <button type="button" className="more is-new" onClick={again}>
                  <Icon name="again" />
                  Again
                </button>
              ) : running && !isBreath ? (
                <>
                  <button type="button" className="more" onClick={() => (feedback('tap'), run.back())}>
                    <Icon name="prev" />
                    Back
                  </button>
                  <button type="button" className="more" onClick={() => (feedback('tap'), run.extend(10))} disabled={seg.kind !== 'hold'}>
                    <Icon name="plus" />
                    10 s
                  </button>
                  <button type="button" className="more" onClick={() => (feedback('tap'), run.skip())}>
                    <Icon name="skip" />
                    Skip
                  </button>
                </>
              ) : (
                <button type="button" className="more" onClick={main}>
                  <Icon name={paused || r.status === 'ready' ? 'play' : 'pause'} />
                  {action}
                </button>
              )}
              <button type="button" className="more" onClick={openSheet}>
                <Icon name="more" />
                More
              </button>
            </div>
          ) : (
            <>
              <button type="button" className={`primary${running && !paused ? ' is-running' : ''}`} onClick={r.status === 'done' ? again : main}>
                {action}
                <span className="hint">{r.status === 'done' ? 'run it once more' : 'or tap anywhere · Space'}</span>
              </button>
              {controls}
              <div className="extras">
                {plan}
                {end}
                {look}
              </div>
            </>
          )}
        </>
      )}
      sheet={({ close }) => (
        <>
          <header className="sheet-head">
            <p>{title}</p>
            <button type="button" onClick={close}>
              Done
            </button>
          </header>
          {plan}
          {end}
          <div className="sheet-look">
            <h2>Theme &amp; sound</h2>
            {look}
          </div>
        </>
      )}
    />
  )
}
