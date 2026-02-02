# XSS Protection Implementation

## Overview

Complete XSS (Cross-Site Scripting) protection system implemented across the e-sight marketing website to prevent malicious script injection attacks.

## Implementation Date

December 29, 2025

## Components Implemented

### 1. Core Validation Utilities

#### `src/lib/validation/xss-regex.ts`

- Comprehensive regex patterns detecting 50+ XSS attack vectors
- Three detection modes:
  - **XSS_DETECTION_REGEX**: Balanced comprehensive detection
  - **XSS_SIMPLE_REGEX**: Fast basic validation for performance-critical paths
  - **XSS_AGGRESSIVE_REGEX**: Strict mode with lower false-negative rate
- Helper functions:
  - `containsXSS(input, strict)`: Boolean validation
  - `extractXSSPatterns(input)`: Debug helper to identify detected patterns
  - `basicXSSRemoval(input)`: Deprecated (use DOMPurify instead)

#### `src/lib/validation/xss.ts`

- High-level sanitization utilities built on DOMPurify
- Functions:
  - `sanitizeInput(input)`: Strip all HTML tags, keep text content
  - `sanitizeHtml(html)`: Allow safe HTML tags for rich text
  - `validateAndSanitize(input, options)`: Validation + sanitization
  - `sanitizeObject(data, fieldConfigs)`: Multi-field object sanitization
  - `isSafeInput(input, strict)`: Safety check without sanitization
  - `sanitizeUrl(url)`: URL-specific sanitization (blocks javascript:, data:, etc.)
  - `sanitizeEmail(email)`: Email sanitization with validation
  - `sanitizePhone(phone)`: Phone number sanitization
  - `createSanitizationTransform(options)`: Zod transform helper

### 2. Protected API Routes

#### Profile Update (`src/app/api/users/profile/route.ts`)

**Vulnerabilities Fixed:**

- Stored XSS in username field
- Stored XSS in phone field
- Stored XSS in address field

**Protection Applied:**

```typescript
// Validates and sanitizes username, phone, address before database storage
sanitizedUsername = validateAndSanitize(username, {
  fieldName: "username",
  maxLength: 100,
  strict: false,
});
```

**Attack Vectors Blocked:**

- `<script>alert('XSS')</script>` in username
- `<img src=x onerror=alert(1)>` in address
- `javascript:alert(1)` in any field

#### Support Ticket Creation (`src/app/api/support/create/route.ts`)

**Vulnerabilities Fixed:**

- Stored XSS in ticket description
- Stored XSS in customer name
- Null-byte injection in description field
- Email/phone injection attempts

**Protection Applied:**

```typescript
sanitizedData = {
  name: validateAndSanitize(name, {
    fieldName: "name",
    maxLength: 100,
    strict: true,
  }),
  email: sanitizeEmail(email),
  phone: sanitizePhone(phone),
  description: validateAndSanitize(description, {
    fieldName: "description",
    maxLength: 2000,
    strict: true,
  }),
  // ... other fields
};
```

**Attack Vectors Blocked:**

- `<SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>` (from screenshot)
- `<marquee onstart="javascript:alert('Y')">` (from screenshot)
- `<a href="javas\0\0cript:alert(1)">` (null-byte injection)
- All dangerous HTML tags and event handlers

#### Checkout (`src/app/api/checkout/route.ts`)

**Vulnerabilities Fixed:**

- Stored XSS in shipping address fields
- XSS in customer information (name, email, phone)
- Injection in city/state/pincode fields

**Protection Applied:**

```typescript
sanitizedAddress = {
  name: validateAndSanitize(shippingAddress.name, {
    fieldName: "name",
    maxLength: 100,
    strict: true,
  }),
  email: sanitizeEmail(shippingAddress.email),
  phone: sanitizePhone(shippingAddress.phone),
  address: validateAndSanitize(shippingAddress.address, {
    fieldName: "address",
    maxLength: 500,
    strict: true,
  }),
  city: validateAndSanitize(shippingAddress.city, {
    fieldName: "city",
    maxLength: 100,
    strict: true,
  }),
  // ... other fields
};
```

**Attack Vectors Blocked:**

- Script injection in address fields
- Event handler injection in name fields
- JavaScript protocol injection in email/phone

### 3. Content Security Policy (CSP)

#### Configuration (`next.config.ts`)

**Headers Added:**

```typescript
'Content-Security-Policy': [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.cashfree.com https://checkout.razorpay.com https://browser.sentry-cdn.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://api.cashfree.com https://api.razorpay.com https://o4508368968081408.ingest.us.sentry.io",
  "frame-src 'self' https://checkout.razorpay.com https://sdk.cashfree.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; '),
```

**Additional Security Headers:**

- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Control referrer information
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` - Restrict browser features

**CSP Policy Breakdown:**

1. **default-src 'self'**: Only allow resources from same origin by default
2. **script-src**: Allow scripts from self + payment gateways (Cashfree, Razorpay) + Sentry monitoring
3. **style-src**: Allow styles from self + Google Fonts
4. **img-src**: Allow images from self, data URIs, all HTTPS (for S3/CloudFront)
5. **connect-src**: Allow API calls to payment gateways + Sentry
6. **frame-src**: Allow iframes only for payment gateways
7. **object-src 'none'**: Block plugins (Flash, Java, etc.)
8. **base-uri 'self'**: Prevent base tag injection
9. **form-action 'self'**: Forms can only submit to same origin
10. **frame-ancestors 'none'**: Prevent embedding in iframes (clickjacking protection)
11. **upgrade-insecure-requests**: Auto-upgrade HTTP to HTTPS

## Attack Patterns Detected

### Comprehensive Coverage (50+ patterns)

1. **Script Tags**: `<script>`, `<SCRIPT>`, encoded variants (`&lt;script`, `&#60;script`, `\x3cscript`)
2. **JavaScript Protocol**: `javascript:`, `javascript&colon;`, `java\0script:`, encoded variants
3. **Event Handlers**: 25+ handlers (onerror, onload, onclick, onmouseover, onfocus, etc.)
4. **Data URIs**: `data:text/html`, `data:text/html;base64,`
5. **VBScript/LiveScript**: `vbscript:`, `livescript:`, `mocha:`
6. **Dangerous Tags**: iframe, embed, object, applet, meta, link, style, base, form, input, button, svg, xml, math, marquee, bgsound, layer
7. **CSS Attacks**: `expression()`, `behavior:`, `binding:`, `-moz-binding`, `@import`
8. **Dangerous Functions**: alert, prompt, confirm, eval, setTimeout, setInterval, String.fromCharCode
9. **Document Manipulation**: document.write, document.cookie, document.location
10. **Encoding Bypasses**: hex (`\x3c`), unicode (`\u003c`), HTML entities (`&#60;`, `&#x3C;`)
11. **Null Bytes**: `\0`, `\x00`, `%00`
12. **XML Attacks**: `<![CDATA[`, `<!ENTITY`, `<!DOCTYPE`

### Real-World Payloads Blocked

From user's XSS testing screenshots:

- `<SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>`
- `<marquee onstart="javascript:alert('Y')">`
- `<a href="javas\0\0cript:alert(1)">`
- `<img src=x onerror=alert(1)>`
- `<iframe src="javascript:alert('XSS')">`

## Testing

### Test Suite (`src/lib/validation/xss-regex.test.ts`)

- 15 test suites covering all attack vector categories
- 100+ individual test cases
- Performance tests: <100ms for 10,000-char inputs, <50ms for batch processing
- Real-world payload validation from screenshots

### Manual Testing Required

1. **Profile Update**:
   - Try updating username with `<script>alert(1)</script>` → should return 400 error
   - Try legitimate names with special chars (O'Brien, José) → should work
2. **Support Tickets**:
   - Try description with `<img src=x onerror=alert(1)>` → should return 400 error
   - Try legitimate descriptions with punctuation → should work

3. **Checkout**:
   - Try shipping address with `javascript:alert(1)` → should return 400 error
   - Try legitimate addresses with apartments/units → should work

4. **CSP Verification**:
   - Open browser DevTools → Network → Check response headers
   - Should see `Content-Security-Policy` header with full policy
   - Try inline `<script>` in browser console → should be blocked by CSP

## Dependencies Added

```json
{
  "isomorphic-dompurify": "^2.18.0",
  "@types/dompurify": "^3.2.1"
}
```

**Why isomorphic-dompurify?**

- Works in both Node.js (server) and browser (client) environments
- Industry-standard HTML sanitization library
- Actively maintained with frequent security updates
- Used by major companies (GitHub, GitLab, MDN)

## Security Best Practices Applied

### 1. Defense in Depth

- **Validation**: Detect XSS patterns before processing
- **Sanitization**: Strip malicious content with DOMPurify
- **CSP**: Browser-level protection against inline scripts
- **Output Encoding**: React/Next.js automatic JSX escaping

### 2. Input Validation

- Max length limits (username: 100, description: 2000, etc.)
- Strict mode for sensitive fields (name, description)
- Email/phone format validation
- URL protocol validation (block javascript:, data:, file:)

### 3. Context-Aware Sanitization

- Plain text fields: Strip ALL HTML (`sanitizeInput`)
- Rich text fields: Allow safe HTML only (`sanitizeHtml`)
- URLs: Protocol validation + sanitization (`sanitizeUrl`)
- Emails: Format validation + lowercase normalization (`sanitizeEmail`)

### 4. Error Handling

- Generic error messages to users: "Invalid input detected"
- Detailed logging on server: Detected patterns logged with `console.warn()`
- No exposure of security mechanisms to attackers

### 5. Performance Optimization

- Three-tier regex system (simple/comprehensive/aggressive)
- Use simple regex first for large inputs (>10,000 chars)
- Validation before sanitization (fail fast)
- Cached regex patterns (no re-compilation)

## Known Limitations

### 1. False Positives

**Potential Issues:**

- Legitimate code examples in support tickets may be flagged
- URLs with "javascript" in path (e.g., `/blog/javascript-tutorial`) may be blocked
- Names with unusual characters might trigger strict mode

**Mitigation:**

- Use `strict: false` for fields where code examples are expected
- Document edge cases in error messages
- Manual review process for flagged tickets

### 2. CSP Compatibility

**Challenges:**

- `'unsafe-inline'` and `'unsafe-eval'` required for payment gateways
- Reduces CSP effectiveness but necessary for business functionality
- Third-party scripts (Cashfree, Razorpay, Sentry) must be explicitly allowed

**Future Improvements:**

- Replace `'unsafe-inline'` with nonces for first-party scripts
- Migrate to CSP Level 3 with `'strict-dynamic'`
- Use Subresource Integrity (SRI) for third-party scripts

### 3. Existing Data

**Issue:**

- XSS protection only applies to NEW data (created after implementation)
- Existing database records may contain unescaped HTML from before protection

**Recommendation:**

- Audit existing user data for stored XSS
- Run migration script to sanitize historical records
- Apply output encoding when displaying old data

## Monitoring & Maintenance

### 1. Logging

**What to Monitor:**

- XSS validation failures: `console.warn('XSS attempt detected in ${fieldName}:', patterns)`
- Pattern frequency: Track which attack vectors are being attempted
- False positive reports: User complaints about legitimate input being blocked

**Log Analysis:**

```bash
# Search for XSS attempts in server logs
grep "XSS attempt detected" logs/server.log | wc -l

# Most common attack patterns
grep "XSS attempt detected" logs/server.log | awk '{print $NF}' | sort | uniq -c | sort -rn
```

### 2. Updates

**Dependencies to Monitor:**

- `isomorphic-dompurify`: Update monthly for security patches
- `@types/dompurify`: Update with dompurify
- `next`: Framework updates may affect CSP headers

**Update Process:**

```bash
npm outdated | grep dompurify
npm update isomorphic-dompurify @types/dompurify
npm audit
npm test
```

### 3. Testing

**Regression Tests:**

- Run XSS regex tests before each deployment: `npm test`
- Manual testing with OWASP XSS payload list
- Browser testing across Chrome, Firefox, Safari for CSP enforcement

**Security Audits:**

- Quarterly penetration testing focusing on XSS
- Annual third-party security audit
- Bug bounty program for vulnerability disclosure

## Integration Examples

### React Form Component

```typescript
import { containsXSS } from '@/lib/validation/xss-regex';

function ProfileForm() {
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;

    // Client-side validation (UX improvement)
    if (containsXSS(username)) {
      setError('Invalid characters detected in username');
      return;
    }

    // Server validates again (security requirement)
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ username }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### API Route with Sanitization

```typescript
import { validateAndSanitize } from "@/lib/validation/xss";

export async function POST(request: Request) {
  const { username } = await request.json();

  // Validate and sanitize
  let sanitizedUsername;
  try {
    sanitizedUsername = validateAndSanitize(username, {
      fieldName: "username",
      maxLength: 100,
      strict: false,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Store sanitized data
  await User.updateOne({ _id: userId }, { username: sanitizedUsername });

  return NextResponse.json({ success: true });
}
```

### Zod Schema Integration

```typescript
import { z } from "zod";
import { createSanitizationTransform } from "@/lib/validation/xss";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username too long")
    .transform(createSanitizationTransform({ maxLength: 100 })),

  bio: z
    .string()
    .max(500, "Bio too long")
    .transform(
      createSanitizationTransform({ maxLength: 500, allowHtml: true })
    ),
});
```

## References

### OWASP Resources

- [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOM Based XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
- [Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

### Library Documentation

- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)
- [isomorphic-dompurify NPM](https://www.npmjs.com/package/isomorphic-dompurify)
- [Next.js Security Headers](https://nextjs.org/docs/app/building-your-application/configuring/headers)

### Testing Resources

- [XSS Payload List by Ismail Tasdelen](https://github.com/ismailtasdelen/xss-payload-list)
- [OWASP XSS Filter Evasion Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html)
- [PortSwigger XSS Cheat Sheet](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet)

## Changelog

### December 29, 2025 - Initial Implementation

- Created XSS regex detection module with 50+ attack patterns
- Created sanitization utility with DOMPurify integration
- Protected profile update API route
- Protected support ticket creation API route
- Protected checkout API route
- Implemented CSP headers in Next.js config
- Added 100+ test cases for XSS detection
- Documentation completed

### Future Enhancements

- [ ] Add XSS sanitization to admin panel forms
- [ ] Implement CSP nonces for inline scripts
- [ ] Add Subresource Integrity (SRI) for third-party scripts
- [ ] Create migration script to sanitize existing database records
- [ ] Add rate limiting for XSS validation failures
- [ ] Implement automated XSS scanning in CI/CD pipeline
- [ ] Create developer training materials on XSS prevention
- [ ] Set up monitoring dashboard for XSS attempts

## Support

For questions or issues with XSS protection:

1. Check this documentation first
2. Review test cases in `xss-regex.test.ts` for examples
3. Check server logs for detailed error messages
4. Contact security team for suspected vulnerabilities

**Security Disclosure:**
If you discover a security vulnerability, please email security@maceazy.com instead of opening a public issue.
