# Store Subdomain Quick Reference

## 🔗 URLs

### Production
- **Main Site**: https://maceazy.com
- **Store**: https://store.maceazy.com (NEW)
- **Donate**: https://donate.maceazy.com
- **Legacy**: https://products.maceazy.com → redirects to store.maceazy.com

### Local Development
- **Main Site**: http://localhost:3000 or http://maceazy.localhost:3000
- **Store**: http://store.localhost:3000
- **Donate**: http://donate.localhost:3000
- **Legacy**: http://products.localhost:3000 → redirects to store.localhost:3000

---

## 🎯 What's Where

### Main Site (maceazy.com)
- Homepage
- About
- Contact
- Gallery
- General information

### Store Subdomain (store.maceazy.com)
- Product catalog
- Product details
- Shopping cart
- Checkout
- User authentication (login/signup/profile)
- Order history

### Donate Subdomain (donate.maceazy.com)
- Donation portal
- Payment processing
- Donor leaderboard
- Success pages

---

## 🚀 Navigation Flow

```
User clicks "Products" anywhere
  → Redirects to store.maceazy.com
  → Shows product catalog

User clicks "Donate" anywhere
  → Redirects to donate.maceazy.com
  → Shows donation page

User visits products.maceazy.com (legacy)
  → 301 redirect to store.maceazy.com
  → Browser URL updates to store.*
```

---

## 💻 Development Setup

### 1. Edit Hosts File

**Windows** (`C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1    maceazy.localhost
127.0.0.1    store.localhost
127.0.0.1    donate.localhost
127.0.0.1    products.localhost
```

**Mac/Linux** (`/etc/hosts`):
```
127.0.0.1    maceazy.localhost
127.0.0.1    store.localhost
127.0.0.1    donate.localhost
127.0.0.1    products.localhost
```

### 2. Start Dev Server
```bash
bun dev
```

### 3. Test URLs
```bash
# Main site
http://maceazy.localhost:3000

# Store (NEW)
http://store.localhost:3000

# Donate
http://donate.localhost:3000

# Legacy redirect test
http://products.localhost:3000  # Should redirect to store.localhost:3000
```

---

## 📋 Deployment Steps

### 1. DNS Configuration (Cloudflare/GoDaddy/etc)
```
Type: CNAME
Name: store
Value: cname.vercel-dns.com
TTL: Auto
```

Keep existing:
```
Type: CNAME
Name: products
Value: cname.vercel-dns.com
TTL: Auto
```

### 2. Vercel Dashboard
1. Go to **Settings → Domains**
2. Click **Add Domain**
3. Enter: `store.maceazy.com`
4. Wait for SSL provisioning (5-10 min)
5. Keep `products.maceazy.com` in domain list (for redirects)

### 3. Deploy
```bash
git add .
git commit -m "Migrate to store subdomain"
git push origin main
```

Vercel auto-deploys on push.

---

## ✅ Testing Checklist

### Local
- [ ] Store subdomain loads: `http://store.localhost:3000`
- [ ] Products page works: `http://store.localhost:3000/`
- [ ] Product details work: `http://store.localhost:3000/product-slug`
- [ ] Login accessible: `http://store.localhost:3000/login`
- [ ] Cart works on store subdomain
- [ ] Legacy redirects: `products.localhost` → `store.localhost`

### Production
- [ ] Store subdomain loads: `https://store.maceazy.com`
- [ ] SSL certificate valid
- [ ] Products page works
- [ ] Cart and checkout functional
- [ ] Auth flows work (login/signup/profile)
- [ ] Legacy redirects: `products.maceazy.com` → `store.maceazy.com`
- [ ] SEO: Check 301 redirect status code

---

## 🐛 Troubleshooting

### Issue: "store.localhost" not working
**Fix**: 
```bash
# 1. Check hosts file has entry
# 2. Restart browser
# 3. Clear DNS cache (Windows):
ipconfig /flushdns
# Mac:
sudo dscacheutil -flushcache
```

### Issue: "products.*" not redirecting
**Fix**:
```bash
# 1. Check middleware.ts deployed
# 2. Clear browser cache
# 3. Check Vercel logs
# 4. Test in incognito mode
```

### Issue: Cart not working on store subdomain
**Fix**:
```bash
# 1. Check ProductsNavbar loading (layout.tsx)
# 2. Verify CartContext initialized
# 3. Check browser console for errors
# 4. Verify auth cookies accessible
```

### Issue: 404 on store subdomain routes
**Fix**:
```bash
# 1. Verify middleware rewrite rules
# 2. Check /app/products/page.tsx exists
# 3. Review Vercel deployment logs
# 4. Test route locally first
```

---

## 📱 Component Mapping

### Navbar Selection (layout.tsx)
```typescript
store.* or products.* → ProductsNavbar
donate.* → Navbar
maceazy.com → Navbar
```

### State Management
```typescript
// Navbar.tsx and ProductsNavbar.tsx
isStoreDomain = store.* || products.*
storeDomainUrl = "https://store.maceazy.com"
```

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Subdomain routing, legacy redirect |
| `src/components/Navbar.tsx` | Main site navigation |
| `src/components/products/ProductsNavbar.tsx` | Store navigation |
| `src/app/layout.tsx` | Navbar selection logic |
| `SUBDOMAIN_SETUP.md` | Full deployment guide |
| `STORE_SUBDOMAIN_MIGRATION.md` | Migration details |

---

## 📞 Need Help?

1. Check Vercel logs: https://vercel.com/dashboard
2. Test DNS propagation: https://dnschecker.org
3. Review middleware logic locally
4. Contact: dev@maceazy.com

---

**Quick Start**: 
1. Update hosts file
2. Run `bun dev`
3. Visit `http://store.localhost:3000`
4. Done! 🎉
