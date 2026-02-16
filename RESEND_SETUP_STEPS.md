# 🚀 Resend Email Fix - Step by Step Guide

## ✅ What I Fixed (Local .env)

I've updated your local `backend/.env` file with:
```env
USE_RESEND=true
RESEND_API_KEY=re_CQfS9vXG_9AYc8KLphcdPWUQuzr47gUSj
EMAIL_FROM=onboarding@resend.dev
```

## 🔧 What You Need to Do on Render

### Step 1: Update Render Environment Variables

1. Go to: **https://dashboard.render.com**

2. Click on your **backend service** (hostel management backend)

3. Click **"Environment"** tab on the left

4. **Add these 3 environment variables:**

   | Key | Value |
   |-----|-------|
   | `USE_RESEND` | `true` |
   | `RESEND_API_KEY` | `re_CQfS9vXG_9AYc8KLphcdPWUQuzr47gUSj` |
   | `EMAIL_FROM` | `onboarding@resend.dev` |

5. Click **"Save Changes"** button

6. Render will **automatically redeploy** your backend (this takes 2-3 minutes)

7. Wait for deployment to complete

### Step 2: Test Email After Deployment

Once deployment is complete, test signup/OTP:
- OTP emails should now work on production (Render)
- Check the Render logs for confirmation: `📧 Using Resend for email service`

---

## ⚠️ Current Limitation

**Why OTP only goes to `shaikhhostel0112@gmail.com`:**

Your Resend account is in **sandbox mode** because your domain `hostel-bazar.vercel` is still being verified.

In sandbox mode:
- ✅ Emails to verified addresses work (your Resend account email)
- ❌ Emails to other addresses are blocked

---

## 🔐 How to Send to ANY Email (Remove Sandbox Limitation)

### Option 1: Wait for Domain Verification (Recommended)

1. **Check DNS Status:**
   - Go to: https://resend.com/domains
   - Look for "hostel-bazar.vercel"
   - Wait until status shows "Verified" ✅

2. **DNS Propagation Time:**
   - Usually: 10 minutes - 2 hours
   - Sometimes: Up to 48 hours
   - Check progress at: https://dnschecker.org

3. **Once Verified:**
   - Update Render environment variable:
     ```
     EMAIL_FROM=noreply@hostel-bazar.vercel.app
     ```
   - Now you can send to ANY email address! 🎉

### Option 2: Add Test Emails Manually (Quick Solution)

If you need to test with specific emails RIGHT NOW:

1. Go to: **https://resend.com/settings/emails**

2. Click **"Add Email"**

3. Enter test email address (e.g., `test@gmail.com`)

4. Resend will send verification email to that address

5. User opens email and clicks verification link

6. Now that email can receive OTPs too!

**Limitation:** You can add only a few emails this way. Not scalable for production.

---

## 📊 How to Check Everything is Working

### Check 1: Render Logs

1. Go to Render dashboard → Your backend service
2. Click **"Logs"** tab
3. Look for: `📧 Using Resend for email service`
4. If you see `📧 Using Gmail SMTP for email service` → Environment variables not set correctly

### Check 2: Test Signup

1. Go to your frontend: https://hostel-bazar.vercel.app/signup

2. Try to sign up with:
   - `shaikhhostel0112@gmail.com` (should work - verified email)
   - Any other email (will only work after domain verification)

3. Check Render logs for:
   ```
   ✅ Email sent via Resend: <message-id>
   ```

### Check 3: Resend Dashboard

1. Go to: **https://resend.com/emails**
2. You'll see all sent emails with status:
   - ✅ Delivered
   - ⏳ Queued
   - ❌ Bounced

---

## 🎯 Summary

**Immediate Action Required:**
1. ✅ Add `USE_RESEND=true` to Render environment variables
2. ✅ Add `RESEND_API_KEY` to Render environment variables  
3. ✅ Add `EMAIL_FROM=onboarding@resend.dev` to Render environment variables
4. ✅ Save and wait for redeploy

**Then:**
- Test with `shaikhhostel0112@gmail.com` → Should work immediately
- Other emails → Wait for domain verification OR add them manually

**Final Solution:**
- Wait for `hostel-bazar.vercel` domain verification
- Update `EMAIL_FROM` to `noreply@hostel-bazar.vercel.app`
- Send to ANY email address without restrictions!

---

## 🆘 Still Having Issues?

**If emails still not working after Render redeploy:**

1. Share Render logs (from Logs tab)
2. Check Resend dashboard for error messages
3. Verify all 3 environment variables are set correctly

**Common Mistakes:**
- ❌ Typo in environment variable names
- ❌ Missing `=true` for `USE_RESEND`
- ❌ Old deployment still running (force redeploy)
- ❌ DNS records not added correctly to domain provider

---

**Last Updated:** 2026-02-13
