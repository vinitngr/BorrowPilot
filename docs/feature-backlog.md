# Borrower Copilot differentiation backlog

This backlog is intentionally ordered for one-at-a-time implementation. Each item should produce one focused commit, its own tests where applicable, and a before/after review of the borrower case matrix.

The product should feel like borrower intelligence, not a prettier EMI calculator. The strongest differentiators are the features that explain trade-offs, expose uncertainty, and help a borrower make or negotiate a decision.

## Working rule

When the next item is requested, implement only that item. Do not bundle unrelated fixes or UI polish. Finish with:

1. focused implementation;
2. focused tests or fixture updates;
3. `pnpm test` and `pnpm run build`;
4. one commit using `feat(scope): ...`, `fix(scope): ...`, `test(scope): ...`, or `docs(scope): ...`;
5. a short handoff describing what changed and what remains.

## Priority 0 — correctness first

### 1. Proposed-EMI stress verdict

Fix the current false `Borrow less` behavior by evaluating the requested loan EMI under normal and stressed income, rather than comparing two abstract capacity values.

Why it differentiates: the verdict becomes financially defensible instead of being a static score.

Suggested commit: `fix(engine): evaluate requested repayment under stress`

### 2. Affordability waterfall

Return a transparent monthly waterfall:

```text
conservative income
- essential expenses
- minimum household reserve
- existing EMIs
- proposed EMI
= remaining buffer
```

Make the binding constraint explicit and avoid double-counting dependents inside expenses.

Suggested commit: `feat(engine): add affordability waterfall`

### 3. Financial invariant and boundary suite

Add monotonicity and boundary tests before tuning thresholds: higher income should not reduce capacity, higher expenses should not improve it, and requested EMI should drive verdict transitions predictably.

Suggested commit: `test(engine): expand financial invariants`

### 4. Profile validation and data-quality warnings

Validate impossible profiles and return clear issues for negative values, income ranges in the wrong order, invalid scores, age limits, and inconsistent collateral answers.

Suggested commit: `feat(engine): validate borrower profiles`

## Priority 1 — borrower intelligence features

### 5. Stress scenario engine

Support multiple named scenarios instead of one fixed 20% income drop:

- income falls 20%;
- income falls 35% for high-volatility income;
- interest rate rises by 2%;
- essential expenses rise 15%;
- existing EMI remains while income pauses for one month.

Return pass/fail, buffer, and the first scenario that breaks the plan.

Suggested commit: `feat(engine): add borrower stress scenarios`

### 6. “What would change my answer?” sensitivity analysis

Calculate the smallest meaningful change that moves a borrower from `Borrow less` to `Borrow`, or from `Don’t borrow` to `Borrow less`.

Examples:

- reduce requested amount by ₹X;
- reduce existing EMI by ₹X;
- build Y months of savings;
- wait until income history reaches Z months;
- improve documentation or clear high-cost debt.

This is a memorable feature because it gives the borrower an action plan rather than only a score.

Suggested commit: `feat(engine): add decision sensitivity analysis`

### 7. Product and collateral routing

Add product policies for personal, vehicle, gold, LAP, and secured business borrowing. Include collateral LTV, encumbrance, documentation, product caps, and tenure limits.

Keep collateral as a lender-eligibility factor, never as a substitute for repayment affordability.

Suggested commit: `feat(engine): add product and collateral limits`

### 8. Fee-aware APR and total cost

Calculate effective APR using actual cash received, fee treatment, repayment schedule, tenure, total interest, processing fee, and total repayment. Do not add a fee ratio directly to nominal interest.

Suggested commit: `feat(engine): calculate fee-aware APR`

### 9. Debt stress and refinance analyzer

Separate ordinary EMIs from high-cost debt, credit-card minimums, BNPL, and recent late-payment stress. Show when a new loan is unsafe but a lower-cost consolidation route might be worth investigating.

This must never encourage replacing debt without comparing total repayment, fees, tenure extension, and collateral risk.

Suggested commit: `feat(engine): analyze debt stress and refinance options`

### 10. Risk-aware confidence model

Split confidence into:

- affordability confidence;
- lender-eligibility confidence;
- rate confidence;
- input completeness;
- model uncertainty.

High volatility, missing documentation, recent stress, and contradictory answers should prevent an unjustified high-confidence result.

Suggested commit: `feat(engine): make confidence risk-aware`

### 11. Structured decision ledger

Replace loose strings with structured evidence:

- reason code;
- category;
- severity;
- observed value;
- threshold;
- affected output;
- borrower-facing explanation.

This makes the assessment defensible in an interview and keeps UI explanations consistent.

Suggested commit: `feat(engine): add structured decision reasons`

## Priority 2 — adaptive question quality

### 12. Next-best-question routing

Instead of showing every possible follow-up, select the next question based on expected decision impact. For example, ask about high-cost debt before emergency savings if debt stress already dominates the result.

Each question should declare:

- which uncertainty it resolves;
- which output it can change;
- why it is being asked;
- when it is no longer worth asking.

Suggested commit: `feat(questions): prioritize decision-critical followups`

### 13. Product-intent and income-generation questions

Ask whether the requested borrowing is expected to generate income, especially for a vehicle or business purpose. Ask whether the borrower wants secured or unsecured borrowing when both routes are plausible.

The answer should affect product recommendation, stress assumptions, or verdict—not merely add profile detail.

Suggested commit: `feat(questions): capture product intent and income use`

### 14. Borrower answer quality layer

Allow “I don’t know” or “not sure” distinctly from zero and no. Detect suspicious combinations such as ₹0 expenses with several dependents, or high income volatility with identical minimum and maximum income.

Suggested commit: `feat(questions): handle unknown and inconsistent answers`

## Priority 3 — visual features that add decision value

These should be assigned to the UI-focused session after the corresponding engine output exists.

### 15. Affordability waterfall visualization

Show income flowing through essential expenses, existing EMIs, proposed EMI, and remaining buffer. Use the same values as the engine; do not calculate separately in the component.

Suggested commit: `feat(charts): add affordability waterfall`

### 16. Scenario comparison chart

Compare base, income-drop, rate-rise, and expense-rise scenarios with safe EMI, remaining buffer, and pass/fail state. The chart should answer “which risk breaks my plan first?”

Suggested commit: `feat(charts): add stress scenario comparison`

### 17. Sanction versus safe amount visual

Use a clear two-limit visualization with requested amount, likely sanction range, and recommended safe range. Add a short explanation of why the ranges differ.

Suggested commit: `feat(charts): visualize lender and safe limits`

### 18. Negotiation Card export

Make the Negotiation Card copyable, printable, and exportable as a clean one-page summary. Include a generated negotiation insight only when a lender quote is entered or compared.

Suggested commit: `feat(negotiation): add shareable borrower card`

### 19. Lender quote comparison

Let the borrower enter quoted amount, rate, tenure, processing fee, insurance, and foreclosure terms. Compare the quote against the estimated fair band and total cost, clearly labelling user-provided values versus estimates.

Suggested commit: `feat(negotiation): compare lender quote with fair range`

### 20. Decision explanation timeline

Show the few answers that changed the result most, such as “existing EMI reduced safe capacity by ₹X” or “unknown score widened the rate band.” This is more useful than displaying every rule.

Suggested commit: `feat(results): show decision explanation timeline`

## Priority 4 — advanced differentiators

### 21. Repayment resilience score

Add a separate score for how many months the borrower could keep paying after an income interruption, based on savings, essential expenses, existing EMIs, and proposed EMI. Keep it separate from credit score.

Suggested commit: `feat(engine): add repayment resilience score`

### 22. Debt-free and prepayment comparison

Show the effect of shorter tenure, prepayment, or waiting and saving before borrowing. Include total interest saved and any assumed prepayment fee.

Suggested commit: `feat(engine): compare prepayment strategies`

### 23. Rule versioning and audit snapshot

Attach a ruleset version and calculation snapshot to every result so a future rule update does not silently change an old Negotiation Card.

Suggested commit: `feat(engine): version assessment rules`

### 24. Calibration report

Create a repeatable report that runs the review matrix, summarizes verdict counts, safe/lender gaps, confidence distribution, and threshold boundary cases. This makes future tuning measurable.

Suggested commit: `test(engine): add calibration report`

## Recommended immediate sequence

The first five “next” steps should be:

1. Proposed-EMI stress verdict
2. Financial invariant and boundary suite
3. Affordability waterfall
4. Profile validation
5. Stress scenario engine

Do not tune global FOIR or rate thresholds before these are complete. Otherwise, a logic defect can be mistaken for a calibration problem.
