import { useState } from 'react'
import { mmss } from './format.js'
import { marksFor } from './progress.js'
import { BREATH_PATTERNS, patternText, routineSec } from './store.js'
import { HistoryList } from './HistoryView.jsx'
import { Field, Icon, Stepper } from './ui.jsx'

const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString()

export default function Home({ theme, look, routines, breath, setBreath, history, goal, go }) {
  const [editPattern, setEditPattern] = useState(false)
  const Gauge = theme.gauge
  const today = history.filter((h) => sameDay(h.at, Date.now()))
  const heldToday = today.reduce((s, h) => s + h.held, 0)

  // The field shows today: everything held so far against the daily stretch goal.
  const g = {
    mode: 'stretch',
    phase: 'idle',
    level: 0,
    restMs: 0,
    goalMark: false,
    marks: marksFor(50),
    session: heldToday / (goal * 1000),
    banked: heldToday / (goal * 1000),
    sessionGoal: goal * 1000,
    reps: today.slice(0, 16).map(() => ({ level: 1, state: 'done' })),
    face: { status: 'Today', whole: mmss(heldToday), frac: null, sub: today.length ? `held over ${today.length} ${today.length === 1 ? 'session' : 'sessions'}` : 'nothing yet · pick a session' },
    tap: { hint: 'Your day so far', action: `${Math.round(Math.min(1, heldToday / (goal * 1000)) * 100)}% of ${goal / 60} min` },
  }

  const custom = breath.custom
  const setCustom = (k) => (v) => setBreath({ ...breath, custom: { ...custom, [k]: v } })

  return (
    <main className="app home">
      <div className="gauge home-gauge" aria-hidden="true">
        <Gauge g={g} />
      </div>
      <section className="board home-board" aria-label="Sessions">
        <div className="menu">
          <header className="brand">
            <img src="/held-mark.svg" alt="" />
            <h1>held</h1>
          </header>
          <section>
            <h2>Stretch</h2>
            <button type="button" className="row" onClick={() => go({ name: 'stretch' })}>
              <span className="row-main">
                <strong>Free stretch</strong>
                <span>Tap to hold, tap to rest</span>
              </span>
              <Icon name="next" />
            </button>
          </section>

          <section>
            <h2>Routines</h2>
            {routines.map((r) => (
              <div className="row-pair" key={r.id}>
                <button type="button" className="row" onClick={() => go({ name: 'routine', id: r.id })}>
                  <span className="row-main">
                    <strong>{r.name}</strong>
                    <span>
                      {r.exercises.length === 1
                        ? `${r.exercises[0].reps} × ${r.exercises[0].hold} s hold, ${r.exercises[0].rest} s rest`
                        : `${r.exercises.length} exercises · ${r.exercises.reduce((s, e) => s + e.reps, 0)} holds`}
                      {' · '}
                      {mmss(routineSec(r) * 1000)}
                    </span>
                  </span>
                  <Icon name="play" />
                </button>
                <button type="button" className="row-edit" onClick={() => go({ name: 'edit', id: r.id })} aria-label={`Edit ${r.name}`}>
                  <Icon name="edit" />
                </button>
              </div>
            ))}
            <button type="button" className="row row-add" onClick={() => go({ name: 'edit', id: null })}>
              <Icon name="plus" />
              <span className="row-main">
                <strong>New routine</strong>
              </span>
            </button>
          </section>

          <section>
            <h2>Breathing</h2>
            <Field label="Length" id="len-label">
              <Stepper id="len-label" label="length" value={breath.minutes} onChange={(v) => setBreath({ ...breath, minutes: v })} min={1} max={30} format={(v) => `${v} min`} />
            </Field>
            {[...BREATH_PATTERNS, { ...custom, id: 'custom', name: 'Your pattern' }].map((p) => (
              <div className="row-pair" key={p.id}>
                <button type="button" className="row" onClick={() => go({ name: 'breath', id: p.id })}>
                  <span className="row-main">
                    <strong>{p.name}</strong>
                    <span>{patternText(p)} seconds</span>
                  </span>
                  <Icon name="play" />
                </button>
                {p.id === 'custom' && (
                  <button type="button" className="row-edit" onClick={() => setEditPattern(!editPattern)} aria-expanded={editPattern} aria-label="Edit your pattern">
                    <Icon name="edit" />
                  </button>
                )}
              </div>
            ))}
            {editPattern && (
              <div className="settings pattern-edit">
                {[
                  ['in', 'Breathe in', 1],
                  ['holdIn', 'Hold', 0],
                  ['out', 'Breathe out', 1],
                  ['holdOut', 'Hold after', 0],
                ].map(([k, label, min]) => (
                  <Field key={k} label={label} id={`p-${k}`}>
                    <Stepper id={`p-${k}`} label={label} value={custom[k]} onChange={setCustom(k)} step={0.5} min={min} max={20} format={(v) => (v ? `${v} s` : 'Off')} />
                  </Field>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2>History</h2>
            {history.length ? (
              <>
                <HistoryList items={history.slice(0, 3)} />
                {history.length > 3 && (
                  <button type="button" className="row row-link" onClick={() => go({ name: 'history' })}>
                    <span className="row-main">
                      <strong>All history</strong>
                      <span>{history.length} sessions</span>
                    </span>
                    <Icon name="next" />
                  </button>
                )}
              </>
            ) : (
              <p className="empty">Finished sessions are listed here: what you did, how long you held, how long it took.</p>
            )}
          </section>

          <section>
            <h2>Theme &amp; sound</h2>
            {look}
          </section>
        </div>
      </section>
    </main>
  )
}

