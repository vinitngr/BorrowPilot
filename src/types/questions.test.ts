import { describe, expect, it } from 'vitest'
import { questionsFor, requiredQuestionsFor } from './questions'

describe('adaptive question flow', () => {
  it('starts with a compact base set', () => {
    expect(questionsFor({}).length).toBe(10)
  })

  it('asks self-employed borrowers about documentation and property when relevant', () => {
    const questions = questionsFor({ incomeType: 'self-employed', loanPurpose: 'business' })
    expect(questions.map(question => question.id)).toEqual(expect.arrayContaining(['documentedIncome', 'propertyValue', 'incomeVolatility']))
  })

  it('does not show property questions for salaried personal borrowers', () => {
    const questions = questionsFor({ incomeType: 'salaried', loanPurpose: 'personal' })
    expect(questions.some(question => question.id === 'propertyValue')).toBe(false)
    expect(requiredQuestionsFor({ incomeType: 'salaried', loanPurpose: 'personal' }).every(question => question.affects.length > 0)).toBe(true)
  })
})
