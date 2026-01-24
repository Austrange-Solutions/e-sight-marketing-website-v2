# 🔧 Cashfree Production Mode Troubleshooting

## Error: "payment_session_id is not present or is invalid"

This error occurs when switching from Cashfree Sandbox to Production mode.

---

## 🎯 Common Causes & Solutions

### 1. **Endpoint Mismatch**

**Issue**: Using sandbox credentials with production endpoint or vice versa.

**Check your `.env.local` or production environment:**



**⚠️ IMPORTANT**: 
- Both server-side (`CASHFREE_*`) and client-side (`NEXT_PUBLIC_CASHFREE_*`) must match!
- Client side loads the Cashfree JS SDK with the same mode
- Server side creates orders with matching credentials

---

### 2. **Client-Server Environment Mismatch**

**Issue**: Server creates order in production, but client loads Cashfree JS SDK in sandbox mode.

**Fix in your button components:**

Update `CashfreeButton.tsx` and `DonateButton.tsx`:

```typescript
// ❌ WRONG - Hardcoded mode
const cashfree = await load({
  mode: "sandbox"
});

// ✅ CORRECT - Dynamic based on environment
const cashfree = await load({
  mode: process.env.NEXT_PUBLIC_CASHFREE_ENDPOINT === "https://api.cashfree.com/pg" 
    ? "production" 
    : "sandbox",
});
```

---

### 3. **Invalid Production Credentials**

**Issue**: App ID or Secret Key are incorrect or not activated.

**Verify your Cashfree credentials:**

1. Log in to [Cashfree Merchant Dashboard](https://merchant.cashfree.com/)
2. Go to **Developers → API Keys**
3. Verify:
   - ✅ App ID matches your `.env`
   - ✅ Secret Key matches your `.env`
   - ✅ Production mode is **activated** (not in test mode)
   - ✅ API Keys are **not expired**

---

### 4. **Customer Details Validation**

**Issue**: Production mode requires stricter validation than sandbox.

**Required fields in production:**
- `customer_name` (cannot be empty or "Guest")
- `customer_email` (must be valid email format)
- `customer_phone` (must be valid Indian phone number: 10 digits)

**Check your code:**

```typescript
// ❌ WRONG - Empty/missing customer details
customer_details: {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
}

// ✅ CORRECT - All fields populated
customer_details: {
  customer_name: userDetails?.name,      // "John Doe"
  customer_email: userDetails?.email,    // "john@example.com"
  customer_phone: userDetails?.phone,    // "9876543210"
}
```

---

### 5. **Deployment Environment Variables**

**Issue**: Local works but production doesn't - environment variables not set in Coolify.

**Fix in Coolify:**

1. Go to your application in Coolify
2. Navigate to **Environment Variables**
3. Add ALL required variables:
4. **Redeploy** the application (changes require rebuild)

---

## 🔍 Debugging Steps

### Step 1: Check Server Logs

Look for these console logs we added:

```bash
🔧 [CASHFREE ORDER] Environment: https://api.cashfree.com/pg
🔧 [CASHFREE ORDER] Creating order with amount: 1499
📤 [CASHFREE ORDER] Order request: { ... }
📥 [CASHFREE ORDER] Response: { ... }
✅ [CASHFREE ORDER] Order created successfully: order_123456
```

**What to look for:**
- ✅ Environment should be `https://api.cashfree.com/pg` (production)
- ✅ Response should contain `payment_session_id`
- ❌ If response is empty or error, check credentials

### Step 2: Check Browser Console

Open DevTools → Console and look for:

```javascript
// Order creation response
{
  order_id: "order_123456",
  paymentSessionId: "session_xyz...",
  ...
}

// Cashfree SDK load
mode: "production"  // Should match server
```

### Step 3: Verify API Response

Use browser DevTools → Network tab:

1. **POST to `/api/cashfree/order` or `/api/donate/create`**
   - Response should include `paymentSessionId`
   - If missing, server-side credentials are wrong

2. **Cashfree JS SDK request**
   - Should use production URL if in production mode

### Step 4: Test with Simple Request

Create a test button to verify credentials:

```typescript
// Test order creation
const testOrder = async () => {
  const response = await fetch('/api/cashfree/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 10,  // Test with ₹10
      userDetails: {
        name: "Test User",
        email: "test@example.com",
        phone: "9876543210"
      }
    })
  });
  
  const data = await response.json();
  console.log("Order creation response:", data);
  
  // Should contain paymentSessionId
  if (data.paymentSessionId) {
    console.log("✅ Credentials are working!");
  } else {
    console.error("❌ No payment session ID returned");
  }
};
```

---

## 🧪 Quick Test Checklist

Run through this checklist:

- [ ] **Environment variables set?**
  - `CASHFREE_ENDPOINT` matches production URL
  - `NEXT_PUBLIC_CASHFREE_ENDPOINT` matches production URL
  - `CASHFREE_APP_ID` is your **production** app ID
  - `CASHFREE_SECRET_KEY` is your **production** secret

- [ ] **Application restarted?**
  - After changing environment variables
  - Both local dev server AND Coolify deployment

- [ ] **Credentials verified?**
  - Log in to Cashfree dashboard
  - Copy credentials exactly (no extra spaces)
  - Production mode is activated

- [ ] **Server logs show correct endpoint?**
  - Should log `https://api.cashfree.com/pg`
  - Not `https://sandbox.cashfree.com/pg`

- [ ] **Response contains payment_session_id?**
  - Check server logs
  - Check browser Network tab

- [ ] **Client SDK uses same mode?**
  - Production credentials → `mode: "production"`
  - Sandbox credentials → `mode: "sandbox"`

---

## 💡 Pro Tips

### Tip 1: Keep Separate Credentials
```bash
# .env.local (Development/Sandbox)
CASHFREE_APP_ID=sandbox_app_id_123
CASHFREE_ENDPOINT=https://sandbox.cashfree.com/pg

# Coolify Production (Production/Live)
CASHFREE_APP_ID=production_app_id_456
CASHFREE_ENDPOINT=https://api.cashfree.com/pg
```

### Tip 2: Add Logging Temporarily
```typescript
console.log("Cashfree Endpoint:", process.env.CASHFREE_ENDPOINT);
console.log("App ID (first 5 chars):", process.env.CASHFREE_APP_ID?.substring(0, 5));
```

### Tip 3: Test in Stages
1. Test order creation endpoint directly (Postman/curl)
2. Test with test amount (₹1 or ₹10)
3. Test full flow on staging before production

---

## 🆘 Still Not Working?

If you've tried everything above:

1. **Double-check Cashfree Dashboard:**
   - Is production mode activated?
   - Are there any pending verification steps?
   - Is your account fully verified?

2. **Contact Cashfree Support:**
   - Share your App ID (not secret key!)
   - Share the exact error message
   - Ask if there are account limitations

3. **Fallback to Sandbox:**
   Temporarily switch back to test while debugging:
   ```bash
   CASHFREE_ENDPOINT=https://sandbox.cashfree.com/pg
   NEXT_PUBLIC_CASHFREE_ENDPOINT=https://sandbox.cashfree.com/pg
   # Use sandbox credentials
   ```

---

## ✅ Expected Production Behavior

When everything is configured correctly:

1. **Server creates order** → Returns `payment_session_id`
2. **Client loads Cashfree JS** → Uses production mode
3. **Modal opens** → Shows live payment options
4. **Payment succeeds** → Real money transaction
5. **Verification works** → Order marked as completed

🎉 You're now live with Cashfree Production!
