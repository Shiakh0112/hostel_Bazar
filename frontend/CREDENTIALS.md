# 🔐 Frontend Test Credentials

## Live Application
```
URL: https://hostel-bazar.vercel.app
```

## Test User Credentials

### 👨💼 Hostel Owner
```
Email: owner@hostelbazar.com
Password: Owner@123
```
**Dashboard Access:**
- Hostel Management
- Room Management
- Booking Management
- Payment Reports
- Staff Management
- Analytics Dashboard

### 👨🎓 Student
```
Email: student@hostelbazar.com
Password: Student@123
```
**Dashboard Access:**
- Browse Hostels
- My Bookings
- Monthly Payments
- Payment History
- Maintenance Requests
- Profile Management

### 👨💼 Staff
```
Email: staff@hostelbazar.com
Password: Staff@123
Staff ID: STAFF001
```
**Dashboard Access:**
- Assigned Hostels
- Daily Operations
- Maintenance Requests
- Student Assistance
- Booking Information

## 💳 Test Payment Cards

### Razorpay Test Cards
```
Success Card:
Card: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
Name: Test User

Debit Card:
Card: 5555 5555 5555 4444
Expiry: 12/25
CVV: 123
Name: Test User
```

### Stripe Test Cards
```
Success Card:
Card: 4242 4242 4242 4242
Expiry: 12/25
CVV: 123
Name: Test User
Email: test@example.com

3D Secure Card:
Card: 4000 0027 6000 3184
Expiry: 12/25
CVV: 123
```

### Fake Card (Development)
```
Card: 1234 5678 9012 3456
Expiry: 12/25
CVV: 123
Name: Test User
```

### UPI IDs
```
success@upi
test@paytm
demo@phonepe
sample@googlepay
```

### Wallet Payments
```
PhonePe:
Mobile: 9876543210
PIN: 1234

Google Pay:
Mobile: 9876543210
PIN: 123456
```

## 🧪 Testing Workflows

### 1. Student Booking Flow
1. Login as student
2. Click "Browse Hostels"
3. Select any hostel
4. Click "Book Now"
5. Fill booking form
6. Select payment method
7. Use test card for payment
8. View booking confirmation

### 2. Monthly Payment Flow
1. Login as student
2. Go to "Monthly Payments"
3. Click "Pay Now" on pending payment
4. Select payment method
5. Complete payment with test card
6. View updated status

### 3. Owner Dashboard
1. Login as owner
2. View dashboard analytics
3. Click "Add Hostel"
4. Fill hostel details
5. Upload images
6. Add rooms
7. View all bookings
8. Check payment reports

### 4. Staff Operations
1. Login as staff
2. View assigned hostels
3. Check maintenance requests
4. Update request status
5. View student bookings

## 🎨 UI Features to Test

### Responsive Design
- ✅ Desktop view (1920x1080)
- ✅ Tablet view (768x1024)
- ✅ Mobile view (375x667)

### Animations
- ✅ Page transitions
- ✅ Button hover effects
- ✅ Modal animations
- ✅ Loading spinners
- ✅ Toast notifications

### Glass Morphism UI
- ✅ Transparent cards
- ✅ Backdrop blur effects
- ✅ Gradient backgrounds
- ✅ Animated blobs

### Interactive Elements
- ✅ Search and filters
- ✅ Dropdown menus
- ✅ Form validations
- ✅ Payment modals
- ✅ Image galleries

## 🔍 Browser Compatibility

Tested on:
- ✅ Chrome (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Edge (Latest)
- ✅ Mobile browsers

## 📱 Mobile Testing

Features to test on mobile:
- Touch gestures
- Responsive navigation
- Mobile payment flow
- Image upload
- Form inputs
- Modal interactions

## ⚡ Performance

Expected metrics:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

## 🐛 Known Issues

None currently reported.

## 📞 Support

For issues:
- Check browser console for errors
- Clear cache and cookies
- Try incognito/private mode
- Contact: support@hostelbazar.com

## 🎯 Evaluation Points

- [ ] User authentication works
- [ ] All dashboards load correctly
- [ ] Payment flow completes successfully
- [ ] Forms validate properly
- [ ] Responsive design works
- [ ] Animations are smooth
- [ ] Images load correctly
- [ ] Navigation is intuitive
- [ ] Error handling works
- [ ] Toast notifications appear

---

**Last Updated**: December 2024  
**Version**: 1.0.0
