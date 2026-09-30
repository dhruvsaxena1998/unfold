// Every sound is synthesised: soft cues per theme and an optional ambient bed.
let ctx
let out
let noise
let scale = 1 // cue volume, set per call

export function unlockAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    out = ctx.createDynamicsCompressor()
    out.threshold.value = -18
    out.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
}

// Brown noise, looped: the raw material for surf, wind, trickle and room tone.
function noiseBuffer() {
  if (noise) return noise
  const len = ctx.sampleRate * 6
  noise = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = noise.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
    d[i] = last * 3.5
  }
  return noise
}

function env(at, peak, attack, decay) {
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, at)
  g.gain.linearRampToValueAtTime(peak, at + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay)
  return g
}

// A pitched voice with an envelope; `to` glides the pitch.
function tone(freq, { at = 0, gain = 0.1, attack = 0.01, decay = 0.6, type = 'sine', to, lowpass, dest = out } = {}) {
  const t = ctx.currentTime + at
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + attack + decay * 0.6)
  const g = env(t, gain * scale, attack, decay)
  let node = osc.connect(g)
  if (lowpass) {
    const f = ctx.createBiquadFilter()
    f.frequency.value = lowpass
    node = node.connect(f)
  }
  node.connect(dest)
  osc.start(t)
  osc.stop(t + attack + decay + 0.05)
}

// Struck objects: inharmonic partials, each decaying faster than the last.
function strike(freq, ratios, { at = 0, gain = 0.1, decay = 1.5 } = {}) {
  ratios.forEach((r, i) => tone(freq * r, { at, gain: gain / (i + 1), attack: 0.004, decay: decay / (1 + i * 0.8) }))
}

function knock(freq, { at = 0, gain = 0.2 } = {}) {
  const t = ctx.currentTime + at
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer()
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = freq * 1.5
  f.Q.value = 6
  src.connect(f).connect(env(t, gain * scale, 0.002, 0.07)).connect(out)
  src.start(t, Math.random() * 5)
  src.stop(t + 0.1)
  tone(freq, { at, gain: gain * 0.6, attack: 0.002, decay: 0.12 })
}

const CUES = {
  tide: {
    start: () => tone(900, { to: 260, gain: 0.14, decay: 0.28 }),
    stop: () => tone(280, { to: 620, gain: 0.1, decay: 0.3 }),
    target: () => {
      strike(520, [1, 2, 2.76, 5.4], { gain: 0.14, decay: 2.6 })
      strike(620, [1, 2, 2.76], { at: 0.35, gain: 0.1, decay: 2.2 })
    },
    finish: () => strike(392, [1, 2, 2.76, 5.4], { gain: 0.12, decay: 3 }),
  },
  bloom: {
    start: () => [220, 330].forEach((f) => tone(f, { gain: 0.07, attack: 0.45, decay: 1.4, type: 'triangle', lowpass: 1100 })),
    stop: () => [330, 247].forEach((f, i) => tone(f, { at: i * 0.2, to: f * 0.94, gain: 0.06, attack: 0.3, decay: 1.6, type: 'triangle', lowpass: 900 })),
    target: () => [392, 494, 587].forEach((f, i) => tone(f, { at: i * 0.09, gain: 0.06, attack: 0.25, decay: 2.4, type: 'triangle', lowpass: 1600 })),
    finish: () => [294, 370, 440].forEach((f, i) => tone(f, { at: i * 0.12, gain: 0.06, attack: 0.4, decay: 2.8, type: 'triangle', lowpass: 1200 })),
  },
  vessel: {
    start: () => strike(1568, [1, 2.32, 4.25], { gain: 0.09, decay: 0.7 }),
    stop: () => strike(1175, [1, 2.32, 4.25], { gain: 0.08, decay: 0.6 }),
    target: () => {
      strike(1760, [1, 2.32, 4.25], { gain: 0.09, decay: 1.2 })
      strike(2093, [1, 2.32, 4.25], { at: 0.14, gain: 0.08, decay: 1.2 })
    },
    finish: () => [1568, 1319, 1047].forEach((f, i) => strike(f, [1, 2.32, 4.25], { at: i * 0.16, gain: 0.08, decay: 1 })),
  },
  dawn: {
    start: () => strike(294, [1, 1.006, 2.71, 5.1], { gain: 0.1, decay: 3.2 }),
    stop: () => strike(220, [1, 1.005, 2.71], { gain: 0.08, decay: 2.2 }),
    target: () => {
      strike(392, [1, 1.006, 2.71, 5.1], { gain: 0.1, decay: 3.6 })
      strike(587, [1, 1.004, 2.71], { at: 0.25, gain: 0.07, decay: 3.2 })
    },
    finish: () => strike(196, [1, 1.006, 2.71, 5.1], { gain: 0.11, decay: 4 }),
  },
  grove: {
    start: () => knock(740),
    stop: () => knock(520, { gain: 0.16 }),
    target: () => [523, 659, 784].forEach((f, i) => strike(f, [1, 4], { at: i * 0.11, gain: 0.1, decay: 0.9 })),
    finish: () => [784, 659, 523].forEach((f, i) => strike(f, [1, 4], { at: i * 0.14, gain: 0.1, decay: 1.1 })),
  },
}

// Countdown ticks are shared by every theme: short, soft, the last one higher.
function tick(final) {
  tone(final ? 1320 : 990, { gain: final ? 0.07 : 0.05, attack: 0.002, decay: 0.07 })
}

export function cue(theme, kind, { quiet, final } = {}) {
  if (!ctx || ctx.state !== 'running') return
  if (kind === 'tick') return tick(final)
  // Breathing turns use the theme's voice at half volume.
  scale = quiet ? 0.5 : 1
  CUES[theme]?.[kind]?.()
  scale = 1
}

// Ambient beds. Each theme is built from a different kind of sound, not one
// noise through different filters: surf swells, a chord pad, a babbling brook
// of bubbles, birdsong over wind, and rain pattering on leaves.
let sources = []
let white

// White noise carries the highs that brown noise lacks (hiss, rain, spray).
function whiteBuffer() {
  if (white) return white
  const len = ctx.sampleRate * 4
  white = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = white.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return white
}

function looped(buffer = noiseBuffer()) {
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop = true
  src.start(0, Math.random() * 3)
  sources.push(src)
  return src
}

function filter(type, freq, q = 0.7) {
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  return f
}

function gainNode(v) {
  const g = ctx.createGain()
  g.gain.value = v
  return g
}

function lfo(rate, depth, param) {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.frequency.value = rate
  g.gain.value = depth
  o.connect(g).connect(param)
  o.start()
  sources.push(o)
  return o
}

function panned(bus, pan) {
  const p = ctx.createStereoPanner()
  p.pan.value = pan
  p.connect(bus)
  return p
}

// A short burst of noise through a band: a raindrop, a splash, a click.
function burst(dest, { at = 0, freq = 3000, q = 3, gain = 0.2, dur = 0.02 }) {
  const t = ctx.currentTime + at
  const src = ctx.createBufferSource()
  src.buffer = whiteBuffer()
  src.connect(filter('bandpass', freq, q)).connect(env(t, gain, 0.001, dur)).connect(dest)
  src.start(t, Math.random() * 3)
  src.stop(t + dur + 0.05)
}

// Run fn on a jittered timer until the bed stops.
function every(ms, fn) {
  let id
  const loop = () => {
    fn()
    id = setTimeout(loop, ms * (0.6 + Math.random() * 0.8))
  }
  id = setTimeout(loop, ms * Math.random())
  return () => clearTimeout(id)
}

const rnd = (a, b) => a + Math.random() * (b - a)

const BEDS = {
  // Surf: separate waves that rise, break bright, and wash back out.
  tide: (bus) => {
    looped().connect(filter('lowpass', 220)).connect(gainNode(0.35)).connect(bus)
    const wash = filter('lowpass', 400, 0.5)
    const level = gainNode(0.1)
    looped(whiteBuffer()).connect(wash).connect(level).connect(bus)
    let next = 0
    const wave = () => {
      const t = Math.max(ctx.currentTime, next)
      const d = rnd(5, 8.5)
      level.gain.setTargetAtTime(rnd(0.6, 1), t, d * 0.18)
      wash.frequency.setTargetAtTime(rnd(1400, 2400), t, d * 0.15)
      level.gain.setTargetAtTime(0.08, t + d * 0.45, d * 0.2)
      wash.frequency.setTargetAtTime(350, t + d * 0.4, d * 0.2)
      next = t + d * 0.9
    }
    wave()
    return every(2000, () => ctx.currentTime > next - 1.5 && wave())
  },

  // A soft pad that drifts between two chords every twenty seconds or so.
  bloom: (bus) => {
    const f = filter('lowpass', 900, 0.8)
    lfo(0.04, 350, f.frequency)
    f.connect(bus)
    const chords = [
      [110, 164.8, 277.2, 329.6],
      [98, 146.8, 246.9, 370],
    ]
    const voices = chords[0].map((hz) => {
      const g = gainNode(0.12)
      const o = ctx.createOscillator()
      const o2 = ctx.createOscillator()
      o.type = 'triangle'
      o2.type = 'sine'
      o.frequency.value = hz
      o2.frequency.value = hz * 2.003
      o.connect(g)
      o2.connect(gainNode(0.25)).connect(g)
      g.connect(f)
      o.start()
      o2.start()
      sources.push(o, o2)
      return [o, o2]
    })
    let k = 0
    return every(20000, () => {
      k = 1 - k
      const t = ctx.currentTime
      voices.forEach(([o, o2], i) => {
        o.frequency.setTargetAtTime(chords[k][i], t, 2.5)
        o2.frequency.setTargetAtTime(chords[k][i] * 2.003, t, 2.5)
      })
    })
  },

  // A babbling brook: a thin hiss of water with a stream of tiny bubbles,
  // busier while the glass is filling.
  vessel: (bus, phase) => {
    looped(whiteBuffer()).connect(filter('bandpass', 1300, 0.9)).connect(gainNode(0.05)).connect(bus)
    const sides = [panned(bus, -0.5), panned(bus, 0), panned(bus, 0.5)]
    return every(55, () => {
      const busy = phase() === 'hold' ? 3 : 1
      for (let n = 0; n < busy; n++) {
        if (Math.random() > 0.55) continue
        const f0 = rnd(500, 1900)
        tone(f0, { at: rnd(0, 0.05), to: f0 * rnd(1.4, 2.2), gain: rnd(0.03, 0.09), attack: 0.004, decay: rnd(0.03, 0.08), dest: sides[(Math.random() * 3) | 0] })
      }
    })
  },

  // Morning: a light breeze and three kinds of bird calling from different sides.
  dawn: (bus) => {
    const wind = filter('bandpass', 500, 0.5)
    lfo(0.06, 250, wind.frequency)
    looped().connect(wind).connect(gainNode(0.3)).connect(bus)
    const songs = [
      // chirps falling in pitch
      (dest) => {
        const n = 3 + ((Math.random() * 4) | 0)
        for (let i = 0; i < n; i++) tone(4300, { at: i * 0.12, to: 2900, gain: 0.05, attack: 0.005, decay: 0.07, dest })
      },
      // a two-note whistle
      (dest) => {
        tone(2650, { gain: 0.045, attack: 0.03, decay: 0.28, dest })
        tone(2100, { at: 0.34, gain: 0.04, attack: 0.03, decay: 0.34, dest })
      },
      // a quick trill
      (dest) => {
        for (let i = 0; i < 12; i++) tone(i % 2 ? 3300 : 3700, { at: i * 0.045, gain: 0.03, attack: 0.003, decay: 0.03, dest })
      },
    ]
    return every(3200, () => songs[(Math.random() * songs.length) | 0](panned(bus, rnd(-0.8, 0.8))))
  },

  // Garden rain: fine hiss above, drops pattering on leaves all around.
  grove: (bus, phase) => {
    looped(whiteBuffer()).connect(filter('highpass', 2600)).connect(filter('lowpass', 8000)).connect(gainNode(0.07)).connect(bus)
    const sides = [panned(bus, -0.7), panned(bus, -0.2), panned(bus, 0.3), panned(bus, 0.75)]
    return every(45, () => {
      const drops = phase() === 'hold' ? 2 : 1
      for (let n = 0; n < drops; n++) {
        const side = sides[(Math.random() * 4) | 0]
        burst(side, { at: rnd(0, 0.04), freq: rnd(2200, 6500), q: rnd(2, 5), gain: rnd(0.05, 0.22), dur: rnd(0.01, 0.03) })
        if (Math.random() < 0.08) tone(rnd(700, 1100), { to: rnd(400, 600), gain: 0.04, attack: 0.002, decay: 0.06, dest: side })
      }
    })
  },
}

const LEVEL = { idle: 0.45, hold: 1, rest: 0.7, ended: 0.3 }
// Balanced by measurement so no bed is much louder than another (bright ones sit a little lower).
const VOLUME = { tide: 0.1, bloom: 0.06, vessel: 0.45, dawn: 0.16, grove: 0.16 }
let bed = null
let currentPhase = 'idle'

function stopBed() {
  if (!bed) return
  const { bus, cleanup, nodes } = bed
  const t = ctx.currentTime
  bus.gain.cancelScheduledValues(t)
  bus.gain.setTargetAtTime(0, t, 0.4)
  cleanup?.()
  setTimeout(() => {
    nodes.forEach((n) => n.stop())
    bus.disconnect()
  }, 2500)
  bed = null
}

// Start, swap, level, or stop the ambient bed.
export function ambience(theme, on, phase) {
  currentPhase = phase
  if (!ctx) return
  if (!on) return stopBed()
  if (bed?.theme !== theme) {
    stopBed()
    const bus = ctx.createGain()
    bus.gain.value = 0
    bus.connect(out)
    sources = []
    const cleanup = BEDS[theme](bus, () => currentPhase)
    bed = { theme, bus, cleanup, nodes: sources }
  }
  bed.bus.gain.setTargetAtTime(VOLUME[theme] * LEVEL[phase], ctx.currentTime, 1.2)
}
