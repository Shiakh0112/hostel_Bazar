# 🚀 Deployment Checklist

## ✅ Backend (Render)

### Environment Variables
```
✅ PORT=5000
✅ NODE_ENV=production
✅ MONGODB_URI=mongodb+srv://...
✅ JWT_SECRET=My_Hostel_scret_@123@123Hostel_key
✅ JWT_EXPIRE=7d
✅ EMAIL_HOST=smtp.gmail.com
✅ EMAIL_PORT=587
✅ EMAIL_USER=shaikhhostel0112@gmail.com
✅ EMAIL_PASS=tslppyomamajcpsk
✅ CLOUDINARY_CLOUD_NAME=dda6zmonw
✅ CLOUDINARY_API_KEY=365431727631153
✅ CLOUDINARY_API_SECRET=BXngriXETpvNMboK6052uO9lJgE
✅ STRIPE_SECRET_KEY=sk_test_51QxYNaRrzEKV5j0k...
✅ STRIPE_PUBLISHABLE_KEY=pk_test_51QxYNaRrzEKV5j0k...
✅ FRONTEND_URL=https://hostel-bazar.vercel.app
```

### Build Settings
```
Build Command: npm install
Start Command: npm start
```

## ✅ Frontend (Vercel)

### Environment Variables
```
✅ VITE_API_URL=https://hostel-bazar.onrender.com/api
✅ VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51QxYNaRrzEKV5j0k...
✅ VITE_APP_NAME=HostelBazar
```

### Build Settings
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

## 🧪 Testing

### Test Commands
```bash
# Health check
curl https://hostel-bazar.onrender.com/api/test

# Owner login
curl -X POST https://hostel-bazar.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@hostelbazar.com","password":"Owner@123"}'
```

## 📝 Test Credentials

```
Owner: owner@hostelbazar.com / Owner@123
Student: student@hostelbazar.com / Student@123
Staff: staff@hostelbazar.com / Staff@123 / STAFF001
```

## ⚠️ Important Notes

1. Backend takes 30-60 seconds to wake up (Render free tier)
2. Test API health before login
3. All test accounts are pre-verified
4. Rate limiting disabled for auth routes
