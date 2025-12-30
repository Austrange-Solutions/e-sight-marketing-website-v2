# AWS S3 Region Configuration Fix

## Problem
- S3 bucket is in **ap-south-1** (Asia Pacific Mumbai)
- Pre-signed URLs were being generated with **us-east-1** region
- This caused **301 redirect errors** in production
- CloudFront couldn't access the redirected URLs

## Root Cause
Multiple S3 client initializations were using inconsistent region environment variables:
- Some used `process.env.AWS_REGION` (defaults to `us-east-1` if not set)
- Some used `process.env.S3_REGION`
- No fallback consistency

## Solution Applied
✅ Standardized all S3 client initializations to use:
```typescript
region: process.env.S3_REGION || process.env.AWS_REGION || "ap-south-1"
```

**Files updated:**
1. `src/lib/s3-presigned.ts`
2. `src/app/api/resources/route.ts`
3. `src/app/api/resources/[id]/route.ts`

**Files already correct:**
- `src/app/api/aws/route.ts` - Uses `S3_REGION`
- `src/app/api/images/generate-presigned-url/route.ts` - Uses `S3_REGION`
- `src/app/api/disabled-registration/upload/route.ts` - Uses `S3_REGION`
- `src/app/api/aws/signed-upload/route.ts` - Uses `S3_REGION`
- `src/app/api/aws/upload/route.ts` - Uses `S3_REGION`
- `src/app/api/aws/delete/route.ts` - Uses `S3_REGION`
- `src/app/api/aws/validate/route.ts` - Uses `S3_REGION`

## Environment Variable Requirements
⚠️ **IMPORTANT:** The credentials shown below are examples only. Use your actual AWS credentials from environment variables.

Your `.env` file should have:
```env
S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=****************************************
S3_BUCKET=austrange-storage
S3_PREFIX=e-sight-ecommerce-product-images/
CLOUDFRONT_DOMAIN=https://dw9tsoyfcyk5k.cloudfront.net
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=https://dw9tsoyfcyk5k.cloudfront.net
```

## What to Verify in Production
1. **Ensure environment variables are set** in your deployment platform (Coolify, Vercel, etc.)
   - `S3_REGION=ap-south-1` ✅
   - `AWS_ACCESS_KEY_ID` ✅
   - `AWS_SECRET_ACCESS_KEY` ✅
   
2. **Test pre-signed URL generation:**
   - URLs should now show: `austrange-storage.s3.ap-south-1.amazonaws.com`
   - NOT: `austrange-storage.s3.us-east-1.amazonaws.com`

3. **Clear CloudFront cache** if old URLs are cached

## How Pre-Signed URLs Should Look After Fix
```
https://austrange-storage.s3.ap-south-1.amazonaws.com/e-sight-ecommerce-product-images/...
?X-Amz-Algorithm=AWS4-HMAC-SHA256
&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20251128%2Fap-south-1%2Fs3%2Faws4_request
```

Notice: `ap-south-1` instead of `us-east-1`
