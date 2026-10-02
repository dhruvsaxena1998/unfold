import { useEffect, useRef } from 'react'
import { useSession } from './useSession.js'
import { STRETCH_ACTION, stretchModel } from './model.js'
import { clock, fine, mmss } from './format.js'
import { usePref } from './store.js'
import { ArmedButton, Field, Icon, SessionShell, Stepper, useMedia, useSpace, useWakeLock } from './ui.jsx'

// Free stretch: tap to hold, tap to rest, as long as you like.
export default function StretchRun({ theme, look, feedback, onSave, onHome }) {
  const s = useSession()
  const [target, setTarget] = usePref('target', 0)
  const [goal, setGoal] = usePref('goal', 180)
  const chimed = useRef(-1)
  const saved = useRef(false)
  const compact = useMedia('(max-width: 760px)')
  const repNo = s.rows.length
  const live = s.phase === 'hold' || s.phase === 'rest'
  const g = stretchModel(s, target, goal)
  const Gauge = theme.gauge

  useWakeLock(live)

  useEffect(() => {
    if (s.phase === 'hold' && g.reached && chimed.current !== repNo) {
      chimed.current = repNo
      feedback('target')
    }
  })

  const save = () => {
    if (saved.current || !s.rows.length) return
    saved.current = true
    onSave({ kind: 'stretch', title: 'Free stretch', reps: s.rows.length, held: s.holdTotal, duration: s.total, done: true })
  }

  // Leaving mid-session still records what was done.
  const latest = useRef(save)
  latest.current = save
  useEffect(() => () => latest.current(), [])

  const toggle = () => {
    if (s.phase === 'ended') return
    feedback(s.phase === 'hold' ? 'stop' : 'start')
    s.toggle()
  }
  const finish = () => {
    feedback('finish')
    s.finish()
    save()
  }
  const reset = () => {
    chimed.current = -1
    saved.current = false
    s.clear()
  }
  useSpace(toggle)

  const action = s.phase === 'ended' ? 'New session' : STRETCH_ACTION[s.phase]
  const restShown = s.phase === 'rest' ? s.rest : s.lastRest
  const maxHold = Math.max(1, ...s.rows.map((r) => r.hold))

  const settings = (
    <>
      <Field label="Target hold" id="target-label">
        <Stepper id="target-label" label="target" value={target} onChange={setTarget} step={5} max={180} format={(v) => (v ? `${v} s` : 'Off')} />
      </Field>
      <Field label="Session goal" id="goal-label">
        <Stepper id="goal-label" label="goal" value={goal} onChange={setGoal} step={60} min={60} max={1800} format={(v) => `${v / 60} min`} />
      </Field>
    </>
  )

  const log = (
    <div className="table">
      <h2>{theme.log}</h2>
      {s.rows.length === 0 ? (
        <p className="empty">Each hold is logged here with the rest that followed it.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Rep</th>
              <th scope="col" className="col-strip">Hold</th>
              <th scope="col" className="num"><span className="sr-only">Hold time</span></th>
              <th scope="col" className="num">Rest</th>
            </tr>
          </thead>
          <tbody>
            {s.rows
              .map((r, i) => (
                <tr key={i} className={i === s.rows.length - 1 && live ? 'is-current' : ''}>
                  <td>{i + 1}</td>
                  <td className="col-strip">
                    <span className={`strip${target && r.hold < target * 1000 ? ' is-short' : ''}`} style={{ width: `${(r.hold / maxHold) * 100}%` }} />
                  </td>
                  <td className="num">{clock(r.hold)} s</td>
                  <td className="num rest">{r.rest != null ? `${fine(r.rest)} s` : '–'}</td>
                </tr>
              ))
              .reverse()}
          </tbody>
        </table>
      )}
    </div>
  )

  const endButtons = (
    <div className="secondary">
      <button type="button" onClick={finish} disabled={!live}>
        Finish session
      </button>
      <ArmedButton onConfirm={reset} disabled={s.phase === 'idle'} armedLabel="Tap again to clear">
        Clear
      </ArmedButton>
    </div>
  )

  return (
    <SessionShell
      phaseClass={`is-${s.phase}`}
      compact={compact}
      title="Free stretch"
      onHome={onHome}
      gauge={<Gauge g={g} />}
      onField={toggle}
      fieldDisabled={s.phase === 'ended'}
      fieldLabel={action}
      board={({ openSheet }) => (
        <>
          <p className="state" aria-live="polite">
            {{ idle: 'Ready', hold: 'Holding', rest: 'Resting', ended: 'Session done' }[s.phase]}
          </p>
          <dl className="figures">
            <div className={`fig fig-rest${s.phase === 'rest' ? ' is-live' : ''}`}>
              <dt>{s.phase === 'rest' ? 'Rest' : 'Last rest'}</dt>
              <dd>
                {restShown == null ? '–' : fine(restShown)}
                {restShown != null && restShown < 60000 && <small> s</small>}
              </dd>
            </div>
            <div className="fig">
              <dt>Session</dt>
              <dd>{mmss(s.total)}</dd>
            </div>
            <div className="fig">
              <dt>Reps</dt>
              <dd>{repNo}</dd>
            </div>
            <div className="fig fig-held">
              <dt>Held</dt>
              <dd>
                {mmss(s.holdTotal)}
                <small> / {goal / 60}m</small>
              </dd>
            </div>
          </dl>
          {compact ? (
            <div className="quick">
              {s.phase === 'ended' ? (
                <button type="button" className="more is-new" onClick={reset}>
                  <Icon name="again" />
                  New
                </button>
              ) : (
                <button type="button" className="more" onClick={finish} disabled={!live}>
                  <Icon name="stop" />
                  Finish
                </button>
              )}
              <button type="button" className="more" onClick={openSheet}>
                <Icon name="list" />
                Log
              </button>
            </div>
          ) : (
            <>
              <button type="button" className="primary" onClick={s.phase === 'ended' ? reset : toggle}>
                {action}
                <span className="hint">{s.phase === 'ended' ? 'clears this log' : 'or tap anywhere · Space'}</span>
              </button>
              <div className="extras">
                <div className="settings">{settings}</div>
                {log}
                {endButtons}
                {look}
              </div>
            </>
          )}
        </>
      )}
      sheet={({ close }) => (
        <>
          <header className="sheet-head">
            <p>
              {repNo} {repNo === 1 ? 'rep' : 'reps'} · {mmss(s.holdTotal)} held
            </p>
            <button type="button" onClick={close}>
              Done
            </button>
          </header>
          <div className="settings">{settings}</div>
          {log}
          {endButtons}
          <div className="sheet-look">
            <h2>Theme &amp; sound</h2>
            {look}
          </div>
        </>
      )}
    />
  )
}
