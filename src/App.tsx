import { useState, type ReactNode } from 'react'
import { ArrowRight, Check, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import { Questionnaire } from './components/questions/Questionnaire'
import { ResultsScreen } from './components/results/ResultsScreen'
import { Button } from './components/ui/button'
import { evaluateBorrower } from './engine/decision'
import type { BorrowerProfile } from './types/borrower'
import type { BorrowerResult } from './types/results'

type Screen = 'home' | 'questions' | 'results'

export function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [profile, setProfile] = useState<BorrowerProfile | null>(null)
  const [result, setResult] = useState<BorrowerResult | null>(null)

  const complete = (nextProfile: BorrowerProfile) => {
    setProfile(nextProfile)
    setResult(evaluateBorrower(nextProfile))
    setScreen('results')
  }

  return <div className="min-h-screen bg-[#f7f5f0] text-[#213a35]">
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8"><button onClick={() => setScreen('home')} className="flex items-center gap-2 text-sm font-bold tracking-[-0.01em] text-[#2b5c50]"><span className="grid size-8 place-items-center rounded-xl bg-[#dceee5] text-[#2d6b5b]"><HeartHandshake size={17} /></span> Borrower Copilot</button><span className="hidden text-sm text-[#71817b] sm:block">A clearer conversation with your lender</span></header>
    <main className="px-5 pb-16 pt-8 sm:px-8 sm:pt-14">
      {screen === 'home' && <Home onStart={() => setScreen('questions')} />}
      {screen === 'questions' && <Questionnaire onComplete={complete} />}
      {screen === 'results' && profile && result && <ResultsScreen profile={profile} result={result} onBack={() => setScreen('questions')} onAmountChange={amount => { const nextProfile = { ...profile, requestedAmount: amount }; setProfile(nextProfile); setResult(evaluateBorrower(nextProfile)) }} />}
    </main>
    <footer className="mx-auto w-full max-w-6xl px-5 pb-8 text-xs leading-5 text-[#8a9892] sm:px-8">Estimates are educational, not a bank approval or credit-bureau decision. Rates and fees vary by lender.</footer>
  </div>
}

function Home({ onStart }: { onStart: () => void }) {
  return <div className="mx-auto max-w-6xl">
    <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
      <div><div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#e3f0e9] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#397569]"><Sparkles size={14} /> Borrower intelligence</div><h1 className="max-w-3xl font-serif text-6xl leading-[0.94] tracking-[-0.065em] text-[#213a35] sm:text-8xl">Borrow with your eyes open.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-[#63766e]">Understand what a lender may offer, what your budget can safely carry, and how to negotiate the difference—in about five minutes.</p><Button onClick={onStart} className="mt-9">Start my assessment <ArrowRight size={17} className="ml-2" /></Button></div>
      <div className="relative"><div className="absolute -inset-4 rounded-[3rem] bg-[#e3eee7] blur-2xl" /><div className="relative rounded-[2rem] border border-[#d8e5dc] bg-white p-7 shadow-[0_20px_60px_rgba(34,67,58,0.09)] sm:p-9"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-[#386e61]">A healthier borrowing decision</span><ShieldCheck className="text-[#569483]" size={21} /></div><div className="mt-8 rounded-2xl bg-[#edf6f1] p-5"><p className="text-sm text-[#628077]">Safe amount for your budget</p><p className="mt-2 font-serif text-4xl tracking-[-0.05em] text-[#245b4e]">₹3.8L</p><div className="mt-5 h-2 rounded-full bg-[#d6e9df]"><div className="h-2 w-[58%] rounded-full bg-[#579184]" /></div><div className="mt-3 flex justify-between text-xs text-[#6e887d]"><span>Safe to carry</span><span>₹6.5L lender limit</span></div></div><div className="mt-5 grid grid-cols-2 gap-3"><MiniSignal icon={<Check size={15} />} label="Fair rate" value="12.5–15%" /><MiniSignal icon={<ShieldCheck size={15} />} label="Safe EMI" value="₹11,200" /></div></div></div>
    </section>
    <section className="mt-20 grid gap-4 border-t border-[#dfe7e1] pt-8 sm:grid-cols-3"><Benefit title="Lender vs. safe" text="See the gap between eligibility and affordability." /><Benefit title="Honest ranges" text="Unknown answers widen estimates instead of hiding uncertainty." /><Benefit title="Negotiation-ready" text="Take a clear, useful summary to your lender." /></section>
  </div>
}

function MiniSignal({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="rounded-xl border border-[#e2eae4] p-3"><div className="flex items-center gap-1.5 text-xs text-[#769087]">{icon}{label}</div><p className="mt-1 font-semibold text-[#2c5c50]">{value}</p></div> }
function Benefit({ title, text }: { title: string; text: string }) { return <div className="px-1"><h2 className="font-semibold text-[#31584e]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#75867f]">{text}</p></div> }
