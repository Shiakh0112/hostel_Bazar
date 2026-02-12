# 📧 Email OTP Setup Guide

## Gmail App Password Setup

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
