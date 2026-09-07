import type { InputKey, IncomeType, LoanPurpose } from './borrower'

export type QuestionKind = 'choice' | 'currency' | 'number' | 'boolean' | 'range'
export type QuestionImpact = 'verdict' | 'confidence' | 'amount' | 'rate' | 'emi' | 'product'

export interface QuestionOption<T extends string = string> {
  value: T
  label: string
  description?: string
}

export interface Question<T = unknown> {
  id: InputKey
  title: string
  helpText?: string
  kind: QuestionKind
  required: boolean
  affects: QuestionImpact[]
  showWhen?: (answers: Partial<Record<InputKey, unknown>>) => boolean
  options?: QuestionOption[]
  min?: number
  max?: number
  step?: number
  parse?: (value: string) => T
}

const numberValue = (value: string) => Number(value)

export const baseQuestions: Question[] = [
  {
    id: 'loanPurpose', title: 'What will this borrowing be used for?', kind: 'choice', required: true,
    affects: ['product', 'rate', 'amount'], options: [
      { value: 'personal', label: 'Personal need', description: 'Medical, education, wedding, or household need' },
      { value: 'business', label: 'Business', description: 'Working capital or business expansion' },
      { value: 'property', label: 'Property', description: 'Purchase, construction, or renovation' },
      { value: 'vehicle', label: 'Vehicle', description: 'Car, two-wheeler, or EV' },
      { value: 'gold', label: 'Against gold', description: 'Short-term borrowing secured by gold' },
    ] satisfies QuestionOption<LoanPurpose>[],
  },
  {
    id: 'requestedAmount', title: 'How much are you considering borrowing?', kind: 'currency', required: true,
    affects: ['verdict', 'amount', 'emi', 'rate'], min: 10000, step: 1000, parse: numberValue,
  },
  {
    id: 'monthlyIncomeMin', title: 'What is your usual monthly take-home income?', kind: 'currency', required: true,
    affects: ['verdict', 'amount', 'emi', 'confidence'], min: 5000, step: 500, parse: numberValue,
  },
  {
    id: 'monthlyIncomeMax', title: 'What is the highest monthly income you can reasonably plan around?', kind: 'currency', required: true,
    helpText: 'For a stable salary, this can match your usual income. For variable income, use a realistic upper month.',
    affects: ['verdict', 'amount', 'emi', 'confidence', 'rate'], min: 5000, step: 500, parse: numberValue,
  },
  {
    id: 'incomeType', title: 'How do you earn your income?', kind: 'choice', required: true,
    affects: ['verdict', 'amount', 'rate', 'confidence', 'product'], options: [
      { value: 'salaried', label: 'Salaried', description: 'Regular employer-paid income' },
      { value: 'self-employed', label: 'Self-employed', description: 'Business or professional income' },
      { value: 'informal', label: 'Gig or informal', description: 'Variable, cash, platform, or contract income' },
    ] satisfies QuestionOption<IncomeType>[],
  },
  {
    id: 'existingEmis', title: 'How much do you currently pay in EMIs each month?', kind: 'currency', required: true,
    affects: ['verdict', 'amount', 'emi', 'confidence'], min: 0, step: 500, parse: numberValue,
  },
  {
    id: 'essentialExpenses', title: 'How much do essential household expenses cost each month?', kind: 'currency', required: true,
    helpText: 'Include rent, food, utilities, school fees, insurance, and regular family support.',
    affects: ['verdict', 'amount', 'emi', 'confidence'], min: 0, step: 500, parse: numberValue,
  },
  {
    id: 'age', title: 'How old are you?', kind: 'number', required: true,
    affects: ['amount', 'confidence'], min: 18, max: 65, step: 1, parse: numberValue,
  },
  {
    id: 'dependents', title: 'How many people depend on your income?', kind: 'number', required: true,
    affects: ['verdict', 'amount', 'emi'], min: 0, max: 15, step: 1, parse: numberValue,
  },
  {
    id: 'creditScore', title: 'Do you know your credit score?', kind: 'number', required: false,
    helpText: 'You can skip this. Skipping widens the fair-rate range; it does not assume a low score.',
    affects: ['rate', 'confidence', 'amount'], min: 300, max: 900, step: 1, parse: numberValue,
  },
]

export const followUpQuestions: Question[] = [
  {
    id: 'incomeYears', title: 'How long have you had this income source?', kind: 'number', required: true,
    affects: ['confidence', 'amount', 'rate'], min: 0, max: 50, step: 1, parse: numberValue,
    showWhen: answers => answers.incomeType !== undefined,
  },
  {
    id: 'emergencySavingsMonths', title: 'How many months of essential expenses could your savings cover?', kind: 'number', required: true,
    affects: ['verdict', 'confidence', 'emi'], min: 0, max: 36, step: 1, parse: numberValue,
    showWhen: answers => answers.incomeType !== undefined,
  },
  {
    id: 'incomeVolatility', title: 'How much does your monthly income vary?', kind: 'choice', required: true,
    affects: ['verdict', 'amount', 'emi', 'rate'], options: [
      { value: 'low', label: 'Low', description: 'Usually within a narrow range' },
      { value: 'medium', label: 'Medium', description: 'Some months are noticeably different' },
      { value: 'high', label: 'High', description: 'Income can change substantially month to month' },
    ],
    showWhen: answers => answers.incomeType === 'self-employed' || answers.incomeType === 'informal',
  },
  {
    id: 'documentedIncome', title: 'Can you document most of this income through bank statements or ITRs?', kind: 'boolean', required: true,
    affects: ['confidence', 'amount', 'rate', 'product'],
    showWhen: answers => answers.incomeType === 'self-employed',
  },
  {
    id: 'propertyValue', title: 'What is the approximate value of your unencumbered property?', kind: 'currency', required: true,
    helpText: 'Enter zero if you do not have suitable property. This is only considered for a secured route.',
    affects: ['product', 'amount', 'rate'], min: 0, step: 100000, parse: numberValue,
    showWhen: answers => answers.incomeType === 'self-employed' && answers.loanPurpose === 'business',
  },
  {
    id: 'propertyEncumbered', title: 'Is that property already pledged or carrying a loan?', kind: 'boolean', required: true,
    affects: ['product', 'amount'],
    showWhen: answers => typeof answers.propertyValue === 'number' && (answers.propertyValue as number) > 0,
  },
  {
    id: 'recentRepaymentStress', title: 'Have you recently missed, delayed, or struggled with a debt repayment?', kind: 'boolean', required: true,
    affects: ['verdict', 'confidence', 'amount', 'rate'],
    showWhen: answers => answers.incomeType === 'informal' || answers.existingEmis !== undefined,
  },
]

export function questionsFor(answers: Partial<Record<InputKey, unknown>>): Question[] {
  return [...baseQuestions, ...followUpQuestions].filter(question => !question.showWhen || question.showWhen(answers))
}

export function requiredQuestionsFor(answers: Partial<Record<InputKey, unknown>>): Question[] {
  return questionsFor(answers).filter(question => question.required)
}
