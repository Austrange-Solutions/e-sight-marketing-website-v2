// Quick Cashfree Configuration Checker
// Run this in your browser console on any page to verify setup

console.log("🔍 Cashfree Configuration Check\n");

// Client-side variables (NEXT_PUBLIC_*)
console.log("📱 CLIENT-SIDE:");
console.log("  Endpoint:", process.env.NEXT_PUBLIC_CASHFREE_ENDPOINT || "❌ NOT SET");
console.log("  App ID:", process.env.NEXT_PUBLIC_CASHFREE_APP_ID ? 
  "✅ SET (" + process.env.NEXT_PUBLIC_CASHFREE_APP_ID.substring(0, 10) + "...)" : 
  "❌ NOT SET");
console.log("  Mode:", process.env.NEXT_PUBLIC_CASHFREE_ENDPOINT === "https://api.cashfree.com/pg" ? 
  "🔴 PRODUCTION" : "🟡 SANDBOX");

console.log("\n⚠️ Note: Server-side variables (CASHFREE_APP_ID, CASHFREE_SECRET_KEY) cannot be checked from the browser.");
console.log("Check your terminal logs for server-side configuration.");

// Validation
const isValid = 
  process.env.NEXT_PUBLIC_CASHFREE_ENDPOINT && 
  process.env.NEXT_PUBLIC_CASHFREE_APP_ID;

if (isValid) {
  console.log("\n✅ Client-side configuration looks good!");
} else {
  console.log("\n❌ Client-side configuration is incomplete!");
  console.log("Make sure to:");
  console.log("1. Set NEXT_PUBLIC_CASHFREE_ENDPOINT in .env.local");
  console.log("2. Set NEXT_PUBLIC_CASHFREE_APP_ID in .env.local");
  console.log("3. Restart your dev server (stop and run 'bun dev' again)");
}

console.log("\n🧪 To test order creation, open DevTools Network tab and try making a payment.");
