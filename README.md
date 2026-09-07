# Borrower Copilot

Borrower Copilot is a decision-support tool for Indian borrowers. It estimates what a lender may sanction, what the borrower can safely carry, and how to discuss the difference with a lender.

It is deliberately not a bank, credit bureau, RBI service, or real-time lender quote.

## Run locally

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

Validation commands:

```bash
pnpm test
pnpm run build
```

## Architecture

The application keeps domain reasoning separate from presentation:

- `src/types` contains borrower, question, and result contracts.
- `src/engine` contains pure EMI, affordability, and decision calculations.
- `src/rules` contains explicit product and affordability assumptions.
- `src/components/questions` contains the adaptive questionnaire.
- `src/components/results` contains the borrower-facing result view and Negotiation Card.
- `src/components/ui` contains small reusable shadcn-style primitives built with Tailwind.
- `src/lib` contains formatting and shared helpers.

The calculation path is:

```text
answers → borrower profile → financial calculations → decision result → UI view
```

The same engine is reused when the borrower changes important values; calculations are not duplicated in the UI.

## Main design decisions

- Lender sanction and safe borrowing are separate estimates. Lender sanction uses a lender-style FOIR ceiling; safe borrowing uses essential expenses, dependents, income resilience, existing debt, and stress adjustments.
- Rates are ranges. Unknown credit score and missing history widen the range and lower confidence rather than silently becoming a bad exact value.
- The initial questionnaire is compact. Follow-up questions are routed by income type and purpose, and each follow-up declares which output it affects.
- The verdict can be Borrow, Borrow less, or Don't borrow. Recent repayment stress and insufficient resilient capacity can produce the last result.
- Processing fees are modeled into an estimated APR, with assumptions shown in `RULES.md`.
- The current submission is intentionally INR-only because the rules are calibrated to Indian lending assumptions. A small currency boundary remains isolated for future expansion, but no non-INR selector is presented to borrowers.

## Limitations

The thresholds are transparent judgement-based defaults, not lender policies. They need calibration against validated portfolio data before production use. The product does not verify income, property ownership, credit history, fees, or lender terms.

## Improvement roadmap

See [`docs/feature-backlog.md`](docs/feature-backlog.md) for the one-checkpoint-at-a-time engine, question-flow, and decision-visualization roadmap.
