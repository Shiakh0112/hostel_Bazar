# 🔧 Environment Variables Setup Guide

## Backend Environment Variables

### Required Variables

#### 1. Server Configuration
```env
PORT=5000
NODE_ENV=production
```

#### 2. Database (MongoDB Atlas)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

**How to get:**
1. Go to https://cloud.mongodb.com
2. Create account and cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string
5. Replace `<username>` and `<password>`

#### 3. JWT Authentication
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRE=7d
```

**How to generate:**
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. Email Service (Gmail)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

**How to get Gmail App Password:**
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App passwords
4. Generate password for "Mail"
5. Use generated password in EMAIL_PASS

#### 5. Cloudinary (Image Storage)
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**How to get:**
1. Go to https://cloudinary.com
2. Create free account
3. Go to Dashboard
4. Copy Cloud Name, API Key, API Secret

#### 6. Razorpay (Payment Gateway)
```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**How to get:**
1. Go to https://razorpay.com
2. Create account
3. Go to Settings → API Keys
4. Generate Test Keys
5. Copy Key ID and Key Secret

#### 7. Stripe (Payment Gateway)
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

**How to get:**
1. Go to https://stripe.com
2. Create account
3. Go to Developers → API keys
4. Copy Test keys (Secret and Publishable)

#### 8. Frontend URL
```env
FRONTEND_URL=https://your-frontend-url.vercel.app
```

---

## Frontend Environment Variables

### Required Variables

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_APP_NAME=HostelBazar
```

---

## Deployment Setup

### Render (Backend)

1. **Create Web Service**
2. **Connect GitHub Repository**
3. **Add Environment Variables:**
   - Go to Environment tab
   - Add all variables from backend `.env`
   - Click "Save Changes"

4. **Build Settings:**
   ```
   Build Command: npm install
   Start Command: npm start
   ```

### Vercel (Frontend)

1. **Import Project from GitHub**
2. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add all variables from frontend `.env`
   - Click "Save"

3. **Build Settings:**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   ```

---

## Testing Environment Variables

### Backend Test
```bash
cd backend
node -e "require('dotenv').config(); console.log('MongoDB:', process.env.MONGODB_URI ? '✅' : '❌'); console.log('JWT Secret:', process.env.JWT_SECRET ? '✅' : '❌'); console.log('Email:', process.env.EMAIL_USER ? '✅' : '❌');"
```

### Frontend Test
```bash
cd frontend
npm run dev
# Check browser console for API URL
```

---

## Common Issues

### Issue: MongoDB Connection Failed
**Solution:** Check connection string format and credentials

### Issue: Email Not Sending
**Solution:** Verify Gmail app password and 2FA enabled

### Issue: Payment Gateway Error
**Solution:** Ensure test keys are used, not live keys

### Issue: CORS Error
**Solution:** Add frontend URL to backend CORS configuration

---

## Security Notes

1. **Never commit `.env` files to Git**
2. **Use different keys for development and production**
3. **Rotate secrets regularly**
4. **Use test keys for development**
5. **Keep `.env.example` updated**

---

## Quick Setup Commands

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm start
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env with backend URL
npm install
npm run dev
```

---

**Last Updated:** December 2024
