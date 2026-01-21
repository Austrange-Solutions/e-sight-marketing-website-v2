# 🌐 Subdomain Configuration Guide

## Setting Up donate.maceazy.com & store.maceazy.com

This guide explains how to configure your donation portal and e-commerce store to run on separate subdomains.

---

## 📋 Overview

The platform has been configured to work with **tenant subdomains**, meaning each subdomain operates as a separate entity while sharing the same codebase:
- **donate.maceazy.com** - Donation portal exclusively
- **store.maceazy.com** - E-commerce store (products, cart, checkout)
- **products.maceazy.com** - Legacy support (redirects to store.maceazy.com)

---

## 🛠️ How It Works

### Middleware Configuration

The middleware (`src/middleware.ts`) detects the subdomain and rewrites URLs:

```typescript
// When user visits: donate.maceazy.com
// → Internally serves: /donate page

// When user visits: store.maceazy.com
// → Internally serves: /products page

// When user visits: products.maceazy.com (legacy)
// → Redirects permanently to: store.maceazy.com
```

### Route Structure

```
Main Site (maceazy.com)
├── / (home)
├── /about
├── /contact
└── /gallery

Donate Subdomain (donate.maceazy.com)
├── / (donate page)
└── /success (donation success)

Store Subdomain (store.maceazy.com)
├── / (products catalog)
├── /[slug] (product details)
├── /login (authentication)
├── /signup (registration)
├── /profile (user profile)
└── /checkout (cart checkout)

Legacy Redirect (products.maceazy.com → store.maceazy.com)
```

---

## 🚀 Local Development

### Testing Subdomain Locally

Since `localhost` doesn't support subdomains natively, use one of these methods:

#### Method 1: Edit hosts file (Recommended)

**Windows:**
1. Open Notepad as Administrator
2. Open: `C:\Windows\System32\drivers\etc\hosts`
3. Add these lines:
   ```
   127.0.0.1    donate.localhost
   127.0.0.1    store.localhost
   127.0.0.1    maceazy.localhost
   ```
4. Save and close
5. Access:
   - Main site: `http://maceazy.localhost:3000`
   - Donate: `http://donate.localhost:3000`
   - Store: `http://store.localhost:3000`

**Mac/Linux:**
1. Open terminal
2. Run: `sudo nano /etc/hosts`
3. Add:
   ```
   127.0.0.1    donate.localhost
   127.0.0.1    store.localhost
   127.0.0.1    maceazy.localhost
   ```
4. Save (Ctrl+O, Enter, Ctrl+X)
5. Access:
   - Main site: `http://maceazy.localhost:3000`
   - Donate: `http://donate.localhost:3000`
   - Store: `http://store.localhost:3000`

#### Method 2: Use direct routes (Quick Testing)

For quick testing without subdomain setup:
- `http://localhost:3000/donate` - Donation portal
- `http://localhost:3000/products` - Store (products catalog)

---

## 🌍 Production Deployment

### Step 1: Deploy to Vercel

```bash
# Push your code to GitHub
git add .
git commit -m "Add subdomain donation portal"
git push origin main

# Deploy to Vercel (if not auto-deployed)
vercel --prod
```

### Step 2: Configure Domains in Vercel

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to: **Settings → Domains**
3. Add three domains:
   - `maceazy.com` (main site)
   - `donate.maceazy.com` (donation portal)
   - `store.maceazy.com` (e-commerce store)

### Step 3: Update DNS Records

Add these DNS records in your domain provider (e.g., GoDaddy, Namecheap, Cloudflare):

#### Main Domain
```
Type: A or CNAME
Name: @
Value: 76.76.21.21 (Vercel IP) or cname.vercel-dns.com
```

#### Donate Subdomain
```
Type: CNAME
Name: donate
Value: cname.vercel-dns.com
```

#### Store Subdomain
```
Type: CNAME
Name: store
Value: cname.vercel-dns.com
```

**Example for Cloudflare:**
| Type  | Name   | Content               | Proxy Status |
|-------|--------|-----------------------|--------------|
| CNAME | @      | cname.vercel-dns.com  | Proxied      |
| CNAME | donate | cname.vercel-dns.com  | Proxied      |
| CNAME | store  | cname.vercel-dns.com  | Proxied      |

### Step 4: Verify SSL

Vercel automatically provisions SSL certificates. Wait 5-10 minutes, then verify:
- ✅ https://maceazy.com (should work)
- ✅ https://donate.maceazy.com (should work)
- ✅ https://store.maceazy.com (should work)

---

## 🔗 Navigation Configuration

The navigation automatically adjusts based on subdomain:

### Development
```typescript
// Main site (localhost:3000)
- Products link → http://store.localhost:3000
- Donate link → http://donate.localhost:3000

// Store subdomain (store.localhost:3000)
- Auth available (login/signup/profile)
- Cart and checkout accessible
- Other links → main site

// Donate subdomain (donate.localhost:3000)
- Focused donation experience
- Links back to main site for navigation
```

### Production
```typescript
// Main site (maceazy.com)
- Products link → https://store.maceazy.com
- Donate link → https://donate.maceazy.com

// Store subdomain (store.maceazy.com)
- Auth available (login/signup/profile)
- Cart and checkout accessible
- Other links → main site

// Donate subdomain (donate.maceazy.com)
- Focused donation experience
- Links back to main site
```

---

## 🧪 Testing Checklist

### Local Testing
- [ ] Main site loads at `http://localhost:3000` or `http://maceazy.localhost:3000`
- [ ] Donate page loads at `http://donate.localhost:3000`
- [ ] Store page loads at `http://store.localhost:3000`
- [ ] Products navigation redirects to store subdomain
- [ ] Donate button redirects to donate subdomain
- [ ] Auth (login/signup/profile) works on store subdomain
- [ ] Cart and checkout accessible on store subdomain
- [ ] Legacy products.localhost redirects to store.localhost

### Production Testing
- [ ] Main site loads at `https://maceazy.com`
- [ ] Donate subdomain loads at `https://donate.maceazy.com`
- [ ] Store subdomain loads at `https://store.maceazy.com`
- [ ] SSL certificates are valid for all domains
- [ ] Cross-subdomain navigation works
- [ ] Auth flows work correctly on store subdomain
- [ ] Cart persists across store subdomain navigation
- [ ] Payment flows work end-to-end
- [ ] Donation flows work end-to-end
- [ ] Legacy products.maceazy.com redirects to store.maceazy.com

---

## 🔧 Troubleshooting

### Issue: Subdomain not working locally
**Solution**: 
- Check `hosts` file has correct entries (`donate.localhost`, `store.localhost`)
- Restart browser after editing hosts
- Clear browser cache
- Use full URL: `http://store.localhost:3000` (not `http://store:3000`)

### Issue: Subdomain not working in production
**Solution**:
- Verify DNS records are correct (both donate and store CNAMEs)
- Wait 24-48 hours for DNS propagation
- Check Vercel domain settings (all three domains added)
- Ensure SSL is provisioned for all domains

### Issue: products.maceazy.com not redirecting
**Solution**:
- Check middleware.ts redirect logic
- Verify legacy products subdomain DNS record exists
- Clear browser cache
- Check Vercel deployment logs

### Issue: Cart not working on store subdomain
**Solution**:
- Verify ProductsNavbar is loaded (check layout.tsx)
- Check CartContext is properly initialized
- Verify auth cookies are accessible
- Check browser console for errors

### Issue: 404 on store subdomain
**Solution**:
- Check middleware.ts is deployed
- Verify rewrite rules for `/products` routes
- Check Vercel logs for routing errors
- Ensure products page exists at `/app/products/page.tsx`

---

## 📱 Mobile Considerations

Navigation is fully responsive across all subdomains:

**Desktop:**
- Navbar shows subdomain-specific links
- Store subdomain includes cart icon
- Donate subdomain focused on donation CTA
- Hover effects and smooth transitions

**Mobile:**
- Hamburger menu adapts to current subdomain
- Full-width buttons for easy tapping
- Cart accessible from mobile menu on store subdomain
- Consistent styling across all subdomains

---

## 🔐 Security Notes

1. **HTTPS Only**: All subdomains automatically use HTTPS in production
2. **CORS**: Middleware handles cross-origin properly between subdomains
3. **Session Isolation**: Auth cookies scoped to appropriate subdomains
4. **Payment Security**: Cashfree/Razorpay work seamlessly across subdomains
5. **Legacy Redirect**: products.* redirects preserve query parameters

---

## 📊 Analytics Setup

If using Google Analytics, track all subdomains:

```javascript
// Google Analytics tracking for multi-subdomain setup
gtag('config', 'GA_MEASUREMENT_ID', {
  'cookie_domain': '.maceazy.com',  // Note the leading dot for subdomain tracking
  'cookie_flags': 'SameSite=None;Secure'
});
```

Track subdomain separately:
- Main: `maceazy.com`
- Donate: `donate.maceazy.com`

---

## 🎯 SEO Considerations

### Canonical URLs
Add to donate pages:
```html
<link rel="canonical" href="https://donate.maceazy.com" />
```

### Robots.txt
```
User-agent: *
Allow: /

Sitemap: https://maceazy.com/sitemap.xml
Sitemap: https://donate.maceazy.com/sitemap.xml
```

---

## 🚦 Environment Variables

No changes needed! The same `.env.local` works for all subdomains:
- Main site
- Donate subdomain
- Store subdomain

They share:
- MongoDB connection
- Payment gateway keys (Cashfree/Razorpay)
- NextAuth configuration
- AWS S3/CloudFront credentials

---

## 📋 Deployment Checklist

Before going live:

- [ ] Code pushed to GitHub
- [ ] Vercel project deployed
- [ ] Main domain added: `maceazy.com`
- [ ] Donate subdomain added: `donate.maceazy.com`
- [ ] Store subdomain added: `store.maceazy.com`
- [ ] DNS records configured (all three)
- [ ] SSL certificates verified (all three)
- [ ] Store navigation tested (products, cart, checkout)
- [ ] Donate button tested (both environments)
- [ ] Auth flows tested (login, signup, profile on store)
- [ ] Payment flows tested (both store and donate)
- [ ] Legacy products.* redirect tested
- [ ] Mobile responsive checked (all subdomains)
- [ ] Analytics tracking setup (multi-subdomain)

---

## 🎉 Success!

Once configured, users can:
- Visit `maceazy.com` for your main marketing site
- Visit `store.maceazy.com` for e-commerce shopping
- Visit `donate.maceazy.com` for focused donation experience
- Legacy `products.maceazy.com` automatically redirects to store

**Benefits:**
- ✅ Clean separation of marketing, commerce, and donations
- ✅ Dedicated URLs for each purpose
- ✅ Easy to share: `store.maceazy.com`, `donate.maceazy.com`
- ✅ Professional multi-tenant architecture
- ✅ Better SEO and conversion rates
- ✅ Backward compatibility with old product links

---

## 📞 Support

For issues:
1. Check Vercel logs
2. Review middleware.ts for routing logic
3. Verify DNS propagation for all subdomains
4. Test cross-subdomain navigation
5. Contact: support@maceazy.com

---

**Last Updated**: January 2026  
**Version**: 2.0.0 (Store subdomain added)
