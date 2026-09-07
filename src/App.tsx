import { useState } from 'react'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Questionnaire } from './components/questions/Questionnaire'
import { ResultsScreen } from './components/results/ResultsScreen'
import { Button } from './components/ui/button'
import { evaluateBorrower } from './engine/decision'
import { CURRENCIES, toInr, type CurrencyCode } from './lib/currency'
import type { BorrowerProfile } from './types/borrower'
import type { BorrowerResult } from './types/results'

type Screen = 'home' | 'questions' | 'results'

export function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [currency, setCurrency] = useState<CurrencyCode>('INR')
  const [starterAnswers, setStarterAnswers] = useState<Partial<BorrowerProfile>>({})
  const [profile, setProfile] = useState<BorrowerProfile | null>(null)
  const [result, setResult] = useState<BorrowerResult | null>(null)

  const complete = (nextProfile: BorrowerProfile) => {
    setProfile(nextProfile)
    setResult(evaluateBorrower(nextProfile))
    setScreen('results')
  }

  return (
    <div className={`app-shell ${screen === 'home' ? 'home-mode' : ''}`}>
      <header className="app-header">
        <button className="brand" onClick={() => setScreen('home')} aria-label="Go to BorrowPilot home">
          <span className="brand-mark"><Sparkles size={15} /></span>
          <span>BorrowPilot</span>
        </button>
        <div className="header-meta"><span className="status-dot" /> Private by design <span className="header-divider" /><label className="locale-control"><select value={currency} onChange={event => setCurrency(event.target.value as CurrencyCode)} aria-label="Currency and country" title="Display currency">{Object.values(CURRENCIES).map(option => <option key={option.code} value={option.code}>{option.label}</option>)}</select></label></div>
      </header>

      <main className={`app-main ${screen === 'home' ? 'home-main' : 'form-main'}`}>
        {screen === 'home' && <Home onStart={answers => { setStarterAnswers(answers); setScreen('questions') }} />}
        {screen === 'questions' && <Questionnaire initialAnswers={starterAnswers} currency={currency} onComplete={complete} />}
        {screen === 'results' && profile && result && (
          <ResultsScreen
            profile={profile}
            result={result}
            currency={currency}
            onBack={() => setScreen('questions')}
            onAmountChange={amount => {
              const nextProfile = { ...profile, requestedAmount: toInr(amount, currency) }
              setProfile(nextProfile)
              setResult(evaluateBorrower(nextProfile))
            }}
          />
        )}
      </main>

    </div>
  )
}

function Home({ onStart }: { onStart: (answers: Partial<BorrowerProfile>) => void }) {
  return (
    <div className="home-view">
      <section className="home-center">
        <div className="home-symbol"><Sparkles size={25} /></div>
        <h1>Know your number<br />before they quote theirs.</h1>
        <p>BorrowPilot helps you decide what to borrow, what to pay, and what to negotiate.</p>
        <div className="home-actions"><Button onClick={() => onStart({})}>Check my borrowing range <ArrowRight size={16} /></Button><button type="button" className="ai-action" onClick={() => onStart({})}><span className="ai-spark">✦</span><span><strong>Let BorrowPilot fill this in</strong><small>Answer a few prompts with AI assistance</small></span><ArrowRight size={14} /></button></div>
        <div className="hero-footnote"><ShieldCheck size={15} /> No login · no bureau pull · nothing stored</div>
      </section>
    </div>
  )
}
