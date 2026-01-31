# XSS Protection Quick Reference

## Quick Start

### Import

```typescript
import {
  validateAndSanitize,
  sanitizeEmail,
  sanitizePhone,
} from "@/lib/validation/xss";
import { containsXSS } from "@/lib/validation/xss-regex";
```

### Basic Usage

```typescript
// In API routes - validate then sanitize
try {
  const cleanInput = validateAndSanitize(userInput, {
    fieldName: "username",
    maxLength: 100,
    strict: false,
  });
  // Store cleanInput in database
} catch (error) {
  return NextResponse.json({ error: error.message }, { status: 400 });
}
```

## Function Reference

### `validateAndSanitize(input, options)`

Validates for XSS patterns, then sanitizes with DOMPurify.

**Options:**

- `fieldName` (string): Field name for error messages
- `maxLength` (number): Max character limit
- `allowHtml` (boolean): Allow safe HTML tags (default: false)
- `strict` (boolean): Use aggressive XSS detection (default: false)

**Returns:** Sanitized string or throws Error

**Example:**

```typescript
const username = validateAndSanitize(input, {
  fieldName: "username",
  maxLength: 100,
  strict: false,
});
```

### `sanitizeEmail(email)`

Validates and sanitizes email addresses.

**Example:**

```typescript
const cleanEmail = sanitizeEmail("user@example.com");
```

### `sanitizePhone(phone)`

Removes non-numeric characters except +, spaces, (), -.

**Example:**

```typescript
const cleanPhone = sanitizePhone("+1 (555) 123-4567");
```

### `containsXSS(input, strict)`

Checks if input contains XSS patterns without sanitizing.

**Example:**

```typescript
if (containsXSS(userInput)) {
  return { error: "Invalid input detected" };
}
```

### `sanitizeUrl(url)`

Validates and sanitizes URLs, blocks dangerous protocols.

**Example:**

```typescript
const cleanUrl = sanitizeUrl("https://example.com");
// Returns '' for 'javascript:alert(1)'
```

## Common Patterns

### API Route

```typescript
export async function POST(request: Request) {
  const { name, email, description } = await request.json();

  let sanitizedData;
  try {
    sanitizedData = {
      name: validateAndSanitize(name, {
        fieldName: "name",
        maxLength: 100,
        strict: true,
      }),
      email: sanitizeEmail(email),
      description: validateAndSanitize(description, {
        fieldName: "description",
        maxLength: 2000,
        strict: true,
      }),
    };
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Store sanitizedData in database
  await Model.create(sanitizedData);
  return NextResponse.json({ success: true });
}
```

### React Form

```typescript
import { containsXSS } from "@/lib/validation/xss-regex";

function MyForm() {
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    const input = e.target.myField.value;

    if (containsXSS(input)) {
      setError("Invalid characters detected");
      return;
    }

    // Submit to API (server validates again)
    fetch("/api/endpoint", {
      method: "POST",
      body: JSON.stringify({ myField: input }),
    });
  };
}
```

### Zod Schema

```typescript
import { z } from "zod";
import { createSanitizationTransform } from "@/lib/validation/xss";

const schema = z.object({
  username: z
    .string()
    .max(100)
    .transform(createSanitizationTransform({ maxLength: 100 })),
});
```

## When to Use What

| Input Type       | Function              | Options                         |
| ---------------- | --------------------- | ------------------------------- |
| Username/Name    | `validateAndSanitize` | `strict: false`                 |
| Email            | `sanitizeEmail`       | -                               |
| Phone            | `sanitizePhone`       | -                               |
| Address          | `validateAndSanitize` | `strict: false, maxLength: 500` |
| Description/Bio  | `validateAndSanitize` | `strict: true, maxLength: 2000` |
| URL              | `sanitizeUrl`         | -                               |
| Rich Text (HTML) | `validateAndSanitize` | `allowHtml: true, strict: true` |

## Strict Mode

Use `strict: true` for:

- User-generated content visible to others (descriptions, bios, comments)
- Fields allowing longer text (high attack surface)
- Admin/privileged user inputs

Use `strict: false` for:

- Short fields with limited chars (username, name)
- Fields with specific formats (email, phone)
- Fields where false positives are problematic

## Error Handling

### Server-Side (Required)

```typescript
try {
  const clean = validateAndSanitize(input, options);
} catch (error) {
  return NextResponse.json(
    { error: error.message }, // Generic message to user
    { status: 400 }
  );
}
```

### Client-Side (Optional UX)

```typescript
if (containsXSS(input)) {
  setError("Invalid characters detected");
  return; // Don't submit
}
```

## Blocked Patterns

### Always Blocked

- `<script>` tags (any case, encoded)
- `javascript:` protocol (obfuscated, encoded)
- Event handlers: `onerror`, `onload`, `onclick`, etc.
- Data URIs: `data:text/html`, `data:...base64`
- Dangerous tags: `<iframe>`, `<embed>`, `<object>`
- CSS attacks: `expression()`, `behavior:`
- Dangerous functions: `eval()`, `setTimeout()`, `fromCharCode()`

### Context-Dependent

- HTML tags in plain text fields (stripped)
- HTML tags in rich text fields (allowed if safe)
- URLs checked for protocol (http/https ok, javascript/data blocked)

## Testing

### Run Tests

```bash
npm test
```

### Manual Testing

Try these payloads (should all be blocked):

- `<script>alert(1)</script>`
- `<img src=x onerror=alert(1)>`
- `javascript:alert(1)`
- `<iframe src="data:text/html,<script>alert(1)</script>">`

## CSP Headers

Configured in `next.config.ts`. Browser blocks:

- Inline scripts without nonce
- Scripts from unauthorized domains
- Object/embed elements
- Form submissions to external sites

Check CSP in browser DevTools:

1. Open Network tab
2. Click any request
3. Check Response Headers for `Content-Security-Policy`

## Performance

| Function                      | Performance | Use Case                       |
| ----------------------------- | ----------- | ------------------------------ |
| `containsXSS` (simple)        | <1ms        | Pre-check before processing    |
| `containsXSS` (comprehensive) | <5ms        | Standard validation            |
| `validateAndSanitize`         | <10ms       | Full validation + sanitization |

For large inputs (>10,000 chars), use simple regex first:

```typescript
import { XSS_SIMPLE_REGEX } from "@/lib/validation/xss-regex";

if (XSS_SIMPLE_REGEX.test(largeInput)) {
  return { error: "Invalid input" };
}
```

## Troubleshooting

### False Positives

**Problem:** Legitimate input flagged as XSS

**Solutions:**

1. Use `strict: false` mode
2. Increase `maxLength` limit
3. Provide specific error messages
4. Log detected patterns: `extractXSSPatterns(input)`

### False Negatives

**Problem:** XSS payload not detected

**Solutions:**

1. Use `strict: true` mode
2. Update regex patterns (report to security team)
3. Add CSP headers (browser-level protection)
4. Use DOMPurify sanitization (removes even unknown patterns)

### Performance Issues

**Problem:** Validation too slow

**Solutions:**

1. Use `XSS_SIMPLE_REGEX` for large inputs
2. Validate on client-side first (fail fast)
3. Batch validation for multiple fields
4. Cache validation results if input unchanged

## Resources

- **Full Docs:** `XSS_PROTECTION_IMPLEMENTATION.md`
- **Usage Guide:** `src/lib/validation/xss-regex-usage.md`
- **Tests:** `src/lib/validation/xss-regex.test.ts`
- **OWASP XSS Guide:** https://owasp.org/www-community/attacks/xss/

## Security Checklist

Before deploying new forms:

- [ ] Import XSS validation utilities
- [ ] Validate ALL user inputs
- [ ] Use `strict: true` for public-facing content
- [ ] Set appropriate `maxLength` limits
- [ ] Sanitize with DOMPurify
- [ ] Store sanitized data only
- [ ] Add error handling for validation failures
- [ ] Test with OWASP XSS payloads
- [ ] Verify CSP headers in browser
- [ ] Log validation failures for monitoring

---

**Remember:** Validation + Sanitization + CSP = Defense in Depth
