# Multi-Foundation Donation System - Quick Testing Guide

## 🚀 Getting Started

### Start Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

## 📍 Feature Locations

### 1. Donation Page (User-Facing)
**URL:** `/donate`

**New Features:**
- ✅ Foundation selection buttons (💙 General, 💚 VSF, 💜 CF)
- ✅ Real-time breakdown preview showing exact split
- ✅ Color-coded breakdown display
- ✅ Updated before payment confirmation

**Test Steps:**
1. Navigate to `/donate`
2. Select a donation amount (e.g., ₹1,499)
3. Click on different foundation buttons
4. Observe breakdown preview update automatically
5. Verify breakdown shows:
   - Razorpay Fee (red)
   - Platform Fee (orange)
   - Foundation Amount (green, highlighted)
   - Company Amount (blue)
6. Fill in donor details
7. Proceed with test payment

### 2. Admin Dashboard - Foundation Settings
**URL:** `/admin/dashboard` → Foundation Settings tab

**New Features:**
- ✅ Editable percentage inputs for each foundation
- ✅ Real-time ₹1,000 example preview
- ✅ Auto-save on blur
- ✅ Visual foundation cards with icons
- ✅ Company share auto-calculation

**Test Steps:**
1. Login to admin panel
2. Navigate to "Foundation Settings" tab
3. Edit VSF Platform Fee to 15%
4. Click outside input (triggers auto-save)
5. Observe success message
6. Check ₹1,000 example updates automatically
7. Verify Company Share adjusts automatically
8. Return to donation page and verify new percentages apply

### 3. Admin Dashboard - Donations Management
**URL:** `/admin/dashboard` → Donations tab

**New Features:**
- ✅ Enhanced Amount column with complete breakdown
- ✅ Shows all fee splits per donation
- ✅ Foundation icons and color coding
- ✅ Updated CSV export with all split columns

**Test Steps:**
1. Navigate to "Donations" tab
2. View Amount column for each donation
3. Verify breakdown shows:
   - Total amount (bold)
   - Razorpay fee with percentage
   - Platform fee with percentage
   - Foundation amount with percentage (green)
   - Company amount with percentage (blue)
4. Click "Export CSV"
5. Open CSV and verify columns:
   - Razorpay Fee %
   - Razorpay Fee
   - Platform Fee %
   - Platform Fee
   - Foundation Share %
   - Foundation Amount
   - Company Share %
   - Company Amount

## 🧪 Test Scenarios

### Scenario 1: Default Percentage Verification
**Objective:** Verify default percentages work correctly

1. Start fresh (no custom settings)
2. Go to Foundation Settings
3. Verify defaults:
   - General: Platform 10%, Foundation 70%
   - VSF: Platform 12%, Foundation 65%
   - CF: Platform 8%, Foundation 75%
4. Create donation for each foundation
5. Verify calculations match expected values

**Expected Results (₹1,499 donation to VSF):**
```
Amount: ₹1,499.00
Razorpay Fee (2%): ₹29.98
Platform Fee (12%): ₹176.28
Foundation Amount (65%): ₹840.28
Company Amount (23%): ₹452.46
```

### Scenario 2: Custom Percentage Update
**Objective:** Test editing percentages and immediate effect

1. Go to Foundation Settings
2. Change VSF Platform Fee from 12% to 15%
3. Change VSF Foundation Share from 65% to 60%
4. Verify auto-save works
5. Go to donation page
6. Select VSF foundation
7. Enter ₹1,000
8. Verify new breakdown applies

**Expected Results (₹1,000 to VSF with 15%/60%):**
```
Razorpay Fee: ₹20.00
Platform Fee: ₹147.00
Foundation Amount: ₹499.80
Company Amount: ₹333.20
```

### Scenario 3: Multi-Foundation Comparison
**Objective:** Compare different foundation splits

1. Go to donation page
2. Enter ₹5,000
3. Select General → Note breakdown
4. Select VSF → Note breakdown  
5. Select CF → Note breakdown
6. Verify each shows different percentages
7. Verify all calculations are correct

### Scenario 4: CSV Export Validation
**Objective:** Ensure CSV has all new fields

1. Create 2-3 test donations for different foundations
2. Go to Donations tab
3. Export CSV
4. Open in Excel/Sheets
5. Verify columns exist:
   - All basic fields (Name, Email, Amount, etc.)
   - Razorpay Fee % and Amount
   - Platform Fee % and Amount
   - Foundation Share % and Amount
   - Company Share % and Amount
6. Verify values match what's shown in UI

### Scenario 5: Edge Case Testing
**Objective:** Test boundary conditions

Test with amounts:
- ₹1 (minimum)
- ₹10
- ₹1,499 (1 E-Kaathi Pro)
- ₹9,999
- ₹50,000
- ₹100,000 (large donation)

Test with percentages:
- 0% platform fee
- 0% foundation share
- 100% foundation share
- Decimal percentages (12.5%, 33.33%)

## 🔍 Verification Checklist

### Foundation Settings Page
- [ ] Three foundation cards display correctly
- [ ] Icons show (💙💚💜)
- [ ] Percentage inputs accept numbers
- [ ] Percentage validation (0-100)
- [ ] Company share auto-calculates
- [ ] ₹1,000 example updates in real-time
- [ ] Auto-save works on blur
- [ ] Success/error messages display
- [ ] Refresh button works
- [ ] Mobile responsive

### Donation Page
- [ ] Foundation selection buttons render
- [ ] Clicking changes selected foundation
- [ ] Selected foundation highlights (ring + background)
- [ ] Breakdown preview appears below selection
- [ ] Breakdown updates when foundation changes
- [ ] Breakdown updates when amount changes
- [ ] Color coding correct (red/orange/green/blue)
- [ ] Foundation icon matches selection
- [ ] Amount formatting correct (₹ symbol, commas)
- [ ] Note text shows correct foundation amount

### Donations Management
- [ ] Amount column shows multi-line breakdown
- [ ] All fees display with percentages
- [ ] Colors match (red/orange/green/blue)
- [ ] Foundation icons show
- [ ] Foundation summary table accurate
- [ ] CSV export includes all columns
- [ ] CSV values match UI display
- [ ] Pagination works
- [ ] Filters work correctly

## 🐛 Common Issues & Solutions

### Issue: Breakdown doesn't show
**Solution:** Ensure amount > 0 and foundation settings exist in database

### Issue: Auto-save not working
**Solution:** Check browser console for API errors, verify MongoDB connection

### Issue: Percentages reset to default
**Solution:** Settings might not be saving. Check `/api/admin/foundation-settings` endpoint

### Issue: CSV missing columns
**Solution:** Old donations may not have new fields. Expected for pre-update donations

### Issue: Calculations don't add up exactly
**Solution:** Normal due to rounding. Variance should be < ₹1

## 📊 Sample Test Data

### Test Donation 1
```
Name: John Doe
Email: john@example.com
Phone: 9876543210
Amount: ₹1,499
Foundation: VSF
Anonymous: No
```

### Test Donation 2
```
Name: Jane Smith
Email: jane@example.com
Phone: 9876543211
Amount: ₹5,000
Foundation: General
Anonymous: Yes
```

### Test Donation 3
```
Name: Test User
Email: test@example.com
Phone: 9876543212
Amount: ₹999
Foundation: CF
Anonymous: No
```

## 🔐 Admin Access

If you need to create an admin account:
```bash
# MongoDB shell or Compass
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { isAdmin: true } }
)
```

Or use your existing admin credentials to access `/admin/dashboard`

## 📈 Expected Behavior Summary

### Razorpay Fee (2%)
- **Always:** 2% of total amount
- **Deducted:** First, from total

### Platform Fee
- **Percentage:** Foundation-specific (editable)
- **Calculated on:** Amount after Razorpay fee
- **Default:** General 10%, VSF 12%, CF 8%

### Foundation Share
- **Percentage:** Foundation-specific (editable)
- **Calculated on:** Amount after both Razorpay and Platform fees
- **Default:** General 70%, VSF 65%, CF 75%
- **This is what foundation receives**

### Company Share
- **Percentage:** Auto-calculated (100% - Foundation Share %)
- **Calculated on:** Remainder after Foundation share
- **Default:** General 30%, VSF 35%, CF 25%

## 🎯 Success Criteria

All features working correctly if:
1. ✅ Foundation Settings page loads with 3 cards
2. ✅ Percentages can be edited and save automatically
3. ✅ Example breakdown updates in real-time
4. ✅ Donation page shows foundation selection
5. ✅ Breakdown preview displays and updates correctly
6. ✅ Payment can be created (even if test mode)
7. ✅ Admin donations table shows complete breakdown
8. ✅ CSV export contains all new columns
9. ✅ Calculations are mathematically correct
10. ✅ Mobile responsive on all pages

## 📞 Need Help?

Check these files for implementation details:
- Model: `src/models/foundationSettingsModel.ts`
- API: `src/app/api/admin/foundation-settings/route.ts`
- UI: `src/components/admin/FoundationSettingsManagement.tsx`
- Preview: `src/components/donate/DonationBreakdownPreview.tsx`
- Full Guide: `CONFIGURABLE_PERCENTAGE_IMPLEMENTATION.md`

Happy Testing! 🚀
