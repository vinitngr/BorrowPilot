import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CircleHelp } from 'lucide-react'
import { questionsFor, type Question } from '../../types/questions'
import { DEFAULT_PROFILE, type BorrowerProfile, type InputKey } from '../../types/borrower'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Progress } from '../ui/progress'

interface QuestionnaireProps {
  onComplete: (profile: BorrowerProfile) => void
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function productForPurpose(purpose: BorrowerProfile['loanPurpose']): BorrowerProfile['loanProduct'] {
  if (purpose === 'business') return 'secured-business-loan'
  if (purpose === 'property') return 'lap'
  if (purpose === 'vehicle') return 'vehicle-loan'
  if (purpose === 'gold') return 'gold-loan'
  return 'personal-loan'
}

export function Questionnaire({ onComplete }: QuestionnaireProps) {
  const [answers, setAnswers] = useState<Partial<BorrowerProfile>>({})
  const [step, setStep] = useState(0)
  const questions = useMemo(() => questionsFor(answers), [answers])
  const question = questions[step] as Question | undefined
  const value = question ? answers[question.id] : undefined

  if (!question) return null

  const update = (key: InputKey, nextValue: unknown) => {
    setAnswers(previous => ({ ...previous, [key]: nextValue }))
  }

  const next = () => {
    if (question.required && isEmpty(value)) return
    if (step === questions.length - 1) {
      const profile = { ...DEFAULT_PROFILE, ...answers } as BorrowerProfile
      profile.loanProduct = productForPurpose(profile.loanPurpose)
      onComplete(profile)
      return
    }
    setStep(current => Math.min(current + 1, questions.length - 1))
  }

  const back = () => setStep(current => Math.max(0, current - 1))
  const progress = ((step + 1) / questions.length) * 100

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Progress value={progress} />
        </div>
        <span className="shrink-0 text-sm font-medium text-[#6b7d76]">{step + 1} of {questions.length}</span>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-10">
          <div className="mb-9 flex items-start gap-3">
            <div className="mt-1 rounded-full bg-[#e8f2ed] p-2 text-[#397669]"><CircleHelp size={18} /></div>
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#579184]">Your situation</p>
              <h2 className="font-serif text-3xl tracking-[-0.04em] text-[#213a35] sm:text-4xl">{question.title}</h2>
              {question.helpText && <p className="mt-3 max-w-lg text-sm leading-6 text-[#6b7d76]">{question.helpText}</p>}
            </div>
          </div>

          {question.kind === 'choice' && (
            <div className="grid gap-3 sm:grid-cols-2">
              {question.options?.map(option => (
                <button key={option.value} type="button" onClick={() => update(question.id, option.value)} className={`rounded-2xl border p-4 text-left transition ${value === option.value ? 'border-[#4e8b7d] bg-[#edf6f1] ring-2 ring-[#cce5db]' : 'border-[#dce5df] bg-white hover:border-[#91b7aa]'}`}>
                  <span className="block font-semibold text-[#274a42]">{option.label}</span>
                  {option.description && <span className="mt-1 block text-sm leading-5 text-[#71817b]">{option.description}</span>}
                </button>
              ))}
            </div>
          )}

          {(question.kind === 'currency' || question.kind === 'number') && (
            <div className="max-w-sm">
              <div className="relative">
                {question.kind === 'currency' && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78918a]">₹</span>}
                <Input autoFocus type="number" min={question.min} max={question.max} step={question.step} value={typeof value === 'number' || typeof value === 'string' ? value : ''} onChange={event => update(question.id, question.parse ? question.parse(event.target.value) : Number(event.target.value))} className={question.kind === 'currency' ? 'pl-9 text-lg' : 'text-lg'} />
              </div>
            </div>
          )}

          {question.kind === 'boolean' && (
            <div className="grid max-w-sm grid-cols-2 gap-3">
              {[true, false].map(option => <button key={String(option)} type="button" onClick={() => update(question.id, option)} className={`rounded-2xl border p-4 font-semibold transition ${value === option ? 'border-[#4e8b7d] bg-[#edf6f1] text-[#2b685c]' : 'border-[#dce5df] text-[#426259] hover:border-[#91b7aa]'}`}>{option ? 'Yes' : 'No'}</button>)}
            </div>
          )}

          {question.id === 'creditScore' && <button type="button" onClick={() => update('creditScore', null)} className="mt-4 text-sm font-medium text-[#477b70] underline underline-offset-4">I don’t know my score</button>}

          <div className="mt-10 flex items-center justify-between gap-3 border-t border-[#edf1ee] pt-6">
            <Button type="button" variant="ghost" onClick={back} disabled={step === 0}><ArrowLeft size={16} className="mr-2" /> Back</Button>
            <Button type="button" onClick={next} disabled={question.required && isEmpty(value)}>{step === questions.length - 1 ? 'See my assessment' : 'Continue'} <ArrowRight size={16} className="ml-2" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
