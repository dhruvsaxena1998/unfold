import { mmss } from './format.js'
import { ArmedButton, Icon } from './ui.jsx'

const day = (at) => {
  const d = new Date(at)
  const today = new Date()
  const yesterday = new Date(Date.now() - 864e5)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}
const time = (at) => new Date(at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

export function HistoryList({ items, grouped = false }) {
  const groups = []
  for (const h of items) {
    const label = day(h.at)
    if (!groups.length || groups.at(-1).label !== label) groups.push({ label, items: [] })
    groups.at(-1).items.push(h)
  }
  return (
    <div className="history">
      {groups.map((grp) => (
        <div key={grp.label + grp.items[0].id}>
          {(grouped || groups.length > 1 || grp.label !== 'Today') && <h3>{grp.label}</h3>}
          <ul>
            {grp.items.map((h) => (
              <li key={h.id}>
                <span className="h-time">{time(h.at)}</span>
                <span className="h-main">
                  <strong>{h.title}</strong>
                  <span>
                    {h.reps} {h.kind === 'breath' ? (h.reps === 1 ? 'breath' : 'breaths') : h.reps === 1 ? 'rep' : 'reps'}
                    {h.kind !== 'breath' && ` · ${mmss(h.held)} held`} · {mmss(h.duration)}
                    {!h.done && ' · ended early'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default function HistoryView({ history, onClear, onHome }) {
  const held = history.reduce((s, h) => s + h.held, 0)
  return (
    <main className="page">
      <header className="page-top">
        <button type="button" className="back" onClick={onHome}>
          <Icon name="back" />
          Home
        </button>
        <h1>History</h1>
      </header>
      <p className="page-lede">
        {history.length} sessions · {mmss(held)} held in all
      </p>
      <HistoryList items={history} grouped />
      {history.length > 0 && (
        <div className="page-foot">
          <ArmedButton className="plain" onConfirm={onClear} armedLabel="Tap again to delete all history">
            Delete history
          </ArmedButton>
        </div>
      )}
    </main>
  )
}
