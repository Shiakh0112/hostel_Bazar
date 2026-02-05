import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, staffLogin, clearError } from '../app/slices/authSlice'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/common/Loader'
import { Mail, Lock, Eye, EyeOff, User, Shield, ArrowRight, Building } from 'lucide-react'

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, getDashboardRoute } = useAuth()
  const { isLoading, error } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    loginType: 'user' // user or staff
  })
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (isAuthenticated) {
      if (from === '/') {
        const dashboardRoute = getDashboardRoute()
        navigate(dashboardRoute, { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    }
  }, [isAuthenticated, navigate, from, getDashboardRoute])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const credentials = {
      email: formData.email,
      password: formData.password
    }

    if (formData.loginType === 'staff') {
      dispatch(staffLogin(credentials))
    } else {
      dispatch(login(credentials))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Logging in..." />
      </div>
    )
  }

  // --- PREMIUM STYLING CLASSES ---
  const glassCard = "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl overflow-hidden"
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600"

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200 flex items-center justify-center p-4">
      <BackgroundBlobs />
      
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-extrabold text-slate-900 hover:scale-105 transition-transform">
            <Building className="w-8 h-8 text-blue-600" />
            <span className={gradientText}>HostelBazar</span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Welcome Back!
          </h2>
          <p className="mt-2 text-slate-500">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Main Card */}
        <div className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
          {/* Login Type Toggle */}
          <div className="mb-6">
            <div className="flex rounded-2xl bg-slate-100/80 p-1.5 backdrop-blur">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, loginType: 'user' })}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  formData.loginType === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <User className="w-4 h-4" />
                Student/Owner
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, loginType: 'staff' })}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  formData.loginType === 'staff'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <Shield className="w-4 h-4" />
                Staff
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
              </div>
            )}

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
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-11 w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                  placeholder="Enter your email address"
                />
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
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-11 pr-11 w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </Link>
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 pt-6 border-t border-slate-200/50">
            <p className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login