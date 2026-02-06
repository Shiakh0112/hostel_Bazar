# 🏪 HostelBazar - Complete Hostel Management System

A modern, full-stack hostel management system built with **React.js**, **Node.js**, **Express.js**, and **MongoDB**. Features a beautiful glass morphism UI design with comprehensive management capabilities for hostels, students, payments, and more.

## 🚀 Live Demo

- **Frontend**: https://hostel-bazar.vercel.app
- **Backend API**: https://hostel-bazar.onrender.com/api

## 🔐 Test User Credentials

Use these credentials to test different user roles:

### **👨‍💼 Hostel Owner Account**
```
Email: owner@hostelbazar.com
Password: Owner@123
```
**Access:** Create hostels, manage rooms, view payments, generate reports, manage staff

### **👨‍🎓 Student Account**
```
Email: student@hostelbazar.com
Password: Student@123
```
**Access:** Browse hostels, book rooms, make payments, view payment history, request maintenance

### **👨‍💼 Staff Account**
```
Email: staff@hostelbazar.com
Password: Staff@123
Staff ID: STAFF001
```
**Access:** Handle daily operations, process maintenance requests, assist students

### **🧪 Test Payment Cards**

**For Razorpay Testing:**
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
Name: Any name
```

**For Stripe Testing:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
Name: Any name
Email: Any valid email
```

**For Fake Card Testing (Development):**
```
Card Number: 1234 5678 9012 3456
Expiry: 12/25
CVV: 123
Name: Test User
```

### **📝 Important Notes:**
- All test accounts are pre-configured with sample data
- Owner account has 2-3 sample hostels with rooms
- Student account has active bookings and payment history
- Staff account is linked to sample hostels
- Use test payment cards for making payments
- OTP verification is bypassed for test accounts

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

## 🚀 Quick Start

### **Prerequisites**
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud)
- **Git**

### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/hostel-bazar.git
cd hostel-bazar
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

## 📊 API Documentation

### **Authentication Endpoints**
```
POST /api/auth/signup          # User registration
POST /api/auth/verify-otp      # Email verification
POST /api/auth/login           # User login
POST /api/auth/staff-login     # Staff login
POST /api/auth/forgot-password # Password reset request
POST /api/auth/reset-password  # Password reset
GET  /api/auth/profile         # Get user profile
PUT  /api/auth/profile         # Update profile
```

### **Hostel Management**
```
GET    /api/hostels            # Get all hostels
POST   /api/hostels            # Create hostel
GET    /api/hostels/:id        # Get hostel details
PUT    /api/hostels/:id        # Update hostel
DELETE /api/hostels/:id        # Delete hostel
```

### **Room Management**
```
GET    /api/rooms              # Get rooms
POST   /api/rooms              # Create room
PUT    /api/rooms/:id          # Update room
DELETE /api/rooms/:id          # Delete room
```

### **Payment System**
```
POST   /api/payments/create    # Create payment
POST   /api/payments/verify    # Verify payment
GET    /api/payments/history   # Payment history
GET    /api/payments/receipt/:id # Download receipt
```

## 🚀 Deployment

### **Backend Deployment (Railway/Heroku)**
1. Create account on Railway or Heroku
2. Connect GitHub repository
3. Set environment variables
4. Deploy automatically

### **Frontend Deployment (Vercel/Netlify)**
1. Create account on Vercel or Netlify
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set environment variables
5. Deploy automatically

### **Database (MongoDB Atlas)**
1. Create MongoDB Atlas account
2. Create cluster and database
3. Get connection string
4. Update MONGODB_URI in environment

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** Pull Request

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- **React.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the flexible database
- **Cloudinary** for image storage solutions
- **Razorpay** and **Stripe** for payment processing

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/yourusername/hostel-bazar/issues) page
2. Create a new issue if your problem isn't already listed
3. Contact via email: your.email@example.com

---

⭐ **Star this repository if you found it helpful!**