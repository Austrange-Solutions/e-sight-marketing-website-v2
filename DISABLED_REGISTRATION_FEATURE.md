# Disabled Person Registration Feature

## Overview
A comprehensive registration and verification system for disabled persons to access special benefits and services. This feature includes document upload, admin verification, and email notifications with full accessibility support.

## Features Implemented

### 1. Mongoose Model
**File**: `src/models/disabledPersonModel.ts`

- Complete schema for disabled person registration
- Supports all Indian government disability types
- Document management for multiple file types
- Verification status tracking with history
- Built-in validation for Indian phone numbers, pincodes, and emails

**Fields**:
- Personal Information: fullName, email, phone, dateOfBirth, gender
- Address: address, city, state, pincode
- Disability Info: disabilityType, disabilityPercentage, otherDisabilityDetails
- Documents: passportPhoto, aadharCard, panCard, disabilityCertificate, udidCard, additionalDocuments
- Verification: verificationStatus (pending/under_review/verified/rejected), verificationHistory, adminNotes, rejectionReason

### 2. Frontend Registration Form
**Files**:
- `src/app/disabled-registration/page.tsx` - Server component with SEO and structured data
- `src/components/DisabledRegistrationForm.tsx` - Client component with full accessibility

**Accessibility Features**:
- ✅ Proper ARIA labels on all form inputs
- ✅ `aria-required` attributes for mandatory fields
- ✅ Semantic HTML with proper roles (main, header, footer, banner)
- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ High contrast mode support
- ✅ Clear validation messages
- ✅ Structured data (schema.org) for SEO

**Form Sections**:
1. Personal Information (name, email, phone, DOB, gender)
2. Address Information (full Indian address with state dropdown)
3. Disability Information (type, percentage, additional details)
4. Document Upload (with real-time upload status)

**Validation**:
- Minimum 40% disability percentage requirement
- 10-digit Indian phone number validation
- 6-digit pincode validation
- File size limit (10MB per file)
- File type validation (images and PDF only)
- At least one ID proof (Aadhar or PAN) required

### 3. AWS S3 Document Upload
**File**: `src/app/api/disabled-registration/upload/route.ts`

- Uploads to dedicated folder: `e-sight/disabled-docs/{documentType}/`
- Supports images (JPEG, PNG, WebP, GIF) and PDF files
- Signed URL generation for secure uploads
- CloudFront URL return for document access
- Document type segregation (passportPhoto, aadharCard, etc.)

### 4. Registration API Routes
**Files**:
- `src/app/api/disabled-registration/register/route.ts` - POST registration with Zod validation
- `src/app/api/disabled-registration/status/route.ts` - GET status check by email or ID
- `src/app/api/disabled-registration/status/[id]/route.ts` - GET status check (legacy)

**Registration Flow**:
1. Validate all required fields with Zod schema
2. Check for duplicate email/phone
3. Create disabled person record with "pending" status
4. Send confirmation email with registration ID
5. Return registration ID for status tracking

**Zod Validation**: 
- Server-side validation using Zod schema
- Detailed error messages for each field
- Type-safe validation
- See `src/lib/validations/disabled-registration.ts` for complete schema

### 5. Admin Panel Integration
**Files**:
- `src/app/api/admin/disabled-persons/route.ts` - GET all registrations
- `src/app/api/admin/disabled-persons/[id]/route.ts` - GET/PATCH individual record
- `src/components/admin/DisabledPersonsManagement.tsx` - Admin list view component
- `src/app/admin/dashboard/disabled-persons/[id]/page.tsx` - Individual person detail page
- `src/app/admin/dashboard/page.tsx` - Main dashboard with "Disabled Persons" tab

**Admin Features**:
- ✅ View all disabled person registrations in a table
- ✅ Search by name, email, or phone
- ✅ Filter by verification status (pending/under_review/verified/rejected)
- ✅ Status count summary at top
- ✅ Click row to view detailed information
- ✅ View detailed information and all documents with preview
- ✅ Update verification status with admin comments
- ✅ Document viewer with download links
- ✅ Complete verification history timeline
- ✅ Automatic email notifications on status change
- ✅ Mobile responsive design

**Admin UI Components**:
1. **List View** (`DisabledPersonsManagement.tsx`)
   - Searchable and filterable table
   - Shows key info: name, contact, disability, location, status
   - Click to navigate to detail page
   - Mobile card view for small screens

2. **Detail View** (`disabled-persons/[id]/page.tsx`)
   - Complete personal information
   - Address details
   - Disability information with description
   - Guardian & emergency contact details
   - All uploaded documents with preview
   - Status update form with comments
   - Verification history timeline
   - Metadata (submission date, last update, verification date)

**Authentication**: All admin routes use `getAdminFromRequest` middleware

### 6. Email Notification System
**File**: `src/helpers/resendEmail.ts`

**Email Templates**:
1. **Registration Confirmation** (`sendDisabledRegistrationEmail`)
   - Sent immediately after registration
   - Includes registration ID and status check link
   - Timeline expectation (3-5 business days)

2. **Status Update** (`sendDisabledStatusUpdateEmail`)
   - Sent when admin changes verification status
   - Different templates for under_review/verified/rejected
   - Includes admin comments if provided
   - Color-coded based on status

**Email Features**:
- Responsive HTML design
- Brand colors (MACEAZY primary blue)
- Clear call-to-action buttons
- Registration ID prominently displayed
- Mobile-friendly layout

### 7. Status Check Page
**Files**:
- `src/app/disabled-registration/status/page.tsx` - Server component with SEO
- `src/components/StatusCheckForm.tsx` - Client component for status lookup

**Features**:
- ✅ Search by email address or registration ID
- ✅ Radio button selection for search type
- ✅ Display complete registration details
- ✅ Show current verification status with color coding
- ✅ Display verification history timeline
- ✅ Show all personal and disability information
- ✅ Status explanation section (pending, under review, verified, rejected)
- ✅ Mobile responsive design

**Status Display**:
- Personal information (name, email, phone)
- Disability details (type, percentage)
- Submission and update dates
- Complete status history with admin comments
- Color-coded status badges (blue=pending, yellow=under review, green=verified, red=rejected)

### 8. Zod Validation System
**File**: `src/lib/validations/disabled-registration.ts`

**Validation Features**:
- ✅ Comprehensive validation schema for all form fields
- ✅ Indian phone number validation (10-digit mobile)
- ✅ Pincode validation (6-digit)
- ✅ Email validation with lowercase normalization
- ✅ Age validation (1-120 years)
- ✅ Disability percentage validation (40-100%)
- ✅ File validation (fileName, fileUrl, fileSize)
- ✅ At least one ID proof required (Aadhar or PAN)
- ✅ Server-side and client-side reusable schema
- ✅ Detailed error messages for each field
- ✅ Type inference for TypeScript

**Schema Exports**:
- `disabledRegistrationSchema` - Main registration validation
- `statusCheckSchema` - Status lookup validation
- `DisabledRegistrationFormData` - TypeScript type
- `StatusCheckFormData` - TypeScript type

### 9. Home Page Integration
**File**: `src/components/HomePage/HomeHero.tsx`

Added "Register as Disabled Person" button in the hero section with:
- Emerald-to-teal gradient styling
- Accessible hover states
- Proper link to registration page
- Positioned alongside existing CTAs

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/disabled-registration/upload` | Upload document to S3 | Public |
| POST | `/api/disabled-registration/register` | Submit registration (with Zod validation) | Public |
| GET | `/api/disabled-registration/status?email=` | Check status by email | Public |
| GET | `/api/disabled-registration/status?id=` | Check status by registration ID | Public |
| GET | `/api/disabled-registration/status/[id]` | Check status (legacy) | Public |
| GET | `/api/admin/disabled-persons` | List all registrations | Admin |
| GET | `/api/admin/disabled-persons/[id]` | Get person details | Admin |
| PATCH | `/api/admin/disabled-persons/[id]` | Update verification status | Admin |

## Database Schema

```typescript
DisabledPerson {
  _id: ObjectId
  fullName: String (required, 2-100 chars)
  email: String (required, unique, validated)
  phone: String (required, unique, 10 digits)
  dateOfBirth: Date (required)
  gender: "Male" | "Female" | "Other" (required)
  address: String (required)
  addressLine2: String (optional)
  city: String (required)
  state: String (required, Indian states)
  pincode: String (required, 6 digits)
  disabilityType: DisabilityType (required)
  disabilityPercentage: Number (required, 40-100)
  otherDisabilityDetails: String (optional)
  documents: {
    passportPhoto: DocumentType (required)
    aadharCard: DocumentType (optional)
    panCard: DocumentType (optional)
    disabilityCertificate: DocumentType (required)
    udidCard: DocumentType (optional)
    additionalDocuments: DocumentType[] (optional)
  }
  verificationStatus: "pending" | "under_review" | "verified" | "rejected"
  verificationHistory: [{
    status: String
    updatedBy: String
    updatedAt: Date
    comments: String
  }]
  adminNotes: String (optional)
  rejectionReason: String (optional)
  verifiedAt: Date (optional)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}

DocumentType {
  fileUrl: String (CloudFront URL)
  fileName: String
  fileSize: Number (bytes)
  fileType: String (MIME type)
  uploadedAt: Date
}
```

## Disability Types Supported
As per Indian Government guidelines:
1. Visual Impairment
2. Hearing Impairment
3. Locomotor Disability
4. Intellectual Disability
5. Mental Illness
6. Multiple Disabilities
7. Other (with text description)

## Verification Workflow

1. **User Submits Registration**
   - Fills form with personal details
   - Uploads required documents
   - Receives confirmation email with registration ID

2. **Admin Review**
   - Admin views registration in dashboard
   - Reviews all documents and information
   - Changes status to "under_review"
   - User receives email notification

3. **Verification Decision**
   - **Approved**: Status → "verified", user gets verification email
   - **Rejected**: Status → "rejected" with reason, user gets email with instructions

4. **Email Notifications**
   - Sent at each status change
   - Contains registration ID
   - Includes status check link
   - Shows admin comments if any

## Accessibility Compliance

### WCAG 2.1 Level AA Features:
- ✅ Semantic HTML5 structure
- ✅ Proper heading hierarchy
- ✅ ARIA labels and landmarks
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader announcements
- ✅ High contrast text
- ✅ Clear error messages
- ✅ Form validation feedback
- ✅ Alternative text for icons

### Screen Reader Support:
- Form fields have descriptive labels
- Required fields clearly marked
- Status updates announced with `aria-live`
- Upload progress communicated
- Errors announced immediately

## Security Features

1. **Document Storage**
   - Files stored in private S3 folder: `e-sight/disabled-docs/`
   - CloudFront URLs for secure access
   - File type validation
   - File size limits (10MB)

2. **API Security**
   - Admin routes require authentication
   - JWT token validation
   - Request validation
   - Error handling without information leakage

3. **Data Validation**
   - Server-side validation for all inputs
   - Mongoose schema validation
   - Duplicate email/phone prevention
   - Sanitized file names

## Future Enhancements (TODO)

1. **Notifications**
   - [ ] SMS notifications for status updates
   - [ ] In-app notifications for admin
   - [ ] WhatsApp notifications

2. **Analytics**
   - [ ] Track registration completion rate
   - [ ] Monitor verification times
   - [ ] Document upload success rate
   - [ ] Admin dashboard statistics

3. **Improvements**
   - [ ] Add document preview before upload
   - [ ] Support for multiple languages (Hindi, regional languages)
   - [ ] OCR for automatic data extraction from documents
   - [ ] Integration with government disability databases (UDID)
   - [ ] Bulk document download for admin
   - [ ] Export registration data to CSV/Excel
   - [ ] Advanced search filters in admin panel

4. **User Features**
   - [ ] User dashboard to track application
   - [ ] Ability to edit application before verification
   - [ ] Upload additional documents after submission
   - [ ] Print registration receipt

## Testing Checklist

### Registration Form
- [x] Test registration form with all required fields
- [x] Test file upload with different file types and sizes
- [x] Test Zod validation for each field
- [x] Test duplicate email/phone detection
- [x] Test accessibility with screen readers
- [x] Test keyboard navigation
- [x] Test mobile responsiveness
- [x] Test with slow network (upload progress)
- [x] Test error handling

### Admin Panel
- [x] Test admin authentication
- [x] Test status update workflow
- [x] Test search functionality
- [x] Test status filter
- [x] Test individual person detail view
- [x] Test document viewer
- [x] Test admin comments and status updates
- [x] Test verification history display

### Status Check
- [x] Test status check by email
- [x] Test status check by registration ID
- [x] Test error handling for invalid search
- [x] Test status history display
- [x] Test mobile responsiveness

### Email Notifications
- [x] Test email sending for all status types
- [x] Test registration confirmation email
- [x] Test status update emails
- [x] Test email with admin comments

## Environment Variables Required

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your_bucket_name
S3_REGION=your_region
CLOUDFRONT_DOMAIN=your_cloudfront_domain

# Email Configuration
RESEND_API_KEY=your_resend_api_key

# Database
MONGODB_URI=your_mongodb_connection_string

# App Configuration
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
TOKEN_SECRET=your_jwt_secret
```

## Support Contact

For help with this feature:
- Email: contact@austrange.com
- Phone: +91 123-456-7890
- Documentation: /disabled-registration page has inline help

## Version History

- **v1.0.0** (2025-01-18): Initial implementation
  - Complete registration form with accessibility
  - AWS S3 document upload
  - Admin verification workflow
  - Email notifications
  - Home page integration

- **v2.0.0** (2025-01-18): Major updates
  - ✅ Added Zod validation for forms and API
  - ✅ Created status check page (search by email or ID)
  - ✅ Built complete admin panel UI
    - DisabledPersonsManagement component with search/filter
    - Individual person detail page with document viewer
    - Integrated "Disabled Persons" tab in admin dashboard
  - ✅ Server-side and client-side validation
  - ✅ Mobile-responsive admin UI
  - ✅ Document preview in admin panel
  - ✅ Complete verification history timeline
  - ✅ Enhanced error handling with Zod

---

**Last Updated**: October 18, 2025
**Maintained By**: e-Sight Development Team
