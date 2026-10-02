import { describe, expect, it } from 'vitest'
import { clock, fine, mmss, tenth } from '../src/format.js'

const at = [0, 999, 59999, 60000, 61000, 754321]

describe('time formatters', () => {
  it('clock: whole seconds under a minute, m:ss from a minute', () => {
    expect(at.map(clock)).toEqual(['0', '0', '59', '1:00', '1:01', '12:34'])
  })
  it('mmss: always m:ss', () => {
    expect(at.map(mmss)).toEqual(['0:00', '0:00', '0:59', '1:00', '1:01', '12:34'])
  })
  it('tenth: the tenths digit', () => {
    expect(at.map(tenth)).toEqual([0, 9, 9, 0, 0, 3])
  })
  it('fine: tenths under a minute, m:ss from a minute', () => {
    expect(at.map(fine)).toEqual(['0.0', '0.9', '59.9', '1:00', '1:01', '12:34'])
  })
})
