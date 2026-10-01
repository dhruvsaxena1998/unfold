import { mmss } from './format.js'
import { marksFor } from './progress.js'
import { isBreath, patternText, routineSec } from './store.js'
import { HistoryList } from './HistoryView.jsx'
import { Icon } from './ui.jsx'

const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString()

const summary = (r) =>
  (isBreath(r)
    ? `Breathe ${patternText(r.pattern)} s`
    : r.exercises.length === 1
      ? `${r.exercises[0].reps} × ${r.exercises[0].hold} s hold, ${r.exercises[0].rest} s rest`
      : `${r.exercises.length} exercises · ${r.exercises.reduce((s, e) => s + e.reps, 0)} holds`) +
  ` · ${mmss(routineSec(r) * 1000)}`

function RoutineRow({ r, go }) {
  return (
    <button type="button" className="row" onClick={() => go({ name: 'routine', id: r.id })}>
      <span className="row-main">
        <strong>{r.name}</strong>
        <span>{summary(r)}</span>
      </span>
      <Icon name="play" />
    </button>
  )
}

export default function Home({ theme, look, routines, history, goal, go }) {
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

  return (
    <main className="app home">
      <div className="gauge home-gauge" aria-hidden="true">
        <Gauge g={g} />
      </div>
      <section className="board home-board" aria-label="Sessions">
        <div className="menu">
          <header className="brand">
            <svg viewBox="232 212 560 600" aria-hidden="true">
              <rect x="292" y="640" width="440" height="150" rx="56" fill="currentColor" />
              <rect x="292" y="468" width="440" height="150" rx="56" fill="currentColor" />
              <rect x="292" y="252" width="440" height="150" rx="56" fill="#e04a2a" transform="rotate(-9 292 402)" />
            </svg>
            <h1>unfold</h1>
          </header>
          <section>
            <h2>Routines</h2>
            <button type="button" className="row" onClick={() => go({ name: 'stretch' })}>
              <span className="row-main">
                <strong>Free stretch</strong>
                <span>Tap to hold, tap to rest</span>
              </span>
              <Icon name="play" />
            </button>
            {routines.map((r) => (
              <div className="row-pair" key={r.id}>
                <RoutineRow r={r} go={go} />
                <button type="button" className="row-edit" onClick={() => go({ name: 'edit', id: r.id })} aria-label={`Edit ${r.name}`}>
                  <Icon name="edit" />
                </button>
              </div>
            ))}
            <button type="button" className="row row-add" onClick={() => go({ name: 'edit', id: null })}>
              <Icon name="plus" />
              <span className="row-main">
                <strong>New routine</strong>
                <span>Your own holds or breathing, kept on this device</span>
              </span>
            </button>
          </section>

          <section>
            <h2>History</h2>
            {history.length ? (
              <>
                <HistoryList items={history.slice(0, 3)} />
                <button type="button" className="row row-link" onClick={() => go({ name: 'history' })}>
                  <span className="row-main">
                    <strong>All history</strong>
                    <span>
                      {history.length} {history.length === 1 ? 'session' : 'sessions'} · view or delete
                    </span>
                  </span>
                  <Icon name="next" />
                </button>
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

