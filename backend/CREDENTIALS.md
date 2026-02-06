# 🔐 Backend Test Credentials

## API Base URL
```
Production: https://hostel-bazar.onrender.com/api
Local: http://localhost:5000/api
```

## Test User Credentials

### Owner Account
```json
{
  "email": "owner@hostelbazar.com",
  "password": "Owner@123",
  "role": "owner"
}
```

### Student Account
```json
{
  "email": "student@hostelbazar.com",
  "password": "Student@123",
  "role": "student"
}
```

### Staff Account
```json
{
  "email": "staff@hostelbazar.com",
  "password": "Staff@123",
  "staffId": "STAFF001",
  "role": "staff"
}
```

## API Testing

### Login Endpoint
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "owner@hostelbazar.com",
  "password": "Owner@123"
}
```

### Staff Login Endpoint
```bash
POST /api/auth/staff-login
Content-Type: application/json

{
  "email": "staff@hostelbazar.com",
  "password": "Staff@123",
  "staffId": "STAFF001"
}
```

## Payment Gateway Test Keys

### Razorpay (Test Mode)
```
Key ID: rzp_test_xxxxxxxxxx
Key Secret: [Contact admin]
```

### Stripe (Test Mode)
```
Publishable Key: pk_test_xxxxxxxxxx
Secret Key: [Contact admin]
```

## Database Connection
```
MongoDB Atlas: [Configured in .env]
Database Name: hostel-bazar
```

## Environment Variables Required
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
STRIPE_SECRET_KEY=your-stripe-secret
PORT=5000
NODE_ENV=production
```

## Quick Test Commands

### Test Owner Login
```bash
curl -X POST https://hostel-bazar.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@hostelbazar.com","password":"Owner@123"}'
```

### Test Student Login
```bash
curl -X POST https://hostel-bazar.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@hostelbazar.com","password":"Student@123"}'
```

### Test Staff Login
```bash
curl -X POST https://hostel-bazar.onrender.com/api/auth/staff-login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@hostelbazar.com","password":"Staff@123","staffId":"STAFF001"}'
```

## Notes
- All test accounts are pre-configured with sample data
- JWT tokens expire after 7 days
- Use test payment cards for transactions
- API rate limiting: 100 requests per 15 minutes
