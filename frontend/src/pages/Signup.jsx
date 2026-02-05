import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signup, clearError } from "../app/slices/authSlice";
import { USER_ROLES } from "../utils/constants";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Building, UserCheck } from 'lucide-react';

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, signupStep } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    role: USER_ROLES.STUDENT,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- PREMIUM STYLING CLASSES ---
  const glassCard = "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl overflow-hidden";
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  // ❌ signupStep ko reset MAT karo
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // ✅ OTP page redirect
  useEffect(() => {
    if (signupStep === "otp") {
      navigate("/verify-otp");
    }
  }, [signupStep, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const { confirmPassword, ...userData } = formData;
    dispatch(signup(userData));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200 flex items-center justify-center p-4">
      <BackgroundBlobs />
      
      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-extrabold text-slate-900 hover:scale-105 transition-transform">
            <Building className="w-8 h-8 text-blue-600" />
            <span className={gradientText}>HostelBazar</span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-slate-500">
            Join our hostel management platform
          </p>
        </div>

        {/* Main Card */}
        <div className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-11 w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <p className="text-red-600 text-sm font-medium">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-11 w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && <p className="text-red-600 text-sm font-medium">{errors.email}</p>}
            </div>

            {/* Mobile Field */}
            <div className="space-y-2">
              <label htmlFor="mobile" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  className="pl-11 w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                  placeholder="Enter 10-digit mobile number"
                />
              </div>
              {errors.mobile && <p className="text-red-600 text-sm font-medium">{errors.mobile}</p>}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: USER_ROLES.STUDENT })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    formData.role === USER_ROLES.STUDENT
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <User className="w-6 h-6" />
                  <span className="font-semibold text-sm">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: USER_ROLES.OWNER })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    formData.role === USER_ROLES.OWNER
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <UserCheck className="w-6 h-6" />
                  <span className="font-semibold text-sm">Owner</span>
                </button>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-11 pr-11 w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-sm font-medium">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-11 pr-11 w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-600 text-sm font-medium">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-slate-200/50">
            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
