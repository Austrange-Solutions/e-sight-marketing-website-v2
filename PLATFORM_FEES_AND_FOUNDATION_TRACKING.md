# Enhanced Donation System with Platform Fees & Foundation Tracking

## Implementation Summary - Phase 2

### ✅ All Requirements Implemented

## 1. Platform Fees (2% Razorpay Fee)

### Database Changes
**File:** `src/models/Donation.ts`
- Added `platformFee` field (Number) - Automatically calculated as 2% of donation amount
- Added `netAmount` field (Number) - Amount after deducting platform fee
- Calculation: 
  - Platform Fee = Amount × 0.02
  - Net Amount = Amount - Platform Fee

### API Changes
**File:** `src/app/api/donate/create/route.ts`
- Automatically calculates and stores platform fees on every donation
- Example for ₹1,499 donation:
  - Total: ₹1,499
  - Platform Fee (2%): ₹29.98
  - Net to Foundation: ₹1,469.02

**File:** `src/app/api/admin/donations/route.ts`
- Enhanced aggregation to calculate:
  - Total platform fees collected
  - Total net amounts per foundation
  - Platform fees breakdown by foundation

---

## 2. Anonymous Donors - Admin View

### Feature: Show Real Name with Anonymous Tag
**In Admin Panel:** Shows actual donor name + 🔒 Anonymous badge
- Example: "Sahil Mane 🔒 Anonymous"

**In Public Leaderboard:** Still shows only "Anonymous"

### Implementation Details
- Admin can see who made anonymous donations
- Name is never hidden from admin for tracking purposes
- 🔒 tag clearly indicates the donation is marked as anonymous

---

## 3. Foundation Display with Icons

### Foundation Icons & Colors
- **General** (💙): Blue theme - Standard MACEAZY donations
- **VSF** (💚): Green theme - Vishnu Shakti Foundation
- **CF** (💜): Purple theme - Chetana Foundation

### Display Locations
1. **Stats Cards**: Total collections per foundation
2. **Summary Table**: Comprehensive foundation breakdown
3. **Donations Table**: Each row shows foundation icon + badge
4. **Filters**: Select by foundation

---

## 4. Enhanced Admin Dashboard

### Top Statistics (5 Cards)
1. **Total Donations**: Count of all donations
2. **Total Revenue**: Total amount collected
3. **Platform Fees (2%)**: Total fees charged (orange theme)
4. **Net to Foundations**: Total net amount after fees (green theme)
5. **Pending**: Count of pending donations

### Foundation Summary Table
Comprehensive breakdown showing:

| Foundation | Donations | Total Collected | Platform Fee (2%) | Net Amount |
|-----------|-----------|----------------|-------------------|------------|
| 💙 General | 5 | ₹7,495 | ₹149.90 | ₹7,345.10 |
| 💚 VSF | 10 | ₹14,990 | ₹299.80 | ₹14,690.20 |
| 💜 CF | 7 | ₹10,493 | ₹209.86 | ₹10,283.14 |
| **Total** | **22** | **₹32,978** | **₹659.56** | **₹32,318.44** |

### Donations Table Columns
1. **Date**: When donation was made
2. **Donor**: Name + 🔒 Anonymous tag if applicable
3. **Contact**: Email & Phone
4. **Amount**: 
   - Total amount
   - Platform fee (2%) in orange
   - Net amount in green
5. **Foundation**: Icon + Badge (e.g., 💚 VSF)
6. **Status**: Completed/Pending/Failed
7. **Payment ID**: Razorpay payment reference

---

## 5. Enhanced CSV Export

### New CSV Columns
- Donor Name (actual name)
- Anonymous (Yes/No indicator)
- Email
- Phone
- Total Amount
- Platform Fee (2%)
- Net Amount
- Sticks Equivalent
- Foundation
- Status
- Payment ID
- Order ID

---

## 6. Amount Bifurcation Details

### Per Donation Breakdown
Every donation now shows three values:
1. **Total Donation**: Original amount paid by donor
2. **Platform Fee**: 2% Razorpay charge
3. **Net to Foundation**: Amount received by foundation

### Example Calculation
```
Donation: ₹1,499
├── Platform Fee (2%): ₹29.98
└── Net to Foundation: ₹1,469.02
```

---

## Visual Summary

### Admin Panel Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Stats Cards (5 columns)                                        │
│  [Total: 22] [Revenue: ₹48,435] [Fees: ₹968] [Net: ₹47,467] [Pending: 12]│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Foundation Summary Table                                       │
│  ┌────────────┬──────────┬─────────┬─────────┬──────────┐      │
│  │ Foundation │ Count    │ Collected│ Fee (2%)│ Net Amt  │      │
│  ├────────────┼──────────┼─────────┼─────────┼──────────┤      │
│  │ 💙 General │    5     │  ₹7,495 │ ₹149.90 │ ₹7,345   │      │
│  │ 💚 VSF     │   10     │ ₹14,990 │ ₹299.80 │ ₹14,690  │      │
│  │ 💜 CF      │    7     │ ₹10,493 │ ₹209.86 │ ₹10,283  │      │
│  └────────────┴──────────┴─────────┴─────────┴──────────┘      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Filters: [Search] [Status Filter] [Foundation Filter] [Export]│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Donations Table                                                │
│  Date | Donor (🔒) | Contact | Amount (₹+Fee+Net) | Foundation│
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### ✅ Implemented Features

1. **Platform Fee Calculation**: Automatic 2% fee on all donations
2. **Anonymous Donor Tracking**: Real name visible to admin with 🔒 tag
3. **Foundation Icons**: Visual indicators (💙💚💜)
4. **Comprehensive Stats**: Total, fees, net amounts
5. **Foundation Summary**: Complete breakdown table
6. **Amount Bifurcation**: Total → Fee → Net displayed everywhere
7. **Enhanced CSV Export**: Includes all fee and net amount data
8. **Color-coded Display**: Different colors for each foundation

### 💰 Financial Transparency

Every donation shows:
- **User pays**: ₹1,499 (total amount)
- **Platform keeps**: ₹29.98 (2% fee)
- **Foundation gets**: ₹1,469.02 (net amount)

All amounts are tracked separately in database for accurate reporting.

---

## Database Schema Update

```typescript
interface IDonation {
  donorName: string;
  email: string;
  phone: string;
  amount: number;              // Total donation
  platformFee: number;         // 2% Razorpay fee (NEW)
  netAmount: number;           // Amount after fee (NEW)
  sticksEquivalent: number;
  foundation: "general" | "vsf" | "cf";
  isAnonymous: boolean;
  status: "pending" | "completed" | "failed";
  // ... other fields
}
```

---

## Testing Checklist

- [ ] Make donation and verify platform fee calculation
- [ ] Check anonymous donation shows name in admin with 🔒 tag
- [ ] Verify foundation icons display correctly
- [ ] Test foundation summary table calculations
- [ ] Export CSV and check new columns
- [ ] Verify all amounts (total, fee, net) display correctly
- [ ] Check foundation filter works
- [ ] Confirm stats cards show correct totals

---

## Files Modified

1. `src/models/Donation.ts` - Added platformFee & netAmount fields
2. `src/app/api/donate/create/route.ts` - Calculate fees on creation
3. `src/app/api/admin/donations/route.ts` - Aggregate fee data
4. `src/components/admin/DonationsManagement.tsx` - Complete UI overhaul

---

## Notes

- **Platform Fee**: Fixed at 2% (Razorpay standard)
- **Rounding**: All amounts rounded to 2 decimal places
- **Anonymous Handling**: Name always stored, flag controls public display
- **Foundation Tracking**: Every donation tagged to one foundation
- **Transparency**: All fee calculations visible to admin

---

## Future Enhancements (Optional)

- Add date range filters for foundation reports
- Generate foundation-specific receipts
- Email reports to foundation contacts
- Track trending foundations over time
- Add donation goals per foundation
