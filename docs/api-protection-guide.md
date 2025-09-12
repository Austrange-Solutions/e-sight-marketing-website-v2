# API Route Protection Documentation

## Overview
All API routes are now protected by middleware that automatically redirects unauthorized access to the home page (`/`).

## Protection Categories

### 🟢 Public API Routes (No Authentication Required)
These routes can be accessed by anyone:
- `/api/users/login` - User login
- `/api/users/signup` - User registration  
- `/api/users/verify` - Email verification
- `/api/users/verifyemail` - Email verification confirmation
- `/api/users/forgotpassword` - Password reset request
- `/api/users/resetpassword` - Password reset confirmation
- `/api/users/resend-code` - Resend verification code
- `/api/products` - Public product listing
- `/api/validate-pincode` - Public pincode validation
- `/api/admin/login` - Admin login

### 🔴 Admin API Routes (Admin Authentication Required)
These routes require admin authentication via `admin-token` cookie:
- `/api/admin/orders` - Order management
- `/api/admin/products` - Product management
- `/api/admin/users` - User management
- `/api/admin/stats` - Dashboard statistics
- `/api/admin/settings` - System settings
- `/api/admin/delivery-areas` - Delivery area management
- `/api/admin/verify` - Admin verification

### 🔵 User API Routes (User Authentication Required)
These routes require user authentication via `token` cookie:
- `/api/users/profile` - User profile management
- `/api/users/logout` - User logout
- `/api/cart` - Shopping cart operations
- `/api/checkout` - Checkout process
- `/api/orders` - User order management
- `/api/razorpay` - Payment processing
- `/api/upload` - File uploads
- `/api/images` - Image management
- `/api/aws` - AWS operations

## How It Works

### 1. Route Classification
The middleware automatically classifies incoming API requests into one of the three categories above.

### 2. Authentication Check
- **Public Routes**: Allowed without any checks
- **Admin Routes**: Validates `admin-token` cookie and checks `isAdmin` flag
- **User Routes**: Validates `token` cookie and checks user ID
- **Unlisted Routes**: Automatically protected (redirected to home)

### 3. Response Handling
- **Authorized**: Request proceeds normally
- **Unauthorized**: Automatic redirect to home page (`/`)

## Security Features

### ✅ Comprehensive Protection
- All API routes are protected by default
- Only explicitly listed routes are accessible
- JWT token validation for authentication
- Automatic home page redirect for unauthorized access

### ✅ Logging
- All unauthorized access attempts are logged
- Successful authentications are logged
- Clear reason codes for debugging

### ✅ Token Validation
- Proper JWT signature verification
- Token expiry checking
- Role-based access control (admin vs user)

## Example Scenarios

### ❌ Unauthorized Access
```
Request: GET http://localhost:3000/api/users/profile
Cookie: (no token)
Result: Redirect to http://localhost:3000/
Log: "🚫 Unauthorized API access attempt: /api/users/profile - No user token"
```

### ❌ Invalid Admin Access
```
Request: GET http://localhost:3000/api/admin/orders
Cookie: token=user_token (not admin)
Result: Redirect to http://localhost:3000/
Log: "🚫 Unauthorized API access attempt: /api/admin/orders - Invalid admin token"
```

### ✅ Valid User Access
```
Request: GET http://localhost:3000/api/users/profile
Cookie: token=valid_user_token
Result: API response (profile data)
Log: "✅ User API access granted: /api/users/profile"
```

### ✅ Public Access
```
Request: GET http://localhost:3000/api/products
Cookie: (none required)
Result: API response (product list)
Log: (no log - public route)
```

## Configuration

### Environment Variables Required
```env
TOKEN_SECRET=your-jwt-secret-key
```

### Middleware Configuration
The middleware runs on all routes except static files:
- Static files (`_next/static/*`)
- Image optimization (`_next/image/*`)
- Favicon (`favicon.ico`)
- Image files (`*.png`, `*.jpg`, etc.)

## Testing the Protection

### 1. Test Unauthorized Access
```bash
curl http://localhost:3000/api/users/profile
# Should redirect to home page
```

### 2. Test Admin Protection
```bash
curl http://localhost:3000/api/admin/orders
# Should redirect to home page without admin-token
```

### 3. Test Public Routes
```bash
curl http://localhost:3000/api/products
# Should return product data
```

## Adding New Routes

### To Add a Public Route
Add to `PUBLIC_API_ROUTES` array in `middleware.ts`:
```typescript
const PUBLIC_API_ROUTES = [
  // ... existing routes
  '/api/new-public-route',
];
```

### To Add an Admin Route
Add to `ADMIN_API_ROUTES` array in `middleware.ts`:
```typescript
const ADMIN_API_ROUTES = [
  // ... existing routes
  '/api/admin/new-admin-route',
];
```

### To Add a User Route
Add to `USER_API_ROUTES` array in `middleware.ts`:
```typescript
const USER_API_ROUTES = [
  // ... existing routes
  '/api/new-user-route',
];
```

## Security Best Practices

1. **Principle of Least Privilege**: Only necessary routes are public
2. **Default Deny**: Unlisted routes are automatically protected
3. **Proper Authentication**: JWT validation with proper secret
4. **Clear Logging**: All access attempts are logged for monitoring
5. **Graceful Handling**: Redirects instead of exposing API errors

## Monitoring

Check application logs for:
- `🚫 Unauthorized API access attempt` - Security threats
- `✅ Admin/User API access granted` - Successful authentications
- Monitor unusual patterns in unauthorized access attempts

This protection system ensures that your entire API surface is secure by default while maintaining usability for legitimate users and admins.