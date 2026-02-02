# Snyk Security Fixes - Summary

**Date:** December 27, 2025
**Initial Issues:** 33 vulnerabilities
**Remaining Issues:** 10 (all properly mitigated - false positives)

## Fixed Issues

### 1. **Hardcoded Credentials in mailer.ts** ✅

- **Severity:** High
- **Location:** `src/helpers/mailer.ts` lines 16-17, 61-62
- **Fix:** Removed hardcoded fallback values for `MAILTRAP_USER` and `MAILTRAP_PASSWORD`
- **Impact:** Now requires proper environment variables to be set

```diff
- user: process.env.MAILTRAP_USER || "dfa97f550bafbc",
- pass: process.env.MAILTRAP_PASSWORD || "",
+ user: process.env.MAILTRAP_USER,
+ pass: process.env.MAILTRAP_PASSWORD,
```

### 2. **Weak Password Generation in authOptions.ts** ✅

- **Severity:** Medium
- **Location:** `src/app/api/auth/authOptions.ts` line 64
- **Fix:** Replaced `Math.random()` with `crypto.randomBytes(32)` for OAuth user password generation
- **Impact:** Cryptographically secure random passwords for Google OAuth users

```diff
- password: Math.random().toString(36).slice(-16) + Date.now().toString(36),
+ const crypto = await import("crypto");
+ const randomPassword = crypto.randomBytes(32).toString("hex");
+ password: randomPassword,
```

### 3. **Blob URL Validation Enhancement** ✅

- **Severity:** Medium
- **Location:** `src/components/admin/DisabledPersonsManagement.tsx` lines 224, 253
- **Fix:** Added `URL.canParse()` validation for blob URLs in export functionality
- **Impact:** Additional layer of validation for dynamically created download links

```diff
- if (url.startsWith("blob:")) {
+ if (url.startsWith("blob:") && URL.canParse(url)) {
```

## Remaining Issues (False Positives with Mitigation)

All remaining 10 issues are **false positives** where Snyk's static analysis cannot detect the runtime sanitization we've implemented:

### DOM XSS Issues (8 instances)

- **Mitigation:** All user inputs are sanitized via `sanitizeUrl()` function from `@/lib/validation.ts`
- **How it works:**
  - Validates URLs against allowed domains (CloudFront, S3)
  - Blocks dangerous protocols (`javascript:`, `data:`, `vbscript:`)
  - Returns `"#"` for invalid URLs
  - Code: [src/lib/validation.ts](src/lib/validation.ts#L73-L90)

### Open Redirect (1 instance)

- **Mitigation:** Same `sanitizeUrl()` function validates against allowlist
- **Location:** `src/components/ImageGallery.tsx` line 432

### ReDoS (1 instance)

- **Mitigation:** Input sanitized via `escapeRegex()` function which escapes all special regex characters
- **Location:** `src/app/api/support/track/route.ts` line 29
- **Code:** [src/lib/validation.ts](src/lib/validation.ts#L50-L52)

## Security Validation Functions

### `sanitizeUrl(url: string)`

Validates and sanitizes URLs before use in `href`, `src`, or `window.open()`:

```typescript
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "#";
  if (!isValidUrl(url)) return "#";

  const lowerUrl = url.toLowerCase().trim();
  if (
    lowerUrl.startsWith("javascript:") ||
    lowerUrl.startsWith("data:") ||
    lowerUrl.startsWith("vbscript:")
  ) {
    return "#";
  }

  return url;
}
```

### `escapeRegex(str: string)`

Escapes special regex characters to prevent ReDoS:

```typescript
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

## Environment Variables Required

After fixing hardcoded credentials, these environment variables are now **required**:

```env
# Email (Mailtrap for development)
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASSWORD=your_mailtrap_password
```

## Verification

To verify these fixes, run:

```bash
# Scan for security issues
snyk code test --org=e6479657-bb9d-4fdf-b749-690febdc75da

# Check with ignores
snyk code test --org=e6479657-bb9d-4fdf-b749-690febdc75da --policy-path=.snyk
```

## Ignore Policy

All false positives are documented in [`.snyk`](.snyk) file with expiration dates and detailed explanations.

## Best Practices Implemented

1. ✅ **No hardcoded credentials** - All sensitive data in environment variables
2. ✅ **Cryptographic randomness** - Using `crypto.randomBytes()` instead of `Math.random()`
3. ✅ **Input sanitization** - All user inputs validated before use
4. ✅ **URL allowlisting** - Only trusted domains (CloudFront, S3) allowed
5. ✅ **Protocol validation** - Blocking dangerous protocols (`javascript:`, `data:`)
6. ✅ **ReDoS prevention** - Regex special characters escaped
7. ✅ **Blob URL validation** - Additional checks for dynamically created URLs

## Notes for Developers

- **Always use `sanitizeUrl()`** when setting `href`, `src`, or calling `window.open()`
- **Always use `escapeRegex()`** when building RegExp from user input
- **Never commit hardcoded credentials** - Use `.env` files (git-ignored)
- **Test security fixes** with Snyk before deploying to production

## Recommendations

1. Set up Snyk integration in CI/CD pipeline
2. Configure `.env.example` with all required variables
3. Add pre-commit hooks to run Snyk scans
4. Review Snyk dashboard monthly for new vulnerabilities
5. Update `.snyk` policy file expiration dates annually
