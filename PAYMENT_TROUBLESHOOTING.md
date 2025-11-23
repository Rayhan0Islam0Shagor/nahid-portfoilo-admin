# bKash Payment Integration - Troubleshooting Guide

## Common Error: 403 Forbidden with AWS SigV4 Requirement

### Error Message
```
Authorization header requires 'Credential' parameter. 
Authorization header requires 'Signature' parameter. 
Authorization header requires 'SignedHeaders' parameter.
```

### Root Cause
This error occurs when you're using **Payment Gateway API credentials** with **Tokenized Checkout API endpoints**, or vice versa. These are two different bKash APIs with different authentication methods.

### Solution Steps

#### Step 1: Verify Your API Type
1. Log into https://developer.bka.sh/
2. Go to "My Applications"
3. Check the type of your application:
   - **Tokenized Checkout** ✅ (What we need)
   - **Payment Gateway** ❌ (Different API)

#### Step 2: Check Your Credentials
- **Tokenized Checkout API** uses:
  - `app_key` and `app_secret` (for token grant)
  - `username` and `password` (for authentication)
  - Simple token-based authentication (no AWS SigV4)

- **Payment Gateway API** uses:
  - Different credential structure
  - AWS Signature Version 4 (SigV4) authentication
  - Different endpoints

#### Step 3: Create New Application (If Needed)
If you only have Payment Gateway credentials:

1. In bKash Developer Portal, create a **new application**
2. Select **"Tokenized Checkout"** as the API type
3. Get your new credentials:
   - App Key
   - App Secret
   - Username
   - Password
4. Update your `.env` file with these new credentials

#### Step 4: Verify Token Grant Works
Test if your credentials work:

```bash
# Use the test endpoint (requires admin auth)
GET http://localhost:5000/api/payments/bkash/test-token
```

If this succeeds, your credentials are correct. If payment creation still fails, it's an endpoint/version issue.

#### Step 5: Check API Endpoint
Verify you're using the correct endpoint:

- ✅ Correct: `https://tokenized.sandbox.bka.sh/v1.2.0-beta`
- ❌ Wrong: `https://sandbox.bka.sh/` (Payment Gateway endpoint)

### Quick Checklist

- [ ] Using Tokenized Checkout API credentials (not Payment Gateway)
- [ ] All 4 credentials are from the same API type
- [ ] `.env` file is in `nahid-admin/backend/` directory
- [ ] Server restarted after updating `.env`
- [ ] Token grant test endpoint works (`/api/payments/bkash/test-token`)
- [ ] Using correct base URL: `https://tokenized.sandbox.bka.sh/v1.2.0-beta`

### Still Having Issues?

1. **Contact bKash Support**
   - Email: support@bka.sh
   - Provide:
     - Your app key
     - Error message (AWS SigV4 requirement)
     - Request to verify Tokenized Checkout API access

2. **Check bKash Documentation**
   - Visit: https://developer.bka.sh/documentation
   - Look for latest API changes
   - Verify endpoint URLs

3. **Verify Account Status**
   - Ensure your bKash developer account is active
   - Check if your application is approved
   - Verify sandbox access is enabled

### Alternative: Manual Testing

Test the API directly using curl:

```bash
# 1. Get access token
curl -X POST https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant \
  -H "username: YOUR_USERNAME" \
  -H "password: YOUR_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"app_key":"YOUR_APP_KEY","app_secret":"YOUR_APP_SECRET"}'

# 2. Use the id_token from response to create payment
curl -X POST https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/payment/create \
  -H "Authorization: YOUR_ID_TOKEN" \
  -H "X-APP-Key: YOUR_APP_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "0011",
    "payerReference": "TEST-123",
    "callbackURL": "http://localhost:5000/api/payments/bkash/callback",
    "amount": "10",
    "currency": "BDT",
    "intent": "sale",
    "merchantInvoiceNumber": "TEST-123"
  }'
```

If the manual curl test also fails with 403, it confirms the credentials/endpoint issue.

---

**Last Updated:** 2025-01-22
**Version:** 1.0.0

