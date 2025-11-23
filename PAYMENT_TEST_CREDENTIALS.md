# bKash Payment Integration - Test Credentials

This document contains test credentials and instructions for testing the bKash payment integration in the portfolio.

## bKash Sandbox Test Credentials

### Getting Started

1. **Register for bKash Sandbox Account**
   - Visit: https://developer.bka.sh/
   - Sign up for a developer account
   - Create a new application to get your credentials

### Test Credentials (Sandbox)

#### Application Credentials

```
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=<Your App Key from bKash Developer Portal>
BKASH_APP_SECRET=<Your App Secret from bKash Developer Portal>
BKASH_USERNAME=<Your Username from bKash Developer Portal>
BKASH_PASSWORD=<Your Password from bKash Developer Portal>
```

#### Test Phone Numbers (Sandbox)

Use these test phone numbers for bKash sandbox testing:

**Merchant Account:**

- Phone: `01770618575` (or your sandbox merchant number)
- PIN: `123456` (default sandbox PIN)

**Customer Account:**

- Phone: `01770618576` (or your sandbox customer number)
- PIN: `123456` (default sandbox PIN)

**Note:** These are example numbers. Use the actual numbers provided in your bKash sandbox account.

### Test PINs

- Default PIN for sandbox accounts: `123456`
- OTP for sandbox: `123456`

### Environment Variables Setup

**IMPORTANT**: Make sure you're using **Tokenized Checkout API** credentials, NOT Payment Gateway API credentials.

Add these to your `.env` file in the backend:

```env
# bKash Tokenized Checkout API Configuration
# ⚠️ CRITICAL: Use Tokenized Checkout credentials, NOT Payment Gateway credentials
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=your-tokenized-checkout-app-key-here
BKASH_APP_SECRET=your-tokenized-checkout-app-secret-here
BKASH_USERNAME=your-tokenized-checkout-username-here
BKASH_PASSWORD=your-tokenized-checkout-password-here
BKASH_CALLBACK_URL=http://localhost:5000/api/payments/bkash/callback
```

**How to Verify You Have the Right Credentials:**

1. Log into https://developer.bka.sh/
2. Check your application type:
   - ✅ **Tokenized Checkout** - Use these credentials (what we need)
   - ❌ **Payment Gateway** - Different API, requires AWS SigV4 (causes 403 error)
3. If you only have Payment Gateway credentials, create a new application for Tokenized Checkout

### Testing Flow

1. **Start the Backend Server**

   ```bash
   cd nahid-admin/backend
   npm start
   ```

2. **Open Portfolio Website**

   - Navigate to the tracks section
   - Click on any track card to open the modal
   - Click "GET FULL TRACK" button

3. **Fill Payment Form**

   - Enter your name (e.g., "Test User")
   - Enter your email (e.g., "test@example.com")
   - Click "Proceed to Payment"

4. **bKash Payment Window**

   - A popup window will open with bKash sandbox payment page
   - Use test phone number: `01770618576` (or your sandbox customer number)
   - Enter PIN: `123456`
   - Complete the payment

5. **Payment Success**
   - After successful payment, the popup will close
   - A success modal will appear with download option
   - You can download the track using the provided order ID

### Test Scenarios

#### ✅ Successful Payment

1. Use valid test phone number
2. Enter correct PIN (123456)
3. Complete payment
4. Should see success message and download option

#### ❌ Failed Payment

1. Use invalid phone number
2. Enter wrong PIN
3. Payment should fail
4. Should see error message

#### ⏱️ Payment Timeout

1. Start payment process
2. Don't complete payment for extended period
3. Payment should timeout
4. Should see timeout message

### API Endpoints Used

1. **Create Payment**

   ```
   POST /api/payments/bkash/create
   Body: {
     "trackId": "track-id",
     "buyerEmail": "buyer@example.com",
     "buyerName": "Buyer Name"
   }
   ```

2. **Check Payment Status**

   ```
   GET /api/payments/bkash/status/:paymentID
   ```

3. **Download Track**
   ```
   GET /api/sales/download/:saleSerialId
   ```

### Troubleshooting

#### Payment Window Not Opening

- Check if popups are blocked in your browser
- Allow popups for the portfolio website
- Try using a different browser

#### Payment Creation Fails with 403 Error - AWS SigV4 Required

**Error Message:** `"Authorization header requires 'Credential' parameter. Authorization header requires 'Signature' parameter..."`

**This specific error indicates that bKash API is expecting AWS Signature Version 4 (SigV4) authentication**, which is unusual for bKash's tokenized checkout API. This typically means:

1. **API Version Mismatch**: The API endpoint or version might have changed
2. **Wrong API Type**: You might be using credentials for a different bKash API (e.g., payment gateway vs tokenized checkout)
3. **bKash Configuration Issue**: Your bKash developer account might need to be configured for tokenized checkout specifically

**Solutions:**

1. **Verify API Type in bKash Developer Portal**

   - Log into https://developer.bka.sh/
   - Check if you're using "Tokenized Checkout" API credentials
   - Ensure your application is set up for "Tokenized Checkout" not "Payment Gateway"

2. **Check API Endpoint**

   - Verify you're using the correct base URL for tokenized checkout
   - Current: `https://tokenized.sandbox.bka.sh/v1.2.0-beta`
   - Check bKash documentation for any endpoint changes

3. **Contact bKash Support**

   - This error suggests a configuration issue on bKash's side
   - Contact bKash support with:
     - Your app key
     - The error message
     - Request to verify tokenized checkout API access

4. **Alternative: Use Payment Gateway API**
   - If tokenized checkout isn't available, consider using bKash Payment Gateway API instead
   - This requires different credentials and endpoint structure

#### Payment Creation Fails with 403 Error (General)

**Error Message:** `"Request failed with status code 403"` or `"bKash Payment Creation Failed (403)"`

**Common Causes:**

1. **Invalid bKash Credentials**

   - Verify all credentials are correctly set in `.env` file:
     - `BKASH_APP_KEY`
     - `BKASH_APP_SECRET`
     - `BKASH_USERNAME`
     - `BKASH_PASSWORD`
   - Ensure there are no extra spaces or quotes around values
   - Double-check credentials from bKash Developer Portal

2. **Credentials Not Loaded**

   - Restart backend server after updating `.env` file
   - Verify `.env` file is in the correct location (`nahid-admin/backend/.env`)
   - Check that `dotenv` is properly configured

3. **Wrong bKash Environment**

   - Ensure `BKASH_BASE_URL` points to sandbox: `https://tokenized.sandbox.bka.sh/v1.2.0-beta`
   - Don't mix sandbox credentials with production URLs

4. **bKash Account Issues**
   - Verify your bKash developer account is active
   - Check if your application is approved in bKash Developer Portal
   - Ensure you're using the correct app credentials

**Debugging Steps:**

1. **Check Backend Server Logs**

   - Look for detailed error messages (now includes bKash API error details)
   - Check if token grant is successful before payment creation
   - Look for "Creating bKash payment" and "Access token obtained" messages

2. **Test Token Grant Separately**

   - Use the test endpoint: `GET /api/payments/bkash/test-token` (requires admin auth)
   - This will verify if credentials are correct and token grant works
   - If this fails, the issue is with credentials or token grant

3. **Verify Credentials are Loaded**

   ```bash
   # In backend directory
   node -e "require('dotenv').config(); console.log('APP_KEY:', process.env.BKASH_APP_KEY ? 'Set' : 'Missing')"
   ```

4. **Test Token Grant Manually**

   ```bash
   # Using curl
   curl -X POST https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant \
     -H "username: YOUR_USERNAME" \
     -H "password: YOUR_PASSWORD" \
     -H "Content-Type: application/json" \
     -d '{"app_key":"YOUR_APP_KEY","app_secret":"YOUR_APP_SECRET"}'
   ```

5. **Check Common Issues**
   - Ensure `.env` file is in `nahid-admin/backend/` directory
   - Restart server after updating `.env` file
   - Check for typos in credential values
   - Verify you're using sandbox credentials (not production)
   - Check if your bKash developer account is active and approved

#### Payment Creation Fails (Other Errors)

- Verify bKash credentials in `.env` file
- Check backend server logs for detailed error messages
- Ensure backend server is running on correct port (5000)
- Check network connectivity to bKash API

#### Payment Status Not Updating

- Check if callback URL is accessible
- Verify bKash callback is configured correctly
- Check backend logs for callback errors

#### Download Not Working

- Verify payment status is "completed"
- Check if order ID (saleSerialId) is correct
- Ensure track audio file exists in database

### Important Notes

1. **Sandbox vs Production**

   - Current implementation uses bKash sandbox
   - For production, update `BKASH_BASE_URL` to production URL
   - Update credentials to production credentials

2. **Callback URL**

   - Must be publicly accessible for production
   - Use ngrok or similar tool for local testing
   - Update `BKASH_CALLBACK_URL` in bKash developer portal

3. **Security**
   - Never commit `.env` file with real credentials
   - Use environment variables for sensitive data
   - Rotate credentials regularly

### Support

For bKash API issues:

- bKash Developer Portal: https://developer.bka.sh/
- bKash Documentation: https://developer.bka.sh/documentation

For application issues:

- Check backend server logs
- Check browser console for frontend errors
- Verify API endpoints are accessible

---

**Last Updated:** $(date)
**Version:** 1.0.0
