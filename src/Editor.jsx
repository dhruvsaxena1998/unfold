import { useState } from 'react'
import { mmss } from './format.js'
import { routineSec, uid } from './store.js'
import { ArmedButton, Field, Icon, Stepper } from './ui.jsx'

const blank = () => ({ id: uid(), name: 'New routine', waitBetween: false, transition: 15, exercises: [newExercise(1)] })
const newExercise = (n) => ({ id: uid(), name: `Exercise ${n}`, hold: 10, rest: 5, reps: 8 })

export default function Editor({ routine, onSave, onDelete, onHome }) {
  const [r, setR] = useState(() => (routine ? structuredClone(routine) : blank()))
  const setEx = (i, patch) => setR({ ...r, exercises: r.exercises.map((e, k) => (k === i ? { ...e, ...patch } : e)) })
  const move = (i, d) => {
    const ex = [...r.exercises]
    ;[ex[i], ex[i + d]] = [ex[i + d], ex[i]]
    setR({ ...r, exercises: ex })
  }
  const remove = (i) => setR({ ...r, exercises: r.exercises.filter((_, k) => k !== i) })
  const holds = r.exercises.reduce((s, e) => s + e.reps, 0)

  return (
    <main className="page editor">
      <header className="page-top">
        <button type="button" className="back" onClick={onHome}>
          <Icon name="back" />
          Cancel
        </button>
        <h1>{routine ? 'Edit routine' : 'New routine'}</h1>
        <button type="button" className="save" onClick={() => onSave({ ...r, name: r.name.trim() || 'Routine' })} disabled={!r.exercises.length}>
          Save
        </button>
      </header>

      <label className="name-field">
        <span>Name</span>
        <input value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} maxLength={40} />
      </label>
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
