import { describe, expect, it } from 'vitest'
import { calculateEmi, principalForEmi } from './emi'

describe('EMI calculations', () => {
  it('calculates a reducing-balance EMI', () => {
    expect(calculateEmi(100000, 0.12, 12)).toBeCloseTo(8884.88, 1)
  })

  it('round trips principal and EMI', () => {
    const principal = 350000
    const emi = calculateEmi(principal, 0.15, 36)
    expect(principalForEmi(emi, 0.15, 36)).toBeCloseTo(principal, 4)
  })
})
