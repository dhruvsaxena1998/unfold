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

export const STARTER_ROUTINES = [
  {
    id: 'steady',
    name: 'Steady holds',
    waitBetween: false,
    transition: 15,
    exercises: [{ id: 'a', name: 'Hold', hold: 10, rest: 5, reps: 10 }],
  },
  {
    id: 'long',
    name: 'Long holds',
    waitBetween: false,
    transition: 15,
    exercises: [{ id: 'a', name: 'Hold', hold: 30, rest: 15, reps: 5 }],
  },
  {
    id: 'three',
    name: 'Three stretches',
    waitBetween: true,
    transition: 15,
    exercises: [
      { id: 'a', name: 'Stretch one', hold: 20, rest: 10, reps: 5 },
      { id: 'b', name: 'Stretch two', hold: 20, rest: 10, reps: 5 },
      { id: 'c', name: 'Stretch three', hold: 20, rest: 10, reps: 5 },
    ],
  },
]

export const BREATH_PATTERNS = [
  { id: 'box', name: 'Box breathing', in: 4, holdIn: 4, out: 4, holdOut: 4 },
  { id: '478', name: '4-7-8', in: 4, holdIn: 7, out: 8, holdOut: 0 },
  { id: 'slow', name: 'Slow and even', in: 5.5, holdIn: 0, out: 5.5, holdOut: 0 },
]

export const routineHoldSec = (r) => r.exercises.reduce((s, e) => s + e.hold * e.reps, 0)

// Estimated length: every hold and rest, plus the gaps between exercises.
export const routineSec = (r) =>
  r.exercises.reduce((s, e) => s + (e.hold + e.rest) * e.reps - e.rest, 0) +
  Math.max(0, r.exercises.length - 1) * (r.waitBetween ? 0 : r.transition)

export const patternText = (p) => [p.in, p.holdIn, p.out, p.holdOut].filter((v, i) => v || i % 2 === 0).join(' · ')
