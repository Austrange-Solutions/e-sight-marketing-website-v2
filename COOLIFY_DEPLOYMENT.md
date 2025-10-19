# 🚀 Coolify Deployment Guide for donate.maceazy.com

## Problem Diagnosis

### Issue 1: "No available server"
This means the domain `donate.maceazy.com` is not properly configured in Coolify to route to your application.

### Issue 2: "404 Page Not Found" when using IP
The middleware expects a subdomain like `donate.maceazy.com`, but direct IP access (e.g., `192.168.1.1`) has no subdomain.

---

## ✅ Complete Fix for Coolify

### Step 1: Configure Domains in Coolify

1. **Open Coolify Dashboard**
2. **Navigate to your application** (e-sight-marketing-website-v2)
3. **Go to Domains section**
4. **Add BOTH domains**:
   ```
   maceazy.com
   donate.maceazy.com
   ```
5. **Save and redeploy** the application

### Step 2: Update DNS Records

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add:

#### For Main Domain
```
Type: A
Name: @ (or leave blank for root)
Value: [Your Coolify Server IP Address]
TTL: 3600 (or Auto)
```

#### For Donate Subdomain
```
Type: A
Name: donate
Value: [Your Coolify Server IP Address]
TTL: 3600 (or Auto)
```

**OR use CNAME** (if you already have @ pointing to IP):
```
Type: CNAME
Name: donate
Value: maceazy.com
TTL: 3600 (or Auto)
```

### Step 3: Environment Variables in Coolify

In your Coolify application settings, set these environment variables:

```bash
# Production URLs
NEXT_PUBLIC_APP_URL=https://maceazy.com
NEXT_PUBLIC_BASE_URL=https://maceazy.com
NEXTAUTH_URL=https://maceazy.com

# Cashfree (use production endpoint for live)
CASHFREE_ENDPOINT=https://api.cashfree.com/pg
NEXT_PUBLIC_CASHFREE_ENDPOINT=https://api.cashfree.com/pg

# Your other environment variables
MONGODB_URI=mongodb://...
CASHFREE_APP_ID=your_production_app_id
CASHFREE_SECRET_KEY=your_production_secret
# ... etc
```

### Step 4: SSL Certificates

Coolify automatically provisions SSL certificates via Let's Encrypt when you add a domain. After adding the domains:

1. Wait 2-5 minutes for SSL provisioning
2. Verify both URLs work with HTTPS:
   - ✅ https://maceazy.com
   - ✅ https://donate.maceazy.com

---

## 🔍 Debugging Steps

### Test 1: Check DNS Propagation
```bash
# On your local machine, run:
nslookup donate.maceazy.com
nslookup maceazy.com

# Both should return your Coolify server IP
```

### Test 2: Check Coolify Proxy
In Coolify, check the Caddy/proxy logs to see if requests are being received.

### Test 3: Check Application Logs
In Coolify application logs, look for:
- Build errors
- Runtime errors
- 404s or missing routes

### Test 4: Test Middleware Locally
```bash
# Run locally with host override
curl -H "Host: donate.maceazy.com" http://localhost:3000
# Should show the donate page
```

---

## 🎯 Common Coolify Issues & Fixes

### Issue: "No available server"
**Cause**: Domain not added to Coolify application
**Fix**: Add `donate.maceazy.com` in Coolify → Application → Domains

### Issue: 404 on subdomain
**Cause**: Middleware not running or DNS not propagated
**Fix**: 
1. Verify DNS points to correct IP
2. Redeploy application in Coolify
3. Check build logs for errors

### Issue: SSL not working
**Cause**: Let's Encrypt needs time to provision
**Fix**: Wait 5-10 minutes after adding domain

### Issue: Main site works, subdomain doesn't
**Cause**: DNS for subdomain not set up
**Fix**: Add A record for `donate` subdomain

---

## 🌐 Complete DNS Configuration Example

### If using Cloudflare:
```
Type    Name      Content                 Proxy Status
A       @         [Your Coolify IP]       Proxied (or DNS only)
A       donate    [Your Coolify IP]       Proxied (or DNS only)
CNAME   www       maceazy.com             Proxied
```

### If using GoDaddy/Namecheap:
```
Type    Host      Points to              TTL
A       @         [Your Coolify IP]      3600
A       donate    [Your Coolify IP]      3600
CNAME   www       maceazy.com            3600
```

---

## 🧪 Testing Checklist

After configuration, verify:

- [ ] `maceazy.com` loads (main site)
- [ ] `donate.maceazy.com` loads (donation page)
- [ ] `donate.maceazy.com/success` loads
- [ ] SSL certificates are valid (padlock in browser)
- [ ] Both domains show in Coolify application settings
- [ ] DNS records are correct (use `nslookup` or `dig`)
- [ ] Payment flow works on donate subdomain
- [ ] Leaderboard displays correctly

---

## 🔧 Alternative: Use Path-Based Routing (If Subdomains Don't Work)

If you're having persistent issues with subdomains on Coolify, you can temporarily use path-based routing:

### Option 1: Keep it simple with `/donate`
Just use `maceazy.com/donate` instead of `donate.maceazy.com`

No changes needed - the route already works!

### Option 2: Set up a redirect
In Coolify, add a redirect rule:
```
donate.maceazy.com → maceazy.com/donate
```

---

## 📞 Need Help?

If issues persist after following this guide:

1. **Check Coolify logs**: Application logs, proxy logs
2. **Verify environment variables**: Ensure all required vars are set
3. **Test DNS propagation**: Use https://dnschecker.org
4. **Check build output**: Look for Next.js build errors
5. **Contact Coolify support**: Share your configuration

---

## 🎉 Expected Result

After proper configuration:

- **Main Site**: https://maceazy.com → Homepage, products, etc.
- **Donate Portal**: https://donate.maceazy.com → Donation page
- **Success Page**: https://donate.maceazy.com/success → Donation success

Both domains point to the same Next.js app, but middleware routes them to different pages!
