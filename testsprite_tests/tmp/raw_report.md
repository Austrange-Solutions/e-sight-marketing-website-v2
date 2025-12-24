
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** e-sight-marketing-website-v2
- **Date:** 2025-12-24
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC006
- **Test Name:** Donation Form - Valid Data Submission
- **Test Code:** [TC006_Donation_Form___Valid_Data_Submission.py](./TC006_Donation_Form___Valid_Data_Submission.py)
- **Test Error:** Testing of the donation form could not be completed because the 'Donate Now ❤️' button leads to a chrome error page, preventing access to the donation form. The issue has been reported. Stopping all further testing as instructed.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0843C006C040000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/b53b710a-d894-48f1-a4f9-d06498806f91
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018
- **Test Name:** Checkout - Complete Order Flow
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/9c543012-1414-44dd-8917-1ff1e6fbbdc8
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC034
- **Test Name:** Payment Gateway - Cashfree Order Creation
- **Test Code:** [TC034_Payment_Gateway___Cashfree_Order_Creation.py](./TC034_Payment_Gateway___Cashfree_Order_Creation.py)
- **Test Error:** Test stopped due to navigation failure. Clicking 'Donate Now ❤️' button leads to a chrome error page, preventing further test execution for Cashfree order creation.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0EC4500CC1F0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/cea6916a-5fbf-41ba-9fea-551f653d883f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC035
- **Test Name:** Payment - Signature Verification Security
- **Test Code:** [TC035_Payment___Signature_Verification_Security.py](./TC035_Payment___Signature_Verification_Security.py)
- **Test Error:** Test stopped due to critical page load error after clicking 'Donate Now ❤️'. The page navigated to a chrome error page which is blank and non-interactive, preventing further test steps. Please fix this issue to continue testing.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A044DA0044270000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://www.youtube.com/youtubei/v1/log_event?alt=json:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/9f2cd16d-b6ae-4ec4-b679-313a117a94cd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC050
- **Test Name:** End-to-End - Complete User Journey
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/587c4676-6f4a-4696-a237-7786bad437ed
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC001
- **Test Name:** Homepage Responsive Design - Mobile 320px
- **Test Code:** [TC001_Homepage_Responsive_Design___Mobile_320px.py](./TC001_Homepage_Responsive_Design___Mobile_320px.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/3780516b-9744-4bb5-ba98-dc9ef94376c2
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** Donation Form - Garbage Value Testing (Name Field)
- **Test Code:** [TC007_Donation_Form___Garbage_Value_Testing_Name_Field.py](./TC007_Donation_Form___Garbage_Value_Testing_Name_Field.py)
- **Test Error:** Testing stopped due to navigation failure. The 'Donate Now ❤️' button leads to a chrome error page, preventing access to the donation form and further testing. Please fix the navigation issue to continue testing.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C4390094360000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/a711f98a-2c42-4256-8080-c78ce6439114
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** Donation Form - Amount Boundary Testing
- **Test Code:** [TC009_Donation_Form___Amount_Boundary_Testing.py](./TC009_Donation_Form___Amount_Boundary_Testing.py)
- **Test Error:** Testing stopped due to navigation error to Chrome error page. Donation form not accessible, so donation amount tests cannot be performed.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ECD600DC3C0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/4316a143-e52a-486b-8d24-b3b9ec5d51e0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013
- **Test Name:** Admin Login - CRUD Operations on Users
- **Test Code:** [TC013_Admin_Login___CRUD_Operations_on_Users.py](./TC013_Admin_Login___CRUD_Operations_on_Users.py)
- **Test Error:** Testing stopped due to navigation issue after login. Unable to access Users Management tab as clicking 'Profile' redirects to login page. Please fix the session or navigation bug to proceed with admin user management tests.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0D83A009C020000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A080F1089C020000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/a76c8412-d5c1-4944-8dc3-6946ac68bb35
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014
- **Test Name:** Admin Products - CRUD with Image Upload
- **Test Code:** [TC014_Admin_Products___CRUD_with_Image_Upload.py](./TC014_Admin_Products___CRUD_with_Image_Upload.py)
- **Test Error:** Test stopped due to missing 'Add Product' button on the Products page, preventing product creation testing. Please fix the UI to enable product management testing.
Browser Console Logs:
[ERROR] Permissions policy violation: compute-pressure is not allowed in this document. (at https://www.youtube.com/s/player/50cc0679/player_ias.vflset/en_GB/base.js:5401:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0583E0044030000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/auth/providers:0:0)
[ERROR] [next-auth][error][CLIENT_FETCH_ERROR] 
https://next-auth.js.org/errors#client_fetch_error Failed to fetch {error: Object, url: /api/auth/providers, message: Failed to fetch} (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_b0daae9a._.js:2359:31)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A06CD30044030000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A098D30044030000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/04c2c7b3-9ca3-495e-9cd4-2fd683cf153f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016
- **Test Name:** Cart Functionality - Add/Remove/Update Quantity
- **Test Code:** [TC016_Cart_Functionality___AddRemoveUpdate_Quantity.py](./TC016_Cart_Functionality___AddRemoveUpdate_Quantity.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/b926effa-8c1a-42cb-947e-ca495e1978cf
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020
- **Test Name:** Foundation Settings - Update Percentage Split
- **Test Code:** [TC020_Foundation_Settings___Update_Percentage_Split.py](./TC020_Foundation_Settings___Update_Percentage_Split.py)
- **Test Error:** The test to update foundation fee percentages and verify calculations could not be fully completed due to repeated session expiration or logout issues preventing access to the Foundation Settings page. Multiple login attempts were made, but each attempt to access the Profile or Foundation Settings redirected to the login page, indicating session instability. Therefore, the platform fee and foundation share percentages could not be updated or verified, and no donation tests or dashboard checks could be performed. The task is incomplete due to these session management problems.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A098350054220000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C4350054220000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C4350054220000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C4350054220000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C4350054220000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C4350054220000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/98c19f1a-b734-4e42-b230-4d4ad837f313
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC032
- **Test Name:** Admin Middleware - Unauthorized Access Prevention
- **Test Code:** [TC032_Admin_Middleware___Unauthorized_Access_Prevention.py](./TC032_Admin_Middleware___Unauthorized_Access_Prevention.py)
- **Test Error:** Login as regular user failed, preventing further testing of non-admin access restrictions. Reporting issue and stopping test execution.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0043C006C010000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/acac627f-71ef-4409-b3ee-9b92568d4824
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC046
- **Test Name:** Data Integrity - Donation Breakdown Calculation
- **Test Code:** [TC046_Data_Integrity___Donation_Breakdown_Calculation.py](./TC046_Data_Integrity___Donation_Breakdown_Calculation.py)
- **Test Error:** Test stopped due to critical website issue: donation page fails to load after clicking 'Donate Now ❤️'. Unable to proceed with donation fee split calculation verification. Please fix the website issue and retry.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A080D800F41F0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A004D900F41F0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A004D900F41F0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A080D800F41F0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/48e179f9-c3a0-4ab9-b30e-3a7d08e35b47
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC053
- **Test Name:** API Direct Testing - Donation Endpoint
- **Test Code:** [TC053_API_Direct_Testing___Donation_Endpoint.py](./TC053_API_Direct_Testing___Donation_Endpoint.py)
- **Test Error:** The homepage is loaded and ready. Now proceeding to test the /api/donate/create endpoint directly with POST requests as per the given instructions.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0043B00EC0E0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/adab79e0-26a6-4acd-b796-f4ec2fa73ae9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC054
- **Test Name:** API Testing - Admin Endpoints Authorization
- **Test Code:** [TC054_API_Testing___Admin_Endpoints_Authorization.py](./TC054_API_Testing___Admin_Endpoints_Authorization.py)
- **Test Error:** The admin API authorization tests could not be fully completed. Initial tests without token returned 401 Unauthorized as expected. However, tests with regular user token repeatedly returned 401 Unauthorized instead of the expected 403 Forbidden, indicating token handling issues. Attempts to logout and re-login to obtain fresh tokens failed because the logout button redirected to an unrelated page, preventing session clearing. Consequently, tests with expired and valid admin tokens were not performed. Due to these navigation and token management issues, the task is stopped without full completion.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C43A0024010000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized) (at http://localhost:3000/api/admin/users:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A000230824010000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized) (at http://localhost:3000/api/admin/users:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A000230824010000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/4c2e3742-acce-4385-ad54-21f44b79bfab
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC055
- **Test Name:** HTTPS & SSL Certificate Validation
- **Test Code:** [TC055_HTTPS__SSL_Certificate_Validation.py](./TC055_HTTPS__SSL_Certificate_Validation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/055a6c7e-10b9-4362-b43f-9a1d17ccb9db
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC061
- **Test Name:** Email Delivery - Donation Receipt Email
- **Test Code:** [TC061_Email_Delivery___Donation_Receipt_Email.py](./TC061_Email_Delivery___Donation_Receipt_Email.py)
- **Test Error:** The donation process cannot proceed because clicking the 'Donate Now ❤️' button leads to a browser error page. The issue is reported and testing is stopped.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0AC3400641B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://www.youtube.com/youtubei/v1/log_event?alt=json:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/1d65aa3f-374a-46e4-903f-8b57e6507b4f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC065
- **Test Name:** User Registration - Email Verification
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/17c3ae5f-e3bd-449e-858d-6e702906d54e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC073
- **Test Name:** Payment Idempotency - Retry Handling
- **Test Code:** [TC073_Payment_Idempotency___Retry_Handling.py](./TC073_Payment_Idempotency___Retry_Handling.py)
- **Test Error:** Test stopped due to critical navigation errors and inability to create donation order or capture order_id. The duplicate payment request handling test could not be completed. Please fix the website navigation issues and retry.
Browser Console Logs:
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0EC3900CC350000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://www.youtube.com/youtubei/v1/log_event?alt=json:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/5596e01e-05a6-47cd-86b2-ad08a7cc8a9c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC074
- **Test Name:** Payment Webhook - Cashfree Callback Handling
- **Test Code:** [TC074_Payment_Webhook___Cashfree_Callback_Handling.py](./TC074_Payment_Webhook___Cashfree_Callback_Handling.py)
- **Test Error:** Unable to find the correct webhook endpoint URL for Cashfree webhook simulation after multiple attempts. No UI or documentation found to simulate webhook POST. Recommend using an external API testing tool (e.g., Postman or curl) to send a POST request with the PAYMENT_SUCCESS event payload to likely webhook endpoints and verify server handling. Task stopped as further progress is blocked without correct endpoint or backend access.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0EC3900CC0C0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found) (at http://localhost:3000/api/webhooks/cashfree:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found) (at http://localhost:3000/api/webhooks:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0EC3900CC0C0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/_next/webpack-hmr' failed: Error in connection establishment: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_cf1d9188._.js:5696:0)
[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found) (at http://localhost:3000/api/webhooks/cashfree:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found) (at http://localhost:3000/api/webhook/cashfree:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/befa3481-e590-4c5b-bdaf-b9f0e2673932
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC075
- **Test Name:** Transaction Rollback - Failed Payment Recovery
- **Test Code:** [TC075_Transaction_Rollback___Failed_Payment_Recovery.py](./TC075_Transaction_Rollback___Failed_Payment_Recovery.py)
- **Test Error:** The test for database transaction rollback on payment failure could not be completed. The donation order creation process could not be started because clicking the 'Donate Now ❤️' button led to a chrome error page (chrome-error://chromewebdata/), indicating a navigation or loading failure. This prevented any further testing steps, including simulating payment failure, verifying donation status, checking database rollback, and retrying donations. The issue appears to be a critical site navigation or server problem that must be resolved before testing can continue.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A080D9003C050000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/5ac37196-732e-4240-a01c-9fa0c09e379e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC082
- **Test Name:** OWASP WSTG-ERRH - Error Information Disclosure Prevention
- **Test Code:** [TC082_OWASP_WSTG_ERRH___Error_Information_Disclosure_Prevention.py](./TC082_OWASP_WSTG_ERRH___Error_Information_Disclosure_Prevention.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/290f4a43-146b-4d98-a3a6-dc5427d5e0c7
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC092
- **Test Name:** OWASP Top 10 - Server-Side Request Forgery (SSRF) Prevention
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/46066e3c-ed04-41f0-bbc9-46cea7bf00c3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC100
- **Test Name:** End-to-End Smoke Test Suite - Critical Path Validation
- **Test Code:** [TC100_End_to_End_Smoke_Test_Suite___Critical_Path_Validation.py](./TC100_End_to_End_Smoke_Test_Suite___Critical_Path_Validation.py)
- **Test Error:** The comprehensive smoke test was partially completed. The user registration journey was mostly successful with all form fields filled correctly except for the document upload step, which could not be completed due to unsupported file upload actions in the current environment. This blocked form submission and prevented full completion of the registration process. Other critical user journeys such as product browsing, cart operations, payment processing, donation flow, admin access, and email delivery were not tested due to the early stop at registration. The test run ended with a 0% success rate for full critical path completion. Further automation support for file uploads is needed to fully validate the registration flow and proceed with subsequent user journeys.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://pkedcjkdefgpdelpbcmbmeomcjbeemfm/cast_sender.js:0:0)
[ERROR] Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME (at chrome-extension://enhhojjnijigcajfphajepfemndkmdlo/cast_sender.js:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A02CD80044060000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at https://www.youtube.com/embed/-dqg8zQ9v90?si=WS5kGbDl19A1ejOr:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/903684e1-23bd-4cef-90d8-b01badb2fead/d7880e2f-7c29-4671-9633-6eb6cfed7a55
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **16.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---