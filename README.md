# 🏪 HostelBazar - Complete Hostel Management System

A modern, full-stack hostel management system built with **React.js**, **Node.js**, **Express.js**, and **MongoDB**. Features a beautiful glass morphism UI design with comprehensive management capabilities for hostels, students, payments, and more.

## 🚀 Live Demo

- **Frontend**: https://hostel-bazar.vercel.app
- **Backend API**: https://hostel-bazar.onrender.com/api

---

## 📊 Complete API Documentation

### **Base URL**
```
Production: https://hostel-bazar.onrender.com/api
Local: http://localhost:5000/api
```

---

## 🔐 Authentication System

The authentication system supports three user roles: **Students**, **Hostel Owners**, and **Staff Members**. All endpoints use JWT (JSON Web Tokens) for secure authentication.

### **How Authentication Works:**
1. **Signup** → User registers with email and password
2. **OTP Verification** → System sends OTP to email for verification
3. **Login** → User logs in with verified credentials
4. **JWT Token** → Server returns JWT token for authenticated requests
5. **Protected Routes** → Token must be included in Authorization header

---

### **Authentication Endpoints**

#### **1. User Signup (Registration)**
**Purpose:** Register a new user (Student or Owner)

```http
POST /api/auth/signup
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "role": "student"
}

Response (Success):
{
  "success": true,
  "message": "OTP sent to email",
  "userId": "user_id_here"
}
```

#### **2. Verify OTP**
**Purpose:** Verify user's email with OTP

```http
POST /api/auth/verify-otp
Content-Type: application/json

Body:
{
  "userId": "user_id_here",
  "otp": "123456"
}

Response (Success):
{
  "success": true,
  "message": "Email verified successfully",
  "token": "jwt_token_here",
  "user": { ...user_data }
}
```

#### **3. User Login**
**Purpose:** Login with email and password

```http
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "owner@hostelbazar.com",
  "password": "Owner@123"
}

Response (Success):
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "Owner Name",
    "email": "owner@hostelbazar.com",
    "role": "owner"
  }
}
```

#### **4. Staff Login**
**Purpose:** Login for staff members (requires Staff ID)

```http
POST /api/auth/staff-login
Content-Type: application/json

Body:
{
  "email": "staff@hostelbazar.com",
  "password": "Staff@123",
  "staffId": "STAFF001"
}

Response (Success):
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ...staff_data }
}
```

#### **5. Forgot Password**
```http
POST /api/auth/forgot-password
Content-Type: application/json

Body:
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Password reset link sent to email",
  "userId": "user_id_here"
}
```

#### **6. Reset Password**
```http
POST /api/auth/reset-password
Content-Type: application/json

Body:
{
  "userId": "user_id_here",
  "newPassword": "NewPassword@123"
}

Response:
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### **7. Get User Profile**
**Authentication Required**

```http
GET /api/auth/profile
Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "user": { ...user_data }
}
```

#### **8. Update Profile**
**Authentication Required**

```http
PUT /api/auth/profile
Authorization: Bearer {jwt_token}
Content-Type: application/json

Body:
{
  "name": "Updated Name",
  "phone": "9876543210"
}

Response:
{
  "success": true,
  "user": { ...updated_user_data }
}
```

---

## 🔐 Test User Credentials

Use these pre-configured test accounts:

### **👨💼 Hostel Owner Account**
```
Email: owner@hostelbazar.com
Password: Owner@123
```
**Access:** Create hostels, manage rooms, view payments, generate reports, manage staff

**Test Login:**
```bash
curl -X POST https://hostel-bazar.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@hostelbazar.com","password":"Owner@123"}'
```

### **👨🎓 Student Account**
```
Email: student@hostelbazar.com
Password: Student@123
```
**Access:** Browse hostels, book rooms, make payments, view payment history

**Test Login:**
```bash
curl -X POST https://hostel-bazar.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@hostelbazar.com","password":"Student@123"}'
```

### **👨💼 Staff Account**
```
Email: staff@hostelbazar.com
Password: Staff@123
Staff ID: STAFF001
```
**Access:** Handle daily operations, process maintenance requests

**Test Login:**
```bash
curl -X POST https://hostel-bazar.onrender.com/api/auth/staff-login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@hostelbazar.com","password":"Staff@123","staffId":"STAFF001"}'
```

### **🧪 Test Payment Cards**

**Razorpay:**
```
Card: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
```

**Stripe:**
```
Card: 4242 4242 4242 4242
Expiry: 12/25
CVV: 123
```

---

## 📋 All API Endpoints

### **Hostel Management**

#### **Get All Hostels**
```http
GET /api/hostels?city=Mumbai&gender=male

Response:
{
  "success": true,
  "hostels": [ ...hostel_array ]
}
```

#### **Create Hostel** (Owner Only)
```http
POST /api/hostels
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
{
  "name": "Sunrise Hostel",
  "address": "123 Main St",
  "city": "Mumbai",
  "contactNumber": "9876543210",
  "gender": "male",
  "facilities": ["wifi", "ac"],
  "images": [files]
}
```

#### **Get Hostel Details**
```http
GET /api/hostels/:id
```

#### **Update Hostel** (Owner Only)
```http
PUT /api/hostels/:id
Authorization: Bearer {token}
```

#### **Delete Hostel** (Owner Only)
```http
DELETE /api/hostels/:id
Authorization: Bearer {token}
```

---

### **Room Management**

#### **Get Rooms**
```http
GET /api/rooms?hostelId={hostel_id}
Authorization: Bearer {token}
```

#### **Create Room** (Owner Only)
```http
POST /api/rooms
Authorization: Bearer {token}

Body:
{
  "hostelId": "hostel_id",
  "roomNumber": "101",
  "floor": 1,
  "capacity": 4,
  "rentPerBed": 8000,
  "roomType": "shared"
}
```

#### **Update Room** (Owner Only)
```http
PUT /api/rooms/:id
Authorization: Bearer {token}
```

#### **Delete Room** (Owner Only)
```http
DELETE /api/rooms/:id
Authorization: Bearer {token}
```

---

### **Booking Management**

#### **Create Booking** (Student)
```http
POST /api/bookings
Authorization: Bearer {token}

Body:
{
  "hostelId": "hostel_id",
  "roomId": "room_id",
  "checkInDate": "2024-01-01",
  "duration": 6
}
```

#### **Get My Bookings** (Student)
```http
GET /api/bookings/my-bookings
Authorization: Bearer {token}
```

#### **Get Booking Requests** (Owner)
```http
GET /api/bookings/requests
Authorization: Bearer {token}
```

#### **Approve/Reject Booking** (Owner)
```http
PUT /api/bookings/:id/status
Authorization: Bearer {token}

Body:
{
  "status": "approved"
}
```

---

### **Payment System**

#### **Create Payment Order**
```http
POST /api/payments/create
Authorization: Bearer {token}

Body:
{
  "bookingId": "booking_id",
  "amount": 8000,
  "paymentMethod": "razorpay"
}
```

#### **Verify Payment**
```http
POST /api/payments/verify
Authorization: Bearer {token}

Body:
{
  "orderId": "order_id",
  "paymentId": "payment_id",
  "signature": "signature"
}
```

#### **Get Payment History**
```http
GET /api/payments/history
Authorization: Bearer {token}
```

#### **Download Receipt**
```http
GET /api/payments/receipt/:id
Authorization: Bearer {token}
```

---

### **Monthly Payments**

#### **Get Monthly Payments** (Student)
```http
GET /api/monthly-payments
Authorization: Bearer {token}
```

#### **Pay Monthly Rent**
```http
POST /api/monthly-payments/pay
Authorization: Bearer {token}

Body:
{
  "monthlyPaymentId": "payment_id",
  "paymentMethod": "razorpay"
}
```

---

### **Maintenance Management**

#### **Create Maintenance Request** (Student)
```http
POST /api/maintenance
Authorization: Bearer {token}

Body:
{
  "title": "AC not working",
  "description": "AC needs repair",
  "priority": "high"
}
```

#### **Get Maintenance Requests**
```http
GET /api/maintenance
Authorization: Bearer {token}
```

#### **Update Maintenance Status** (Staff/Owner)
```http
PUT /api/maintenance/:id
Authorization: Bearer {token}

Body:
{
  "status": "in_progress"
}
```

---

### **Staff Management**

#### **Add Staff** (Owner)
```http
POST /api/staff
Authorization: Bearer {token}

Body:
{
  "name": "Staff Name",
  "email": "staff@example.com",
  "password": "Staff@123",
  "staffId": "STAFF002",
  "hostelId": "hostel_id"
}
```

#### **Get All Staff** (Owner)
```http
GET /api/staff
Authorization: Bearer {token}
```

#### **Update Staff** (Owner)
```http
PUT /api/staff/:id
Authorization: Bearer {token}
```

#### **Delete Staff** (Owner)
```http
DELETE /api/staff/:id
Authorization: Bearer {token}
```

---

### **Student Management**

#### **Get All Students** (Owner/Staff)
```http
GET /api/students
Authorization: Bearer {token}
```

#### **Get Student Details**
```http
GET /api/students/:id
Authorization: Bearer {token}
```

---

### **Reports**

#### **Financial Report** (Owner)
```http
GET /api/reports/financial?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

#### **Occupancy Report** (Owner)
```http
GET /api/reports/occupancy
Authorization: Bearer {token}
```

---

### **Expenses**

#### **Add Expense** (Owner)
```http
POST /api/expenses
Authorization: Bearer {token}

Body:
{
  "hostelId": "hostel_id",
  "category": "maintenance",
  "amount": 5000,
  "description": "AC repair"
}
```

#### **Get Expenses** (Owner)
```http
GET /api/expenses?hostelId={hostel_id}
Authorization: Bearer {token}
```

---

### **Discounts**

#### **Create Discount** (Owner)
```http
POST /api/discounts
Authorization: Bearer {token}

Body:
{
  "code": "WELCOME10",
  "discountType": "percentage",
  "discountValue": 10
}
```

#### **Apply Discount**
```http
POST /api/discounts/apply
Authorization: Bearer {token}

Body:
{
  "code": "WELCOME10",
  "amount": 10000
}
```

---

### **Room Transfers**

#### **Request Room Transfer** (Student)
```http
POST /api/room-transfers
Authorization: Bearer {token}

Body:
{
  "currentRoomId": "room_id_1",
  "requestedRoomId": "room_id_2",
  "reason": "Need ground floor"
}
```

#### **Approve/Reject Transfer** (Owner)
```http
PUT /api/room-transfers/:id
Authorization: Bearer {token}

Body:
{
  "status": "approved"
}
```

---

### **Checkout**

#### **Request Checkout** (Student)
```http
POST /api/checkout
Authorization: Bearer {token}

Body:
{
  "bookingId": "booking_id",
  "checkoutDate": "2024-06-30"
}
```

#### **Process Checkout** (Owner/Staff)
```http
PUT /api/checkout/:id
Authorization: Bearer {token}

Body:
{
  "status": "completed",
  "refundAmount": 5000
}
```

---

### **Notifications**

#### **Get Notifications**
```http
GET /api/notifications
Authorization: Bearer {token}
```

#### **Mark as Read**
```http
PUT /api/notifications/:id/read
Authorization: Bearer {token}
```

---

### **Emergency Contacts**

#### **Add Emergency Contact** (Student)
```http
POST /api/emergency-contacts
Authorization: Bearer {token}

Body:
{
  "name": "Parent Name",
  "relationship": "Father",
  "phone": "9876543210"
}
```

#### **Get Emergency Contacts**
```http
GET /api/emergency-contacts
Authorization: Bearer {token}
```

---

### **Payment Plans**

#### **Get Available Plans**
```http
GET /api/payment-plans
Authorization: Bearer {token}

Response:
{
  "success": true,
  "plans": [
    {"name": "Monthly", "duration": 1, "discount": 0},
    {"name": "Quarterly", "duration": 3, "discount": 5},
    {"name": "Half-Yearly", "duration": 6, "discount": 10},
    {"name": "Yearly", "duration": 12, "discount": 15}
  ]
}
```

---

### **System**

#### **Health Check**
```http
GET /api/test

Response:
{
  "success": true,
  "message": "API is working"
}
```

---

## 🌟 Features

- **Multi-Role Authentication** - Students, Owners, Staff
- **Hostel Management** - Create, manage multiple hostels
- **Room Management** - Floor-wise organization, bed tracking
- **Payment System** - Razorpay & Stripe integration
- **Monthly Rent** - Automated rent collection
- **Maintenance** - Track and resolve requests
- **Reports** - Financial and occupancy analytics
- **Notifications** - Real-time alerts
- **Glass Morphism UI** - Modern, beautiful design

## 🛠️ Tech Stack

**Frontend:** React.js, Redux Toolkit, Tailwind CSS, Vite  
**Backend:** Node.js, Express.js, MongoDB, JWT  
**Payment:** Razorpay, Stripe  
**Storage:** Cloudinary

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/hostel-bazar.git

# Backend setup
cd backend
npm install
npm run dev

# Frontend setup
cd frontend
npm install
npm run dev
```

## 📝 License

MIT License

---

⭐ **Star this repository if you found it helpful!**
