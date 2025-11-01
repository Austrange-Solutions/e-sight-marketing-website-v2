# Developer Guide — Local workflow & recent changes

This file explains how to run the project locally, run the donation breakdown tests that were added, the DB connection policy, and lists the small fixes applied in this session.

## Quick commands (PowerShell)
- Install (Bun recommended for this repo):
```powershell
bun install
```
- Run dev server (Bun + Turbopack):
```powershell
bun dev --turbopack
```
- Build (production):
```powershell
bun build
bun start
```
- Run the small donation breakdown tests (no extra deps):
```powershell
# Run the test file directly with node
node ./src/__tests__/donationBreakdown.test.js
# or via npm script
npm test
```
- Lint:
```powershell
npm run lint
```

## Donation calculation contract
- Calculation is implemented in `src/models/foundationSettingsModel.ts` as `calculateBreakdown(amount)` and mirrored in `src/lib/calcDonationBreakdown.js`.
- Two-tier calculation (in rupees):
  - platformFee = round(amount * platformFeePercent% to paise)
  - afterPlatformFee = round(amount - platformFee to paise)
  - foundationAmount = round(afterPlatformFee * foundationSharePercent% to paise)
  - companyAmount = round(afterPlatformFee - foundationAmount to paise)
- Rounding: implementation uses Math.round(value * 100) / 100 (round to nearest paise). Tests cover a happy path and a small rounding edge case.

## Database connection policy
- Use the cached connection helper in `dbConfig/dbConfig`.
- Always call `await connect()` (or `await dbConnect()` depending on import alias) at the top of API routes that access the database. This prevents exhausting MongoDB Atlas connections.
- Example at top of a route:
```ts
import { connect } from '@/dbConfig/dbConfig';
await connect();
```

## Files added/changed in this session
- Added `docs/PROJECT_OVERVIEW.md` — consolidated architecture & donation overview.
- Added `docs/DEVELOPER_GUIDE.md` (this file).
- Added `src/lib/calcDonationBreakdown.js` — small utility mirroring foundation model method.
- Added `src/__tests__/donationBreakdown.test.js` — tests for breakdown calculation; run with `node` or `npm test`.
- Added/modified numerous `src/app/api/**/route.ts` files to ensure `await connect()` (or equivalent) is called where Mongoose models are used. Changes were limited to adding `await connect()` or converting synchronous `connect()` to `await connect()` and adding a safe `__ensureConnect` alias where needed.

## Scripts used to audit routes
- `scripts/check_connect.js` — lists route files missing 'await connect()' (first pass)
- `scripts/check_connect_v2.js` — stronger check for any connect calls
- `scripts/check_connect_dbusers.js` — finds route files that reference models/mongoose but lack connect

## Recommendations / next steps
1. Run a full TypeScript/Next build locally to catch any typing/regressions from the edits:
```powershell
npm run build
```
2. Add a proper test runner (Jest or Bun Test) and integrate into CI for automated test runs.
3. Consider replacing inline `await connect()` top-level calls with a small route wrapper or standardized pattern if desired.
4. Add an idempotency test for donation verification: ensure a repeated Razorpay webhook/verify does not create duplicate Donation records.

## Contact
If you want me to open a PR with these changes, run additional tests, or convert tests to a formal test runner, tell me which you'd like next.
