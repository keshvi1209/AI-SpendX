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