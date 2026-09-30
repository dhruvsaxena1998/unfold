// ms -> "7", "59", "1:05"
export function clock(ms) {
  const s = Math.floor(ms / 1000)
  if (s < 60) return String(s)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const tenth = (ms) => Math.floor((ms % 1000) / 100)

// Always m:ss, for the session total.
export function mmss(ms) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// ms -> "2.6" under a minute, else "1:05"; for rests, where tenths matter.
export const fine = (ms) => (ms < 60000 ? (Math.floor(ms / 100) / 10).toFixed(1) : clock(ms))
