# Co Ledger (local-only)

Co Ledger is a two-person household dashboard that shows what’s left after monthly bills and card minimums. Runs locally; first login creates the local user.

## Purpose & flow
- **Capture incomes** for you and your partner separately.
- **Add bills and credit cards** (amount / min payment, first due date).
- On fetch, due dates are rolled forward to the current month, and **monthly summaries** are saved for both members plus a combined household view.
- Dashboard shows two panels (You / Partner) and a household rollup + comparison gaps.

## Stack
- Next.js 14 (App Router) + TypeScript
- MongoDB via Mongoose
- NextAuth credentials (email/password) — first sign-in seeds the user
- React Query, Tailwind-style tokens (custom CSS)

## Setup
1) Create `.env.local` from `.env.example`; set `DATABASE_URL` to your Mongo instance and `NEXTAUTH_SECRET`.
2) Install deps: `npm install` (or `pnpm install`).
3) Run dev server: `npm run dev` (defaults to http://localhost:3000).
4) Sign in with any email/password — then set income in **Settings**, add bills and cards; dashboard shows remaining.

## Data rules
- Each bill/card stores `nextDueDate`; summaries auto-roll dates forward to the current month.
- Remaining = income – sum(bills) – sum(card minimums).
- Deleting a bill or card stops future contributions; past summaries remain unless recalculated.

## Theming
- Dark background with neon green accent. Mobile-first responsive layouts; left drawer on desktop, top nav on mobile.
# co-ledger
