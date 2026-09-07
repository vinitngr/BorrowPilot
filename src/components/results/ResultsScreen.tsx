import { ArrowLeft, Copy, Info, ShieldCheck } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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
  const verdict = verdictCopy[result.verdict]
  const safeRatio = result.likelySanction.amount.max ? Math.min(100, result.safeBorrowing.amount.max / result.likelySanction.amount.max * 100) : 0
  return (
    <div className="dashboard-shell">
      <div className="dashboard-head">
        <div><p className="section-kicker">Your borrowing snapshot</p><h2>Here is what your numbers support.</h2><p>Ranges are estimates. The explanation is as important as the number.</p></div>
        <div className="header-actions"><span className="confidence-chip">{result.confidence} confidence · {result.confidenceScore}/100</span><Button variant="ghost" onClick={onBack}><ArrowLeft size={14} /> Revisit answers</Button></div>
      </div>

      <div className="dashboard-grid">
        <section className="dash-card verdict-card"><span className="card-kicker">Recommendation</span><div className="verdict-main"><h1>{verdict.label}</h1><p className="verdict-copy">{result.verdictExplanation}</p></div></section>
        <section className="dash-card safe-card"><span className="card-kicker">Use this amount, not just the maximum</span><strong className="big-value">{formatAmount(result.recommendedAmount.max, currency)}</strong><p>Recommended safe borrowing, after expenses, existing EMIs, and a stress check.</p></section>

        <MetricCard label="Likely lender sanction" value={formatAmount(result.likelySanction.amount.max, currency)} detail="Eligibility-style estimate" />
        <MetricCard label="Maximum recommended EMI" value={formatAmount(result.recommendedEmi.max, currency)} detail="Keep new EMI below this" />
        <MetricCard label="Fair annual rate" value={`${formatPercent(result.rate.annualRate.min)}–${formatPercent(result.rate.annualRate.max)}`} detail="A profile-based range" />
        <MetricCard label="Estimated APR" value={`${formatPercent(result.rate.estimatedApr.min)}–${formatPercent(result.rate.estimatedApr.max)}`} detail="Includes processing fee" />

        <section className="dash-card wide-card"><CardTitle kicker="Two different limits" title="Lender limit vs. safe limit" note="The lender may approve more than your monthly life should carry." /><div className="comparison"><div className="comparison-labels"><span>Safe amount {formatAmount(result.safeBorrowing.amount.max, currency)}</span><span>Likely sanction {formatAmount(result.likelySanction.amount.max, currency)}</span></div><div className="comparison-track"><div className="comparison-safe" style={{ width: `${safeRatio}%` }} /></div><div className="comparison-legend"><span><i />Safe amount</span><span className="sanction"><i />Lender sanction</span></div></div><div className="tradeoff-list">{result.tenureTradeoffs.map(option => <div className="tradeoff" key={option.tenureMonths}><span>{option.tenureMonths} months</span><strong>{formatAmount(option.amount, currency)}</strong><small>{formatAmount(option.totalRepayment, currency)} total</small></div>)}</div></section>

        <section className="dash-card chart-card"><CardTitle kicker="Tenure trade-off" title="More time costs more overall" note="At your safe EMI ceiling, a longer tenure can support a larger amount but increases total repayment." /><div className="chart-wrap"><ResponsiveContainer width="100%" height={238}><BarChart data={result.tenureTradeoffs} margin={{ top: 12, right: 8, left: 8, bottom: 0 }} barGap={8}><CartesianGrid stroke="#e6eaf0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="tenureMonths" tickFormatter={value => `${value}m`} axisLine={false} tickLine={false} tick={{ fill: '#6e7885', fontSize: 10 }} /><YAxis tickFormatter={value => formatAmount(Number(value), currency)} axisLine={false} tickLine={false} width={72} tick={{ fill: '#9ba4af', fontSize: 9 }} /><Tooltip cursor={{ fill: '#f5f6f8' }} content={<TradeoffTooltip currency={currency} />} /><Bar dataKey="amount" name="Safe amount" fill="#2864d7" radius={[3, 3, 0, 0]} /><Bar dataKey="totalRepayment" name="Total repayment" fill="#b9c4d2" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="chart-amount" />Safe amount</span><span><i className="chart-total" />Total repayment</span></div></section>

        <section className="dash-card medium-card"><CardTitle kicker="Stress check" title={result.stressScenario.label} note="A lower-income month should still leave room to repay." /><div className="stress-box"><div><span>Safe new EMI</span><strong>{formatAmount(result.stressScenario.safeEmi, currency)}</strong></div><p>{result.stressScenario.passes ? 'This leaves a workable repayment buffer.' : 'This puts repayment under pressure. Consider borrowing less or waiting.'}</p></div><div className="comparison-labels" style={{ marginTop: 18 }}><span>Income under stress</span><strong>{formatAmount(result.stressScenario.monthlyIncome, currency)}</strong></div></section>

        <section className="dash-card wide-card"><CardTitle kicker="Why this result" title="Signals in your profile" /><div className="signal-grid"><SignalList title="Working in your favour" items={result.positiveFactors} /><SignalList title="Watch-outs" items={result.riskFactors.length ? result.riskFactors : result.reasons} risks /></div></section>

        <section className="dash-card medium-card"><CardTitle kicker="Adjust and compare" title="Try another amount" note="The result updates without repeating your answers." /><label className="field" style={{ display: 'block', marginTop: 17 }}><span className="field-help" style={{ display: 'block', marginBottom: 7 }}>Loan amount considered</span><div className="field-prefix"><span>{currency}</span><input className="field-control" type="number" min={0} step={1000} value={Math.round(fromInr(profile.requestedAmount, currency))} onChange={event => onAmountChange(Number(event.target.value))} /></div></label><div className="card-note" style={{ marginTop: 13 }}>Product route: {productLabel(result.productRecommendation)} · fixed INR-calibrated rules, displayed in {currency}</div></section>

        <section className="dash-card negotiation-card"><div className="card-head"><div><span className="card-kicker" style={{ color: '#2864d7' }}>Negotiation card</span><h3>Take these numbers to the lender.</h3><p className="card-note">Compare the quote against your fair range and ask what is driving the difference.</p></div><Button variant="secondary"><Copy size={13} /> Copy summary</Button></div><div className="negotiation-grid"><NegotiationItem label="Verdict" value={verdict.label} /><NegotiationItem label="Fair rate" value={`${formatPercent(result.rate.annualRate.min)}–${formatPercent(result.rate.annualRate.max)}`} /><NegotiationItem label="Safe amount" value={formatAmount(result.recommendedAmount.max, currency)} /><NegotiationItem label="Max EMI" value={formatAmount(result.recommendedEmi.max, currency)} /></div></section>
      </div>
    </div>
  )
}

function CardTitle({ kicker, title, note }: { kicker: string; title: string; note?: string }) { return <div className="card-head"><div><span className="card-kicker">{kicker}</span><h3>{title}</h3>{note && <p className="card-note">{note}</p>}</div><Info size={15} color="#9ba4af" /></div> }
function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) { return <section className="dash-card metric-card"><span className="card-kicker">Output</span><p className="metric-label">{label}</p><p className="metric-value">{value}</p><p className="metric-detail">{detail}</p></section> }
function SignalList({ title, items, risks = false }: { title: string; items: string[]; risks?: boolean }) { return <div className={risks ? 'risks' : ''}><h4>{title}</h4><ul>{(items.length ? items : ['No major signals recorded.']).slice(0, 3).map(item => <li key={item}>{item}</li>)}</ul></div> }
function NegotiationItem({ label, value }: { label: string; value: string }) { return <div className="negotiation-item"><span>{label}</span><strong>{value}</strong></div> }
function productLabel(product: BorrowerResult['productRecommendation']) { return product.replaceAll('-', ' ') }
function TradeoffTooltip({ active, payload, label, currency }: { active?: boolean; payload?: Array<{ name?: string; value?: number | string; color?: string }>; label?: number | string; currency: CurrencyCode }) { if (!active || !payload?.length) return null; return <div className="chart-tooltip"><strong>{label} months</strong>{payload.map(item => <div key={item.name}><i style={{ background: item.color }} />{item.name}: {formatAmount(Number(item.value), currency)}</div>)}</div> }
