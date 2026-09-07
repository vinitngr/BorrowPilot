import { useState } from 'react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Questionnaire } from './components/questions/Questionnaire'
import { ResultsScreen } from './components/results/ResultsScreen'
import { Button } from './components/ui/button'
import { evaluateBorrower } from './engine/decision'
import { type CurrencyCode } from './lib/currency'
import logoUrl from '../assets/borrowpilot-logo.svg'
import markUrl from '../assets/borrowpilot-mark.svg'
import type { BorrowerProfile } from './types/borrower'
import type { BorrowerResult } from './types/results'

type Screen = 'home' | 'questions' | 'results'

export function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const currency: CurrencyCode = 'INR'
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
          <img src={logoUrl} alt="BorrowPilot" />
        </button>
        <div className="header-meta"><span className="status-dot" /> Private by design <span className="header-divider" /><span className="locale-control">India · INR</span></div>
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
              const nextProfile = { ...profile, requestedAmount: amount }
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
        <div className="home-symbol"><img src={markUrl} alt="BorrowPilot" /></div>
        <h1>Know your number<br />before they quote theirs.</h1>
        <p>BorrowPilot helps you decide what to borrow, what to pay, and what to negotiate.</p>
        <div className="home-actions"><Button onClick={() => onStart({})}>Check my borrowing range <ArrowRight size={16} /></Button>{/* Reserved for a future guided assistant; hidden until it performs real work. */}</div>
        <div className="hero-footnote"><ShieldCheck size={15} /> No login · no bureau pull · nothing stored</div>
      </section>
    </div>
  )
}
