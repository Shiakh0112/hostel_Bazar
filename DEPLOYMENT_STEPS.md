# 🚀 Deployment Steps

## Frontend Deployment (Vercel)

### Method 1: Automatic (GitHub Connected)
```bash
# Commit and push changes
git add .
git commit -m "Updated deployment configuration"
git push origin main
```
✅ Vercel will automatically deploy!

### Method 2: Manual Deployment
```bash
# Go to frontend folder
cd frontend

# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

## Backend Deployment (Render)

Backend is already deployed at: https://hostel-bazar.onrender.com

### To Update Backend:
```bash
# Commit and push changes
git add .
git commit -m "Updated CORS configuration"
git push origin main
```
✅ Render will automatically redeploy!

## ✅ Configuration Checklist

### Frontend (.env)
- [x] VITE_API_URL = https://hostel-bazar.onrender.com/api
- [x] Localhost commented out

### Backend (app.js)
- [x] CORS origin includes: https://hostel-bazar.vercel.app
- [x] Credentials enabled
- [x] All HTTP methods allowed

### Backend (.env)
- [x] FRONTEND_URL = https://hostel-bazar.vercel.app
- [x] NODE_ENV = production

## 🔗 Live URLs

- **Frontend**: https://hostel-bazar.vercel.app
- **Backend**: https://hostel-bazar.onrender.com/api
- **API Test**: https://hostel-bazar.onrender.com/api/test

## 🧪 Testing After Deployment

1. Open: https://hostel-bazar.vercel.app
2. Try login with test credentials:
   - Owner: owner@hostelbazar.com / Owner@123
   - Student: student@hostelbazar.com / Student@123
3. Check browser console for any errors
4. Test API: https://hostel-bazar.onrender.com/api/test

## ⚠️ Important Notes

- Backend may take 30-60 seconds to wake up (Render free tier)
- If 404 error, wait 1 minute and refresh
- All changes are now production-ready
- CORS is properly configured

## 🐛 Troubleshooting

### If CORS Error:
- Check backend logs on Render
- Verify CORS origins in app.js
- Clear browser cache

### If API Not Responding:
- Wait 60 seconds for backend to wake up
- Test: https://hostel-bazar.onrender.com/api/test
- Check Render dashboard for errors

### If Frontend Not Loading:
- Check Vercel deployment logs
- Verify .env file has correct API URL
- Clear browser cache and hard refresh (Ctrl+Shift+R)
