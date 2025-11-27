# CSR Donation Pool System - Implementation Guide

## 🎉 Implementation Complete!

The CSR (Corporate Social Responsibility) Donation Pool system has been successfully implemented with full functionality for managing corporate donations alongside individual donations.

---

## 📋 Features Implemented

### 1. **Database Model** (`src/models/CSRDonation.ts`)
- ✅ Company name, donation amount, number of people
- ✅ Foundation reference (links to existing foundations)
- ✅ Auto-calculated fee breakdown (Platform Fee, Foundation Share, Company Share)
- ✅ Donation date (default today, editable)
- ✅ Status tracking (pending, verified, received, certificate_issued, rejected)
- ✅ Notes field for additional information
- ✅ Full audit trail (createdBy, lastEditedBy, auditLog with field-level change tracking)

### 2. **API Routes**

#### CSR Donations Management
- **GET `/api/admin/csr-donations`** - List all CSR donations with filtering
  - Query params: `status`, `foundation`, `startDate`, `endDate`
  - Returns: Array of CSR donations with populated foundation/user references

- **POST `/api/admin/csr-donations`** - Create new CSR donation
  - Required: `companyName`, `amount`, `numberOfPeople`, `foundation`
  - Optional: `date`, `notes`, fee breakdown (auto-calculated if not provided)
  - Auto-calculates breakdown using foundation's percentage settings

- **PATCH `/api/admin/csr-donations/[id]`** - Update CSR donation
  - All fields editable (inline editing support)
  - Field-level change tracking in audit log
  - Admin user recorded for every edit

- **DELETE `/api/admin/csr-donations/[id]`** - Delete CSR donation
  - Requires admin confirmation

#### Donation Pool Analytics
- **GET `/api/admin/donation-pool`** - Aggregated statistics
  - Combines online donations + CSR donations
  - Foundation-wise breakdown with company details
  - Date filtering (today, week, month, year, custom range)
  - Returns:
    - Total pool amount
    - Individual donors vs CSR breakdown
    - Per-foundation statistics with company lists

- **GET `/api/admin/donation-pool/export`** - Excel export
  - Exports all donation data to `.xlsx` file
  - Includes: Date, Type, Donor/Company, Foundation, Amount, Breakdown, Status
  - Filename: `donation-pool-export-YYYY-MM-DD.xlsx`

### 3. **Admin Components**

#### CSR Donations Manager (`src/components/admin/CSRDonationsManager.tsx`)
**Features:**
- ✅ **Add CSR Donation Form** - Toggle form with "Add CSR Donation" button
  - Company name, Foundation selection, Amount, Number of people
  - Date (default today, editable)
  - Notes field
  - Auto-calculation of fee breakdown

- ✅ **Inline Editable Table** - Edit all fields directly in table
  - Company name, Foundation, Amount, People count
  - Platform Fee, Foundation Share, Company Share (all editable)
  - Date, Status, Notes

- ✅ **Filtering**
  - Date ranges: All Time, Today, This Week, This Month, Last Month, This Year, Custom Range
  - Status filter: All, Pending, Verified, Received, Certificate Issued, Rejected

- ✅ **Actions**
  - Edit inline (pencil icon)
  - View audit log (expandable with chevron icon)
  - Delete with confirmation

- ✅ **Audit Log Display**
  - Shows who edited, when, and what changed
  - Field-level change tracking (old value → new value)
  - Purple-highlighted expandable section per donation

#### Donation Pool Dashboard (`src/components/admin/DonationPoolDashboard.tsx`)
**Features:**
- ✅ **Total Pool Summary**
  - Combined total (Individual Donors + CSR)
  - Percentage breakdown
  - Donor/company counts

- ✅ **Foundation-Wise Breakdown**
  - Total amount per foundation
  - Online donors: Amount + count
  - CSR: Amount + company count + people count

- ✅ **Expandable Company Details**
  - Click "Show Details" to see company list
  - Per-company: Name, Amount, People, Date, Status

- ✅ **Fee Breakdown**
  - Foundation Share
  - Company Share
  - Platform Fee

- ✅ **Excel Export**
  - "Export Excel" button at top
  - Downloads filtered data based on current date range

- ✅ **Date Filtering**
  - Same options as CSR Manager
  - Synced with export function

### 4. **Admin Dashboard Integration**

Modified `src/app/admin/dashboard/page.tsx`:
- ✅ Added **3 sub-tabs under Donations**:
  1. **Donation Pool** (default) - Combined dashboard
  2. **Online Donations** - Existing online donation management
  3. **CSR Donations** - CSR manual entry and management

---

## 🚀 How to Use

### For Admins

#### Adding a CSR Donation
1. Go to Admin Dashboard → **Donations** tab
2. Click **CSR Donations** sub-tab
3. Click **"Add CSR Donation"** button
4. Fill form:
   - Company Name (required)
   - Foundation (dropdown of active foundations)
   - Amount in ₹ (required)
   - Number of People (default 1)
   - Date (default today)
   - Notes (optional)
5. Click **"Add CSR Donation"**
6. System auto-calculates Platform Fee, Foundation Share, Company Share

#### Editing a CSR Donation
1. Find the donation in the table
2. Click **pencil icon** (Edit)
3. Fields become editable inline
4. Modify any field:
   - Company name, Foundation, Amount, People
   - **Fee breakdown is also editable** (Platform Fee, Foundation Share, Company Share)
   - Date, Status, Notes
5. Click **save icon** (checkmark)
6. Changes are recorded in audit log

#### Viewing Audit Log
1. Click **chevron icon** next to edit button
2. Expandable section shows:
   - Who edited (admin username)
   - When edited (date/time)
   - What changed (field: old value → new value)

#### Viewing Donation Pool
1. Go to **Donation Pool** sub-tab
2. Select date range from dropdown
3. View:
   - Total pool amount
   - Individual vs CSR breakdown
   - Foundation-wise statistics
4. **Expand foundation CSR details**:
   - Click "Show Details" under CSR section
   - See list of companies with amounts and people count

#### Exporting to Excel
1. In **Donation Pool** tab
2. Select desired date range
3. Click **"Export Excel"** button
4. File downloads: `donation-pool-export-2024-11-01.xlsx`
5. Contains all online + CSR donations in selected range

---

## 📊 Data Flow

### CSR Donation Creation
```
1. Admin fills form → POST /api/admin/csr-donations
2. Server validates data
3. Looks up foundation by code or ObjectId
4. Auto-calculates fee breakdown:
   - Platform Fee = Amount × (Foundation's Platform Fee %)
   - After Platform Fee = Amount - Platform Fee
   - Foundation Share = After Platform Fee × (Foundation's Share %)
   - Company Share = After Platform Fee - Foundation Share
5. Saves to database with audit log entry
6. Returns created donation with populated references
```

### Inline Edit with Audit Tracking
```
1. Admin edits field → PATCH /api/admin/csr-donations/[id]
2. Server compares old vs new values
3. Records changes in audit log:
   {
     editedBy: Admin User ObjectId,
     editedAt: Timestamp,
     changes: [
       { field: "amount", oldValue: 10000, newValue: 15000 },
       { field: "status", oldValue: "pending", newValue: "verified" }
     ]
   }
4. Updates donation with new values
5. Sets lastEditedBy to current admin
```

### Donation Pool Aggregation
```
1. Request → GET /api/admin/donation-pool?dateRange=month
2. Server queries:
   - Online donations (status=completed, within date range)
   - CSR donations (within date range)
3. Groups by foundation
4. Aggregates:
   - Total amounts (online + CSR per foundation)
   - Donor/company counts
   - Fee breakdowns
5. Returns structured JSON with foundation-wise stats
```

---

## 🔧 Technical Details

### Database Schema (CSRDonation)
```typescript
{
  companyName: String (required),
  amount: Number (required, min: 1),
  numberOfPeople: Number (required, min: 1, default: 1),
  foundation: ObjectId (ref: Foundation, required),
  
  // Fee breakdown (editable)
  platformFee: Number,
  foundationShare: Number,
  companyShare: Number,
  
  // Metadata
  date: Date (default: now, editable),
  status: Enum ['pending', 'verified', 'rejected', 'received', 'certificate_issued'],
  notes: String,
  
  // Audit
  createdBy: ObjectId (ref: User, required),
  lastEditedBy: ObjectId (ref: User),
  auditLog: [{
    editedBy: ObjectId (ref: User),
    editedAt: Date,
    changes: [{
      field: String,
      oldValue: Mixed,
      newValue: Mixed
    }]
  }],
  
  timestamps: true (createdAt, updatedAt)
}
```

### API Authentication
- All CSR routes require **admin authentication**
- Uses `getAdminFromRequest()` middleware
- Returns 401 if not authenticated as admin

### Date Range Filtering
- **All Time** - No date filter
- **Today** - Start of day → End of day
- **This Week** - Start of week (Sunday) → Now
- **This Month** - 1st of month → Now
- **Last Month** - 1st of last month → Last day of last month
- **This Year** - Jan 1st → Now
- **Custom** - User-specified start/end dates

---

## 🎨 UI Components

### CSR Table Columns
| Column | Type | Editable |
|--------|------|----------|
| Date | Date input | ✅ Yes |
| Company | Text input | ✅ Yes |
| Foundation | Dropdown | ✅ Yes |
| Amount | Number input | ✅ Yes |
| People | Number input | ✅ Yes |
| Platform Fee | Number input | ✅ Yes |
| Foundation Share | Number input | ✅ Yes |
| Company Share | Number input | ✅ Yes |
| Status | Dropdown | ✅ Yes |
| Actions | Icons | Edit/Audit/Delete |

### Status Colors
- **Pending** - Yellow background
- **Verified** - Green background
- **Rejected** - Red background
- **Received** - Blue background
- **Certificate Issued** - Blue background

---

## 📁 Files Created/Modified

### New Files
1. `src/models/CSRDonation.ts` - Database model
2. `src/app/api/admin/csr-donations/route.ts` - GET/POST routes
3. `src/app/api/admin/csr-donations/[id]/route.ts` - PATCH/DELETE routes
4. `src/app/api/admin/donation-pool/route.ts` - Aggregation route
5. `src/app/api/admin/donation-pool/export/route.ts` - Excel export route
6. `src/components/admin/CSRDonationsManager.tsx` - CSR management UI
7. `src/components/admin/DonationPoolDashboard.tsx` - Pool dashboard UI

### Modified Files
1. `src/app/admin/dashboard/page.tsx` - Added sub-tabs to Donations tab

---

## ✅ Testing Checklist

### CSR Donation Management
- [ ] Add new CSR donation (all fields)
- [ ] Add CSR donation with minimal fields (auto-calculation)
- [ ] Edit company name inline
- [ ] Edit amount and verify fee recalculation
- [ ] Edit foundation selection
- [ ] Edit status (pending → verified)
- [ ] View audit log after multiple edits
- [ ] Delete CSR donation with confirmation
- [ ] Filter by date range (all options)
- [ ] Filter by status
- [ ] Verify validation errors (missing required fields)

### Donation Pool Dashboard
- [ ] View total pool amount
- [ ] Check individual vs CSR breakdown percentages
- [ ] Expand foundation to see CSR company details
- [ ] Verify amounts match (online + CSR = total)
- [ ] Test date filtering (all ranges)
- [ ] Export to Excel
- [ ] Open Excel file and verify data
- [ ] Check column headers and formatting

### Integration
- [ ] Switch between sub-tabs (Pool, Online, CSR)
- [ ] Verify navigation state persists
- [ ] Test with multiple foundations
- [ ] Test with no CSR donations (should show "No donations found")
- [ ] Test with no date filter (all time)

---

## 🐛 Known Issues / Future Enhancements

### Current Limitations
- CSR donations are admin-only (not shown on public donation page) ✅
- No bulk upload feature (add multiple CSR donations at once)
- No certificate generation (only status tracking)

### Future Enhancements
1. **Bulk CSV Upload** - Upload multiple CSR donations from Excel/CSV
2. **80G Certificate Generation** - Auto-generate PDF certificates for CSR donors
3. **Email Notifications** - Notify admins when CSR status changes
4. **Advanced Filtering** - Search by company name, amount range
5. **Recurring CSR** - Track annual CSR contributions from same company
6. **CSR Dashboard Widget** - Show CSR stats on main dashboard overview
7. **Export Options** - PDF export, CSV export
8. **CSR Reports** - Detailed reports for tax filing

---

## 🔗 Related Documentation
- `DYNAMIC_FOUNDATION_SYSTEM.md` - Foundation management
- `CONFIGURABLE_PERCENTAGE_IMPLEMENTATION.md` - Fee calculation logic
- `CROWDFUNDING_PORTAL.md` - Online donation system
- `docs/PROJECT_OVERVIEW.md` - Overall architecture

---

## 📞 Support

For questions or issues:
1. Check console logs for API errors
2. Verify admin authentication (check cookies)
3. Ensure MongoDB connection is active
4. Check foundation configuration (active foundations exist)
5. Verify environment variables are set correctly

---

**Implementation Date:** November 1, 2025  
**Status:** ✅ Complete and Ready for Testing  
**Version:** 1.0.0
