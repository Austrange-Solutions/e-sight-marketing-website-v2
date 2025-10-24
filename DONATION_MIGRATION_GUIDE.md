# Donation Migration Guide

## Issue Fixed
The error occurred because existing donations in your database don't have the new fields:
- `foundation` (general/vsf/cf)
- `platformFee` (2% of amount)
- `netAmount` (amount - platformFee)

## Solution Applied

### 1. Code Fixed ✅
Updated `DonationsManagement.tsx` to handle missing foundation field:
- Uses fallback: `donation.foundation || "general"`
- Safe navigation prevents crashes

### 2. Migration Options

You have **TWO ways** to migrate existing donations:

---

## Option A: Using Admin API (Recommended - Easiest)

### Step 1: Open your browser console
1. Go to admin panel: `http://localhost:3000/admin/dashboard`
2. Open browser console (F12)

### Step 2: Run this command:
```javascript
fetch('/api/admin/donations/migrate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => console.log('Migration result:', data))
.catch(err => console.error('Migration error:', err));
```

### Step 3: Check result
You should see:
```json
{
  "success": true,
  "message": "Migration complete: 22 donations updated, 0 errors",
  "updated": 22,
  "errors": 0
}
```

---

## Option B: Using Node Script

### Step 1: Run migration script
```bash
node scripts/migrate-donations.js
```

### Step 2: Check output
```
Starting donation migration...
Connected to database
Found 22 donations to update
Progress: 10/22 donations updated
Progress: 20/22 donations updated

=== Migration Complete ===
Successfully updated: 22 donations
Errors: 0
=========================

Foundation Summary:

general:
  Donations: 22
  Total: ₹48,435.00
  Fees: ₹968.70
  Net: ₹47,466.30
```

---

## What Gets Updated

For each existing donation:
1. **foundation**: Set to "general" (default)
2. **platformFee**: Calculated as 2% of amount
3. **netAmount**: Calculated as amount - platformFee

### Example:
```
Existing Donation:
{
  amount: 1499,
  foundation: undefined,
  platformFee: undefined,
  netAmount: undefined
}

After Migration:
{
  amount: 1499,
  foundation: "general",      // ✅ Added
  platformFee: 29.98,         // ✅ Calculated
  netAmount: 1469.02          // ✅ Calculated
}
```

---

## Verification

After migration, refresh the admin panel and verify:
- ✅ No more errors in console
- ✅ All donations show foundation (💙 GENERAL by default)
- ✅ Platform fees displayed correctly
- ✅ Net amounts calculated properly
- ✅ Foundation summary table shows data

---

## Notes

1. **Safe to run multiple times**: The migration script only updates donations that are missing the fields
2. **Default foundation**: All existing donations will be marked as "general"
3. **No data loss**: Only adds missing fields, doesn't modify existing data
4. **Idempotent**: Running multiple times won't create duplicates

---

## If You Want to Change Foundation for Specific Donations

After migration, if you want to assign specific donations to VSF or CF, you can manually update them in MongoDB:

```javascript
// Example: Update specific donation to VSF
db.donations.updateOne(
  { _id: ObjectId("your-donation-id") },
  { $set: { foundation: "vsf" } }
);
```

---

## Troubleshooting

### Error: "Cannot read properties of undefined"
**Solution**: Run the migration using Option A (Admin API) above

### Error: "Connection refused"
**Solution**: Make sure your MongoDB is running

### No donations found to migrate
**Solution**: Your database might already be migrated, or you have no existing donations

---

## Future Donations

All **new donations** made after the code update will automatically have:
- Foundation field (based on which button user clicks)
- Platform fee (auto-calculated)
- Net amount (auto-calculated)

No manual intervention needed! ✅
