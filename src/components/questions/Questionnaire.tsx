import { useMemo, useState, type ReactNode } from 'react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { questionsFor, type Question } from '../../types/questions'
import { DEFAULT_PROFILE, type BorrowerProfile, type InputKey } from '../../types/borrower'
import { Button } from '../ui/button'
import { CURRENCIES, profileToInr, type CurrencyCode } from '../../lib/currency'

interface QuestionnaireProps { onComplete: (profile: BorrowerProfile) => void; initialAnswers?: Partial<BorrowerProfile>; currency: CurrencyCode }

function isEmpty(value: unknown) { return value === undefined || value === null || value === '' }

function productForPurpose(purpose: BorrowerProfile['loanPurpose']): BorrowerProfile['loanProduct'] {
  if (purpose === 'business') return 'secured-business-loan'
  if (purpose === 'property') return 'lap'
  if (purpose === 'vehicle') return 'vehicle-loan'
  if (purpose === 'gold') return 'gold-loan'
  return 'personal-loan'
}

export function Questionnaire({ onComplete, initialAnswers = {}, currency }: QuestionnaireProps) {
  const [answers, setAnswers] = useState<Partial<BorrowerProfile>>(initialAnswers)
  const questions = useMemo(() => questionsFor(answers), [answers])
  const required = questions.filter(question => question.required)
  const completed = required.filter(question => !isEmpty(answers[question.id])).length
  const progress = required.length ? (completed / required.length) * 100 : 0

  const update = (key: InputKey, nextValue: unknown) => setAnswers(previous => ({ ...previous, [key]: nextValue }))

  const submit = () => {
    if (required.some(question => isEmpty(answers[question.id]))) return
    const profile = profileToInr({ ...DEFAULT_PROFILE, ...answers } as BorrowerProfile, currency)
    profile.loanProduct = productForPurpose(profile.loanPurpose)
    onComplete(profile)
  }

  const loadExample = (example: Partial<BorrowerProfile>) => setAnswers(example)

  return (
    <div className="form-shell">
      <div className="form-head">
        <div>
          <p className="section-kicker">Borrowing profile</p>
          <div className="form-title-row"><h2>A few numbers. A clearer range.</h2><div className="example-badges"><span>Examples</span><button type="button" onClick={() => loadExample(priyaExample)}>Priya · salaried</button><button type="button" onClick={() => loadExample(raviExample)}>Ravi · business</button><button type="button" onClick={() => loadExample(anitaExample)}>Anita · stressed</button></div></div>
          <p>Required fields are marked by the flow. Unknown credit information can stay unknown.</p>
        </div>
        <div className="form-progress">
          <div className="form-progress-label"><span>{completed} of {required.length} required fields</span><span>{Math.round(progress)}%</span></div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        </div>
      </div>

      <div className="form-layout">
        <div className="form-card">
          <FormSection title="The loan" description="What you want to borrow and why.">
            <div className="field field-wide"><FieldLabel question={questions.find(item => item.id === 'loanPurpose')!} /><ChoiceField question={questions.find(item => item.id === 'loanPurpose')!} value={answers.loanPurpose} onChange={update} /></div>
            <div className="field"><FieldLabel question={questions.find(item => item.id === 'requestedAmount')!} /><CurrencyField question={questions.find(item => item.id === 'requestedAmount')!} value={answers.requestedAmount} currency={currency} onChange={update} /></div>
          </FormSection>

          <FormSection title="Income & commitments" description="Use take-home income and recurring monthly outflows.">
            {['monthlyIncomeMin', 'monthlyIncomeMax', 'incomeType', 'existingEmis', 'essentialExpenses'].map(id => {
              const question = questions.find(item => item.id === id)
              if (!question) return null
              return <QuestionField key={id} question={question} value={answers[question.id]} currency={currency} onChange={update} />
            })}
          </FormSection>

          <FormSection title="Profile & resilience" description="These details change the confidence and the safety margin.">
            {['age', 'dependents', 'creditScore', 'incomeYears', 'emergencySavingsMonths', 'incomeVolatility', 'documentedIncome', 'propertyValue', 'propertyEncumbered', 'recentRepaymentStress'].map(id => {
              const question = questions.find(item => item.id === id)
              if (!question) return null
              return <QuestionField key={id} question={question} value={answers[question.id]} currency={currency} onChange={update} />
            })}
          </FormSection>

          <div className="form-actions">
            <span className="hero-footnote"><ShieldCheck size={14} /> Nothing is sent or stored</span>
            <Button onClick={submit} disabled={completed < required.length}>See my borrowing range <ArrowRight size={15} /></Button>
          </div>
        </div>

        <aside className="form-sidebar">
          <div className="side-card">
            <h3>What you’ll get</h3>
            <div className="side-list"><div><b>01</b><span>Borrow, borrow less, or don’t borrow</span></div><div><b>02</b><span>Lender limit versus safe amount</span></div><div><b>03</b><span>Fair rate band and estimated APR</span></div><div><b>04</b><span>EMI ceiling and a stress check</span></div></div>
          </div>
          <div className="side-card"><h3>About unknowns</h3><p>Not knowing a score or savings figure widens the range. It is never silently treated as zero or as a bad score.</p></div>
        </aside>
      </div>
    </div>
  )
}

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="form-section"><h3>{title}</h3><p>{description}</p><div className="field-grid">{children}</div></section>
}

function FieldLabel({ question }: { question: Question }) {
  const reserveHelp = ['monthlyIncomeMin', 'monthlyIncomeMax', 'existingEmis', 'essentialExpenses'].includes(question.id)
  return <><label htmlFor={question.id}>{question.title}{question.required ? <span aria-hidden="true"> *</span> : null}</label>{(question.helpText || reserveHelp) && <p className={`field-help ${reserveHelp ? 'field-help-reserved' : ''}`}>{question.helpText || '\u00a0'}</p>}</>
}

function QuestionField({ question, value, currency, onChange }: { question: Question; value: unknown; currency: CurrencyCode; onChange: (key: InputKey, value: unknown) => void }) {
  const fullWidth = question.kind === 'choice' || question.kind === 'boolean' || question.id === 'recentRepaymentStress' || question.id === 'documentedIncome'
  return <div className={'field ' + (fullWidth ? 'field-wide' : '')}><FieldLabel question={question} />{question.kind === 'choice' ? <ChoiceField question={question} value={value} onChange={onChange} /> : question.kind === 'boolean' ? <BooleanField question={question} value={value} onChange={onChange} /> : question.kind === 'currency' ? <CurrencyField question={question} value={value} currency={currency} onChange={onChange} /> : <NumberField question={question} value={value} onChange={onChange} />}</div>
}

function ChoiceField({ question, value, onChange }: { question: Question; value: unknown; onChange: (key: InputKey, value: unknown) => void }) {
  return <div className="choice-grid">{question.options?.map(option => <button key={option.value} type="button" className={`choice-button ${value === option.value ? 'selected' : ''}`} onClick={() => onChange(question.id, option.value)}><strong>{option.label}</strong>{option.description && <span>{option.description}</span>}</button>)}</div>
}

function BooleanField({ question, value, onChange }: { question: Question; value: unknown; onChange: (key: InputKey, value: unknown) => void }) {
  return <div className="choice-grid">{[true, false].map(option => <button key={String(option)} type="button" className={`choice-button ${value === option ? 'selected' : ''}`} onClick={() => onChange(question.id, option)}><strong>{option ? 'Yes' : 'No'}</strong><span>{option ? 'This applies to me' : 'This does not apply'}</span></button>)}</div>
}

function CurrencyField({ question, value, currency, onChange }: { question: Question; value: unknown; currency: CurrencyCode; onChange: (key: InputKey, value: unknown) => void }) { return <div className="field-prefix"><span>{CURRENCIES[currency].symbol}</span><input id={question.id} className="field-control" type="number" min={question.min} max={question.max} step={question.step} value={typeof value === 'number' || typeof value === 'string' ? value : ''} onChange={event => onChange(question.id, question.parse ? question.parse(event.target.value) : Number(event.target.value))} /></div> }
function NumberField({ question, value, onChange }: { question: Question; value: unknown; onChange: (key: InputKey, value: unknown) => void }) { return <input id={question.id} className="field-control" type="number" min={question.min} max={question.max} step={question.step} value={typeof value === 'number' || typeof value === 'string' ? value : ''} onChange={event => onChange(question.id, question.parse ? question.parse(event.target.value) : Number(event.target.value))} /> }

const priyaExample: Partial<BorrowerProfile> = {
  loanPurpose: 'personal', requestedAmount: 800000, monthlyIncomeMin: 110000, monthlyIncomeMax: 110000, incomeType: 'salaried', existingEmis: 14000,
  essentialExpenses: 28000, age: 29, creditScore: 780, dependents: 0, incomeYears: 5, emergencySavingsMonths: 6, recentRepaymentStress: false,
}

const anitaExample: Partial<BorrowerProfile> = {
  loanPurpose: 'vehicle', requestedAmount: 150000, monthlyIncomeMin: 26000, monthlyIncomeMax: 30000, incomeType: 'informal', existingEmis: 4500,
  essentialExpenses: 22000, age: 35, creditScore: null, dependents: 2, incomeYears: 2, emergencySavingsMonths: 0, incomeVolatility: 'high', recentRepaymentStress: true,
}

const raviExample: Partial<BorrowerProfile> = {
  loanPurpose: 'business', requestedAmount: 1500000, monthlyIncomeMin: 40000, monthlyIncomeMax: 80000, incomeType: 'self-employed', existingEmis: 0,
  essentialExpenses: 30000, age: 42, creditScore: null, dependents: 3, incomeYears: 14, emergencySavingsMonths: 4, incomeVolatility: 'medium',
  documentedIncome: true, propertyValue: 4500000, propertyEncumbered: false, recentRepaymentStress: false,
}
