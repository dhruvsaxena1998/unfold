import { useState } from 'react'
import { mmss } from './format.js'
import { isBreath, patternText, routineSec, uid } from './store.js'
import { ArmedButton, Field, Icon, Stepper } from './ui.jsx'

const blank = () => ({ id: uid(), name: 'New routine', waitBetween: false, transition: 15, exercises: [newExercise(1)] })
const newExercise = (n) => ({ id: uid(), name: `Exercise ${n}`, hold: 10, rest: 5, reps: 8 })
const blankBreath = (id) => ({ id, name: 'New breathing', kind: 'breath', minutes: 5, pattern: { in: 4, holdIn: 0, out: 6, holdOut: 0 } })

const DEFAULT_NAMES = new Set(['New routine', 'New breathing'])

const BREATH_STEPS = [
  ['in', 'Breathe in', 1],
  ['holdIn', 'Hold', 0],
  ['out', 'Breathe out', 1],
  ['holdOut', 'Hold after', 0],
]

export default function Editor({ routine, onSave, onDelete, onHome }) {
  const [r, setR] = useState(() => (routine ? structuredClone(routine) : blank()))
  const breath = isBreath(r)
  // A new routine starts as stretches; it can switch to breathing before it is
  // saved, keeping a name already typed.
  const setKind = (b) => {
    if (b === breath) return
    const next = b ? blankBreath(r.id) : { ...blank(), id: r.id }
    setR(DEFAULT_NAMES.has(r.name) ? next : { ...next, name: r.name })
  }
  const setStep = (k) => (v) => setR({ ...r, pattern: { ...r.pattern, [k]: v } })

  return (
    <main className="page editor">
      <header className="page-top">
        <button type="button" className="back" onClick={onHome}>
          <Icon name="back" />
          Cancel
        </button>
        <h1>{routine ? 'Edit routine' : 'New routine'}</h1>
        <button type="button" className="save" onClick={() => onSave({ ...r, name: r.name.trim() || 'Routine' })} disabled={!breath && !r.exercises.length}>
          Save
        </button>
      </header>

      {!routine && (
        <div className="choice" role="radiogroup" aria-label="Kind of routine">
          <button type="button" role="radio" aria-checked={!breath} onClick={() => setKind(false)}>
            <strong>Stretches</strong>
            <span>holds and rests, rep by rep</span>
          </button>
          <button type="button" role="radio" aria-checked={breath} onClick={() => setKind(true)}>
            <strong>Breathing</strong>
            <span>a paced breath, for a set time</span>
          </button>
        </div>
      )}

      <label className="name-field">
        <span>Name</span>
        <input value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} maxLength={40} />
      </label>
      {breath ? <BreathFields r={r} setR={setR} setStep={setStep} /> : <StretchFields r={r} setR={setR} />}

      {routine && (
        <div className="page-foot">
          <ArmedButton className="plain" onConfirm={() => onDelete(routine.id)} armedLabel="Tap again to delete this routine">
            Delete routine
          </ArmedButton>
        </div>
      )}
    </main>
  )
}

function BreathFields({ r, setR, setStep }) {
  const cycle = r.pattern.in + r.pattern.holdIn + r.pattern.out + r.pattern.holdOut
  return (
    <>
      <p className="page-lede">
        {patternText(r.pattern)} seconds · about {Math.max(1, Math.round((r.minutes * 60) / cycle))} breaths
      </p>
      <div className="settings">
        <Field label="Length" id="len-label">
          <Stepper id="len-label" label="length" value={r.minutes} onChange={(v) => setR({ ...r, minutes: v })} min={1} max={30} format={(v) => `${v} min`} />
        </Field>
        {BREATH_STEPS.map(([k, label, min]) => (
          <Field key={k} label={label} id={`p-${k}`}>
            <Stepper id={`p-${k}`} label={label} value={r.pattern[k]} onChange={setStep(k)} step={0.5} min={min} max={20} format={(v) => (v ? `${v} s` : 'Off')} />
          </Field>
        ))}
      </div>
    </>
  )
}

function StretchFields({ r, setR }) {
  const setEx = (i, patch) => setR({ ...r, exercises: r.exercises.map((e, k) => (k === i ? { ...e, ...patch } : e)) })
  const move = (i, d) => {
    const ex = [...r.exercises]
    ;[ex[i], ex[i + d]] = [ex[i + d], ex[i]]
    setR({ ...r, exercises: ex })
  }
  const remove = (i) => setR({ ...r, exercises: r.exercises.filter((_, k) => k !== i) })
  const holds = r.exercises.reduce((s, e) => s + e.reps, 0)

  return (
    <>
      <p className="page-lede">
        {r.exercises.length} {r.exercises.length === 1 ? 'exercise' : 'exercises'} · {holds} holds · about {mmss(routineSec(r) * 1000)}
      </p>

      <ol className="exercises">
        {r.exercises.map((e, i) => (
          <li key={e.id}>
            <div className="ex-head">
              <span className="ex-no">{i + 1}</span>
              <input value={e.name} onChange={(ev) => setEx(i, { name: ev.target.value })} aria-label={`Exercise ${i + 1} name`} maxLength={32} />
              <div className="ex-tools">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                  <Icon name="up" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === r.exercises.length - 1} aria-label="Move down">
                  <Icon name="down" />
                </button>
                <button type="button" onClick={() => remove(i)} disabled={r.exercises.length === 1} aria-label={`Remove ${e.name}`}>
                  <Icon name="trash" />
                </button>
              </div>
            </div>
            <div className="settings">
              <Field label="Hold" id={`h-${e.id}`}>
                <Stepper id={`h-${e.id}`} label="hold" value={e.hold} onChange={(v) => setEx(i, { hold: v })} step={5} min={5} max={300} format={(v) => `${v} s`} />
              </Field>
              <Field label="Rest" id={`r-${e.id}`}>
                <Stepper id={`r-${e.id}`} label="rest" value={e.rest} onChange={(v) => setEx(i, { rest: v })} step={5} min={0} max={180} format={(v) => (v ? `${v} s` : 'None')} />
              </Field>
              <Field label="Reps" id={`n-${e.id}`}>
                <Stepper id={`n-${e.id}`} label="reps" value={e.reps} onChange={(v) => setEx(i, { reps: v })} min={1} max={50} />
              </Field>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className="row row-add" onClick={() => setR({ ...r, exercises: [...r.exercises, newExercise(r.exercises.length + 1)] })}>
        <Icon name="plus" />
        <span className="row-main">
          <strong>Add exercise</strong>
        </span>
      </button>

      {r.exercises.length > 1 && (
        <section className="between">
          <h2>Between exercises</h2>
          <div className="choice" role="radiogroup" aria-label="Between exercises">
            <button type="button" role="radio" aria-checked={!r.waitBetween} onClick={() => setR({ ...r, waitBetween: false })}>
              <strong>Carry on</strong>
              <span>after a short rest</span>
            </button>
            <button type="button" role="radio" aria-checked={r.waitBetween} onClick={() => setR({ ...r, waitBetween: true })}>
              <strong>Wait for my tap</strong>
              <span>time to change position</span>
            </button>
          </div>
          {!r.waitBetween && (
            <div className="settings">
              <Field label="Rest between" id="gap-label">
                <Stepper id="gap-label" label="rest between" value={r.transition} onChange={(v) => setR({ ...r, transition: v })} step={5} min={5} max={120} format={(v) => `${v} s`} />
              </Field>
            </div>
          )}
        </section>
      )}
    </>
  )
}
