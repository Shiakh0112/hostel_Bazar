const express = require("express");
const {
  signup,
  verifyOTP,
  resendOTP,
  login,
  staffLogin,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  uploadProfileImage,
  changePassword
} = require("../controllers/auth.controller");

const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const {
  validateSignup,
  validateLogin,
  validateOTP,
} = require("../validations/auth.validation");

const router = express.Router();

/* ========== PUBLIC ROUTES ========== */
router.post("/signup", validateSignup, signup);
router.post("/verify-otp", validateOTP, verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", validateLogin, login);
router.post("/staff-login", validateLogin, staffLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

/* ========== PROTECTED ROUTES ========== */
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.put("/change-password", protect, changePassword);
router.post(
  "/upload-avatar",
  protect,
  upload.single("avatar"),
  uploadProfileImage
);

module.exports = router;
