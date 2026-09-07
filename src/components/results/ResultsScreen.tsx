import { useState } from 'react'
import { ArrowLeft, Check, Copy, Info, Printer, ShieldCheck } from 'lucide-react'
import type { BorrowerProfile } from '../../types/borrower'
import type { BorrowerResult } from '../../types/results'
import { Button } from '../ui/button'
import { formatAmount, formatPercent, type CurrencyCode } from '../../lib/utils'
import { fromInr } from '../../lib/currency'

interface ResultsScreenProps { profile: BorrowerProfile; result: BorrowerResult; currency: CurrencyCode; onBack: () => void; onAmountChange: (amount: number) => void }

const verdictCopy = {
  borrow: { label: 'Borrow', tone: 'positive' },
  'borrow-less': { label: 'Borrow less', tone: 'caution' },
  'dont-borrow': { label: "Don't borrow", tone: 'danger' },
} as const

export function ResultsScreen({ profile, result, currency, onBack, onAmountChange }: ResultsScreenProps) {
  const [copied, setCopied] = useState(false)
  const verdict = verdictCopy[result.verdict]
  const safeRatio = result.likelySanction.amount.max ? Math.min(100, result.safeBorrowing.amount.max / result.likelySanction.amount.max * 100) : 0
  const negotiationSummary = `BorrowPilot assessment\nVerdict: ${verdict.label}\nFair annual rate: ${formatPercent(result.rate.annualRate.min)}–${formatPercent(result.rate.annualRate.max)}\nSafe amount: ${formatAmount(result.recommendedAmount.max, currency)}\nMaximum recommended EMI: ${formatAmount(result.recommendedEmi.max, currency)}\nLikely lender sanction: ${formatAmount(result.likelySanction.amount.max, currency)}`
  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(negotiationSummary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="dashboard-shell">
      <div className="dashboard-head">
        <div><p className="section-kicker">Your borrowing snapshot</p><h2>Here is what your numbers support.</h2><p>Ranges are estimates. The explanation is as important as the number.</p></div>
        <div className="header-actions"><span className="confidence-chip">{result.confidence} confidence · {result.confidenceScore}/100</span><Button className="save-report-button" onClick={saveReportAsPdf}><Printer size={14} /> Save PDF</Button><Button variant="ghost" onClick={onBack}><ArrowLeft size={14} /> Revisit answers</Button></div>
      </div>

      <div className="dashboard-grid">
        <section className="dash-card verdict-card"><span className="card-kicker">Recommendation</span><div className="verdict-main"><h1>{verdict.label}</h1><p className="verdict-copy">{result.verdictExplanation}</p></div></section>
        <section className="dash-card safe-card"><span className="card-kicker">Use this amount, not just the maximum</span><strong className="big-value">{formatAmount(result.recommendedAmount.max, currency)}</strong><p>Recommended safe borrowing, after expenses, existing EMIs, and a stress check.</p></section>

        <MetricCard label="Likely lender sanction" value={formatAmount(result.likelySanction.amount.max, currency)} detail="Eligibility-style estimate" />
        <MetricCard label="Maximum recommended EMI" value={formatAmount(result.recommendedEmi.max, currency)} detail="Keep new EMI below this" />
        <MetricCard label="Fair annual rate" value={`${formatPercent(result.rate.annualRate.min)}–${formatPercent(result.rate.annualRate.max)}`} detail="A profile-based range" />
        <MetricCard label="Estimated APR" value={`${formatPercent(result.rate.estimatedApr.min)}–${formatPercent(result.rate.estimatedApr.max)}`} detail="Includes processing fee" />

        <section className="dash-card wide-card"><CardTitle kicker="Two different limits" title="Lender limit vs. safe limit" note="The lender may approve more than your monthly life should carry." /><div className="comparison"><div className="comparison-labels"><span>Safe amount {formatAmount(result.safeBorrowing.amount.max, currency)}</span><span>Likely sanction {formatAmount(result.likelySanction.amount.max, currency)}</span></div><div className="comparison-track"><div className="comparison-safe" style={{ width: `${safeRatio}%` }} /></div><div className="comparison-legend"><span><i />Safe amount</span><span className="sanction"><i />Lender sanction</span></div></div><div className="tradeoff-list">{result.tenureTradeoffs.map(option => <div className="tradeoff" key={option.tenureMonths}><span>{option.tenureMonths} months</span><strong>{formatAmount(option.amount, currency)}</strong><small>{formatAmount(option.totalRepayment, currency)} total</small></div>)}</div></section>

        <section className="dash-card medium-card"><CardTitle kicker="Stress check" title={result.stressScenario.label} note="A lower-income month should still leave room to repay." /><div className="stress-box"><div><span>Safe new EMI</span><strong>{formatAmount(result.stressScenario.safeEmi, currency)}</strong></div><p>{result.stressScenario.passes ? 'This leaves a workable repayment buffer.' : 'This puts repayment under pressure. Consider borrowing less or waiting.'}</p></div><div className="comparison-labels" style={{ marginTop: 18 }}><span>Income under stress</span><strong>{formatAmount(result.stressScenario.monthlyIncome, currency)}</strong></div></section>

        <section className="dash-card wide-card"><CardTitle kicker="Why this result" title="Signals in your profile" /><div className="signal-grid"><SignalList title="Working in your favour" items={result.positiveFactors} /><SignalList title="Watch-outs" items={result.riskFactors.length ? result.riskFactors : result.reasons} risks /></div></section>

        <section className="dash-card medium-card adjust-and-compare"><CardTitle kicker="Adjust and compare" title="Try another amount" note="The result updates without repeating your answers." /><label className="field" style={{ display: 'block', marginTop: 17 }}><span className="field-help" style={{ display: 'block', marginBottom: 7 }}>Loan amount considered</span><div className="field-prefix"><span>{currency}</span><input className="field-control" type="number" min={0} step={1000} value={Math.round(fromInr(profile.requestedAmount, currency))} onChange={event => onAmountChange(Number(event.target.value))} /></div></label><div className="card-note" style={{ marginTop: 13 }}>Product route: {productLabel(result.productRecommendation)} · fixed INR-calibrated rules, displayed in {currency}</div></section>

        <section className="dash-card negotiation-card"><div className="card-head"><div><span className="card-kicker" style={{ color: '#2864d7' }}>Negotiation card</span><h3>Take these numbers to the lender.</h3><p className="card-note">Compare the quote against your fair range and ask what is driving the difference.</p></div><Button variant="secondary" onClick={copySummary}>{copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy summary'}</Button></div><div className="negotiation-grid"><NegotiationItem label="Verdict" value={verdict.label} /><NegotiationItem label="Fair rate" value={`${formatPercent(result.rate.annualRate.min)}–${formatPercent(result.rate.annualRate.max)}`} /><NegotiationItem label="Safe amount" value={formatAmount(result.recommendedAmount.max, currency)} /><NegotiationItem label="Max EMI" value={formatAmount(result.recommendedEmi.max, currency)} /></div></section>

        <section className="chart-row">
          <div className="dash-card chart-panel"><CardTitle kicker="Tenure trade-off" title="More time costs more overall" note="Longer tenure supports a larger amount at the same safe EMI ceiling, but total repayment rises." /><div className="bar-chart">{result.tenureTradeoffs.map(option => <div className="bar-group" key={option.tenureMonths}><div className="bar-label"><span>{option.tenureMonths} months</span><strong>{formatAmount(option.totalRepayment, currency)} total</strong></div><ChartBar label="Safe amount" value={option.amount} max={Math.max(...result.tenureTradeoffs.map(item => item.totalRepayment))} color="blue" currency={currency} /><ChartBar label="Total repayment" value={option.totalRepayment} max={Math.max(...result.tenureTradeoffs.map(item => item.totalRepayment))} color="slate" currency={currency} /></div>)}</div></div>
          <div className="dash-card chart-panel"><CardTitle kicker="Monthly income allocation" title="What your income is carrying" note="The recommended EMI should fit after essentials and existing commitments." /><div className="bar-chart allocation-chart"><ChartBar label="Essential expenses" value={profile.essentialExpenses ?? profile.monthlyIncomeMin * 0.5} max={profile.monthlyIncomeMin} color="slate" currency={currency} /><ChartBar label="Existing EMIs" value={profile.existingEmis} max={profile.monthlyIncomeMin} color="amber" currency={currency} /><ChartBar label="Recommended new EMI" value={result.recommendedEmi.max} max={profile.monthlyIncomeMin} color="blue" currency={currency} /><ChartBar label="Remaining buffer" value={Math.max(0, profile.monthlyIncomeMin - (profile.essentialExpenses ?? profile.monthlyIncomeMin * 0.5) - profile.existingEmis - result.recommendedEmi.max)} max={profile.monthlyIncomeMin} color="green" currency={currency} /></div></div>
        </section>
        <section className="dash-card stress-chart-wide"><CardTitle kicker="Resilience comparison" title="What changes in a difficult month" note="The stress view makes the repayment buffer visible instead of hiding it inside the verdict." /><div className="stress-compare-grid"><StressComparison label="Monthly income" normal={profile.monthlyIncomeMin} stressed={result.stressScenario.monthlyIncome} currency={currency} /><StressComparison label="Safe new EMI capacity" normal={result.recommendedEmi.max} stressed={result.stressScenario.safeEmi} currency={currency} /></div><div className="chart-legend"><span><i className="chart-normal" />Normal month</span><span><i className="chart-stressed" />20% income stress</span></div></section>
      </div>
      <div className="print-footer">BorrowPilot · borrower assessment · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
    </div>
  )
}

function CardTitle({ kicker, title, note }: { kicker: string; title: string; note?: string }) { return <div className="card-head"><div><span className="card-kicker">{kicker}</span><h3>{title}</h3>{note && <p className="card-note">{note}</p>}</div><Info size={15} color="#9ba4af" /></div> }
function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) { return <section className="dash-card metric-card"><span className="card-kicker">Output</span><p className="metric-label">{label}</p><p className="metric-value">{value}</p><p className="metric-detail">{detail}</p></section> }
function SignalList({ title, items, risks = false }: { title: string; items: string[]; risks?: boolean }) { return <div className={risks ? 'risks' : ''}><h4>{title}</h4><ul>{(items.length ? items : ['No major signals recorded.']).slice(0, 3).map(item => <li key={item}>{item}</li>)}</ul></div> }
function NegotiationItem({ label, value }: { label: string; value: string }) { return <div className="negotiation-item"><span>{label}</span><strong>{value}</strong></div> }
function productLabel(product: BorrowerResult['productRecommendation']) { return product.replaceAll('-', ' ') }
function ChartBar({ label, value, max, color, currency }: { label: string; value: number; max: number; color: 'blue' | 'slate' | 'amber' | 'green'; currency: CurrencyCode }) { const width = max > 0 ? Math.min(100, Math.max(0, value / max * 100)) : 0; return <div className="chart-bar"><div className="bar-label"><span>{label}</span><strong>{formatAmount(value, currency)}</strong></div><div className="bar-track"><span className={`bar-fill ${color}`} style={{ width: `${width}%` }} /></div></div> }
function StressComparison({ label, normal, stressed, currency }: { label: string; normal: number; stressed: number; currency: CurrencyCode }) { const max = Math.max(normal, stressed, 1); return <div className="stress-compare"><div className="bar-label"><span>{label}</span><strong>{formatAmount(stressed, currency)} stressed</strong></div><div className="stress-track"><span className="stress-fill normal" style={{ width: `${normal / max * 100}%` }} /><span className="stress-fill stressed" style={{ width: `${stressed / max * 100}%` }} /></div><div className="stress-values"><span>Normal {formatAmount(normal, currency)}</span><span>Stress {formatAmount(stressed, currency)}</span></div></div> }
function saveReportAsPdf() { window.print() }
