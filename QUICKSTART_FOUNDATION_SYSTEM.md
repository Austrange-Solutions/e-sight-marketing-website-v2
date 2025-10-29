# ⚡ Quick Start: Dynamic Foundation System

## 🚀 Get Started in 5 Minutes

### **Step 1: Run Migration** (30 seconds)

```powershell
# From project root
bun run scripts/migrate-foundations-to-dynamic.js
```

✅ **Expected Output:**
```
✅ Connected to MongoDB
✅ Created foundation: Vishnu Shakti Foundation (vsf)
✅ Created foundation: Chetana Foundation (cf)
✅ Updated 77 donations to reference ObjectId
✅ Migration completed successfully!
```

---

### **Step 2: Test Admin Panel** (1 minute)

1. **Login:** http://localhost:3000/admin/login
2. **Navigate:** Click "Foundation Settings" tab
3. **Scroll down:** See "Foundation Management" section
4. **Verify:** VSF and CF appear with stats

---

### **Step 3: Add Your First Foundation** (2 minutes)

1. **Click** "+ Add Foundation" button
2. **Fill required fields:**
   - Foundation Name: `"Test Children Trust"`
   - Foundation Share %: `70`
3. **Optional (recommended):**
   - Choose emoji: 🧡
   - Pick color: #ff7700
4. **Check** "Active" box
5. **Click** "Create Foundation"

---

### **Step 4: See It Live** (30 seconds)

1. **Visit:** http://localhost:3000/donate
2. **Look:** You should see 3 foundation cards:
   - 💚 VSF
   - 💜 CF
   - 🧡 Test Children Trust
3. **Try:** Select "Test Children Trust" and enter amount

---

### **Step 5: Test Complete Flow** (1 minute)

1. Select foundation
2. Enter donor details
3. Click "Donate" button
4. Complete Razorpay test payment
5. **Check admin panel:** Stats should update automatically

---

## ✅ Success Checklist

After completing above steps, verify:

- [ ] Migration ran successfully
- [ ] VSF and CF appear in admin panel with correct stats
- [ ] Created "Test Children Trust" foundation
- [ ] Foundation shows as active in admin list
- [ ] All 3 foundations visible on /donate page
- [ ] Can select any foundation for donation
- [ ] Test donation completes successfully
- [ ] Foundation stats update automatically

---

## 🎯 Next Actions

### **To Add Real Foundation:**

1. Click "+ Add Foundation"
2. Fill all fields (name, %, description, logo, contact)
3. Upload logo to S3
4. Activate when ready

### **To Edit Foundation:**

1. Click ✏️ Edit icon
2. Modify any field
3. Click "Save Changes"

### **To Deactivate Foundation:**

1. Click ⚡ Deactivate icon
2. Foundation hidden from donation page
3. Still visible in admin panel

### **To Delete Foundation:**

- Only works if foundation has ZERO donations
- If has donations, use Deactivate instead

---

## 🐛 Troubleshooting

### **Migration fails?**
- Check `.env` has correct `MONGODB_URI`
- Ensure database is accessible
- Try running migration again (safe to re-run)

### **Foundation not showing on donation page?**
- Check "Active" status is ✅
- Clear browser cache
- Check browser console for errors

### **Cannot upload logo?**
- Verify AWS credentials in `.env`
- Check S3 bucket permissions
- Ensure CloudFront domain is set

### **Stats not updating?**
- Complete a test donation
- Wait 1-2 seconds
- Refresh admin panel

---

## 📚 Full Documentation

- **Complete Guide:** `DYNAMIC_FOUNDATION_SYSTEM.md`
- **Visual Diagrams:** `DYNAMIC_FOUNDATION_VISUAL_ARCHITECTURE.md`
- **Implementation Summary:** `DYNAMIC_FOUNDATION_IMPLEMENTATION_SUMMARY.md`

---

## 💡 Pro Tips

1. **Test first:** Create test foundation before adding real NGOs
2. **Use priority:** Lower number = appears first on donation page
3. **Upload logo:** Looks more professional than emoji
4. **Add description:** Helps donors understand foundation's mission
5. **Set minimum:** Prevent tiny donations if needed
6. **Monitor stats:** Track donation performance per foundation

---

## 🎨 Example: Complete Foundation Setup

```json
{
  "foundationName": "Hope for Children Foundation",
  "code": "hope",
  "foundationSharePercent": 75,
  "displayName": "Hope",
  "tagline": "Providing education and healthcare to underprivileged children",
  "description": "Since 2010, Hope for Children Foundation has helped over 10,000 children access quality education, healthcare, and nutrition. We work in rural areas to ensure every child has a chance at a better future.",
  "icon": "🌟",
  "primaryColor": "#f59e0b",
  "contactEmail": "contact@hopeforchildren.org",
  "contactPhone": "+91 98765 43210",
  "website": "https://hopeforchildren.org",
  "minimumDonation": 100,
  "isActive": true
}
```

---

**Time to Complete:** 5 minutes
**Difficulty:** Easy
**Prerequisites:** Admin access, MongoDB running
**Result:** Fully functional dynamic foundation system

---

**Last Updated:** October 20, 2025
**Status:** ✅ Production Ready
