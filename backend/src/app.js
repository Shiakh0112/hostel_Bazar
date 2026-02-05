const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const hostelRoutes = require('./routes/hostel.routes');
const bookingRoutes = require('./routes/booking.routes');
const roomRoutes = require('./routes/room.routes');
const paymentRoutes = require('./routes/payment.routes');
const monthlyPaymentRoutes = require('./routes/monthlyPayment.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const staffRoutes = require('./routes/staff.routes');
const studentRoutes = require('./routes/student.routes');
const reportRoutes = require('./routes/report.routes');
const notificationRoutes = require('./routes/notification.routes');
const expenseRoutes = require('./routes/expense.routes');
const discountRoutes = require('./routes/discount.routes');
const emergencyContactRoutes = require('./routes/emergencyContact.routes');
const checkoutRoutes = require('./routes/checkout.routes');
const paymentPlanRoutes = require('./routes/paymentPlan.routes');
const roomTransferRoutes = require('./routes/roomTransfer.routes');
const systemRoutes = require('./routes/system.routes');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  skip: (req) => {
    // Skip rate limiting for auth routes in development
    return process.env.NODE_ENV === 'development' && req.path.startsWith('/api/auth');
  }
});

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/monthly-payments', monthlyPaymentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/emergency-contacts', emergencyContactRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payment-plans', paymentPlanRoutes);
app.use('/api/room-transfers', roomTransferRoutes);
app.use('/api/system', systemRoutes);

app.use(errorHandler);

module.exports = app;