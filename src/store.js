import { useEffect, useState } from 'react'

// Everything kept on the device lives here, under one prefix.
const KEY = (k) => `stretch.${k}`

export function load(key, initial) {
  try {
    return JSON.parse(localStorage.getItem(KEY(key))) ?? initial
  } catch {
    return initial
  }
}

// A stored value; every screen using the same key stays in step.
export function usePref(key, initial) {
  const [value, setValue] = useState(() => load(key, initial))
  useEffect(() => {
    const onPref = (e) => e.detail === key && setValue(load(key, initial))
    window.addEventListener('pref', onPref)
    return () => window.removeEventListener('pref', onPref)
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  const set = (next) =>
    setValue((prev) => {
      const v = typeof next === 'function' ? next(prev) : next
      localStorage.setItem(KEY(key), JSON.stringify(v))
      queueMicrotask(() => window.dispatchEvent(new CustomEvent('pref', { detail: key })))
      return v
    })
  return [value, set]
}

export const uid = () => Math.random().toString(36).slice(2, 10)

// What a new device starts with, beside free stretch. They are ordinary
// routines: edit or delete them like any you add.
export const STARTER_ROUTINES = [
  {
    id: 'steady',
    name: 'Steady holds',
    waitBetween: false,
    transition: 15,
    exercises: [{ id: 'a', name: 'Hold', hold: 10, rest: 5, reps: 10 }],
  },
  { id: 'box', name: 'Box breathing', kind: 'breath', minutes: 5, pattern: { in: 4, holdIn: 4, out: 4, holdOut: 4 } },
  { id: '478', name: '4-7-8', kind: 'breath', minutes: 5, pattern: { in: 4, holdIn: 7, out: 8, holdOut: 0 } },
]

export const isBreath = (r) => r.kind === 'breath'

// Older versions started with more routines, and kept breathing as separate
// settings. Drop the old starters nobody changed and bring breathing in.
const DROPPED = [
  { id: 'long', name: 'Long holds', waitBetween: false, transition: 15, exercises: [{ id: 'a', name: 'Hold', hold: 30, rest: 15, reps: 5 }] },
  {
    id: 'three',
    name: 'Three stretches',
    waitBetween: true,
    transition: 15,
    exercises: ['one', 'two', 'three'].map((n, i) => ({ id: 'abc'[i], name: `Stretch ${n}`, hold: 20, rest: 10, reps: 5 })),
  },
  { id: 'slow', name: 'Slow and even', kind: 'breath', minutes: 5, pattern: { in: 5.5, holdIn: 0, out: 5.5, holdOut: 0 } },
]
const version = Number(localStorage.getItem(KEY('v')) ?? 1)
const stored = load('routines', null)
if (version < 3 && stored) {
  const old = load('breath', null)
  // Breathing starters picked up the old shared length, so length alone doesn't count as a change.
  const plain = ({ minutes, ...r }) => JSON.stringify(r) // eslint-disable-line no-unused-vars
  const kept = stored.filter((r) => !DROPPED.some((o) => o.id === r.id && plain(o) === plain(r)))
  if (version < 2) kept.push(...STARTER_ROUTINES.filter((r) => isBreath(r) && !kept.some((k) => k.id === r.id)).map((r) => ({ ...r, minutes: old?.minutes ?? 5 })))
  if (old?.custom) kept.push({ id: 'custom', name: 'Your pattern', kind: 'breath', minutes: old.minutes ?? 5, pattern: old.custom })
  localStorage.setItem(KEY('routines'), JSON.stringify(kept))
}
localStorage.removeItem(KEY('breath'))
localStorage.setItem(KEY('v'), '3')

// Estimated length: every hold and rest, plus the gaps between exercises.
export const routineSec = (r) =>
  isBreath(r) ? r.minutes * 60 :
  r.exercises.reduce((s, e) => s + (e.hold + e.rest) * e.reps - e.rest, 0) +
  Math.max(0, r.exercises.length - 1) * (r.waitBetween ? 0 : r.transition)

export const patternText = (p) => [p.in, p.holdIn, p.out, p.holdOut].filter((v, i) => v || i % 2 === 0).join(' · ')
