# 🔧 Backend Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: 404 Error on Backend URL

**Problem:** `GET https://hostel-bazar.onrender.com/ 404 (Not Found)`

**Cause:** Render free tier puts inactive services to sleep after 15 minutes of inactivity.

**Solution:**
1. Wait 30-60 seconds for backend to wake up
2. Test API health: https://hostel-bazar.onrender.com/api/test
3. Expected response:
```json
{
  "success": true,
  "message": "API is working"
}
```

---

### Issue 2: 401 Unauthorized on Login

**Problem:** Login fails with 401 error even with correct credentials

**Possible Causes & Solutions:**

#### A. Backend Not Running
```bash
# Test if backend is alive
curl https://hostel-bazar.onrender.com/api/test

# If no response, wait 60 seconds and try again
```

#### B. Wrong API URL in Frontend
Check frontend `.env` file:
```env
VITE_API_URL=https://hostel-bazar.onrender.com/api
```

#### C. CORS Issue
Backend CORS is configured for:
- http://localhost:3000
- http://localhost:5173
- https://hostel-bazar.vercel.app

#### D. Database Connection Issue
Check if MongoDB Atlas is accessible and credentials are correct.

---

### Issue 3: Login Test Commands

**Test Owner Login:**
```bash
curl -X POST https://hostel-bazar.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@hostelbazar.com","password":"Owner@123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Owner Name",
    "email": "owner@hostelbazar.com",
    "role": "owner"
  }
}
```

**Test Student Login:**
```bash
curl -X POST https://hostel-bazar.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@hostelbazar.com","password":"Student@123"}'
```

**Test Staff Login:**
```bash
curl -X POST https://hostel-bazar.onrender.com/api/auth/staff-login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@hostelbazar.com","password":"Staff@123","staffId":"STAFF001"}'
```

---

### Issue 4: Forgot Password Not Working

**Test Forgot Password:**
```bash
curl -X POST https://hostel-bazar.onrender.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@hostelbazar.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

**Note:** Check spam folder for reset email.

---

## Quick Verification Steps

### Step 1: Check Backend Health
```bash
curl https://hostel-bazar.onrender.com/api/test
```
✅ Should return: `{"success":true,"message":"API is working"}`

### Step 2: Test Login
```bash
curl -X POST https://hostel-bazar.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@hostelbazar.com","password":"Owner@123"}'
```
✅ Should return JWT token and user data

### Step 3: Test Protected Route
```bash
# First get token from login
TOKEN="your_jwt_token_here"

curl -X GET https://hostel-bazar.onrender.com/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```
✅ Should return user profile

---

## Environment Variables Checklist

### Backend (.env)
```env
✅ MONGODB_URI=mongodb+srv://...
✅ JWT_SECRET=your-secret-key
✅ JWT_EXPIRE=7d
✅ EMAIL_HOST=smtp.gmail.com
✅ EMAIL_PORT=587
✅ EMAIL_USER=your-email@gmail.com
✅ EMAIL_PASS=your-app-password
✅ CLOUDINARY_CLOUD_NAME=your-cloud-name
✅ CLOUDINARY_API_KEY=your-api-key
✅ CLOUDINARY_API_SECRET=your-api-secret
✅ RAZORPAY_KEY_ID=your-razorpay-key
✅ RAZORPAY_KEY_SECRET=your-razorpay-secret
✅ STRIPE_SECRET_KEY=your-stripe-secret
✅ PORT=5000
✅ NODE_ENV=production
```

### Frontend (.env)
```env
✅ VITE_API_URL=https://hostel-bazar.onrender.com/api
✅ VITE_RAZORPAY_KEY_ID=your-razorpay-key
✅ VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
```

---

## Render Deployment Checklist

### Build Command
```bash
npm install
```

### Start Command
```bash
npm start
```

### Environment Variables
All variables from `.env` must be added in Render dashboard.

### Health Check Path
```
/api/test
```

---

## For Evaluators

### If Backend is Down:

1. **Wait 60 seconds** - Render free tier needs time to wake up
2. **Test health endpoint** - https://hostel-bazar.onrender.com/api/test
3. **Try login again** - Use provided credentials
4. **Check browser console** - Look for actual error messages

### If Still Not Working:

1. **Contact Developer** - Provide error screenshots
2. **Check Render Status** - Service might be redeploying
3. **Try Alternative** - Run backend locally:
   ```bash
   cd backend
   npm install
   npm start
   ```

---

## Local Development Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

---

## Support

**If issues persist:**
- Email: support@hostelbazar.com
- GitHub Issues: https://github.com/Shiakh0112/hostel_Bazar/issues
- Check Render logs for backend errors

---

**Last Updated:** December 2024
