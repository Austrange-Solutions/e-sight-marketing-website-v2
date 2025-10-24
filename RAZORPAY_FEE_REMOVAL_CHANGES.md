# Razorpay Fee Removal from Donation Calculation

## Summary
Removed Razorpay payment gateway fees from the donation breakdown calculation. The system now uses a simplified **2-tier calculation** instead of the previous 3-tier system.

**Date:** October 20, 2025  
**Scope:** Donation system only (product payments unchanged)

---

## Changes Made

### Previous System (3-tier):
```
Donation Amount (₹1000)
  ↓ Razorpay Fee (2%) → ₹20
  ↓ Platform Fee (12%) → ₹117.60
  ↓ Foundation/Company Split (65%/35%) → ₹560.56 / ₹301.84
```

### New System (2-tier):
```
Donation Amount (₹1000)
  ↓ Platform Fee (12%) → ₹120
  ↓ Foundation/Company Split (65%/35%) → ₹572 / ₹308
```

**Important:** Razorpay still charges ~2% on transactions, but this fee is now **absorbed by the platform** and not deducted from the donation amount in calculations.

---

## Files Modified

### 1. Database Models

#### `src/models/foundationSettingsModel.ts`
- ❌ Removed `razorpayFeePercent` field from interface and schema
- ✅ Updated `calculateBreakdown()` method to 2-tier calculation
- ✅ Removed Razorpay step from calculation logic

#### `src/models/Donation.ts`
- ❌ Removed `razorpayFee` field
- ❌ Removed `razorpayFeePercent` field
- ❌ Removed deprecated `netAmount` field
- ✅ Kept: `platformFee`, `foundationAmount`, `companyAmount`

### 2. API Routes

#### `src/app/api/donate/create/route.ts`
- ✅ Updated to use 2-tier calculation
- ✅ Removed Razorpay fee from breakdown
- ✅ Razorpay order amount = donation amount (no extra charge)
- ✅ Updated default settings for VSF/CF (removed razorpay fields)

#### `src/app/api/donate/verify/route.ts`
- ✅ No changes needed (only handles payment verification)

### 3. Admin UI Components

#### `src/components/admin/FoundationSettingsManagement.tsx`
- ❌ Removed "Razorpay Fee (%)" input field
- ✅ Updated example breakdown preview (removed Razorpay line)
- ✅ Updated calculation function to 2-tier
- ✅ Updated "How it works" info box text

#### `src/components/admin/DonationsManagement.tsx`
- ❌ Removed `razorpayFee` and `razorpayFeePercent` from interface
- ❌ Removed `netAmount` field (deprecated)
- ✅ Updated CSV export headers (removed Razorpay columns)
- ✅ Updated table display (removed Razorpay fee row)
- ✅ Shows only: Platform Fee, Foundation Amount, Company Amount

### 4. Documentation

#### `.github/copilot-instructions.md`
- ✅ Updated to reflect 2-tier calculation system
- ✅ Noted that Razorpay fees are absorbed by platform
- ✅ Clarified that no gateway fees are shown to users

---

## Database Migration Notes

### Existing Donations
- Old donation records may still have `razorpayFee`, `razorpayFeePercent`, and `netAmount` fields
- These fields are no longer used but kept for historical data
- New donations will NOT have these fields

### Foundation Settings
- Existing foundation settings with `razorpayFeePercent` will still work
- The field is ignored in new calculations
- Admin UI no longer allows editing this field

### Recommended (Optional) Migration
If you want to clean up the database completely:

```javascript
// Remove deprecated fields from existing donations
await Donation.updateMany(
  {},
  { 
    $unset: { 
      razorpayFee: "",
      razorpayFeePercent: "",
      netAmount: ""
    }
  }
);

// Remove razorpayFeePercent from foundation settings
await FoundationSettings.updateMany(
  {},
  { 
    $unset: { razorpayFeePercent: "" }
  }
);
```

---

## User-Facing Changes

### Donation Flow
- **Before:** User donates ₹1000 → Sees "Processing..." → Gets receipt
- **After:** User donates ₹1000 → Sees "Processing..." → Gets receipt
- **No visible change** to users

### Admin Dashboard
- **Foundation Settings:** Razorpay Fee input removed (only Platform Fee and Foundation Share visible)
- **Donations Table:** Razorpay Fee column removed from display and CSV export
- **Example Preview:** Shows 2-tier breakdown instead of 3-tier

---

## Testing Checklist

- [ ] Create new donation (VSF foundation)
- [ ] Create new donation (CF foundation)
- [ ] Verify donation record has no `razorpayFee` field
- [ ] Check admin foundation settings (no Razorpay input)
- [ ] View donations in admin panel (no Razorpay column)
- [ ] Export donations to CSV (no Razorpay columns)
- [ ] Verify breakdown calculations are correct
- [ ] Test on localhost:3000
- [ ] Deploy to production

---

## Rollback Instructions

If you need to revert these changes:

1. Restore previous versions of all modified files
2. Run database migration to restore fields (if cleaned)
3. Clear any cached connections/sessions
4. Restart the application

---

## Questions or Issues?

Refer to:
- `CONFIGURABLE_PERCENTAGE_IMPLEMENTATION.md` - Donation system architecture
- `.github/copilot-instructions.md` - AI agent instructions
- `QUICKSTART_DONATE.md` - Donation portal setup guide
