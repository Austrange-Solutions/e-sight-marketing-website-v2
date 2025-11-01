# Maceazy Pro Crowdfunding Portal

## Overview

The Maceazy Pro Crowdfunding Portal is a comprehensive donation platform built to enable supporters to contribute towards providing smart canes to visually impaired individuals. The portal is designed to run on the `donate` subdomain with a seamless, no-login-required donation flow.

## Live URL
- **Main Site**: `https://maceazy.com`
- **Donation Portal**: `https://donate.maceazy.com` (or `/donate` route)

## Reference Site
Inspired by: [https://donate.sightsaversindia.org/](https://donate.sightsaversindia.org/)

---

## Features

### 1. **Donation Flow**
- ✅ No authentication required - guest donations
- ✅ Preset donation amounts (1x, 2x, 4x, 8x Maceazy Pro at ₹1499 each)
- ✅ Custom donation amount with real-time impact calculator
- ✅ Secure Razorpay payment integration
- ✅ Email and SMS notifications (via Razorpay)
- ✅ Donation success page with confetti animation
- ✅ Anonymous donation option

### 2. **Real-Time Impact Calculator**
Shows donors exactly what their contribution provides:
- **₹1-750**: "Contributing towards Maceazy Pro"
- **₹751-1498**: "Donating 0.5 Maceazy Pro"
- **₹1499**: "Donating 1 Maceazy Pro"
- **₹3000**: "Donating 2 Maceazy Pro"
- **Custom amounts**: Calculated dynamically (amount ÷ 1499)

### 3. **Leaderboard**
- ✅ Real-time top donors display
- ✅ Shows donor name, amount, and sticks donated
- ✅ Respects anonymous donations
- ✅ Rank badges (🏆 Gold, 🥈 Silver, 🥉 Bronze)
- ✅ Animated cards with gradient backgrounds

### 4. **Design & Theme**
- ✅ MACEAZY brand colors (Primary: #1B9BD8, Secondary: #0C5277)
- ✅ Light mode only (dark mode removed as per user request)
- ✅ Responsive design for mobile, tablet, and desktop
- ✅ Framer Motion animations throughout
- ✅ Uses shadcn/ui components

---

## Technical Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4 (OKLCH color system)
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui, Magic UI, Aceternity UI
- **Confetti**: canvas-confetti

### Backend
- **Database**: MongoDB with Mongoose ODM
- **Payment Gateway**: Razorpay
- **Authentication**: NextAuth (not used for donations)
- **API Routes**: Next.js API Routes

### Payment Flow
1. User fills donation form
2. Create Razorpay order → `/api/donate/create`
3. Open Razorpay checkout modal
4. User completes payment
5. Verify signature → `/api/donate/verify`
6. Redirect to success page → `/donate/success`

---

## Project Structure

```
src/
├── app/
│   ├── donate/
│   │   ├── page.tsx                 # Main donation page
│   │   └── success/
│   │       └── page.tsx             # Success/Thank you page
│   └── api/
│       └── donate/
│           ├── create/
│           │   └── route.ts         # Create Razorpay order & pending donation
│           ├── verify/
│           │   └── route.ts         # Verify payment & update status
│           ├── leaderboard/
│           │   └── route.ts         # Fetch top 10 donors
│           └── details/
│               └── route.ts         # Fetch donation by payment/order ID
├── components/
│   └── donate/
│       ├── DonateButton.tsx         # Razorpay payment button
│       └── Leaderboard.tsx          # Top donors display
└── models/
    └── Donation.ts                  # Mongoose donation schema
```

---

## Database Schema

### Donation Model (`src/models/Donation.ts`)

```typescript
{
  donorName: String,           // Required, 2-100 chars
  email: String,               // Required, validated
  phone: String,               // Required, 10 digits
  amount: Number,              // Required, min ₹1, max ₹10,00,000
  sticksEquivalent: Number,    // Auto-calculated: amount ÷ 1499
  paymentId: String,           // Razorpay payment ID
  orderId: String,             // Razorpay order ID
  signature: String,           // Razorpay signature (for verification)
  status: String,              // 'pending' | 'completed' | 'failed'
  message: String,             // Optional donor message (max 500 chars)
  isAnonymous: Boolean,        // Hide from leaderboard
  createdAt: Date,             // Auto timestamp
  updatedAt: Date              // Auto timestamp
}
```

**Indexes:**
- `{ status: 1, createdAt: -1 }` - For filtering completed donations
- `{ email: 1 }` - For donor lookup
- `{ orderId: 1 }` - For payment verification
- `{ amount: -1 }` - For leaderboard queries

**Virtuals:**
- `formattedSticks` - Human-readable stick count
- `formattedAmount` - Formatted currency (₹X,XXX)

---

## API Endpoints

### 1. **POST /api/donate/create**
Creates a Razorpay order and pending donation record.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "amount": 1499,
  "message": "Happy to help!",
  "isAnonymous": false
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_xxx",
  "amount": 149900,
  "currency": "INR",
  "key": "rzp_test_xxx",
  "donationId": "donation_doc_id"
}
```

---

### 2. **POST /api/donate/verify**
Verifies Razorpay payment signature and updates donation status.

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "donationId": "donation_doc_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "donation": {
    "id": "xxx",
    "amount": 1499,
    "sticksEquivalent": 1,
    "donorName": "John Doe",
    "email": "john@example.com",
    "paymentId": "pay_xxx",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 3. **GET /api/donate/leaderboard**
Fetches top 10 non-anonymous donors.

**Response:**
```json
{
  "success": true,
  "donors": [
    {
      "_id": "xxx",
      "donorName": "John Doe",
      "amount": 11992,
      "sticksEquivalent": 8,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 4. **GET /api/donate/details?payment_id=xxx&order_id=xxx**
Fetches donation details for success page.

**Response:**
```json
{
  "success": true,
  "donation": {
    "_id": "xxx",
    "donorName": "John Doe",
    "email": "john@example.com",
    "amount": 1499,
    "sticksEquivalent": 1,
    "paymentId": "pay_xxx",
    "orderId": "order_xxx",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Environment Variables

Add these to your `.env.local`:

```bash
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your_secret_key

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

---

## Component Details

### DonateButton Component
**Location**: `src/components/donate/DonateButton.tsx`

**Props:**
- `amount` (number) - Donation amount in INR
- `sticksEquivalent` (number) - Calculated stick count
- `donorDetails` (object) - Name, email, phone, message, isAnonymous
- `className` (string) - Optional styling classes
- `disabled` (boolean) - Disable button
- `onError` (function) - Error callback

**Features:**
- Loads Razorpay SDK dynamically
- Creates order via API
- Opens Razorpay modal
- Handles payment verification
- Redirects to success page
- Error handling with user feedback

---

### Leaderboard Component
**Location**: `src/components/donate/Leaderboard.tsx`

**Features:**
- Fetches top 10 donors on mount
- Real-time updates (can add polling)
- Animated rank badges (🏆🥈🥉)
- Gradient backgrounds for top 3
- Loading skeleton states
- Empty state message

---

## Donation Page Sections

### 1. **Hero Section**
- Eye-catching headline
- Impact statistics (500+ people helped, ₹7.5L+ raised)
- Trust badges

### 2. **Donation Form**
- **Preset Buttons**: 1x, 2x, 4x, 8x Maceazy Pro
- **Custom Amount Input**: With rupee symbol
- **Real-Time Impact Display**: Shows stick equivalent
- **Donor Details Form**: Name, email, phone, optional message
- **Anonymous Checkbox**: Hide from leaderboard
- **DonateButton**: Integrated Razorpay payment

### 3. **Leaderboard Sidebar**
- Top donors with ranks
- Amounts and stick counts
- Timestamps

### 4. **Why Maceazy Pro Section**
- Feature cards (obstacle detection, battery life, lightweight, affordable)
- MACEAZY brand messaging

---

## Success Page Features

### 1. **Celebration Animation**
- Confetti burst on page load
- Success checkmark animation

### 2. **Donation Summary**
- Thank you message
- Donation amount and impact
- Donor details
- Payment ID
- Timestamp

### 3. **Action Buttons**
- Share on social media (Web Share API)
- Download receipt (placeholder - to be implemented)
- Donate again
- Visit shop

### 4. **Next Steps Timeline**
1. Processing donation
2. Manufacturing Maceazy Pro
3. Distribution to beneficiaries

---

## Razorpay Integration

### Payment Flow Diagram
```
User fills form
      ↓
DonateButton clicked
      ↓
POST /api/donate/create
      ↓
Razorpay order created
      ↓
Razorpay modal opens
      ↓
User completes payment
      ↓
POST /api/donate/verify
      ↓
Signature verified
      ↓
Donation status → 'completed'
      ↓
Redirect to /donate/success
      ↓
Confetti + Thank you page
```

### Security
- ✅ Signature verification using HMAC SHA256
- ✅ Server-side validation
- ✅ Environment variables for keys
- ✅ Status checks before processing

---

## Validation Rules

### Donor Name
- Required
- Min 2 characters
- Max 100 characters

### Email
- Required
- Valid email format
- Stored in lowercase

### Phone
- Required
- Exactly 10 digits
- No special characters

### Amount
- Required
- Minimum ₹1
- Maximum ₹10,00,000 (10 lakhs)

### Message
- Optional
- Max 500 characters

---

## Installation & Setup

### 1. Install Dependencies
```bash
bun install
# or
npm install
```

### 2. Install Additional Packages
```bash
bun add razorpay canvas-confetti
bun add -d @types/canvas-confetti
```

### 3. Configure Environment Variables
Copy `.env.sample` to `.env.local` and fill in:
- Razorpay keys (test or production)
- MongoDB URI
- NextAuth configuration

### 4. Run Development Server
```bash
bun dev
```

### 5. Access Donation Portal
Open [http://localhost:3000/donate](http://localhost:3000/donate)

---

## Testing

### Test Razorpay Integration
Use Razorpay test cards:
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test Scenarios
1. ✅ Donate with preset amount (1x ₹1499)
2. ✅ Donate with custom amount (₹2500)
3. ✅ Cancel payment (should show error)
4. ✅ Anonymous donation (shouldn't appear on leaderboard)
5. ✅ Form validation (empty fields)
6. ✅ Success page loads correctly
7. ✅ Leaderboard updates after donation

---

## Deployment Checklist

### Before Going Live:
- [ ] Update Razorpay keys to production
- [ ] Set up proper MongoDB indexes
- [ ] Configure CORS if using subdomain
- [ ] Test payment flow end-to-end
- [ ] Set up email notifications (Razorpay webhook)
- [ ] Add analytics tracking
- [ ] Implement receipt PDF generation
- [ ] Set up monitoring/logging
- [ ] Configure CDN for assets
- [ ] Test on mobile devices

### DNS Configuration for Subdomain:
```
Type: CNAME
Name: donate
Value: your-main-domain.vercel.app
```

Or if using Vercel:
- Add `donate.maceazy.com` in project settings
- Vercel will auto-configure DNS

---

## Future Enhancements

### Phase 2 Features:
- [ ] Email receipts with PDF attachment
- [ ] SMS confirmations
- [ ] Recurring donations (monthly/yearly)
- [ ] Corporate matching donations
- [ ] Fundraising campaigns with progress bars
- [ ] Donor wall with testimonials
- [ ] Social media sharing with OG tags
- [ ] WhatsApp share integration
- [ ] Donation certificates
- [ ] Impact stories section
- [ ] Photo gallery of beneficiaries
- [ ] Volunteer signup integration

### Analytics:
- [ ] Track donation conversion rate
- [ ] Most popular donation amounts
- [ ] Donor demographics
- [ ] Payment method preferences
- [ ] Abandonment rate
- [ ] Average donation size

---

## Troubleshooting

### Issue: Payment not processing
**Solution**: Check Razorpay keys in environment variables, ensure HTTPS in production

### Issue: Leaderboard not updating
**Solution**: Check MongoDB connection, verify donation status is 'completed'

### Issue: Success page shows error
**Solution**: Verify payment verification endpoint is working, check signature calculation

### Issue: Confetti not showing
**Solution**: Ensure `canvas-confetti` is installed, check browser console for errors

---

## Support & Contact

For issues or questions regarding the donation portal:
- **Email**: support@maceazy.com
- **Website**: https://maceazy.com
- **GitHub**: [Repository URL]

---

## Credits

**Developed by**: MACEAZY Team  
**Payment Gateway**: Razorpay  
**Framework**: Next.js  
**UI Components**: shadcn/ui, Magic UI, Aceternity UI  
**Inspiration**: Sightsavers India Donation Portal  

---

## License

© 2024 MACEAZY. All rights reserved.

---

## Changelog

### Version 1.0.0 (Initial Release)
- ✅ Complete donation flow with Razorpay
- ✅ Real-time impact calculator
- ✅ Top donors leaderboard
- ✅ Success page with confetti
- ✅ Anonymous donation option
- ✅ MACEAZY brand theme
- ✅ Mobile responsive design
- ✅ Form validation
- ✅ MongoDB integration

