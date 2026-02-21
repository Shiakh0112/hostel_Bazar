# 🏨 HostelBazar - Complete Hostel Management System

A modern, full-stack hostel management system built with **React.js**, **Node.js**, **Express.js**, and **MongoDB**. Features a beautiful glass morphism UI design with comprehensive management capabilities.

---

## 🌐 Live Demo

- **Frontend**: https://hostel-bazar.vercel.app
- **Backend API**: https://hostel-bazar.onrender.com/api
- **API Health Check**: https://hostel-bazar.onrender.com/api/test
- **GitHub Repository**: https://github.com/Shiakh0112/hostel_Bazar.git

### ⚠️ Important Notes:
```
❗ Backend may take 30-60 seconds to wake up on first request (Render free tier)
❗ If you get 404 error, wait 1 minute and refresh
❗ Test the API health: https://hostel-bazar.onrender.com/api/test
```

---

## 🔐 Test User Credentials

### 👨‍💼 **Hostel Owner Account**
```
Email: khatikashfaq992@gmail.com
Password: Shaikh@123
```
**Access:** Create hostels, manage rooms, view payments, generate reports, manage staff

### 👨‍🎓 **Student Account**
```
Email: khanashfaq9423@gmail.com
Password: shaikh0112
```
**Access:** Browse hostels, book rooms, make payments, view payment history

### 👨‍💼 **Staff Account**
```
Email: ashfaqkhatik5109@gmail.com
Password: staff0112
Staff ID: STAFF001
```
**Access:** Handle daily operations, process maintenance requests

### 🧪 **Test Payment Cards**

**Razorpay Test Card:**
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
Name: Any Name
```

**Stripe Test Card:**
```
Card Number: 4242 4242 4242 4242
Expiry: 12/25
CVV: 123
Name: Any Name
```

---

## 🌟 Features

### 👥 **Multi-Role Authentication System**
- **Students** - Book rooms, make payments, view history
- **Hostel Owners** - Manage hostels, rooms, payments, reports
- **Staff Members** - Handle day-to-day operations
- Secure OTP-based email verification
- Password reset functionality
- JWT-based authentication

### 🏢 **Hostel Management**
- Create and manage multiple hostels
- Room allocation and management
- Floor-wise room organization
- Bed management with availability tracking
- Hostel image gallery with Cloudinary integration
- Real-time occupancy tracking

### 💰 **Payment System**
- **Razorpay** and **Stripe** payment gateway integration
- Monthly rent collection tracking
- Advance payment handling
- Payment history and receipts
- Late fee calculation
- Discount management
- Multiple payment methods support

### 📊 **Dashboard & Analytics**
- **Owner Dashboard** - Revenue tracking, occupancy rates, payment analytics
- **Student Dashboard** - Payment history, room details, notifications
- **Staff Dashboard** - Daily operations, maintenance requests
- Real-time data updates
- Interactive charts and graphs (Chart.js)
- Visual analytics with revenue trends

### 🔧 **Advanced Features**
- **Room Transfer System** - Move students between rooms
- **Maintenance Management** - Track and resolve maintenance requests
- **Notification System** - Real-time alerts and updates
- **Expense Tracking** - Monitor hostel operational costs
- **Report Generation** - Detailed financial and occupancy reports
- **Emergency Contacts** - Store student emergency contact information
- **Checkout System** - Handle student checkout with refunds

### 🎨 **Modern UI/UX**
- **Glass Morphism Design** - Beautiful transparent cards with blur effects
- **Animated Backgrounds** - Moving gradient blobs
- **Responsive Design** - Works perfectly on all devices
- **Dark/Light Theme Support**
- **Interactive Animations** - Smooth transitions and hover effects
- **Lucide React Icons** - Beautiful, consistent iconography

---

## 🛠️ Tech Stack

### **Frontend**
- **React.js 18** - Modern React with hooks
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Data visualization
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
- **Brevo (Sendinblue)** - Transactional emails
- **Cloudinary** - Image storage
- **Multer** - File upload handling

### **Payment Gateways**
- **Razorpay** - Indian payment gateway
- **Stripe** - International payment gateway

### **Additional Services**
- **Cron Jobs** - Automated tasks (monthly invoices, late fees)
- **Rate Limiting** - API protection
- **CORS** - Cross-origin resource sharing

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
│   │   ├── config/         # Configuration files
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   ├── uploads/            # File uploads
│   ├── backups/            # Database backups
│   ├── .env                # Environment variables
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
│   ├── .env                # Environment variables
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
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hostel-bazar
# or use MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hostel-bazar

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Brevo Email Service
BREVO_SENDER_EMAIL=your-email@gmail.com
BREVO_API_KEY=your-brevo-api-key

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Gateways
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
STRIPE_SECRET_KEY=your-stripe-secret-key

# Frontend URL
FRONTEND_URL=http://localhost:5173
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
# Local Development
VITE_API_URL=http://localhost:5000/api

# Production (uncomment for deployment)
# VITE_API_URL=https://hostel-bazar.onrender.com/api

VITE_RAZORPAY_KEY_ID=your-razorpay-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
VITE_APP_NAME=HostelBazar
```

Start frontend development server:
```bash
npm run dev
```

### **4. Access Application**
- **Local Frontend**: http://localhost:5173
- **Local Backend API**: http://localhost:5000/api
- **Live Demo**: https://hostel-bazar.vercel.app

---

## 📱 Usage Guide

### **For Students**
1. **Register** with email verification
2. **Browse hostels** by city, gender, price
3. **View hostel details** - rooms, amenities, pricing
4. **Book rooms** with advance payment
5. **Make monthly payments** on time
6. **Track payment history** and download receipts
7. **Request maintenance** for room issues
8. **Request room transfers** if needed
9. **View notifications** for important updates

### **For Hostel Owners**
1. **Register as owner** and verify account
2. **Create hostel** with details and images
3. **Add rooms** with floor and bed details
4. **Approve/reject bookings** from students
5. **Allocate rooms** to confirmed students
6. **Track payments** - advance and monthly
7. **Generate reports** - revenue, occupancy, maintenance
8. **Manage staff** - add, update, remove
9. **Handle maintenance** requests
10. **Track expenses** and profitability
11. **View analytics** with visual charts

### **For Staff**
1. **Login with staff credentials** (email + password + Staff ID)
2. **View assigned hostel** details
3. **Handle maintenance requests** - assign, update status
4. **Assist students** with queries
5. **View student list** in hostel
6. **Process daily operations**

---

## 🔧 Configuration

### **Database Setup**
The system automatically creates required collections and indexes. For MongoDB Atlas:
1. Create account at https://mongodb.com/cloud/atlas
2. Create cluster and database
3. Get connection string
4. Update MONGODB_URI in .env

### **Email Configuration**
For Gmail with Brevo:
1. Create Brevo account at https://brevo.com
2. Get API key from dashboard
3. Add BREVO_API_KEY to .env
4. Verify sender email

For Gmail direct (alternative):
1. Enable 2-factor authentication
2. Generate app password
3. Use in EMAIL_PASS

### **Payment Gateway Setup**

**Razorpay:**
1. Create account at https://razorpay.com
2. Get API keys from dashboard
3. Add keys to environment variables
4. Test with test cards

**Stripe:**
1. Create account at https://stripe.com
2. Get API keys from dashboard
3. Add keys to environment variables
4. Test with test cards

### **Cloudinary Setup**
1. Create account at https://cloudinary.com
2. Get cloud name, API key, and secret
3. Add to environment variables
4. Images will be automatically uploaded

---

## 🚀 Deployment

### **Backend Deployment (Render)**
1. Create account on Render.com
2. Connect GitHub repository
3. Create new Web Service
4. Set environment variables from .env
5. Deploy automatically on git push

**Deployed Backend:** https://hostel-bazar.onrender.com

### **Frontend Deployment (Vercel)**
1. Create account on Vercel.com
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Set environment variables
6. Deploy automatically on git push

**Deployed Frontend:** https://hostel-bazar.vercel.app

### **Database (MongoDB Atlas)**
1. Create MongoDB Atlas account
2. Create cluster and database
3. Whitelist IP: 0.0.0.0/0 (allow all)
4. Get connection string
5. Update MONGODB_URI in Render environment

---

## 📊 API Documentation

### **Base URL**
```

Test: https://hostel-bazar.onrender.com/api/test
Production: https://hostel-bazar.onrender.com/api
Local: http://localhost:5000/api
```

### **Testing the API**

You can test the API using:
- **Postman** - Download from https://postman.com
- **Thunder Client** - VS Code extension
- **cURL** - Command line tool
- **Browser** - For GET requests only

---

### **🔐 Authentication Endpoints**

#### **1. Health Check (No Auth Required)**
```http
GET /api/test
```
**Response:**
```json
{
  "success": true,
  "message": "API is working"
}
```

#### **2. User Signup**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "mobile": "9876543210",
  "role": "student"
}
```
**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email",
  "data": {
    "userId": "user_id_here"
  }
}
```

#### **3. Verify OTP**
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "userId": "user_id_from_signup",
  "otp": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    }
  }
}
```

#### **4. User Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "khatikashfaq992@gmail.com",
  "password": "Shaikh@123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "name": "Owner Name",
      "email": "khatikashfaq992@gmail.com",
      "role": "owner"
    }
  }
}
```

#### **5. Staff Login**
```http
POST /api/auth/staff-login
Content-Type: application/json

{
  "email": "ashfaqkhatik5109@gmail.com",
  "password": "staff0112",
  "staffId": "STAFF001"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Staff login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "name": "Staff Name",
      "email": "ashfaqkhatik5109@gmail.com",
      "role": "staff",
      "staffId": "STAFF001"
    }
  }
}
```

#### **6. Forgot Password**
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### **7. Reset Password**
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "userId": "user_id",
  "otp": "123456",
  "newPassword": "NewPassword@123"
}
```

---

### **🏢 Hostel Management Endpoints**

**Note:** All these endpoints require authentication. Add header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **1. Get All Hostels (Public)**
```http
GET /api/hostels
Query Parameters:
  - city: string (optional)
  - hostelType: boys|girls|co-ed (optional)
  - minPrice: number (optional)
  - maxPrice: number (optional)
  - page: number (default: 1)
  - limit: number (default: 10)
```
**Example:**
```
GET /api/hostels?city=Pune&hostelType=boys&page=1&limit=10
```

#### **2. Get Hostel by ID**
```http
GET /api/hostels/:id
```

#### **3. Create Hostel (Owner Only)**
```http
POST /api/hostels
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

Form Data:
  - name: string
  - description: string
  - address[street]: string
  - address[city]: string
  - address[state]: string
  - address[pincode]: string
  - hostelType: boys|girls|co-ed
  - structure[totalFloors]: number
  - structure[roomsPerFloor]: number
  - structure[bedsPerRoom]: number
  - pricing[monthlyRent]: number
  - pricing[advancePayment]: number
  - amenities: array of strings
  - mainImage: file
  - images: array of files
```

#### **4. Update Hostel (Owner Only)**
```http
PUT /api/hostels/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

#### **5. Delete Hostel (Owner Only)**
```http
DELETE /api/hostels/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### **🛏️ Room & Bed Management**

#### **1. Get Rooms by Hostel**
```http
GET /api/rooms/hostel/:hostelId
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **2. Get Available Beds**
```http
GET /api/rooms/hostel/:hostelId/available-beds
```

#### **3. Create Rooms (Owner Only)**
```http
POST /api/rooms/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "hostelId": "hostel_id",
  "totalFloors": 3,
  "roomsPerFloor": 4,
  "bedsPerRoom": 3
}
```

---

### **📝 Booking Endpoints**

#### **1. Create Booking (Student Only)**
```http
POST /api/bookings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "hostelId": "hostel_id",
  "bookingDetails": {
    "fullName": "John Doe",
    "checkInDate": "2025-03-01",
    "expectedCheckOutDate": "2025-12-31",
    "guardianName": "Parent Name",
    "guardianContact": "9876543210"
  }
}
```

#### **2. Get Student Bookings**
```http
GET /api/bookings/student
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **3. Get Owner Bookings**
```http
GET /api/bookings/owner
Authorization: Bearer YOUR_JWT_TOKEN
Query Parameters:
  - status: pending|approved|confirmed|rejected
  - hostelId: string (optional)
```

#### **4. Approve/Reject Booking (Owner Only)**
```http
PUT /api/bookings/:id/status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "approved",
  "rejectionReason": "Optional reason if rejected"
}
```

#### **5. Allocate Room (Owner Only)**
```http
PUT /api/bookings/:id/allocate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "roomId": "room_id",
  "bedId": "bed_id"
}
```

---

### **💰 Payment Endpoints**

#### **1. Create Payment Order**
```http
POST /api/payments/create-order
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "bookingId": "booking_id",
  "amount": 15000,
  "paymentType": "advance",
  "paymentMethod": "razorpay"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_id_from_razorpay",
    "amount": 1500000,
    "currency": "INR",
    "paymentId": "payment_doc_id"
  }
}
```

#### **2. Verify Payment**
```http
POST /api/payments/verify
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "paymentId": "payment_doc_id",
  "paymentMethod": "razorpay",
  "razorpayOrderId": "order_id",
  "razorpayPaymentId": "payment_id",
  "razorpaySignature": "signature"
}
```

#### **3. Get Student Payments**
```http
GET /api/payments/student
Authorization: Bearer YOUR_JWT_TOKEN
Query Parameters:
  - status: pending|completed|failed
  - paymentType: advance|monthly
```

#### **4. Get Owner Payments**
```http
GET /api/payments/owner
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### **📅 Monthly Payment Endpoints**

#### **1. Generate Monthly Rents (Student)**
```http
POST /api/monthly-payments/generate
Authorization: Bearer YOUR_JWT_TOKEN
```
**Response:** Creates monthly payment records for entire stay period

#### **2. Get Student Monthly Payments**
```http
GET /api/monthly-payments/student
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **3. Get Owner Monthly Payments**
```http
GET /api/monthly-payments/owner
Authorization: Bearer YOUR_JWT_TOKEN
Query Parameters:
  - hostelId: string (optional)
  - status: pending|completed
  - month: string (optional)
  - year: number (optional)
```

---

### **🔧 Maintenance Endpoints**

#### **1. Create Maintenance Request (Student)**
```http
POST /api/maintenance
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "hostelId": "hostel_id",
  "category": "plumbing",
  "priority": "high",
  "description": "Tap is leaking",
  "location": "Room 101"
}
```

#### **2. Get Student Maintenance Requests**
```http
GET /api/maintenance/student
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **3. Get Owner Maintenance Requests**
```http
GET /api/maintenance/owner
Authorization: Bearer YOUR_JWT_TOKEN
Query Parameters:
  - hostelId: string (optional)
  - status: pending|assigned|in_progress|completed
  - priority: low|medium|high|urgent
```

#### **4. Update Maintenance Status (Owner/Staff)**
```http
PUT /api/maintenance/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "completed",
  "actualCost": 500,
  "notes": "Fixed the tap"
}
```

---

### **👥 Staff Management Endpoints**

#### **1. Add Staff (Owner Only)**
```http
POST /api/staff
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Staff Name",
  "email": "staff@example.com",
  "mobile": "9876543210",
  "password": "Staff@123",
  "hostelId": "hostel_id",
  "position": "Manager",
  "salary": 25000
}
```

#### **2. Get Owner Staff**
```http
GET /api/staff/owner
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **3. Update Staff**
```http
PUT /api/staff/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **4. Delete Staff**
```http
DELETE /api/staff/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### **📊 Reports & Analytics Endpoints**

#### **1. Owner Dashboard**
```http
GET /api/reports/owner/dashboard
Authorization: Bearer YOUR_JWT_TOKEN
Query Parameters:
  - hostelId: string (optional)
  - period: number (days, default: 30)
```

#### **2. Revenue Report**
```http
GET /api/reports/revenue
Authorization: Bearer YOUR_JWT_TOKEN
Query Parameters:
  - hostelId: string (optional)
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD
  - groupBy: day|month|year
```

#### **3. Occupancy Report**
```http
GET /api/reports/occupancy
Authorization: Bearer YOUR_JWT_TOKEN
Query Parameters:
  - hostelId: string (optional)
```

#### **4. Maintenance Report**
```http
GET /api/reports/maintenance
Authorization: Bearer YOUR_JWT_TOKEN
Query Parameters:
  - hostelId: string (optional)
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD
```

#### **5. Student Report**
```http
GET /api/reports/students
Authorization: Bearer YOUR_JWT_TOKEN
Query Parameters:
  - hostelId: string (optional)
```

---

### **🔔 Notification Endpoints**

#### **1. Get User Notifications**
```http
GET /api/notifications
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **2. Mark as Read**
```http
PUT /api/notifications/:id/read
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **3. Mark All as Read**
```http
PUT /api/notifications/read-all
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### **💡 Testing Tips**

1. **Get JWT Token First:**
   - Login using test credentials
   - Copy the token from response
   - Add to Authorization header: `Bearer YOUR_TOKEN`

2. **Test Flow for Student:**
   ```
   Login → Browse Hostels → Create Booking → 
   Wait for Approval → Pay Advance → Generate Monthly Payments → 
   Pay Monthly Rent
   ```

3. **Test Flow for Owner:**
   ```
   Login → Create Hostel → Generate Rooms → 
   Approve Bookings → Allocate Rooms → View Reports
   ```

4. **Common Response Format:**
   ```json
   {
     "success": true|false,
     "message": "Response message",
     "data": { /* response data */ }
   }
   ```

5. **Error Response Format:**
   ```json
   {
     "success": false,
     "message": "Error message",
     "error": "Detailed error"
   }
   ```

---

### **📝 Postman Collection**

You can import this collection to Postman:

1. Create new collection "HostelBazar API"
2. Set base URL variable: `{{baseUrl}}` = `https://hostel-bazar.onrender.com/api`
3. Set auth token variable: `{{token}}` = Your JWT token
4. Add requests from above endpoints
5. Use `{{baseUrl}}` and `{{token}}` in requests

---

## 🔧 Troubleshooting

### **Backend 404 Error**
**Problem:** Backend returns 404 error

**Solution:**
1. Render free tier sleeps after 15 min inactivity
2. Wait 30-60 seconds for wake up
3. Test: https://hostel-bazar.onrender.com/api/test
4. Should return: `{"success":true,"message":"API is working"}`

### **Login 401 Error**
**Problem:** Login fails with 401 Unauthorized

**Solutions:**
1. Wait for backend to wake up (30-60 seconds)
2. Test API health first
3. Verify credentials are correct
4. Check browser console for errors

### **CORS Error**
**Problem:** CORS policy blocking requests

**Solution:**
1. Backend CORS is configured for:
   - http://localhost:5173
   - https://hostel-bazar.vercel.app
2. Clear browser cache
3. Check backend logs on Render

### **Payment Not Working**
**Problem:** Payment fails or doesn't process

**Solution:**
1. Use test cards provided above
2. Check payment gateway keys in .env
3. Verify backend is running
4. Check browser console for errors

### **Charts Not Loading**
**Problem:** Visual charts show loading spinner

**Solution:**
1. Wait for data to load (2-3 seconds)
2. Check browser console for errors
3. Verify Chart.js is installed
4. Refresh the page

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** Pull Request

---

## 📝 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

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
- **Chart.js** for beautiful data visualization

---

## 📞 Support

If you have any questions or need help:
1. Check the [Issues](https://github.com/Shiakh0112/hostel_Bazar/issues) page
2. Create a new issue if your problem isn't listed
3. Contact via GitHub

---

## 🎯 Key Features Summary

✅ Multi-role authentication (Student, Owner, Staff)
✅ Complete hostel management system
✅ Room and bed allocation
✅ Payment processing (Razorpay & Stripe)
✅ Monthly rent tracking
✅ Maintenance management
✅ Staff management
✅ Reports and analytics with charts
✅ Notification system
✅ Email verification
✅ Password reset
✅ Responsive design
✅ Glass morphism UI
✅ Real-time updates
✅ Automated cron jobs
✅ Image upload with Cloudinary
✅ PDF receipt generation
✅ Discount management
✅ Room transfer system
✅ Checkout with refunds
✅ Emergency contacts
✅ Expense tracking

---

⭐ **Star this repository if you found it helpful!**

---

## 📈 Project Status

- ✅ **Backend**: Deployed on Render
- ✅ **Frontend**: Deployed on Vercel
- ✅ **Database**: MongoDB Atlas
- ✅ **Payment**: Razorpay & Stripe integrated
- ✅ **Email**: Brevo configured
- ✅ **Images**: Cloudinary configured
- ✅ **Charts**: Chart.js working
- ✅ **CORS**: Properly configured
- ✅ **Authentication**: JWT working
- ✅ **All Features**: Tested and working

**Last Updated:** February 2025
