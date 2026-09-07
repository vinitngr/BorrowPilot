import { AlertTriangle, ArrowLeft, CheckCircle2, Info, ShieldCheck } from 'lucide-react'
import type { BorrowerProfile } from '../../types/borrower'
import type { BorrowerResult } from '../../types/results'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Input } from '../ui/input'
import { formatPercent, formatRupees } from '../../lib/utils'

interface ResultsScreenProps {
  profile: BorrowerProfile
  result: BorrowerResult
  onBack: () => void
  onAmountChange: (amount: number) => void
}

const verdictCopy = {
  borrow: { label: 'Borrow', icon: CheckCircle2, tone: 'bg-[#e4f2e9] text-[#23634e]' },
  'borrow-less': { label: 'Borrow less', icon: ShieldCheck, tone: 'bg-[#fff1d9] text-[#8c5d17]' },
  'dont-borrow': { label: 'Don’t borrow', icon: AlertTriangle, tone: 'bg-[#fde7e3] text-[#a33e32]' },
} as const

export function ResultsScreen({ profile, result, onBack, onAmountChange }: ResultsScreenProps) {
  const verdict = verdictCopy[result.verdict]
  const VerdictIcon = verdict.icon
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-7 flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack}><ArrowLeft size={16} className="mr-2" /> Revisit answers</Button>
        <Badge>{result.confidence} confidence · {result.confidenceScore}/100</Badge>
      </div>

      <section className="mb-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden border-0 bg-[#1f5148] text-white">
          <CardContent className="p-7 sm:p-10">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.14em] text-[#9ed1bd]">Your borrowing verdict</p>
            <div className="mb-4 flex items-center gap-3"><div className={`rounded-full p-2 ${verdict.tone}`}><VerdictIcon size={22} /></div><h1 className="font-serif text-5xl tracking-[-0.05em] sm:text-6xl">{verdict.label}</h1></div>
            <p className="max-w-xl text-lg leading-8 text-[#d9eee5]">{result.verdictExplanation}</p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#d9eee5]"><span className="rounded-full bg-white/10 px-4 py-2">Safe EMI up to {formatRupees(result.recommendedEmi.max)}</span><span className="rounded-full bg-white/10 px-4 py-2">Fair rate {formatPercent(result.rate.annualRate.min)}–{formatPercent(result.rate.annualRate.max)}</span></div>
          </CardContent>
        </Card>
        <Card><CardHeader><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#579184]">The number that matters</p><h2 className="font-serif text-3xl tracking-[-0.04em] text-[#213a35]">Use this amount, not just the lender’s maximum.</h2></CardHeader><CardContent><div className="rounded-2xl bg-[#edf6f1] p-5"><p className="text-sm text-[#5d766e]">Recommended safe borrowing</p><p className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#245c50]">{formatRupees(result.recommendedAmount.max)}</p><p className="mt-2 text-sm leading-5 text-[#5d766e]">Built from your expenses, existing EMIs, income resilience, and a stress check.</p></div></CardContent></Card>
      </section>

      <Card className="mt-6"><CardHeader><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#579184]">Try a different amount</p><h2 className="font-serif text-3xl tracking-[-0.04em] text-[#213a35]">See the decision update live.</h2></CardHeader><CardContent><div className="flex flex-col gap-4 sm:flex-row sm:items-end"><label className="block max-w-xs flex-1 text-sm font-medium text-[#426259]">Loan amount considered<Input type="number" min={0} step={1000} value={profile.requestedAmount} onChange={event => onAmountChange(Number(event.target.value))} className="mt-2" /></label><p className="max-w-lg text-sm leading-6 text-[#71817b]">This recalculates the verdict and recommendation using the same answers. You do not need to repeat the questionnaire.</p></div><div className="mt-7 overflow-x-auto"><div className="mb-3 text-sm font-semibold text-[#31584e]">Tenure trade-off at your safe EMI ceiling</div><div className="grid min-w-[520px] grid-cols-3 gap-3">{result.tenureTradeoffs.map(option => <div key={option.tenureMonths} className="rounded-xl bg-[#f3f7f3] p-4"><p className="text-xs text-[#78918a]">{option.tenureMonths} months</p><p className="mt-1 font-semibold text-[#2a5b4f]">{formatRupees(option.amount)}</p><p className="mt-1 text-xs text-[#71817b]">{formatRupees(option.totalRepayment)} total repayment</p></div>)}</div></div></CardContent></Card>

      <section className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#579184]">Two different limits</p><h2 className="font-serif text-3xl tracking-[-0.04em] text-[#213a35]">Lender vs. safe</h2></div><Info className="text-[#7ea095]" size={20} /></div></CardHeader><CardContent className="space-y-5"><Metric label="Likely lender sanction" value={formatRupees(result.likelySanction.amount.max)} detail="What a lender may consider under an eligibility-style check" /><Metric label="Safe amount for you" value={formatRupees(result.safeBorrowing.amount.max)} detail="What your monthly budget can carry with more resilience" /><div className="h-3 overflow-hidden rounded-full bg-[#f1e9db]"><div className="h-full rounded-full bg-[#d49c4c]" style={{ width: `${Math.min(100, result.likelySanction.amount.max ? result.safeBorrowing.amount.max / result.likelySanction.amount.max * 100 : 0)}%` }} /></div></CardContent></Card>
        <Card><CardHeader><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#579184]">Monthly reality</p><h2 className="font-serif text-3xl tracking-[-0.04em] text-[#213a35]">Your repayment ceiling</h2></CardHeader><CardContent className="space-y-4"><Metric label="Recommended maximum EMI" value={formatRupees(result.recommendedEmi.max)} detail="Keep the EMI below this ceiling" /><Metric label="Existing EMI load" value={formatPercent(result.debtBurden)} detail="Before adding the new loan" /><Metric label="Estimated APR" value={`${formatPercent(result.rate.estimatedApr.min)}–${formatPercent(result.rate.estimatedApr.max)}`} detail="Includes an estimated processing fee" /></CardContent></Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card><CardHeader><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#579184]">Stress check</p><h2 className="font-serif text-3xl tracking-[-0.04em] text-[#213a35]">If income falls 20%</h2></CardHeader><CardContent><p className="text-sm leading-6 text-[#61756e]">Your estimated income would be {formatRupees(result.stressScenario.monthlyIncome)}. Safe new EMI: <strong className="text-[#294d44]">{formatRupees(result.stressScenario.safeEmi)}</strong>.</p><div className={`mt-5 rounded-2xl p-4 text-sm leading-6 ${result.stressScenario.passes ? 'bg-[#e8f3ec] text-[#28634f]' : 'bg-[#fff0e6] text-[#9b512f]'}`}>{result.stressScenario.passes ? 'This still leaves a workable repayment buffer.' : 'This would put the repayment under pressure; consider borrowing less or waiting.'}</div></CardContent></Card>
        <Card><CardHeader><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#579184]">Why this result</p><h2 className="font-serif text-3xl tracking-[-0.04em] text-[#213a35]">Signals in your profile</h2></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><SignalList title="Working in your favour" items={result.positiveFactors} positive /><SignalList title="Watch-outs" items={result.riskFactors.length ? result.riskFactors : result.reasons} /></CardContent></Card>
      </section>

      <Card className="mt-6 border-[#cde2d8] bg-[#f2f8f4]"><CardContent className="p-7 sm:p-9"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#579184]">Negotiation Card</p><h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#213a35]">Take these numbers to the lender.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#60766e]">Ask why the quote differs from this fair range, and whether the fee or rate can be reduced without extending the loan beyond your safe tenure.</p></div><Button variant="secondary">Copy summary</Button></div><div className="mt-7 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><NegotiationItem label="Verdict" value={verdict.label} /><NegotiationItem label="Fair rate" value={`${formatPercent(result.rate.annualRate.min)}–${formatPercent(result.rate.annualRate.max)}`} /><NegotiationItem label="Safe amount" value={formatRupees(result.recommendedAmount.max)} /><NegotiationItem label="Max EMI" value={formatRupees(result.recommendedEmi.max)} /></div></CardContent></Card>
    </div>
  )
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <div><p className="text-sm text-[#71817b]">{label}</p><p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#274a42]">{value}</p><p className="mt-1 text-xs leading-5 text-[#84958e]">{detail}</p></div> }
function SignalList({ title, items, positive = false }: { title: string; items: string[]; positive?: boolean }) { return <div><h3 className="mb-3 text-sm font-semibold text-[#31584e]">{title}</h3>{items.length ? <ul className="space-y-3">{items.slice(0, 3).map(item => <li key={item} className="flex gap-2 text-sm leading-5 text-[#657870]"><span className={`mt-1 ${positive ? 'text-[#4c9078]' : 'text-[#c48b3e]'}`}><span className="sr-only">{positive ? 'Positive: ' : 'Risk: '}</span>•</span>{item}</li>)}</ul> : <p className="text-sm text-[#84958e]">No major signals recorded.</p>}</div> }
function NegotiationItem({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white/75 p-4"><p className="text-xs text-[#779087]">{label}</p><p className="mt-1 font-semibold text-[#2a594d]">{value}</p></div> }
