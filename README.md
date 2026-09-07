<div align="center">
  <img src="assets/borrowpilot-logo.svg" alt="BorrowPilot" width="420" />

  <h3>Know your number before they quote theirs.</h3>

  <p>Borrower-first decision support for understanding affordability, lender capacity, and negotiation room.</p>
</div>

<br />

BorrowPilot is an assessment tool for Indian borrowers. It turns a short set of financial inputs into a transparent borrowing range, a stress-tested safe amount, an estimated fair-rate band, and a practical lender conversation.

> This is an educational decision-support tool—not a bank, credit bureau, RBI service, or real-time lender quote.

## What makes it different

- **Two limits, clearly separated:** what a lender may sanction versus what a borrower can safely carry.
- **Stress-tested affordability:** the recommendation checks a difficult month instead of relying only on average income.
- **Explainable outcomes:** every verdict is supported by positive signals, watch-outs, assumptions, and confidence.
- **Financially useful output:** the Negotiation Card gives the borrower numbers to take to a lender.
- **Adaptive questioning:** follow-up questions change with income type and borrowing purpose.
- **Honest uncertainty:** unknown credit history widens ranges and lowers confidence rather than pretending to know an exact rate.

## The assessment flow

```text
borrower inputs → profile normalization → EMI and affordability engine → decision result → negotiation view
```

The calculation engine is pure TypeScript and is kept separate from the React presentation layer. Changing the requested amount on the results screen reuses the same engine; it does not duplicate financial logic in the UI.

## Project structure

| Area | Responsibility |
| --- | --- |
| `src/engine` | EMI, affordability, stress, and decision calculations |
| `src/rules` | Explicit FOIR, rate, fee, and resilience assumptions |
| `src/types` | Borrower, question, and result contracts |
| `src/components/questions` | Compact adaptive questionnaire |
| `src/components/results` | Assessment dashboard, charts, and Negotiation Card |
| `src/components/ui` | Small reusable Tailwind/shadcn-style primitives |
| `src/lib` | Currency boundaries and shared formatting helpers |

## Financial assumptions

The current submission is intentionally INR-only because the rules are calibrated to Indian lending assumptions. The model uses lender-style FOIR ceilings, essential expenses, existing EMIs, dependents, income resilience, emergency savings, recent repayment stress, a 20% income-stress scenario, and estimated processing fees.

All thresholds are transparent judgement-based defaults, documented in [`RULES.md`](RULES.md). They are not lender policies and require validated portfolio data before production use.

## Limitations

BorrowPilot does not verify income, property ownership, credit history, fees, or lender terms. It should be used to prepare questions and compare quotes—not as approval, financial advice, or a substitute for a lender’s final offer.

## Local setup and checks

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

Before sharing a build:

```bash
pnpm test
pnpm run build
```
