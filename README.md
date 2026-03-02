# Track It (local-only)

Dark-mode Next.js app to see how much is left after monthly bills and card minimums.

## Stack
- Next.js 14 (App Router) + TypeScript
- MongoDB (local) via Mongoose
- NextAuth credentials (email/password) — first sign-in creates the local user
- React Query, Tailwind-style tokens (custom CSS)

## Setup
1) Create `.env.local` from `.env.example` and set `DATABASE_URL` to your local Mongo instance and a `NEXTAUTH_SECRET`.
2) Install deps: `npm install` (or `pnpm install`).
3) Run dev server: `npm run dev` (defaults to http://localhost:3000).
4) Sign in with any email/password — first login seeds the user. Set income in **Settings**, add bills and cards; dashboard shows remaining.

## Data rules
- Each bill/card has `nextDueDate`; when summaries are fetched we auto-roll dates forward to the current month.
- Remaining = income – sum(bills) – sum(card minimums).
- Deleting a bill or card stops future contributions; past summaries remain unless recalculated.

## Theming
- Dark background (#0b0f10) with green accent (#00c853). Mobile-first responsive layouts.
# co-ledger
