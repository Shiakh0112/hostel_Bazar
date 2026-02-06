# 🏪 HostelBazar - Complete Hostel Management System

A modern, full-stack hostel management system built with **React.js**, **Node.js**, **Express.js**, and **MongoDB**. Features a beautiful glass morphism UI design with comprehensive management capabilities for hostels, students, payments, and more.

## 🚀 Live Demo

- **Frontend**: https://hostel-bazar.vercel.app
- **Backend API**: https://hostel-bazar.onrender.com/api
- **GitHub clone**: https://github.com/Shiakh0112/hostel_Bazar.git
- **GitHub Repository**: https://github.com/Shiakh0112/hostel_Bazar/edit/main
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

### 👥 **Multi-Role Authentication System**
- **Students** - Book rooms, make payments, view history
- **Hostel Owners** - Manage hostels, rooms, payments, reports
- **Staff Members** - Handle day-to-day operations
- **Secure OTP-based email verification**
- **Password reset functionality**

### 🏢 **Hostel Management**
- Create and manage multiple hostels
- Room allocation and management
- Floor-wise room organization
- Bed management with availability tracking
- Hostel image gallery with Cloudinary integration

### 💰 **Payment System**
- **Razorpay** and **Stripe** payment gateway integration
- Monthly rent collection tracking
- Payment history and receipts
- Late fee calculation
- Advance payment handling
- Payment plan management

### 📊 **Dashboard & Analytics**
- **Owner Dashboard** - Revenue tracking, occupancy rates, payment analytics
- **Student Dashboard** - Payment history, room details, notifications
- **Staff Dashboard** - Daily operations, maintenance requests
- Real-time data updates
- Interactive charts and graphs

### 🔧 **Advanced Features**
- **Room Transfer System** - Move students between rooms
- **Maintenance Management** - Track and resolve maintenance requests
- **Notification System** - Real-time alerts and updates
- **Expense Tracking** - Monitor hostel operational costs
- **Report Generation** - Detailed financial and occupancy reports
- **Discount Management** - Apply discounts and offers

### 🎨 **Modern UI/UX**
- **Glass Morphism Design** - Beautiful transparent cards with blur effects
- **Animated Backgrounds** - Moving gradient blobs
- **Responsive Design** - Works perfectly on all devices
- **Dark/Light Theme Support**
- **Interactive Animations** - Smooth transitions and hover effects

---

## 🛠️ Tech Stack

### **Frontend**
- **React.js 18** - Modern React with hooks
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Elegant notifications
- **Vite** - Fast build tool

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Cloudinary** - Image storage
- **Multer** - File upload handling

### **Payment Gateways**
- **Razorpay** - Indian payment gateway
- **Stripe** - International payment gateway

### **Additional Services**
- **Twilio** - SMS notifications (optional)
- **Cron Jobs** - Automated tasks
- **Socket.io** - Real-time communication

---

## 📁 Project Structure

```
hostel-bazar/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Custom middlewares
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   ├── validations/    # Input validations
│   │   └── config/         # Configuration files
│   ├── uploads/            # File uploads
│   └── package.json
├── frontend/               # React.js frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── app/            # Redux store & slices
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS files
│   └── package.json
├── hostel images/          # Sample hostel images
└── README.md
```

---

## 🚀 Quick Start

### **Prerequisites**
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud)
- **Git**

### **1. Clone Repository**
```bash
git clone https://github.com/Shiakh0112/hostel_Bazar.git
cd hostel_Bazar
```

### **2. Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/hostel-bazar
# or use MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hostel-bazar

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Gateways
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
STRIPE_SECRET_KEY=your-stripe-secret-key

# Twilio (Optional - SMS)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# Server
PORT=5000
NODE_ENV=development
```

Start backend server:
```bash
npm run dev
```

### **3. Frontend Setup**
```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
VITE_API_URL=https://hostel-bazar.onrender.com/api
VITE_RAZORPAY_KEY_ID=your-razorpay-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

Start frontend development server:
```bash
npm run dev
```

### **4. Access Application**
- **Live Demo**: https://hostel-bazar.vercel.app
- **Local Frontend**: http://localhost:5173
- **Local Backend API**: http://localhost:5000/api

---

## 📱 Usage Guide

### **For Students**
1. **Register** with email verification
2. **Browse hostels** and available rooms
3. **Book rooms** with online payment
4. **Track payments** and download receipts
5. **Request maintenance** and room transfers

### **For Hostel Owners**
1. **Register as owner** and verify account
2. **Create hostel** with details and images
3. **Add rooms** and manage availability
4. **Track payments** and generate reports
5. **Manage staff** and maintenance requests

### **For Staff**
1. **Login with staff credentials**
2. **Handle daily operations**
3. **Process maintenance requests**
4. **Assist with student queries**

---

## 🔧 Configuration

### **Database Setup**
The system automatically creates required collections and indexes. Sample data can be imported using:
```bash
cd backend
node scripts/seedData.js
```

### **Email Configuration**
For Gmail, enable 2-factor authentication and generate an app password:
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate app password for "Mail"
4. Use this password in EMAIL_PASS

### **Payment Gateway Setup**

**Razorpay:**
1. Create account at https://razorpay.com
2. Get API keys from dashboard
3. Add keys to environment variables

**Stripe:**
1. Create account at https://stripe.com
2. Get API keys from dashboard
3. Add keys to environment variables

---

## 🚀 Deployment

### **Backend Deployment (Render)**
1. Create account on Render.com
2. Connect GitHub repository
3. Set environment variables
4. Deploy automatically

### **Frontend Deployment (Vercel)**
1. Create account on Vercel.com
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set environment variables
5. Deploy automatically

### **Database (MongoDB Atlas)**
1. Create MongoDB Atlas account
2. Create cluster and database
3. Get connection string
4. Update MONGODB_URI in environment

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨💻 Author

**Shiakh0112**
- GitHub: [@Shiakh0112](https://github.com/Shiakh0112)
- Repository: [hostel_Bazar](https://github.com/Shiakh0112/hostel_Bazar.git)

---

## 🙏 Acknowledgments

- **React.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the flexible database
- **Cloudinary** for image storage solutions
- **Razorpay** and **Stripe** for payment processing

---

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/Shiakh0112/hostel_Bazar/issues) page
2. Create a new issue if your problem isn't already listed
3. Contact via GitHub

---

⭐ **Star this repository if you found it helpful!**
