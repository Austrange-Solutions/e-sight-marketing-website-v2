# TODO — Next Steps & Priorities

This file lists small, actionable follow-ups that will increase code quality, automation, and safety.

1. Convert ad-hoc tests to a proper test runner
   - Add Jest (or Bun Test) and migrate `src/__tests__/donationBreakdown.test.js` to the runner's format.
   - Add a `test` script and integrate into CI.

2. Add an idempotency check for donation verification
   - Add tests and server-side checks to ensure repeated Razorpay verifies don't create duplicate Donation documents.

3. Add TypeScript build check to PRs
   - Add a CI job that runs `npm run build` or `bun build` to catch type errors early.

4. Standardize DB connect pattern
   - Optionally create a small helper to centralize top-level `await connect()` usage or a route wrapper to reduce copy/paste.

5. Add more tests
   - Foundation settings boundaries (0% and 100%), rounding heavy edge cases, and admin-only permission tests.

6. Review CloudFront & S3 security
   - Validate bucket policies and CORS in staging; consider stricter IAM for upload presigned URLs.

7. Optional: open a PR with these changes
   - Create a descriptive PR, run CI, and merge after review.
