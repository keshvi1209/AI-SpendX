# DEVLOG

## Day 1 — 2026-05-09

**What I did:**
Set up the Next.js 14 project with TypeScript, Tailwind, and shadcn/ui. Deployed to Vercel. 
Defined the core TypeScript types for the audit system. Researched and documented 
pricing for all 8 tools in PRICING_DATA.md. 

**What I learned:**
Windsurf's pricing is harder to find than expected — had to dig through their docs page. 
Claude's Max plan is $100/month, not $50 as I initially assumed. Always verify.

**Blockers / what I'm stuck on:**
Deciding between Supabase and Cloudflare D1 for the backend. Leaning Supabase 
because the free tier is more generous and the JS SDK is better documented.

**Plan for tomorrow:**
Build the spend input form with react-hook-form and localStorage persistence. 
Get the form to accept all 8 tools with their plan options and emit a typed AuditInput object.


## Day 2 — 2026-05-12

**Hours worked:** 5

**What I did:**
Built the spend input form with all 8 tools and their plan options.
Implemented localStorage persistence via a custom useLocalStorage hook —
form state survives page reloads. Added real-time spend total preview.
Wired form submission to sessionStorage and set up the /audit route placeholder.

**What I learned:**
Controlled inputs in React need careful handling for number fields —
parseInt("") returns NaN, which breaks the input. Added || 0 / || 1
fallbacks to handle empty-string edge cases.

**Blockers / what I'm stuck on:**
The Select component from shadcn needs to be installed separately —
not included in the base shadcn init. Wasted 20 minutes debugging.

**Plan for tomorrow:**
Build the audit engine in src/lib/auditEngine.ts as a pure function.
Write Vitest tests before wiring it to the UI.

## Day 3 — 2026-05-13

**Hours worked:** 6

**What I did:**
Built the audit engine as a pure TypeScript function in src/lib/auditEngine.ts.
Wrote 10 Vitest tests covering all 8 tools — all pass. Set up GitHub Actions CI
(.github/workflows/ci.yml) — green checkmark on latest commit. Wired the engine
to /audit page to verify output with real form data.

**What I learned:**
Writing the tests before the full UI forced me to think about edge cases I'd have
missed — e.g. the "redundant IDE" case (paying for both Cursor and Copilot) only
occurred to me when I asked "what inputs would be wrong to flag?"

**Blockers / what I'm stuck on:**
The Gemini Ultra savings calculation returns a floating-point number ($229.99000...)
instead of a clean integer. Fixed by rounding in the display layer rather than the
engine — keeps the engine's output honest.

**Plan for tomorrow:**
Build the audit results page (MVP feature 3). Focus on the hero savings number
and the per-tool breakdown cards. The Credex CTA block for >$500/mo savings.


**Hours worked:** 5

**What I did:**
Built the full audit results page with SavingsHero, FindingCard, and CredexCTA
components. Wired the Anthropic API via /api/summary with graceful fallback to
template text. Wrote PROMPTS.md documenting the prompt and what I tried.
The results page now shows real savings numbers from the audit engine.

**What I learned:**
The Anthropic SDK requires at least one message in the messages array —
you can't drive it purely from the system prompt. Also learned that without
a word count constraint the model outputs ~280 words, which breaks the card layout.

**Blockers / what I'm stuck on:**
The AI summary sometimes takes 3-4 seconds to load. Added a spinner state
so the UI doesn't look broken while it fetches.

**Plan for tomorrow:**
Build MVP features 5 and 6: Supabase lead capture, Resend transactional
email, and unique shareable URLs with OG meta tags.