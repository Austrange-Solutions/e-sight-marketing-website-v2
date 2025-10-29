# Copilot Instructions for E-Sight Marketing Website V2

## Project Overview
This is a Next.js 15 e-commerce/donation platform for MACEAZY (E-Kaathi Pro) with dual functionality:
- **E-commerce:** Product catalog, cart, checkout, and order management
- **Donation Portal:** Multi-foundation crowdfunding system with complex fee splitting

**Tech Stack:** Next.js 15 (App Router, Turbopack), MongoDB/Mongoose, Razorpay, AWS S3/CloudFront, Bun runtime

---


## Core Architecture

### 1. Multi-Foundation Donation System (Critical)
**Dynamic Foundation System:** Admins can add unlimited foundations from admin panel
- **Foundation identification:** Prefer `code` (e.g., "vsf", "cf"), fallback to `_id` (ObjectId)
- **Migration foundations:** VSF (Vishnu Shakti Foundation) and CF (Chetana Foundation) will be created by migration script
- **API accepts:** Both foundation code AND ObjectId (code is preferred)

**Two-tier fee calculation:**
```
Donation Amount (₹100)
  ↓ Step 1: Platform Fee (configurable %)
  → Platform Fee: ₹12, Remaining: ₹88
  ↓ Step 2: Foundation vs Company Split (configurable %)
  → Foundation: ₹57.20 (e.g., 65%), Company: ₹30.80 (e.g., 35%)
```

**Important Notes:**
- Razorpay payment gateway fees (~2%) are NOT included in the calculation
- Platform absorbs Razorpay fees (charged separately by Razorpay during transaction)
- User sees only the donation amount, no gateway fees displayed
- Razorpay order amount = donation amount (no extra charge added)

**Key Files:**
- `src/models/foundationSettingsModel.ts` - Configurable percentages per foundation
- `src/models/Donation.ts` - Stores breakdown (platformFee, foundationAmount, companyAmount)
- `src/app/api/donate/create/route.ts` - Creates Razorpay order with breakdown
- `src/app/api/donate/verify/route.ts` - Verifies payment and saves donation
- `src/components/donate/MultiFoundationDonateButtons.tsx` - Payment buttons

**Important:** Donation breakdowns are HIDDEN from public users (visible only in admin panel)

---

### 2. Database Connection Pattern
**Always use connection caching** to avoid exhausting MongoDB Atlas connections:

```typescript
import { connect } from "@/dbConfig/dbConfig";

export async function GET() {
  await connect(); // Uses cached connection if available
  // ... your code
}
```

**Connection config:** `maxPoolSize: 5, minPoolSize: 1` (in `dbConfig.ts`)
**Critical:** Call `connect()` in EVERY API route - it's cached and optimized

---

### 3. Authentication Systems

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

### 4. Razorpay Payment Integration

**Flow:**
1. Create Razorpay order: `POST /api/donate/create` (donation) or `POST /api/payment/create` (product)
2. Frontend loads Razorpay script and opens checkout modal
3. User completes payment
4. Verify payment: `POST /api/donate/verify` or `POST /api/payment/verify`

**Script Loading (Enhanced for reliability):**
```typescript
// src/components/donate/MultiFoundationDonateButtons.tsx
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
```

**Environment Variables:**
- `RAZORPAY_KEY_ID` - Public key (use in frontend)
- `RAZORPAY_KEY_SECRET` - Secret key (backend only)

---

### AWS S3 + CloudFront Integration

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

### 6. Admin Dashboard Structure

**7 Management Tabs:**
1. Overview - Stats dashboard
2. Users - User management
3. Products - Product CRUD
4. Orders - Order tracking and fulfillment
5. Delivery Areas - Serviceable locations
6. Disabled Persons - Registration tracking (accessibility feature)
7. **Donations** - View all donations with complete fee breakdowns
8. **Foundation Settings** - Edit configurable percentages per foundation

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

**Critical:** Always develop and test on `localhost:3000` BEFORE deploying to production (`maceazy.com`)

### Environment Variables Required
```env
# Database
MONGODB_URI=mongodb+srv://...

# Auth
TOKEN_SECRET=your-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Razorpay
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
2. **Two-tier calculation only** - Platform Fee → Foundation/Company Split (NO Razorpay fee in calculation)
3. **Razorpay fees are absorbed by platform** - not deducted from donation amount
4. **Connection caching is critical** - never skip `await connect()` in API routes
5. **Admin auth is separate from user auth** - use correct middleware for each
6. **Razorpay script loading must be async** - check if already loaded before adding script tag
7. **Always use CloudFront URLs** - never serve S3 URLs directly to users
8. **Bun is the package manager** - use `bun` commands, not `npm` or `yarn`
9. **Local vs Production** - users often confuse these; always clarify which environment

---

## Key Documentation Files
- `CONFIGURABLE_PERCENTAGE_IMPLEMENTATION.md` - Complete donation system architecture
- `QUICKSTART_DONATE.md` - Donation portal setup guide
- `CROWDFUNDING_PORTAL.md` - Feature documentation
- `DISABLED_REGISTRATION_FEATURE.md` - Accessibility feature details
- `THEMING-GUIDE.md` - UI theming system
- `SUBDOMAIN_SETUP.md` - donate.maceazy.com subdomain routing

---

## Common Pitfalls to Avoid
1. ❌ Using `npm` instead of `bun`
2. ❌ Forgetting `await connect()` in API routes
3. ❌ Not forcing Node.js runtime for JWT routes
4. ❌ Mixing admin and user authentication
5. ❌ Hardcoding foundation calculations (use `calculateBreakdown()`)
6. ❌ Exposing donation breakdowns to public users
7. ❌ Serving S3 URLs without CloudFront
8. ❌ Creating duplicate Mongoose models (always check `mongoose.models` first)
