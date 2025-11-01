# Copilot Instructions for E-Sight Marketing Website V2

## Project Overview
Next.js 15 e-commerce/donation platform for MACEAZY (E-Kaathi Pro) with dual functionality:
- **E-commerce:** Product catalog, cart, checkout, order management
- **Donation Portal:** Multi-foundation crowdfunding with configurable fee splitting

**Tech Stack:** Next.js 15 (App Router, Turbopack), MongoDB/Mongoose, Cashfree/Razorpay, AWS S3/CloudFront, Bun runtime

---

## Core Architecture

### 1. Multi-Foundation Donation System (Critical)
**Dynamic Foundation System:** Admins add unlimited foundations via admin panel (no code changes)
- **Foundation identification:** Prefer `code` (e.g., "vsf", "cf"), fallback to `_id` (ObjectId)
- **Migration foundations:** VSF (Vishnu Shakti Foundation), CF (Chetana Foundation) created by migration script
- **APIs accept:** Both foundation code AND ObjectId (code preferred)
- **Only 2 required fields:** Foundation Name + Foundation Share % (rest optional: logo, description, contact)

**Two-tier fee calculation** (implemented in `foundationSettingsModel.ts:calculateBreakdown()`):
```javascript
// Step 1: Platform Fee
platformFee = round(amount * platformFeePercent% to paise)
afterPlatformFee = round(amount - platformFee to paise)

// Step 2: Foundation/Company Split
foundationAmount = round(afterPlatformFee * foundationSharePercent% to paise)
companyAmount = round(afterPlatformFee - foundationAmount to paise)
```

**Critical Notes:**
- **Gateway fees (~2%) NOT in calculation** - platform absorbs Cashfree/Razorpay fees
- User sees only donation amount (no gateway fee shown)
- Order amount = donation amount exactly
- **Rounding:** `Math.round(value * 100) / 100` (nearest paise) to avoid floating-point issues
- **Breakdowns HIDDEN from public** - only visible in admin panel

**Key Files:**
- `src/models/Foundation.ts` - Dynamic foundation model (name, code, logo, percentages, contact)
- `src/models/foundationSettingsModel.ts` - Legacy per-foundation config (VSF/CF only)
- `src/models/Donation.ts` - Stores breakdown (platformFee, foundationAmount, companyAmount)
- `src/app/api/donate/create/route.ts` - Creates Cashfree/Razorpay order with breakdown
- `src/app/api/donate/verify/route.ts` - Verifies payment signature, saves donation
- `src/components/donate/DonateButton.tsx` - Cashfree payment button (active)
- `src/components/donate/MultiFoundationDonateButtons.tsx` - Legacy Razorpay buttons

---

### 2. Subdomain Routing (donate.maceazy.com)
**Middleware-based subdomain detection** (`src/middleware.ts`):
```typescript
// donate.maceazy.com → /donate page
// donate.maceazy.com/success → /donate/success
// donate.maceazy.com/terms-of-use → /donate/terms-of-use
```

**Local Testing:** Use `donate.localhost:3000` (Chrome/Firefox support subdomains on localhost)
- Alternative: Edit `C:\Windows\System32\drivers\etc\hosts` → `127.0.0.1 donate.localhost`

**Pattern:** All routes under `src/app/donate/` are automatically accessible on donate subdomain

---

### 3. Database Connection Pattern
**Always use connection caching** to avoid exhausting MongoDB Atlas connections:

```typescript
import { connect } from "@/dbConfig/dbConfig";

export async function POST() {
  await connect(); // Uses cached connection (maxPoolSize: 5, minPoolSize: 1)
  // ... your Mongoose queries
}
```

**Critical:** 
- Call `await connect()` at start of EVERY API route using Mongoose
- Connection is cached globally - no overhead from repeated calls
- Prevents "too many connections" errors on MongoDB Atlas

---

### 4. Authentication Systems

### 4. Authentication Systems

#### User Authentication (JWT)
- **Token:** Stored in `token` cookie
- **Verification:** `getUserFromToken()` from `@/middleware/auth`
- **Runtime:** Force Node.js runtime (`export const runtime = 'nodejs'`) in routes using JWT
- **User Model:** `src/models/userModel.ts` - fields: `isVerified`, `isAdmin`, `password` (bcrypt hashed)

#### Admin Authentication (Separate System)
- **Token:** Stored in `admin-token` cookie (2-hour expiry)
- **Verification:** `getAdminFromRequest()` from `@/middleware/adminAuth`
- **Login:** `POST /api/admin/login` - checks `user.isAdmin === true`
- **Middleware:** `src/middleware.ts` redirects `/admin/*` to `/admin/login` if unauthorized
- **All admin routes MUST verify:** 
  ```typescript
  const adminData = getAdminFromRequest(request);
  if (!adminData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  ```

---

### 5. Payment Gateway Integration (Cashfree Primary, Razorpay Fallback)

**Active Gateway:** Cashfree (configured in `src/app/api/donate/create/route.ts`)

**Cashfree Flow:**
1. Create order: `POST /api/donate/create` → returns `payment_session_id`
2. Load Cashfree SDK: `load({ mode: "production" | "sandbox" })`
3. Open checkout: `cashfree.checkout({ paymentSessionId })`
4. Verify: `POST /api/donate/verify` with `order_id`

**Critical Environment Matching:**
```env
# MUST match on both server and client
CASHFREE_ENDPOINT=https://api.cashfree.com/pg  # Production
NEXT_PUBLIC_CASHFREE_ENDPOINT=https://api.cashfree.com/pg
CASHFREE_APP_ID=your_production_app_id
NEXT_PUBLIC_CASHFREE_APP_ID=your_production_app_id
```

**Common Pitfall:** "payment_session_id is not present or invalid"
- **Cause:** Client-side SDK mode doesn't match server credentials (sandbox vs production)
- **Fix:** Ensure `NEXT_PUBLIC_CASHFREE_ENDPOINT` matches `CASHFREE_ENDPOINT`

**Razorpay (Legacy):**
- Still supported in `MultiFoundationDonateButtons.tsx`
- Script loading: Check if `window.Razorpay` exists before adding script tag
- Similar flow: create order → load script → verify payment

---

### 6. AWS S3 + CloudFront Integration

### 6. AWS S3 + CloudFront Integration

**Image uploads:** Two-step process
1. Generate pre-signed URL: `POST /api/images/generate-presigned-url`
2. Upload directly to S3 from client using pre-signed URL

**Folder Structure:**
```
e-sight-ecommerce-product-images/
├── donation-logos/       # Foundation/NGO logos (new system)
└── products/            # Product images
```

**Serving images:** Always use CloudFront domain
```typescript
const imageUrl = `${process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN}/${key}`;
```

**Key Files:**
- `src/lib/aws-utils.ts` - S3 client setup
- `src/app/api/images/generate-presigned-url/route.ts` - Pre-signed URL generation (admin-only)
- `public/assets/images/` - Local fallback images

**Environment Variables:**
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- `S3_BUCKET` - e.g., `austrange-storage`
- `S3_PREFIX` - e.g., `e-sight-ecommerce-product-images/`
- `CLOUDFRONT_DOMAIN` or `NEXT_PUBLIC_CLOUDFRONT_DOMAIN` - e.g., `dw9tsoyfcyk5k.cloudfront.net`

---

### 7. Admin Dashboard Structure

**Management Tabs:**
1. Overview - Stats dashboard
2. Users - User management
3. Products - Product CRUD
4. Orders - Order tracking and fulfillment
5. Delivery Areas - Serviceable locations
6. Disabled Persons - Registration tracking (accessibility feature)
7. **Donations** - View all donations with complete fee breakdowns
8. **Foundation Settings** - Edit configurable percentages per foundation
9. **Foundations** - Dynamic foundation management (add/edit/delete)

**Location:** `src/app/admin/dashboard/page.tsx`
**Component Pattern:** Each tab has a dedicated management component in `src/components/admin/`

**Important:** Always filter out "general" foundation from displays:
```typescript
const activeFoundations = ["vsf", "cf"]; // Never include "general"
```

---

## Development Workflow

### Running Locally
```powershell
bun install              # Install dependencies
bun dev --turbopack     # Start dev server (localhost:3000)
bun build               # Production build
bun start               # Start production server
```

**Testing:**
```powershell
npm test                                      # Run donation breakdown tests
node ./src/__tests__/donationBreakdown.test.js # Direct test execution
```

**Critical:** Always develop and test on `localhost:3000` BEFORE deploying to production (`maceazy.com`)

### Environment Variables Required
```env
# Database
MONGODB_URI=mongodb+srv://...

# Auth
TOKEN_SECRET=your-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Cashfree (Primary)
CASHFREE_ENDPOINT=https://api.cashfree.com/pg  # or sandbox.cashfree.com
NEXT_PUBLIC_CASHFREE_ENDPOINT=https://api.cashfree.com/pg
CASHFREE_APP_ID=...
NEXT_PUBLIC_CASHFREE_APP_ID=...
CASHFREE_SECRET_KEY=...

# Razorpay (Fallback)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# AWS
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
S3_BUCKET_NAME=maceazy-s3-bucket
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=https://d1234.cloudfront.net

# Email (Resend)
RESEND_API_KEY=re_...
```

---

## Code Conventions

### Mongoose Models
- **Always check for existing model** before creating:
  ```typescript
  const User = mongoose.models.User || mongoose.model("User", userSchema);
  export default User;
  ```
- **Use timestamps:** `{ timestamps: true }` in schema options
- **Lean queries:** Use `.lean()` for read-only operations (better performance)

### API Routes
- **Error handling:** Always use try-catch with proper status codes
- **Validation:** Use Zod schemas for input validation
- **Response format:** 
  ```typescript
  return NextResponse.json({ success: true, data: {...} }, { status: 200 });
  return NextResponse.json({ error: "Message" }, { status: 400 });
  ```

### TypeScript
- **Strict mode enabled** - no implicit `any`
- **Type imports:** Use `import type { ... }` for type-only imports
- **Model types:** Define interfaces for Mongoose documents (e.g., `UserDocument extends Document`)

---

## Important Notes for AI Agents

1. **Never reintroduce "General" foundation** - it was deliberately removed
2. **Two-tier calculation only** - Platform Fee → Foundation/Company Split (NO gateway fee in calculation)
3. **Gateway fees are absorbed by platform** - not deducted from donation amount
4. **Connection caching is critical** - never skip `await connect()` in API routes
5. **Admin auth is separate from user auth** - use correct middleware for each
6. **Cashfree is primary gateway** - Razorpay is fallback/legacy
7. **Environment must match** - server and client Cashfree endpoints must be identical
8. **Always use CloudFront URLs** - never serve S3 URLs directly to users
9. **Bun is the package manager** - use `bun` commands, not `npm` or `yarn`
10. **Local vs Production** - users often confuse these; always clarify which environment

---

## Key Documentation Files
- `CONFIGURABLE_PERCENTAGE_IMPLEMENTATION.md` - Complete donation system architecture
- `DYNAMIC_FOUNDATION_SYSTEM.md` - Dynamic foundation management details
- `CASHFREE_PRODUCTION_TROUBLESHOOTING.md` - Cashfree deployment guide
- `QUICKSTART_DONATE.md` - Donation portal setup guide
- `CROWDFUNDING_PORTAL.md` - Feature documentation
- `DISABLED_REGISTRATION_FEATURE.md` - Accessibility feature details
- `THEMING-GUIDE.md` - UI theming system
- `SUBDOMAIN_SETUP.md` - donate.maceazy.com subdomain routing
- `docs/DEVELOPER_GUIDE.md` - Local workflow and recent changes
- `docs/PROJECT_OVERVIEW.md` - Architecture summary

---

## Common Pitfalls to Avoid
1. ❌ Using `npm` instead of `bun`
2. ❌ Forgetting `await connect()` in API routes
3. ❌ Not forcing Node.js runtime for JWT routes (`export const runtime = 'nodejs'`)
4. ❌ Mixing admin and user authentication
5. ❌ Hardcoding foundation calculations (use `calculateBreakdown()`)
6. ❌ Exposing donation breakdowns to public users
7. ❌ Serving S3 URLs without CloudFront
8. ❌ Creating duplicate Mongoose models (always check `mongoose.models` first)
9. ❌ Mismatched Cashfree endpoints between server and client
10. ❌ Not handling subdomain routing in middleware
