# 🔐 Test User Credentials - HostelBazar

This document contains all test user credentials for evaluating the HostelBazar Hostel Management System.

## 🌐 Live Application URLs

- **Frontend Application**: https://hostel-bazar.vercel.app
- **Backend API**: https://hostel-bazar.onrender.com/api
- **API Documentation**: https://hostel-bazar.onrender.com/api/docs

---

## 👥 User Accounts

### 1. 👨‍💼 Hostel Owner Account

**Login Credentials:**
```
Email: owner@hostelbazar.com
Password: Owner@123
```

**Role:** Hostel Owner  
**User ID:** (Auto-generated)

**Features Access:**
- ✅ Create and manage multiple hostels
- ✅ View all bookings and payments
- ✅ Generate financial reports
- ✅ Manage staff members
- ✅ Track monthly rent collection
- ✅ View dashboard analytics
- ✅ Manage hostel expenses
- ✅ Handle maintenance requests

**Pre-configured Data:**
- 2-3 Sample hostels created
- Multiple rooms with different configurations
- Active bookings from students
- Payment history and transactions
- Staff members assigned

---

### 2. 👨‍🎓 Student Account

**Login Credentials:**
```
Email: student@hostelbazar.com
Password: Student@123
```

**Role:** Student  
**User ID:** (Auto-generated)

**Features Access:**
- ✅ Browse available hostels
- ✅ Search and filter hostels
- ✅ Book rooms online
- ✅ Make advance payments
- ✅ Pay monthly rent
- ✅ View payment history
- ✅ Download payment receipts
- ✅ Request room transfers
- ✅ Submit maintenance requests
- ✅ View booking details

**Pre-configured Data:**
- Active hostel booking
- Payment history (advance + monthly)
- Room assignment details
- Maintenance request history

---

### 3. 👨‍💼 Staff Account

**Login Credentials:**
```
Email: staff@hostelbazar.com
Password: Staff@123
Staff ID: STAFF001
```

**Role:** Staff Member  
**User ID:** (Auto-generated)

**Features Access:**
- ✅ View assigned hostel details
- ✅ Handle daily operations
- ✅ Process maintenance requests
- ✅ Assist students with queries
- ✅ View booking information
- ✅ Update maintenance status
- ✅ View payment records

**Pre-configured Data:**
- Assigned to sample hostels
- Access to hostel operations
- Maintenance requests to handle

---

## 💳 Test Payment Methods

### Option 1: Razorpay Test Cards

**Credit Card:**
```
Card Number: 4111 1111 1111 1111
Expiry Date: 12/25 (any future date)
CVV: 123 (any 3 digits)
Cardholder Name: Test User
```

**Debit Card:**
```
Card Number: 5555 5555 5555 4444
Expiry Date: 12/25
CVV: 123
Cardholder Name: Test User
```

**UPI:**
```
UPI ID: success@razorpay
```

---

### Option 2: Stripe Test Cards

**Successful Payment:**
```
Card Number: 4242 4242 4242 4242
Expiry Date: 12/25 (any future date)
CVV: 123 (any 3 digits)
Cardholder Name: Test User
Email: test@example.com
```

**Requires Authentication:**
```
Card Number: 4000 0027 6000 3184
Expiry Date: 12/25
CVV: 123
```

**Declined Card:**
```
Card Number: 4000 0000 0000 0002
Expiry Date: 12/25
CVV: 123
```

---

### Option 3: Fake Card (Development Only)

**Test Card:**
```
Card Number: 1234 5678 9012 3456
Expiry Date: 12/25
CVV: 123
Cardholder Name: Test User
```

**Note:** This is for development/testing purposes only and simulates successful payments.

---

### Option 4: UPI Payment

**Test UPI IDs:**
```
success@upi
test@paytm
demo@phonepe
sample@googlepay
```

---

### Option 5: Wallet Payments

**PhonePe:**
```
Mobile: 9876543210
PIN: 1234
```

**Google Pay:**
```
Mobile: 9876543210
PIN: 123456
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Booking Flow (Student)
1. Login with student credentials
2. Browse hostels
3. Select a hostel and room
4. Fill booking details
5. Make advance payment using test card
6. View booking confirmation

### Scenario 2: Monthly Payment (Student)
1. Login with student credentials
2. Go to Monthly Payments section
3. View pending payments
4. Click "Pay Now" on any pending payment
5. Complete payment using test card
6. View updated payment status

### Scenario 3: Hostel Management (Owner)
1. Login with owner credentials
2. View dashboard analytics
3. Create a new hostel
4. Add rooms to the hostel
5. View all bookings
6. Check payment reports
7. Generate monthly reports

### Scenario 4: Maintenance Request (Student)
1. Login with student credentials
2. Go to Maintenance section
3. Submit a new maintenance request
4. Track request status

### Scenario 5: Staff Operations (Staff)
1. Login with staff credentials
2. View assigned hostels
3. Check maintenance requests
4. Update request status
5. View student bookings

---

## 📊 Sample Data Overview

### Hostels:
- **Sunrise Hostel** - Boys hostel with 20 rooms
- **Moonlight Hostel** - Girls hostel with 15 rooms
- **Green Valley Hostel** - Co-ed hostel with 25 rooms

### Rooms:
- Single occupancy rooms
- Double occupancy rooms
- Triple occupancy rooms
- Different floor configurations

### Payments:
- Advance payments (completed)
- Monthly rent payments (pending & completed)
- Late fee calculations
- Payment history

---

## 🔒 Security Notes

1. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

2. **Session Management:**
   - JWT tokens expire after 7 days
   - Automatic logout on token expiry
   - Secure HTTP-only cookies

3. **Payment Security:**
   - All payments are encrypted
   - PCI DSS compliant
   - Test mode for development
   - Production mode for live transactions

---

## 🆘 Troubleshooting

### Issue: Cannot login
**Solution:** 
- Verify email and password are correct
- Check if account is verified
- Clear browser cache and cookies

### Issue: Payment fails
**Solution:**
- Use test card numbers provided above
- Ensure card details are entered correctly
- Check if payment gateway is in test mode

### Issue: OTP not received
**Solution:**
- Test accounts bypass OTP verification
- For new accounts, check spam folder
- Use valid email address

---

## 📞 Support

For any issues or questions:
- **Email**: support@hostelbazar.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/hostel-bazar/issues)
- **Documentation**: Check README.md for detailed setup

---

## ⚠️ Important Reminders

1. **Test Accounts Only**: These credentials are for testing/evaluation purposes only
2. **No Real Payments**: All payment transactions are in test mode
3. **Sample Data**: Pre-configured data is for demonstration purposes
4. **Reset Data**: Test data may be reset periodically
5. **Production Use**: Create new accounts for production use

---

## 📝 Evaluation Checklist

- [ ] Login with all three user types (Owner, Student, Staff)
- [ ] Test hostel creation and management (Owner)
- [ ] Test room booking flow (Student)
- [ ] Test payment processing with test cards
- [ ] Test monthly rent payment (Student)
- [ ] Test maintenance request system
- [ ] Test dashboard analytics (Owner)
- [ ] Test staff operations (Staff)
- [ ] Test responsive design on mobile
- [ ] Test search and filter functionality

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Active ✅

## 📝 Creating New Accounts

### How to Create Owner Account

1. **Go to Signup Page**
   - Visit: https://hostel-bazar.vercel.app/signup
   - Click "Sign Up" button
   - Select "Register as Owner"

2. **Fill Registration Form:**
   ```
   Full Name: Your Name
   Email: your-email@example.com
   Mobile: 9876543210
   Password: YourPassword@123
   Confirm Password: YourPassword@123
   ```

3. **Email Verification:**
   - System sends OTP to your email
   - Check inbox (or spam folder)
   - Enter 6-digit OTP code
   - OTP valid for 10 minutes
   - **Note:** Test accounts bypass OTP

4. **Account Activated:**
   - Login with your credentials
   - Complete profile setup
   - Start creating hostels

---

### How to Create Student Account

1. **Go to Signup Page**
   - Visit: https://hostel-bazar.vercel.app/signup
   - Select "Register as Student"

2. **Fill Registration Form:**
   ```
   Full Name: Student Name
   Email: student-email@example.com
   Mobile: 9876543210
   Password: StudentPass@123
   Confirm Password: StudentPass@123
   ```

3. **Email Verification:**
   - Check email for OTP
   - Enter 6-digit verification code
   - Click "Verify Account"
   - Account activated immediately

4. **Start Booking:**
   - Login to your account
   - Browse available hostels
   - Make bookings

---

### How Owner Creates Staff Account

1. **Login as Owner**
   - Use: owner@hostelbazar.com / Owner@123

2. **Navigate to Staff Management:**
   - Go to Dashboard
   - Click "Staff" in sidebar
   - Click "Add New Staff" button

3. **Fill Staff Details:**
   ```
   Staff Name: Staff Member Name
   Email: staff-email@example.com
   Mobile: 9876543210
   Staff ID: Auto-generated (e.g., STAFF002)
   Assign Hostel: Select from dropdown
   ```

4. **Staff Receives Credentials:**
   - Staff gets email with login details
   - Temporary password included
   - Staff ID provided
   - Can login immediately

---

## 🔐 Email Verification Process

### OTP Verification Flow:

**Step 1: User Registers**
- Fills signup form
- Submits registration
- System generates 6-digit OTP

**Step 2: OTP Email Sent**
```
Subject: Verify Your HostelBazar Account

Your OTP: 123456
Valid for: 10 minutes
```

**Step 3: User Enters OTP**
- Enter 6-digit code
- Click "Verify" button
- System validates OTP

**Step 4: Account Verified**
- Success message displayed
- Redirect to login page
- Can now login

### OTP Details:
- **Format:** 6 digits
- **Validity:** 10 minutes
- **Resend:** Available after 60 seconds
- **Max Attempts:** 3 tries

---

## 🔑 Forgot Password Process

### Password Reset Flow:

**Step 1: Click "Forgot Password"**
- Go to login page
- Click "Forgot Password?" link

**Step 2: Enter Email**
```
Email: your-email@example.com
```
- Click "Send Reset Link"

**Step 3: Check Email**
```
Subject: Reset Your HostelBazar Password

Reset Link: https://hostel-bazar.vercel.app/reset-password?token=xxx
Valid for: 1 hour
```

**Step 4: Click Reset Link**
- Opens password reset page
- Token validated automatically

**Step 5: Enter New Password**
```
New Password: NewPassword@123
Confirm Password: NewPassword@123
```
- Click "Reset Password"

**Step 6: Password Updated**
- Success message shown
- Login with new password

### Password Requirements:
```
✅ Minimum 8 characters
✅ At least 1 uppercase letter
✅ At least 1 lowercase letter
✅ At least 1 number
✅ At least 1 special character

Example: MyPass@123
```

---

## 📧 Email Notifications

### Users Receive Emails For:

1. **Account Registration:**
   - Welcome email
   - OTP verification code
   - Account activation

2. **Password Reset:**
   - Reset password link
   - Password changed confirmation

3. **Bookings:**
   - Booking confirmation
   - Payment receipt

4. **Payments:**
   - Monthly rent reminder
   - Payment success

5. **Staff:**
   - Staff account created
   - Login credentials

---

## 🧪 Testing Authentication

### Test Scenario 1: New Owner Signup
```
1. Go to /signup
2. Select "Owner" role
3. Fill form with valid details
4. Submit form
5. Check email for OTP
6. Enter OTP
7. Account verified
8. Login successfully
```

### Test Scenario 2: Forgot Password
```
1. Go to /login
2. Click "Forgot Password?"
3. Enter email
4. Check email for reset link
5. Click link
6. Enter new password
7. Password updated
8. Login with new password
```

### Test Scenario 3: Staff Creation
```
1. Login as owner
2. Go to Staff Management
3. Click "Add Staff"
4. Fill staff details
5. Submit
6. Staff receives email
7. Staff can login
```

---

## ⚠️ Important Testing Notes

### Pre-configured Test Accounts:
```
✅ Already verified (no OTP needed)
✅ Ready to use immediately
✅ Have sample data
```

### Creating New Accounts:
```
✅ Full signup flow works
✅ Email verification active
✅ OTP sent to real email
✅ Password reset functional
```

### Email Service:
```
✅ Gmail SMTP configured
✅ Emails sent in real-time
✅ Check spam folder
✅ OTP valid 10 minutes
✅ Reset link valid 1 hour
```

---
