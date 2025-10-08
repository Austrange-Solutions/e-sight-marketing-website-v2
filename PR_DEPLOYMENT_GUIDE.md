# PR Deployment & Dynamic Domain Configuration Guide

## Problem Overview

With Coolify PR deployments, each pull request gets a unique subdomain like:
- `pr-123.maceazy.com`
- `pr-456.maceazy.com`

This makes it impossible to use static environment variables like `NEXT_PUBLIC_HOSTNAME` for donate subdomain URLs.

## Solution: Runtime Domain Detection

Instead of build-time environment variables, we use **runtime browser detection** to dynamically construct URLs based on the current hostname.

---

## Implementation

### 1. Domain Utility Functions (`src/lib/domainUtils.ts`)

Created utility functions that detect the current environment at runtime:

```typescript
getDonateUrl()        // Returns: http://donate.localhost:3000 or https://donate-pr-123.maceazy.com
getMainDomainUrl()    // Returns: http://localhost:3000 or https://pr-123.maceazy.com
isDonateDomain()      // Returns: true if on donate subdomain
```

**Key Features:**
- ✅ Works in development (`localhost`)
- ✅ Works in PR previews (`pr-123.maceazy.com`)
- ✅ Works in production (`maceazy.com`)
- ✅ Handles ports automatically
- ✅ No environment variables needed

### 2. Updated Components

**HomeHero.tsx:**
- Uses `useState` and `useEffect` to get donate URL on client side
- Donate button dynamically gets correct URL

**Navbar.tsx:**
- Desktop donate button uses dynamic URL
- Mobile donate button uses dynamic URL
- Navigation links detect if on donate subdomain and redirect correctly

---

## Coolify Configuration

### Option 1: Path-Based (Simpler)

If you deploy donate with the main app:
```
Main app: pr-123.maceazy.com
Donate:   pr-123.maceazy.com/donate
```

**Pros:**
- Single deployment
- No subdomain setup needed
- Works out of the box

**Cons:**
- Donate and main app share same domain
- No true subdomain isolation

### Option 2: Subdomain-Based (Recommended)

Deploy donate as separate subdomain for each PR:

```
Main app: pr-123.maceazy.com
Donate:   donate-pr-123.maceazy.com
```

**Setup in Coolify:**

1. **Main App Deployment:**
   ```yaml
   # coolify.yaml or deployment settings
   domains:
     - pr-${PULL_REQUEST_NUMBER}.maceazy.com
   ```

2. **Donate Subdomain Deployment:**
   ```yaml
   # For donate app
   domains:
     - donate-pr-${PULL_REQUEST_NUMBER}.maceazy.com
   ```

3. **Environment Variables:**
   No `NEXT_PUBLIC_HOSTNAME` needed! The utility functions handle everything at runtime.

**Pros:**
- True subdomain isolation
- Matches production setup
- Better for testing subdomain-specific features

**Cons:**
- Requires separate deployment for donate
- More complex Coolify setup

---

## DNS Configuration

### For Production:
```
A     maceazy.com              → Your server IP
CNAME donate.maceazy.com       → maceazy.com
```

### For PR Previews (Wildcard):
```
CNAME *.maceazy.com            → your-coolify-server.com
```

This allows any subdomain (`pr-123.maceazy.com`, `donate-pr-456.maceazy.com`) to work automatically.

---

## Middleware Configuration

Your `src/middleware.ts` should handle subdomain routing:

```typescript
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Check if it's donate subdomain
  if (hostname.startsWith('donate.') || hostname.startsWith('donate-')) {
    // Rewrite to /donate routes
    const url = request.nextUrl.clone();
    if (url.pathname === '/') {
      url.pathname = '/donate';
      return NextResponse.rewrite(url);
    }
    if (url.pathname === '/success') {
      url.pathname = '/donate/success';
      return NextResponse.rewrite(url);
    }
  }
  
  // ... rest of middleware
}
```

---

## Testing

### Local Development:
```bash
# Main site
http://localhost:3000

# Donate subdomain (add to hosts file)
http://donate.localhost:3000
```

**hosts file** (`C:\Windows\System32\drivers\etc\hosts` on Windows):
```
127.0.0.1  localhost
127.0.0.1  donate.localhost
```

### PR Preview:
```bash
# Main site
https://pr-123.maceazy.com

# Donate subdomain
https://donate-pr-123.maceazy.com  # (if using subdomain option)
https://pr-123.maceazy.com/donate  # (if using path option)
```

---

## Environment Variables (Optional)

You can still use env vars for other purposes, but they're not required for domain detection:

**.env.local:**
```bash
# Optional: For other features, not for donate URL
NEXT_PUBLIC_API_URL=https://api.maceazy.com
RAZORPAY_KEY_ID=rzp_test_xxxxx
```

---

## Benefits of This Approach

1. **Zero Configuration**: No env vars to manage per PR
2. **Automatic**: Works for any PR number automatically
3. **Consistent**: Same code works in dev, staging, and production
4. **Type-Safe**: TypeScript utilities with proper types
5. **SSR-Safe**: Handles server-side rendering gracefully
6. **Testable**: Easy to test different hostname scenarios

---

## Troubleshooting

### Issue: Donate button shows "#" or doesn't work
**Cause**: `donateUrl` not set yet (component rendered before `useEffect`)
**Solution**: Add loading state or check `if (!donateUrl) return null;`

### Issue: PR preview doesn't load donate subdomain
**Cause**: DNS wildcard not configured
**Solution**: Add `*.maceazy.com` CNAME record

### Issue: Localhost testing not working
**Cause**: `donate.localhost` not in hosts file
**Solution**: Add `127.0.0.1 donate.localhost` to hosts file

### Issue: Domain detection incorrect
**Cause**: Browser caching old domain
**Solution**: Hard refresh (Ctrl+Shift+R) or clear cache

---

## Migration Checklist

- [x] Created `src/lib/domainUtils.ts`
- [x] Updated `HomeHero.tsx` to use runtime detection
- [x] Updated `Navbar.tsx` desktop donate button
- [x] Updated `Navbar.tsx` mobile donate button
- [x] Removed `NEXT_PUBLIC_HOSTNAME` dependency
- [ ] Configure Coolify wildcard subdomain (if using Option 2)
- [ ] Add DNS wildcard CNAME record
- [ ] Test on PR preview
- [ ] Deploy to production

---

## Future Improvements

1. **Add loading skeleton** while donate URL is being detected
2. **Preload donate page** for faster navigation
3. **Service worker** for offline support
4. **Analytics** to track subdomain usage
5. **A/B testing** different subdomain structures

---

## Questions?

If you have issues with:
- Coolify configuration
- DNS setup
- Subdomain routing
- Testing

Feel free to ask! 🚀
