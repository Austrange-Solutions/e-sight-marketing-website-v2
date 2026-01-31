# 🔒 Security Deployment Checklist

Use this checklist before deploying to production to ensure all security measures are in place.

## Pre-Deployment Security Audit

### ✅ Clickjacking Protection
- [ ] X-Frame-Options: DENY header configured in `next.config.ts`
- [ ] Content-Security-Policy with frame-ancestors 'none' configured
- [ ] Tested iframe embedding (should be blocked)
- [ ] Verified headers in production environment
- [ ] Tested on all subdomains (donate.maceazy.com, etc.)

### ✅ XSS Protection
- [ ] Content-Security-Policy with strict script-src directives
- [ ] object-src 'none' configured
- [ ] base-uri 'self' configured
- [ ] form-action 'self' configured
- [ ] upgrade-insecure-requests enabled
- [ ] Input validation implemented on all forms
- [ ] Output encoding enabled for user-generated content

### ✅ HTTPS/TLS Configuration
- [ ] Strict-Transport-Security header configured
- [ ] max-age set to at least 1 year (31536000)
- [ ] includeSubDomains directive enabled
- [ ] preload directive added (optional)
- [ ] Valid SSL/TLS certificate installed
- [ ] Certificate expiry monitoring set up

### ✅ Additional Security Headers
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy configured (camera, microphone, geolocation)
- [ ] X-DNS-Prefetch-Control enabled

### ✅ Authentication & Authorization
- [ ] JWT tokens stored in httpOnly cookies
- [ ] Admin authentication separate from user authentication
- [ ] Token expiry configured (2 hours for admin tokens)
- [ ] Middleware protecting admin routes
- [ ] Password hashing with bcrypt (10+ rounds)
- [ ] Rate limiting on login endpoints

### ✅ Database Security
- [ ] MongoDB connection using TLS/SSL
- [ ] Connection string stored in environment variables
- [ ] Database user has minimum required permissions
- [ ] Connection pooling configured (maxPoolSize: 5)
- [ ] Input sanitization to prevent NoSQL injection

### ✅ API Security
- [ ] CORS configured properly
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all API routes
- [ ] Error messages don't expose sensitive information
- [ ] API keys stored in environment variables
- [ ] Webhook signature verification (Cashfree, Razorpay)

### ✅ Payment Gateway Security
- [ ] Cashfree/Razorpay credentials in environment variables
- [ ] Payment verification implemented
- [ ] Order signature validation
- [ ] Amount tampering prevention
- [ ] Test mode vs production mode clearly separated
- [ ] Payment logs sanitized (no sensitive data)

### ✅ File Upload Security
- [ ] S3 pre-signed URLs for uploads (no direct S3 access)
- [ ] File type validation (MIME type checking)
- [ ] File size limits enforced
- [ ] CloudFront for serving images (not direct S3)
- [ ] Bucket permissions restricted (not public)
- [ ] Admin-only access to upload endpoints

### ✅ Environment Variables
- [ ] All sensitive data in environment variables
- [ ] .env files in .gitignore
- [ ] Production environment variables configured separately
- [ ] No hardcoded secrets in code
- [ ] Environment variables documented

### ✅ Dependency Security
- [ ] Dependencies up to date (check with `bun outdated`)
- [ ] No known vulnerabilities (run `npm audit` or Snyk)
- [ ] Lock file committed (bun.lockb)
- [ ] Unused dependencies removed
- [ ] Package sources verified

### ✅ Error Handling
- [ ] Generic error messages for users
- [ ] Detailed errors logged server-side only
- [ ] No stack traces exposed to users
- [ ] Sentry configured for error tracking
- [ ] Error boundaries in React components

### ✅ Logging & Monitoring
- [ ] Security events logged (failed logins, etc.)
- [ ] Logs don't contain sensitive data (passwords, tokens)
- [ ] Log rotation configured
- [ ] Monitoring alerts set up (Sentry)
- [ ] Uptime monitoring configured

### ✅ Testing
- [ ] Security headers tested (`node scripts/test-security-headers.js`)
- [ ] Clickjacking protection tested (`test-clickjacking-protection.html`)
- [ ] Payment flow tested in test mode
- [ ] Admin authentication tested
- [ ] Input validation tested (SQL injection, XSS attempts)
- [ ] CSRF protection tested

## Testing Commands

```bash
# Test security headers (local)
node scripts/test-security-headers.js http://localhost:3000

# Test security headers (production)
node scripts/test-security-headers.js https://maceazy.com

# Test clickjacking protection
# Open test-clickjacking-protection.html in browser

# Check dependencies for vulnerabilities
npm audit
# or
bun audit (if available)

# Run Snyk scan (if configured)
snyk test
```

## Online Security Scanners

After deployment, run these scans:

1. **SecurityHeaders.com**
   - URL: https://securityheaders.com/?q=https://maceazy.com
   - Target Grade: A+

2. **Mozilla Observatory**
   - URL: https://observatory.mozilla.org/analyze/maceazy.com
   - Target Grade: A

3. **SSL Labs**
   - URL: https://www.ssllabs.com/ssltest/analyze.html?d=maceazy.com
   - Target Grade: A+

4. **HSTS Preload**
   - URL: https://hstspreload.org/?domain=maceazy.com
   - Status: Eligible for preload

## Post-Deployment Verification

```bash
# Check headers
curl -I https://maceazy.com | grep -E "(X-Frame-Options|Content-Security-Policy|Strict-Transport-Security)"

# Check donate subdomain
curl -I https://donate.maceazy.com | grep -E "(X-Frame-Options|Content-Security-Policy)"

# Check SSL certificate
openssl s_client -connect maceazy.com:443 -servername maceazy.com

# Test payment gateway connectivity
curl https://api.cashfree.com/pg/health
```

## Security Incident Response

If a security issue is discovered:

1. **Immediate Actions**
   - Assess severity (Critical, High, Medium, Low)
   - If critical, consider taking service offline temporarily
   - Notify team immediately

2. **Investigation**
   - Review logs for suspicious activity
   - Check Sentry for related errors
   - Document timeline of events

3. **Remediation**
   - Apply fix in development environment
   - Test thoroughly
   - Deploy to production with monitoring

4. **Post-Incident**
   - Update security documentation
   - Add tests to prevent recurrence
   - Review and update this checklist

## Security Contacts

- **Security Issues**: Report to development team
- **Sentry Dashboard**: https://austrange.sentry.io
- **Payment Gateway Support**: Cashfree/Razorpay support portals

## Regular Maintenance

- [ ] Weekly: Review Sentry errors
- [ ] Monthly: Update dependencies
- [ ] Monthly: Run security scans
- [ ] Quarterly: Full security audit
- [ ] Annually: Penetration testing (if budget allows)

## Documentation References

- `CLICKJACKING_PROTECTION.md` - Complete clickjacking defense guide
- `XSS_PROTECTION_IMPLEMENTATION.md` - XSS prevention details
- `SECURITY_AUDIT_FIXES.md` - Previous security fixes
- `docs/DEVELOPER_GUIDE.md` - Development workflows
- `.github/copilot-instructions.md` - Project architecture

---

**Last Updated**: January 24, 2026  
**Security Status**: 🟢 Production Ready  
**Compliance**: OWASP Top 10 Protected
