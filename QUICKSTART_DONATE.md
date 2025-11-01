# 🚀 Quick Start: Maceazy Pro Donation Portal

Get the donation portal up and running in 5 minutes!

## Prerequisites
- Node.js 18+ or Bun
- MongoDB account (MongoDB Atlas recommended)
- Razorpay account (for payment processing)

---

## Step 1: Install Dependencies

```bash
# If using Bun (recommended)
bun install

# If using npm
npm install
```

---

## Step 2: Configure Environment Variables

1. Copy the sample environment file:
```bash
cp .env.sample .env.local
```

2. Fill in the required values in `.env.local`:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Razorpay (Get from https://dashboard.razorpay.com)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_string_here
```

**Get Razorpay Keys:**
1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys
3. Generate Test Keys (or Live Keys for production)
4. Copy Key ID and Secret

---

## Step 3: Run Development Server

```bash
# Using Bun
bun dev

# Using npm
npm run dev
```

Your app will be available at: **http://localhost:3000**

---

## Step 4: Access Donation Portal

Open your browser and navigate to:
- Main site: http://localhost:3000
- Donation portal: **http://localhost:3000/donate**

---

## Step 5: Test a Donation

### Use Razorpay Test Cards:

**Successful Payment:**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

**Failed Payment (to test error handling):**
```
Card Number: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
```

### Test Flow:
1. Go to http://localhost:3000/donate
2. Click a preset amount (e.g., 1x Maceazy Pro - ₹1,499)
3. Fill in donor details:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
4. Click "Donate ₹1,499"
5. Complete payment in Razorpay modal
6. You'll be redirected to success page with confetti! 🎉

---

## Verify It's Working

### Check Donation in Database:
Your MongoDB collection `donations` should have a new document with:
- Status: `completed`
- Amount: `1499`
- sticksEquivalent: `1`
- Payment details

### Check Leaderboard:
- Refresh the donate page
- Your donation should appear in the leaderboard (unless anonymous)

---

## File Structure Reference

```
src/
├── app/
│   ├── donate/
│   │   ├── page.tsx              # 👈 Main donation page
│   │   └── success/page.tsx      # 👈 Thank you page
│   └── api/donate/
│       ├── create/route.ts       # Creates Razorpay order
│       ├── verify/route.ts       # Verifies payment
│       ├── leaderboard/route.ts  # Fetches top donors
│       └── details/route.ts      # Gets donation details
├── components/donate/
│   ├── DonateButton.tsx          # 👈 Payment button
│   └── Leaderboard.tsx           # 👈 Top donors display
└── models/
    └── Donation.ts               # 👈 MongoDB schema
```

---

## Common Issues & Solutions

### ❌ Error: "Cannot find module Razorpay"
**Fix:**
```bash
bun add razorpay
```

### ❌ Error: "MongoDB connection failed"
**Fix:**
- Check your `MONGODB_URI` in `.env.local`
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify database user has read/write permissions

### ❌ Error: "Payment verification failed"
**Fix:**
- Verify `RAZORPAY_KEY_SECRET` matches your account
- Check you're using the correct key (test vs live)
- Ensure both `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` are set

### ❌ Leaderboard is empty
**Fix:**
- Make a test donation
- Ensure donation status is `completed`
- Make sure "Make donation anonymous" is unchecked

---

## What's Included?

✅ **4 Preset Donation Amounts**
- 1x Maceazy Pro (₹1,499)
- 2x Maceazy Pro (₹2,998)
- 4x Maceazy Pro (₹5,996)
- 8x Maceazy Pro (₹11,992)

✅ **Custom Amount Input**
- Real-time stick calculation
- Shows impact ("You are donating X Maceazy Pro")

✅ **Form Fields**
- Name (required)
- Email (required, validated)
- Phone (required, 10 digits)
- Message (optional, max 500 chars)
- Anonymous checkbox

✅ **Razorpay Payment**
- Secure payment processing
- Multiple payment methods (card, UPI, wallet, netbanking)
- Automatic signature verification

✅ **Success Page**
- Confetti animation 🎊
- Donation summary
- Share on social media
- Download receipt (coming soon)

✅ **Leaderboard**
- Top 10 donors
- Real-time updates
- Rank badges (🏆🥈🥉)
- Amount and stick count

---

## Next Steps

### For Development:
1. Customize donation amounts in `src/app/donate/page.tsx`
2. Update hero stats (people helped, amount raised)
3. Add your brand logo and images
4. Customize email templates in Razorpay dashboard

### For Production:
1. Switch to Razorpay Live Keys
2. Update `NEXTAUTH_URL` to your domain
3. Set up subdomain: `donate.yourdomain.com`
4. Configure webhook in Razorpay for notifications
5. Add Google Analytics tracking
6. Test thoroughly with real payment methods

---

## Important Notes

⚠️ **Security:**
- Never commit `.env.local` to version control
- Keep your `RAZORPAY_KEY_SECRET` private
- Use HTTPS in production

💡 **Tips:**
- Test with Razorpay test mode first
- Monitor failed payments in Razorpay dashboard
- Set up payment reminders for abandoned carts
- Consider adding donation tiers with perks

🎯 **Best Practices:**
- Keep Maceazy Pro price updated (currently ₹1,499)
- Regularly update hero stats
- Share success stories
- Thank donors via email

---

## Need Help?

📖 **Full Documentation**: See `CROWDFUNDING_PORTAL.md`  
🐛 **Found a bug?**: Open an issue on GitHub  
💬 **Questions?**: Contact support@maceazy.com  

---

## Resources

- [Razorpay Documentation](https://razorpay.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

---

**Happy Fundraising! 🎉**

Help us make a difference by providing Maceazy Pro smart canes to visually impaired individuals.

