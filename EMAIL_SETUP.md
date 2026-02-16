# 📧 Email OTP Setup Guide

## ⚡ Resend Email Service (Recommended for Production)

### Current Status
- **Service:** Resend
- **API Key:** Configured ✅
- **Domain:** hostel-bazar.vercel (Pending DNS Verification)
- **Status:** Using sandbox mode until domain verified

### Step 1: Complete Domain Verification

1. **Wait for DNS Propagation** (This can take a few minutes to 48 hours)
   - Your DNS records are being verified by Resend
   - Check status at: https://resend.com/domains

2. **Required DNS Records** (Already added, waiting for propagation):
   ```
   Type: TXT
   Name: resend._domainkey
   Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdsRVQOxzNadpxIx4JYxcayYPVUp6n2RihM3zWbCbkAmvesfsZ1qf20R8I+FZReW15gRoAHxG42EQHWqOKc5XttzQkweFWXTh2HKUb+32u7bKMgaQa4RL1JWaX5m6MprG1j7VH/jF3pvAAewnuV3TB1Up/GNqoadi9Eirdyel+QQIDAQAB
   
   Type: MX
   Name: send
   Value: feedback-smtp.ap-northeast-1.amazonses.com
   Priority: 10
   
   Type: TXT
   Name: send
   Value: v=spf1 include:amazonses.com ~all
   ```

3. **Update Email From Address (After Verification)**
   - Once domain is verified, update `.env`:
   ```env
   EMAIL_FROM=noreply@hostel-bazar.vercel.app
   # or
   EMAIL_FROM=support@hostel-bazar.vercel.app
   ```

### Step 2: Current Configuration

**Backend .env (Updated):**
```env
USE_RESEND=true
RESEND_API_KEY=re_CQfS9vXG_9AYc8KLphcdPWUQuzr47gUSj
EMAIL_FROM=onboarding@resend.dev
```

### Step 3: Update Render Environment Variables

**IMPORTANT:** Add these to your Render dashboard:
1. Go to: https://dashboard.render.com
2. Select your backend service
3. Go to "Environment" tab
4. Add/Update:
   ```
   USE_RESEND=true
   RESEND_API_KEY=re_CQfS9vXG_9AYc8KLphcdPWUQuzr47gUSj
   EMAIL_FROM=onboarding@resend.dev
   ```
5. Click "Save Changes"
6. Render will automatically redeploy

### ⚠️ Important Notes

**Sandbox Mode Limitation:**
- Until domain is verified, Resend only sends emails to verified addresses
- Currently, only emails to `shaikhhostel0112@gmail.com` (your Resend account email) will work
- After domain verification, you can send to ANY email address

**Testing Before Domain Verification:**
1. Add test email addresses in Resend dashboard
2. Go to: https://resend.com/settings/emails
3. Add and verify test email addresses
4. These verified emails will also receive OTPs

**After Domain Verification:**
- All email addresses will receive OTPs
- Update `EMAIL_FROM` to use your domain
- Better deliverability and branding

---

## Gmail App Password Setup (Legacy/Backup)

### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow steps to enable 2FA

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter name: "Hostel Management System"
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Update Environment Variables

**Backend .env:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx (16-char app password)
```

**Render Dashboard:**
Add same variables in Environment section

### Step 4: Test Email

**Local Test:**
```bash
cd backend
npm run dev
```

**Test Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123",
    "mobile": "9876543210",
    "role": "student"
  }'
```

Check email for OTP.

## Current Email Configuration

**Email:** shaikhhostel0112@gmail.com
**Status:** Configured ✅
**App Password:** Set in .env

## Troubleshooting

### Issue: Email not sending
**Solutions:**
1. Verify Gmail app password is correct
2. Check 2FA is enabled
3. Ensure EMAIL_USER and EMAIL_PASS are set
4. Check spam folder

### Issue: Connection timeout
**Solutions:**
1. Check internet connection
2. Verify Gmail SMTP is not blocked
3. Try different network
4. Check firewall settings

### Issue: Authentication failed
**Solutions:**
1. Regenerate app password
2. Update .env file
3. Restart server
4. Check email/password format

## Email Features

### 1. Signup OTP
- Sent immediately after registration
- Valid for 10 minutes
- 6-digit code

### 2. Forgot Password OTP
- Sent when user requests password reset
- Valid for 10 minutes
- 6-digit code

### 3. Welcome Email
- Sent after successful verification
- Contains account details

### 4. Booking Notifications
- Booking approved/rejected
- Payment confirmations

## Testing Checklist

```
□ Gmail 2FA enabled
□ App password generated
□ Environment variables set
□ Server restarted
□ Signup test successful
□ OTP received in email
□ Forgot password test successful
□ Reset OTP received
```

## Production Deployment

**Render Environment Variables:**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=shaikhhostel0112@gmail.com
EMAIL_PASS=tslppyomamajcpsk
```

**Vercel (Frontend):**
No email configuration needed.

## Important Notes

1. **App Password:** Use Gmail app password, not regular password
2. **2FA Required:** Must enable 2-factor authentication
3. **Spam Folder:** Check spam if email not in inbox
4. **Rate Limits:** Gmail has sending limits (500/day)
5. **Security:** Never commit .env file to Git

---

**Last Updated:** December 2024
