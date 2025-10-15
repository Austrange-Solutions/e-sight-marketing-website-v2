# 🌐 Subdomain Configuration Guide

## Setting Up donate.maceazy.com

This guide explains how to configure your donation portal to run on a subdomain (e.g., `donate.maceazy.com`).

---

## 📋 Overview

The donation portal has been configured to work as a **tenant subdomain**, meaning it operates as a separate entity while sharing the same codebase. When users visit `donate.maceazy.com`, they'll see the donation portal exclusively.

---

## 🛠️ How It Works

### Middleware Configuration

The middleware (`src/middleware.ts`) detects the subdomain and rewrites URLs:

```typescript
// When user visits: donate.maceazy.com
// → Internally serves: /donate page

// When user visits: donate.maceazy.com/success
// → Internally serves: /donate/success page
```

### Route Structure

```
Main Site (maceazy.com)
├── / (home)
├── /products
├── /about
└── /contact

Donate Subdomain (donate.maceazy.com)
├── / (donate page)
└── /success (donation success)
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
   127.0.0.1    maceazy.localhost
   ```
4. Save and close
5. Access:
   - Main site: `http://maceazy.localhost:3000`
   - Donate: `http://donate.localhost:3000`

**Mac/Linux:**
1. Open terminal
2. Run: `sudo nano /etc/hosts`
3. Add:
   ```
   127.0.0.1    donate.localhost
   127.0.0.1    maceazy.localhost
   ```
4. Save (Ctrl+O, Enter, Ctrl+X)
5. Access:
   - Main site: `http://maceazy.localhost:3000`
   - Donate: `http://donate.localhost:3000`

#### Method 2: Use /donate route (Quick Testing)

For quick testing, just use:
- `http://localhost:3000/donate` - Works directly without subdomain

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
3. Add two domains:
   - `maceazy.com` (main site)
   - `donate.maceazy.com` (donation portal)

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

**Example for Cloudflare:**
| Type  | Name   | Content               | Proxy Status |
|-------|--------|-----------------------|--------------|
| CNAME | @      | cname.vercel-dns.com  | Proxied      |
| CNAME | donate | cname.vercel-dns.com  | Proxied      |

### Step 4: Verify SSL

Vercel automatically provisions SSL certificates. Wait 5-10 minutes, then verify:
- ✅ https://maceazy.com (should work)
- ✅ https://donate.maceazy.com (should work)

---

## 🔗 Donate Button Configuration

The "Donate" button automatically adjusts based on environment:

### Development
```typescript
href={process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/donate' 
  : 'https://donate.maceazy.com'}
```
- Local: Opens `/donate` route
- Opens in same tab for testing

### Production
- Production: Opens `https://donate.maceazy.com`
- Opens in new tab (`target="_blank"`)

### Button Locations
The donate button appears in:
1. **Homepage Hero** - Primary CTA alongside "Explore Products"
2. **Navbar** - Top right, always visible (desktop)
3. **Mobile Menu** - Inside hamburger menu (mobile)

---

## 🎨 Styling

The donate button uses a distinctive green gradient to stand out:

```css
bg-gradient-to-r from-green-500 to-emerald-600
hover:from-green-600 hover:to-emerald-700
```

With heart emoji: ❤️ Donate

---

## 🧪 Testing Checklist

### Local Testing
- [ ] Main site loads at `http://localhost:3000`
- [ ] Donate page loads at `http://localhost:3000/donate`
- [ ] Donate button in hero redirects correctly
- [ ] Donate button in navbar redirects correctly
- [ ] Donate button in mobile menu works
- [ ] Success page loads at `http://localhost:3000/donate/success`

### Production Testing
- [ ] Main site loads at `https://maceazy.com`
- [ ] Donate subdomain loads at `https://donate.maceazy.com`
- [ ] Donate button opens in new tab
- [ ] SSL certificates are valid
- [ ] Success page loads at `https://donate.maceazy.com/success`
- [ ] Payment flow works end-to-end
- [ ] Leaderboard displays on donate subdomain

---

## 🔧 Troubleshooting

### Issue: Subdomain not working locally
**Solution**: 
- Check `hosts` file has correct entries
- Restart browser after editing hosts
- Clear browser cache
- Use `http://donate.localhost:3000` (not `http://donate:3000`)

### Issue: Subdomain not working in production
**Solution**:
- Verify DNS records are correct
- Wait 24-48 hours for DNS propagation
- Check Vercel domain settings
- Ensure SSL is provisioned

### Issue: Donate button opens wrong URL
**Solution**:
- Check `NODE_ENV` environment variable
- In production, ensure it's set to `production`
- Redeploy if needed

### Issue: 404 on donate subdomain
**Solution**:
- Check middleware.ts is deployed
- Verify rewrite rules are working
- Check Vercel logs for errors

---

## 📱 Mobile Considerations

The donate button is fully responsive:

**Desktop:**
- Appears in navbar next to other links
- Gradient button with heart emoji
- Hover effects

**Mobile:**
- Appears in hamburger menu
- Full-width button for easy tapping
- Same gradient styling

---

## 🔐 Security Notes

1. **HTTPS Only**: Subdomain automatically uses HTTPS in production
2. **CORS**: Middleware handles cross-origin properly
3. **Session Sharing**: No cookies shared between subdomains (secure)
4. **Razorpay**: Works seamlessly across subdomain

---

## 📊 Analytics Setup

If using Google Analytics, add both domains:

```javascript
// Google Analytics tracking
gtag('config', 'GA_MEASUREMENT_ID', {
  'cookie_domain': 'maceazy.com',
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

No changes needed! The same `.env.local` works for both:
- Main site
- Donate subdomain

They share:
- MongoDB connection
- Razorpay keys
- NextAuth configuration

---

## 📋 Deployment Checklist

Before going live:

- [ ] Code pushed to GitHub
- [ ] Vercel project deployed
- [ ] Main domain added: `maceazy.com`
- [ ] Subdomain added: `donate.maceazy.com`
- [ ] DNS records configured
- [ ] SSL certificates verified
- [ ] Donate button tested (both environments)
- [ ] Payment flow tested
- [ ] Leaderboard working
- [ ] Success page accessible
- [ ] Mobile responsive checked
- [ ] Analytics tracking setup

---

## 🎉 Success!

Once configured, users can:
- Visit `maceazy.com` for your main e-commerce site
- Visit `donate.maceazy.com` for focused donation experience
- Click "Donate" button anywhere to contribute

**Benefits:**
- ✅ Clean separation of donation vs commerce
- ✅ Dedicated donation URL for marketing
- ✅ Easy to share: `donate.maceazy.com`
- ✅ Professional appearance
- ✅ Better conversion rates

---

## 📞 Support

For issues:
1. Check Vercel logs
2. Review middleware.ts
3. Verify DNS propagation
4. Contact: support@maceazy.com

---

**Last Updated**: January 2024  
**Version**: 1.0.0
