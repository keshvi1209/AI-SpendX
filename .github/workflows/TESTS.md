# TESTS.md

All tests are in `src/__tests__/auditEngine.test.ts`.
Run with: `npm test`

| Test | What it covers |
|------|---------------|
| Cursor: Business→Pro for ≤3 seats | Verifies savings calculation: 3×$40 → 3×$20 = $60/mo saved |
| Cursor: Pro plan optimal | Confirms isAlreadyOptimal=true when no savings found |
| Copilot: Enterprise→Business for <20 seats | Verifies $20/seat savings for small teams |
| Copilot: Redundancy flag | Detects overlap when user has both Copilot and Cursor |
| Claude: Max→Pro recommendation | Verifies $80/mo savings when Max is likely overkill |
| Claude: Team→individual for 2 seats | Verifies $10/mo savings on team plan overhead |
| ChatGPT: Pro surfaces Claude alternative | Verifies reason text mentions cheaper alternative |
| Total savings: multi-tool sum | Verifies totalMonthlySavings = sum of per-tool savings |
| Total savings: optimal detection | Verifies isAlreadyOptimal=true when savings < $5 |
| Gemini: Ultra→Pro recommendation | Verifies ~$230/mo savings on overkill Ultra plan |