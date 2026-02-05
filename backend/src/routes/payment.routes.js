const express = require("express");
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  getStudentPayments,
  getOwnerPayments,
  generateMonthlyInvoices,
  getInvoices,
  payInvoice,
  getPaymentStats,
  sendPaymentReminder,
  markPaymentAsPaid,
  downloadInvoicePDF,
  downloadPaymentReceipt,
  triggerMonthlyInvoiceGeneration,
  triggerLateFeeCalculation
} = require("../controllers/payment.controller");

const auth = require("../middlewares/auth.middleware");
const roleAuth = require("../middlewares/role.middleware");
const { validatePayment } = require("../validations/payment.validation");

// ✅ Test route
router.get("/test", (req, res) => {
  res.json({ message: "Payment routes working" });
});

// ✅ Test verify route
router.post("/verify-test", (req, res) => {
  res.json({ message: "Verify route working", body: req.body });
});

// ✅ Create payment
router.post("/create-order", auth, validatePayment, createPaymentOrder);

// ✅ VERIFY PAYMENT
router.post("/verify", auth, verifyPayment);

// Student
router.get(
  "/student/my-payments",
  auth,
  roleAuth(["student"]),
  getStudentPayments
);

// Owner
router.get("/owner/payments", auth, roleAuth(["owner"]), getOwnerPayments);

router.post(
  "/owner/generate-invoices",
  auth,
  roleAuth(["owner"]),
  generateMonthlyInvoices
);

// Invoices
router.get("/invoices", auth, getInvoices);

router.post(
  "/invoices/:invoiceId/pay",
  auth,
  roleAuth(["student"]),
  payInvoice
);

// Fix payment statuses (one-time script)
router.post("/fix-statuses", auth, async (req, res) => {
  try {
    const Payment = require('../models/Payment.model');
    
    // First, let's see what we have
    const allPayments = await Payment.find({ student: req.user.id }).limit(5);
    console.log('Current payments:', allPayments.map(p => ({
      id: p._id,
      status: p.status,
      amount: p.amount,
      paymentType: p.paymentType,
      razorpayPaymentId: p.razorpayPaymentId
    })));
    
    // Mark first few payments as completed for demo
    const result = await Payment.updateMany(
      {
        student: req.user.id,
        status: 'pending'
      },
      {
        $set: {
          status: 'completed',
          paidAt: new Date(),
          razorpayPaymentId: 'pay_demo_' + Date.now()
        }
      },
      { limit: 5 } // Mark first 5 as completed
    );
    
    console.log('Fixed payment statuses:', result);
    res.json({ success: true, message: `Updated ${result.modifiedCount} payments`, data: result });
  } catch (error) {
    console.error('Fix statuses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update payment status (for testing/admin purposes)
router.put("/update-status/:paymentId", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await require('../models/Payment.model').findByIdAndUpdate(
      req.params.paymentId,
      { 
        status,
        paidAt: status === 'completed' ? new Date() : undefined
      },
      { new: true }
    );
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stats
router.get("/stats", auth, getPaymentStats);

// Staff actions
router.post("/:paymentId/reminder", auth, roleAuth(["staff", "owner"]), sendPaymentReminder);
router.put("/:paymentId/mark-paid", auth, roleAuth(["staff", "owner"]), markPaymentAsPaid);

// PDF Downloads
router.get("/invoices/:invoiceId/download", auth, roleAuth(["student"]), downloadInvoicePDF);
router.get("/receipts/:paymentId/download", auth, roleAuth(["student"]), downloadPaymentReceipt);

// Admin/Owner Cron Triggers
router.post("/admin/trigger-monthly-invoices", auth, roleAuth(["owner"]), triggerMonthlyInvoiceGeneration);
router.post("/admin/trigger-late-fees", auth, roleAuth(["owner"]), triggerLateFeeCalculation);

module.exports = router;
