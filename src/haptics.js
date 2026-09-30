import { WebHaptics } from 'web-haptics'

// One place for touch feedback. Android vibrates; iOS Safari only answers
// inside a tap, so automatic phase changes there fall back to sound alone.
const PATTERNS = {
  tap: 'selection',
  start: 'nudge',
  stop: 'soft',
  target: 'success',
  tick: 'light',
  finish: 'success',
}

let haptics
let enabled = true

export function setHaptics(on) {
  enabled = on
}

export function buzz(kind) {
  if (!enabled || typeof window === 'undefined') return
  haptics ??= new WebHaptics()
  haptics.trigger(PATTERNS[kind] ?? kind).catch(() => {})
}
