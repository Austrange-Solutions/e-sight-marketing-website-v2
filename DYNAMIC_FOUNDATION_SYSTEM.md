# Dynamic Foundation Management System

## 📋 Overview

This system allows admins to dynamically add, edit, and manage foundations (NGOs) from the admin panel without code changes. Foundations can be activated/deactivated, customized with branding, and automatically appear on the donation page.

---

## 🎯 Key Features

### ✅ **Admin-Controlled**
- Add new foundations through admin panel UI
- No code changes required
- Edit all foundation details (name, percentages, branding, contact info)
- Delete foundations (with safety checks)
- Activate/deactivate foundations

### ✅ **Flexible Configuration**
- **Only 2 required fields:** Foundation Name, Foundation Share %
- All other fields optional (logo, description, contact info, etc.)
- Auto-generated short codes from foundation names
- Custom branding (logo, color, emoji/icon)

### ✅ **Backward Compatible**
- Supports legacy string-based foundation codes ("vsf", "cf")
- Migration script converts existing data to new system
- Handles both ObjectId and string foundation references

### ✅ **Smart Defaults**
- Inactive by default (admin must activate)
- Auto-calculated company share (100 - foundation share)
- Auto-assigned priority numbers
- Default emoji (❤️) if no logo uploaded
- Platform primary color as default

---

## 🏗️ Architecture

### **Database Models**

#### Foundation Model (`src/models/Foundation.ts`)
```typescript
{
  // Required
  foundationName: string        // e.g., "Vishnu Shakti Foundation"
  code: string                  // Unique: "vsf", "cf", "abc-trust"
  foundationSharePercent: number // 0-100
  companySharePercent: number    // Auto: 100 - foundationShare
  
  // Optional Branding
  displayName?: string          // Short: "VSF"
  tagline?: string              // "Empowering visually impaired"
  description?: string          // Full mission statement
  logoUrl?: string              // S3 URL
  icon?: string                 // Emoji: "💚", "💜"
  primaryColor?: string         // Hex: "#10b981"
  
  // Optional Contact
  contactEmail?: string
  contactPhone?: string
  website?: string
  
  // Operational
  isActive: boolean             // Show on donation page?
  priority: number              // Display order
  minimumDonation?: number      // Min amount
  
  // Auto-calculated Stats
  stats: {
    totalDonations: number
    totalAmount: number
    donorCount: number
  }
}
```

#### Donation Model Update (`src/models/Donation.ts`)
```typescript
{
  // Changed from:
  foundation: "vsf" | "cf"  // String enum
  
  // To:
  foundation: ObjectId | string  // Mixed type for backward compatibility
}
```

---

## 🚀 Implementation

### **Files Created/Modified**

#### 1. **Foundation Model**
- **File:** `src/models/Foundation.ts`
- **Features:**
  - Validation (percentages must sum to 100)
  - Auto-generate code from name
  - Check code uniqueness
  - Calculate next priority
  - Pre-save hooks for auto-calculations

#### 2. **Admin API Routes**
- **File:** `src/app/api/admin/foundations/route.ts`
  - `GET /api/admin/foundations` - Fetch all foundations
  - `POST /api/admin/foundations` - Create new foundation

- **File:** `src/app/api/admin/foundations/[id]/route.ts`
  - `GET /api/admin/foundations/:id` - Get single foundation
  - `PATCH /api/admin/foundations/:id` - Update foundation
  - `DELETE /api/admin/foundations/:id` - Delete foundation (with safety check)

#### 3. **Admin Component**
- **File:** `src/components/admin/FoundationManagement.tsx`
- **Features:**
  - Add/Edit form (expandable)
  - Logo upload to S3
  - Emoji selector
  - Color picker
  - Toggle active/inactive
  - Delete with confirmation
  - Display foundation stats
  - Auto-calculate company share

#### 4. **Integration**
- **File:** `src/components/admin/FoundationSettingsManagement.tsx`
- Added Foundation Management section below existing percentage config

#### 5. **Migration Script**
- **File:** `scripts/migrate-foundations-to-dynamic.js`
- Converts VSF & CF hardcoded data to database
- Updates existing donations to use ObjectId references
- Calculates foundation stats

---

## 📝 Usage Guide

### **Step 1: Run Migration** (One-time)

```powershell
# Connect to production/local database
bun run scripts/migrate-foundations-to-dynamic.js
```

**What it does:**
1. Creates VSF and CF Foundation documents in database
2. Updates all existing Donation documents (foundation field: "vsf" → ObjectId)
3. Calculates stats (total donations, amount, unique donors)
4. Verifies migration success

**Output:**
```
🚀 Starting Foundation Migration...
✅ Connected to MongoDB

📝 Step 1: Creating Foundation documents...
   ✅ Created foundation: Vishnu Shakti Foundation (vsf)
      ObjectId: 507f1f77bcf86cd799439011
   ✅ Created foundation: Chetana Foundation (cf)
      ObjectId: 507f1f77bcf86cd799439012

📝 Step 2: Updating existing donations...
   Found 45 VSF donations and 32 CF donations
   Total donations to migrate: 77

   ✅ Updated 45 VSF donations to reference ObjectId
   ✅ Updated 32 CF donations to reference ObjectId

📝 Step 3: Calculating foundation statistics...
   ✅ VSF: 45 donations, ₹67,455, 38 unique donors
   ✅ CF: 32 donations, ₹48,000, 29 unique donors

📝 Step 4: Verification...
   ✅ Total foundations in database: 2

   📌 Vishnu Shakti Foundation (vsf)
      Status: ✅ Active
      Priority: 1
      Foundation Share: 65%
      Company Share: 35%
      Icon: 💚
      Color: #10b981
      Stats: 45 donations, ₹67,455

   📌 Chetana Foundation (cf)
      Status: ✅ Active
      Priority: 2
      Foundation Share: 75%
      Company Share: 25%
      Icon: 💜
      Color: #8b5cf6
      Stats: 32 donations, ₹48,000

✅ Migration completed successfully!
```

---

### **Step 2: Access Admin Panel**

1. Login as admin: `/admin/login`
2. Navigate to **Foundation Settings** tab
3. Scroll down to **Foundation Management** section

---

### **Step 3: Add New Foundation**

1. Click **"+ Add Foundation"** button
2. Fill required fields:
   - **Foundation Name:** "ABC Children Trust" ✅
   - **Foundation Share %:** 70 ✅
3. Optional fields:
   - Code: "abc" (or leave empty for auto-generation)
   - Display Name: "ABC"
   - Tagline: "Helping underprivileged children"
   - Description: Full mission statement
   - Logo: Upload image to S3
   - Icon: Choose emoji (🧡)
   - Color: Pick color (#ff7700)
   - Contact: Email, phone, website
   - Min Donation: ₹100
4. Check **"Active"** to show on donation page
5. Click **"Create Foundation"**

---

### **Step 4: Edit Foundation**

1. Click **Edit** (pencil icon) on any foundation card
2. Modify any field (all editable)
3. Upload new logo if needed
4. Click **"Save Changes"**

---

### **Step 5: Activate/Deactivate**

1. Click **Power/PowerOff** icon on foundation card
2. Active foundations show on donation page
3. Inactive foundations hidden from public

---

### **Step 6: Delete Foundation**

1. Click **Delete** (trash icon)
2. Confirm deletion
3. **Safety:** Foundations with donations cannot be deleted (deactivate instead)

---

## 🎨 Donation Page Display

### **Before (Hardcoded)**
```tsx
// VSF and CF hardcoded in page component
<button onClick={() => setFoundation("vsf")}>VSF</button>
<button onClick={() => setFoundation("cf")}>CF</button>
```

### **After (Dynamic)**
```tsx
// Fetch active foundations from database
const activeFoundations = await Foundation.find({ isActive: true })
  .sort({ priority: 1 });

// Render dynamically
{activeFoundations.map(foundation => (
  <FoundationCard
    key={foundation._id}
    name={foundation.displayName || foundation.foundationName}
    tagline={foundation.tagline}
    icon={foundation.icon}
    logoUrl={foundation.logoUrl}
    color={foundation.primaryColor}
    onDonate={() => handleDonate(foundation._id)}
  />
))}
```

---

## 🔐 Security Features

### **Authentication**
- All admin API routes require admin JWT token
- Uses `getAdminFromRequest()` middleware
- Returns 401 Unauthorized if not admin

### **Validation**
- Required fields enforced (name, foundation share %)
- Percentage validation (must sum to 100%)
- Code uniqueness check
- Email/phone format validation
- Hex color format validation

### **Safety Checks**
- Cannot delete foundation with existing donations
- Duplicate code prevention
- Invalid percentage detection

---

## 📊 Foundation Statistics

**Auto-calculated on donation completion:**
- Total donations count
- Total amount received
- Unique donor count

**Displayed in admin panel:**
```
Foundation Management:
┌──────────────────────────────────────────────────┐
│ 💚 Vishnu Shakti Foundation (vsf)                │
│ Status: ✅ Active  |  Priority: 1               │
│ Total Donations: ₹67,455  |  Donors: 38         │
│ Foundation Gets: 65%  |  Company Gets: 35%      │
│ [✅ Deactivate] [✏️ Edit] [🗑️ Delete]            │
└──────────────────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

### **After Migration:**
- [ ] VSF appears in admin foundation list
- [ ] CF appears in admin foundation list
- [ ] Both show correct stats (donations, amount, donors)
- [ ] Old donations still display correctly
- [ ] Donation breakdown calculations still accurate

### **Add New Foundation:**
- [ ] Can create foundation with only name + percentage
- [ ] Code auto-generates if left empty
- [ ] Foundation appears in admin list
- [ ] Stats show zeros initially

### **Edit Foundation:**
- [ ] Can change all fields
- [ ] Can upload/change logo
- [ ] Can choose different emoji
- [ ] Can change percentages
- [ ] Changes save successfully

### **Activate/Deactivate:**
- [ ] Active foundations appear on donation page
- [ ] Inactive foundations hidden from donation page
- [ ] Toggle works immediately

### **Delete:**
- [ ] Can delete foundation with zero donations
- [ ] Cannot delete foundation with donations (shows error)
- [ ] Deleted foundation removed from list

### **Donation Flow:**
- [ ] Can donate to VSF (migrated)
- [ ] Can donate to CF (migrated)
- [ ] Can donate to new foundation
- [ ] Donation saves with ObjectId reference
- [ ] Foundation stats update correctly

---

## 🔄 Migration from Hardcoded to Dynamic

### **Before:**
```typescript
// Hardcoded in code
const foundationConfig = {
  vsf: { name: "VSF", icon: "💚", share: 65 },
  cf: { name: "CF", icon: "💜", share: 75 }
};
```

### **After:**
```typescript
// Fetch from database
const foundations = await Foundation.find({ isActive: true });
```

### **Donation Model Change:**
```typescript
// Before: String enum
foundation: "vsf" | "cf"

// After: Mixed type (backward compatible)
foundation: ObjectId | string
```

### **Migration Script Handles:**
1. ✅ Create Foundation documents
2. ✅ Update existing donations
3. ✅ Calculate initial stats
4. ✅ Preserve all data
5. ✅ Zero downtime

---

## 🎯 Future Enhancements

### **Phase 2 (Potential Features):**
- [ ] Multi-select foundations (donate to multiple at once)
- [ ] Foundation campaigns (goal tracking, end dates)
- [ ] Impact metrics (people helped, projects completed)
- [ ] Donor recognition tiers (Bronze, Silver, Gold)
- [ ] Custom 80G certificate templates per foundation
- [ ] Social media integration (auto-post donations)
- [ ] Foundation verification workflow (pending → approved)
- [ ] Legal document storage (80G cert, PAN, registration)
- [ ] Bank account details (for direct transfers)

---

## 📚 API Reference

### **GET /api/admin/foundations**
Fetch all foundations with stats.

**Response:**
```json
{
  "success": true,
  "foundations": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "foundationName": "Vishnu Shakti Foundation",
      "code": "vsf",
      "foundationSharePercent": 65,
      "companySharePercent": 35,
      "displayName": "VSF",
      "tagline": "Empowering visually impaired individuals",
      "icon": "💚",
      "primaryColor": "#10b981",
      "isActive": true,
      "priority": 1,
      "stats": {
        "totalDonations": 45,
        "totalAmount": 67455,
        "donorCount": 38
      }
    }
  ],
  "count": 2
}
```

---

### **POST /api/admin/foundations**
Create new foundation.

**Request Body:**
```json
{
  "foundationName": "ABC Children Trust",
  "code": "abc",
  "foundationSharePercent": 70,
  "tagline": "Helping underprivileged children",
  "icon": "🧡",
  "primaryColor": "#ff7700",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Foundation created successfully",
  "foundation": { /* foundation document */ }
}
```

---

### **PATCH /api/admin/foundations/:id**
Update foundation.

**Request Body:**
```json
{
  "foundationSharePercent": 75,
  "isActive": false
}
```

---

### **DELETE /api/admin/foundations/:id**
Delete foundation (if no donations).

**Response:**
```json
{
  "success": true,
  "message": "Foundation deleted successfully"
}
```

**Error (has donations):**
```json
{
  "error": "Cannot delete foundation. It has 45 associated donation(s). Please deactivate instead.",
  "donationCount": 45
}
```

---

## 🐛 Troubleshooting

### **Migration fails:**
- Check `MONGODB_URI` in `.env`
- Ensure database connection works
- Verify VSF/CF don't already exist in database

### **Foundation not appearing on donation page:**
- Check `isActive` is `true`
- Verify priority is set
- Clear browser cache

### **Cannot upload logo:**
- Check AWS credentials in `.env`
- Verify S3 bucket permissions
- Check CloudFront domain configuration

### **Percentage validation error:**
- Ensure Foundation Share + Company Share = 100%
- Check for decimal precision errors

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review migration script output
3. Check browser console for errors
4. Verify admin authentication

---

**Last Updated:** October 20, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
