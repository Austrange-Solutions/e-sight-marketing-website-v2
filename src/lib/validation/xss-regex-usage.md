# XSS Detection Regex - Usage Guide

## Overview
This module provides comprehensive regex patterns to detect Cross-Site Scripting (XSS) attacks based on Ismail Tasdelen's XSS payload collection.

## Installation

```typescript
import { 
  containsXSS, 
  extractXSSPatterns,
  XSS_DETECTION_REGEX 
} from '@/lib/validation/xss-regex';
```

## Basic Usage

### 1. Check if Input Contains XSS

```typescript
const userInput = '<script>alert("XSS")</script>';

if (containsXSS(userInput)) {
  console.log('⚠️ XSS Attack Detected!');
  // Reject the input
  return { error: 'Invalid input detected' };
}
```

### 2. Strict Mode (Aggressive Detection)

```typescript
const userInput = 'onclick=alert(1)';

// Use strict mode for more sensitive validation
if (containsXSS(userInput, true)) {
  console.log('⚠️ Potential XSS Detected!');
}
```

### 3. Extract XSS Patterns (for Logging)

```typescript
const maliciousInput = '<script>alert(1)</script><img onerror=alert(2)>';

const patterns = extractXSSPatterns(maliciousInput);
console.log('Detected patterns:', patterns);
// Output: ['<script>', 'onerror=']
```

## Integration with Forms

### React/Next.js Example

```typescript
import { containsXSS } from '@/lib/validation/xss-regex';
import DOMPurify from 'isomorphic-dompurify';

function ProfileForm() {
  const handleSubmit = async (data: any) => {
    // Step 1: Check for XSS patterns
    const fieldsToCheck = ['name', 'email', 'bio', 'address'];
    
    for (const field of fieldsToCheck) {
      if (containsXSS(data[field])) {
        toast.error(`Invalid characters detected in ${field}`);
        return;
      }
    }
    
    // Step 2: Sanitize with DOMPurify before sending to API
    const sanitizedData = {
      name: DOMPurify.sanitize(data.name),
      email: DOMPurify.sanitize(data.email),
      bio: DOMPurify.sanitize(data.bio),
      address: DOMPurify.sanitize(data.address),
    };
    
    // Step 3: Send to API
    await fetch('/api/profile', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });
  };
}
```

### API Route Example (Next.js)

```typescript
// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { containsXSS } from '@/lib/validation/xss-regex';
import DOMPurify from 'isomorphic-dompurify';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate all text fields
  const textFields = ['username', 'phone', 'address', 'bio'];
  
  for (const field of textFields) {
    if (body[field] && containsXSS(body[field])) {
      return NextResponse.json(
        { error: `Invalid input in ${field}` },
        { status: 400 }
      );
    }
  }
  
  // Sanitize before database storage
  const sanitizedData = {
    username: DOMPurify.sanitize(body.username),
    phone: DOMPurify.sanitize(body.phone),
    address: DOMPurify.sanitize(body.address),
    bio: DOMPurify.sanitize(body.bio),
  };
  
  // Save to database
  await db.collection('users').updateOne(
    { _id: userId },
    { $set: sanitizedData }
  );
  
  return NextResponse.json({ success: true });
}
```

## Zod Schema Integration

```typescript
import { z } from 'zod';
import { containsXSS } from '@/lib/validation/xss-regex';

const profileSchema = z.object({
  username: z.string()
    .min(3)
    .max(50)
    .refine((val) => !containsXSS(val), {
      message: 'Invalid characters detected in username',
    }),
  
  email: z.string()
    .email()
    .refine((val) => !containsXSS(val), {
      message: 'Invalid characters detected in email',
    }),
  
  bio: z.string()
    .max(500)
    .refine((val) => !containsXSS(val), {
      message: 'Invalid characters detected in bio',
    }),
});

// Usage
const result = profileSchema.safeParse(userInput);
if (!result.success) {
  console.error(result.error.errors);
}
```

## Testing Examples

```typescript
import { containsXSS, XSS_TEST_CASES } from '@/lib/validation/xss-regex';

describe('XSS Detection', () => {
  it('should detect script tags', () => {
    expect(containsXSS('<script>alert(1)</script>')).toBe(true);
  });
  
  it('should detect javascript protocol', () => {
    expect(containsXSS('javascript:alert(1)')).toBe(true);
  });
  
  it('should detect event handlers', () => {
    expect(containsXSS('<img onerror=alert(1)>')).toBe(true);
  });
  
  it('should allow safe input', () => {
    expect(containsXSS('Hello, World!')).toBe(false);
  });
  
  it('should detect all test cases', () => {
    XSS_TEST_CASES.forEach(testCase => {
      expect(containsXSS(testCase)).toBe(true);
    });
  });
});
```

## Detected Attack Vectors

This regex detects:

✅ **Script Tags**
- `<script>`, `</script>`
- Encoded: `&lt;script`, `&#60;script`, `\x3cscript`

✅ **JavaScript Protocol**
- `javascript:alert(1)`
- Obfuscated: `jav\nascript:`, `jav&#x0A;ascript:`
- Encoded: `&#106;&#97;&#118;&#97;`

✅ **Event Handlers**
- `onerror=`, `onload=`, `onclick=`, `onmouseover=`
- All 40+ event handlers

✅ **Data URIs**
- `data:text/html,<script>alert(1)</script>`
- `data:image/svg+xml;base64,...`

✅ **Dangerous Tags**
- `<iframe>`, `<object>`, `<embed>`, `<applet>`
- `<svg>`, `<meta>`, `<link>`, `<style>`, `<base>`

✅ **CSS Attacks**
- `expression()`, `behavior:`, `binding:`, `-moz-binding`
- `@import`, `.htc` files

✅ **Obfuscation Techniques**
- String.fromCharCode
- Hex encoding (`\x6A`)
- Unicode encoding (`\u006A`)
- HTML entities (`&#106;`)
- Null bytes (`\0`, `%00`)

## Important Notes

⚠️ **This regex is NOT a complete solution!**

1. **Use DOMPurify**: Always sanitize HTML with DOMPurify
2. **Content Security Policy**: Implement CSP headers
3. **Output Encoding**: Encode data when rendering
4. **Context-Aware**: Different contexts need different sanitization

## Best Practices

1. **Validation + Sanitization**: Use regex for validation, DOMPurify for sanitization
2. **Whitelist Approach**: Allow known-good patterns, block everything else
3. **Context Matters**: Different sanitization for HTML, URLs, JavaScript contexts
4. **Server-Side Validation**: Never trust client-side validation alone
5. **Security Headers**: Use CSP, X-XSS-Protection, X-Content-Type-Options

## Performance Considerations

- **Simple Regex**: Fast, use for basic checks
- **Comprehensive Regex**: Thorough, may be slower on large inputs
- **Aggressive Regex**: Very strict, may have false positives

```typescript
// For large inputs, use simple regex first
if (input.length > 10000) {
  if (XSS_SIMPLE_REGEX.test(input)) {
    return { error: 'Invalid input' };
  }
}
```

## False Positives

Some legitimate inputs may trigger false positives:

```typescript
// Example: Code documentation
const input = "Use <script> tag for JavaScript";

// This will be flagged even though it's not malicious
containsXSS(input); // true
```

**Solution**: Use context-aware validation or whitelist specific patterns.

## Additional Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Ismail Tasdelen's XSS Payload List](https://github.com/ismailtasdelen/xss-payload-list)

## License

Based on Ismail Tasdelen's XSS Payload List (MIT License)
