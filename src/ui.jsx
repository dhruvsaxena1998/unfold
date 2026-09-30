import { useEffect, useRef, useState } from 'react'
import { buzz } from './haptics.js'

const PATHS = {
  back: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  plus: 'M5 12h14M12 5v14',
  minus: 'M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
  skip: 'M6 5l9 7-9 7zM18 5v14',
  prev: 'M18 5l-9 7 9 7zM6 5v14',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 5l12 7-12 7z',
  stop: 'M6 6h12v12H6z',
  list: 'M4 7h16M4 12h16M4 17h10',
  up: 'M12 19V5M6 11l6-6 6 6',
  down: 'M12 5v14M6 13l6 6 6-6',
  trash: 'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13',
  again: 'M5 12a7 7 0 1 0 2.2-5.1M5 4v4h4',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
}

export function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

export function Stepper({ value, onChange, step = 1, min = 0, max = 999, format = String, label, id }) {
  const set = (v) => {
    buzz('tap')
    onChange(Math.round(Math.min(max, Math.max(min, v)) * 100) / 100)
  }
  return (
    <div className="stepper" role="group" aria-labelledby={id}>
      <button type="button" onClick={() => set(value - step)} disabled={value <= min} aria-label={`Less ${label}`}>
        <Icon name="minus" />
      </button>
      <output aria-live="polite">{format(value)}</output>
      <button type="button" onClick={() => set(value + step)} disabled={value >= max} aria-label={`More ${label}`}>
        <Icon name="plus" />
      </button>
    </div>
  )
}

export function Field({ label, children, id }) {
  return (
    <div className="setting">
      <span id={id}>{label}</span>
      {children}
    </div>
  )
}

export function useMedia(query) {
  const [match, setMatch] = useState(() => matchMedia(query).matches)
  useEffect(() => {
    const mq = matchMedia(query)
    const onChange = () => setMatch(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return match
}

export function useWakeLock(active) {
  useEffect(() => {
    if (!active || !navigator.wakeLock) return
    let lock
    const request = () => navigator.wakeLock.request('screen').then((l) => (lock = l), () => {})
    const onVisible = () => document.visibilityState === 'visible' && request()
    request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release()
    }
  }, [active])
}

// Space runs the main action unless focus is on a control.
export function useSpace(action) {
  const ref = useRef(action)
  ref.current = action
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.repeat) return
      if (e.target.closest?.('button, input, output, [role="group"], dialog')) return
      if (document.querySelector('dialog[open]')) return
      e.preventDefault()
      ref.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

// A two-tap destructive button: first tap arms it for three seconds.
export function ArmedButton({ onConfirm, children, armedLabel, disabled, className = '' }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const id = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(id)
  }, [armed])
  return (
    <button
      type="button"
      disabled={disabled}
      className={`${className}${armed ? ' is-armed' : ''}`}
      onClick={() => {
        if (!armed) return setArmed(true)
        setArmed(false)
        onConfirm()
      }}
    >
      {armed ? armedLabel : children}
    </button>
  )
}

// The session screen: gauge field on the left (top on phones), board beside it.
export function SessionShell({ phaseClass, gauge, onField, fieldLabel, fieldDisabled, title, onHome, board, sheet, compact }) {
  const dialog = useRef(null)
  return (
    <>
      <main className={`app ${phaseClass}`} onClick={(e) => !e.target.closest('button, [role="group"], table, a, input') && onField?.()}>
        <button type="button" className="gauge" onClick={onField} disabled={fieldDisabled} aria-label={fieldLabel}>
          {gauge}
        </button>
        <section className="board" aria-label="Session">
          <header className="board-top">
            <button type="button" className="back" onClick={onHome}>
              <Icon name="back" />
              Home
            </button>
            <p>{title}</p>
          </header>
          {board({ openSheet: () => dialog.current?.showModal() })}
        </section>
      </main>
      {compact && sheet && (
        <dialog ref={dialog} className="sheet" onClick={(e) => e.target === dialog.current && dialog.current.close()}>
          <div className="sheet-body">{sheet({ close: () => dialog.current?.close() })}</div>
        </dialog>
      )}
    </>
  )
}
