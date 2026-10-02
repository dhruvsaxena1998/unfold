import { describe, expect, it } from 'vitest'
import { breathModel, routineModel, stretchModel } from '../src/model.js'
import { breathPlan, routinePlan, Runner } from '../src/runner.js'
import { routineSec, STARTER_ROUTINES } from '../src/store.js'

// Free stretch session states, shaped as useSession returns them.
const stretch = {
  idle: { phase: 'idle', rows: [], hold: 0, rest: 0, lastRest: null, total: 0, holdTotal: 0 },
  holdingUnder: { phase: 'hold', rows: [{ hold: 12000, rest: 4500 }, { hold: 8300, rest: null }], hold: 8300, rest: 0, lastRest: 4500, total: 24800, holdTotal: 20300 },
  holdingOver: { phase: 'hold', rows: [{ hold: 31400, rest: null }], hold: 31400, rest: 0, lastRest: null, total: 31400, holdTotal: 31400 },
  resting: { phase: 'rest', rows: [{ hold: 22000, rest: 6700 }], hold: 22000, rest: 6700, lastRest: null, total: 28700, holdTotal: 22000 },
  longRest: { phase: 'rest', rows: [{ hold: 22000, rest: 75200 }], hold: 22000, rest: 75200, lastRest: null, total: 97200, holdTotal: 22000 },
  ended: { phase: 'ended', rows: [{ hold: 20000, rest: 5000 }, { hold: 25000, rest: null }], hold: 25000, rest: 0, lastRest: 5000, total: 50000, holdTotal: 45000 },
  longHold: { phase: 'hold', rows: [{ hold: 95500, rest: null }], hold: 95500, rest: 0, lastRest: null, total: 95500, holdTotal: 95500 },
}

describe('stretchModel', () => {
  for (const [name, s] of Object.entries(stretch)) {
    it(`${name}, no target`, () => expect(stretchModel(s, 0, 180)).toMatchSnapshot())
    it(`${name}, 30 s target`, () => expect(stretchModel(s, 30, 180)).toMatchSnapshot())
  }

  it('reads the hold and its action words', () => {
    const g = stretchModel(stretch.holdingUnder, 30, 180)
    expect(g.face).toEqual({ whole: '8', frac: '3', status: 'Hold 2', sub: 'seconds' })
    expect(g.tap).toEqual({ hint: 'Tap anywhere or press Space', action: 'End hold' })
    expect(g.goalLabel).toBe('Target 30 s')
    expect(stretchModel(stretch.holdingOver, 30, 180).goalLabel).toBe('Target reached')
    expect(stretchModel(stretch.ended, 0, 180).tap).toEqual({ hint: '', action: 'Session finished' })
  })

  it('without a target the scale shows a minute, then 30 s steps', () => {
    expect(stretchModel(stretch.holdingUnder, 0, 180).marks.at(-1).sec).toBe(60)
    expect(stretchModel(stretch.longHold, 0, 180).marks.at(-1).sec).toBe(120)
  })
})

const routine = {
  id: 't',
  name: 'Two stretches',
  waitBetween: false,
  transition: 15,
  exercises: [
    { id: 'a', name: 'Calf', hold: 10, rest: 5, reps: 2 },
    { id: 'b', name: 'Hip', hold: 20, rest: 10, reps: 2 },
  ],
}
const waiting = { ...routine, waitBetween: true }

// Runner started at t=0; the plan begins with a 5 s lead.
function started(r, t) {
  const run = new Runner(routinePlan(r))
  run.start(0)
  run.tick(t)
  run.now = t
  return run
}

describe('routineModel', () => {
  const states = {
    ready: () => Object.assign(new Runner(routinePlan(routine)), { now: 0 }),
    lead: () => started(routine, 2000),
    midHold: () => started(routine, 9500),
    rest: () => started(routine, 16000),
    gap: () => started(routine, 32000),
    secondExercise: () => started(routine, 52000),
    paused: () => {
      const run = started(routine, 9500)
      run.pause(9500)
      return run
    },
    doneEarly: () => {
      const run = started(routine, 12000)
      run.finish(12000)
      return run
    },
    doneNaturally: () => started(routine, 200000),
  }
  for (const [name, make] of Object.entries(states)) {
    it(name, () => {
      const run = make()
      expect(routineModel(run, routine, run.now)).toMatchSnapshot()
    })
  }
  it('wait between exercises', () => {
    const run = started(waiting, 40000)
    expect(run.seg.kind).toBe('wait')
    expect(routineModel(run, waiting, 40000)).toMatchSnapshot()
  })

  it('ready screen length matches the Home routine list', () => {
    const g = routineModel(new Runner(routinePlan(routine)), routine, 0)
    expect(routineSec(routine)).toBe(90)
    expect(g.face.whole).toBe('1:30')
    expect(routineModel(new Runner(routinePlan(waiting)), waiting, 0).face.whole).toBe('1:15')
  })

  it('session goal is the total planned hold', () => {
    expect(routineModel(new Runner(routinePlan(routine)), routine, 0).sessionGoal).toBe(60000)
  })
})

describe('breathModel', () => {
  const box = { ...STARTER_ROUTINES[1].pattern, name: 'Box breathing' }
  const plan = () => breathPlan(box, 1)
  const at = (t) => {
    const run = new Runner(plan())
    run.start(0)
    run.tick(t)
    run.now = t
    return run
  }
  const states = {
    ready: () => Object.assign(new Runner(plan()), { now: 0 }),
    lead: () => at(1000),
    in: () => at(4500),
    holdIn: () => at(8000),
    out: () => at(12500),
    holdOut: () => at(16000),
    paused: () => {
      const run = at(8000)
      run.pause(8000)
      return run
    },
    doneEarly: () => {
      const run = at(20000)
      run.finish(20000)
      return run
    },
    doneNaturally: () => at(200000),
  }
  for (const [name, make] of Object.entries(states)) {
    it(name, () => {
      const run = make()
      expect(breathModel(run, box, run.now)).toMatchSnapshot()
    })
  }
})
