import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { verifyOTP, clearError } from '../app/slices/authSlice'
import { useAuth } from '../hooks/useAuth'
import { Shield, ArrowLeft, RefreshCw, Building } from 'lucide-react'

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const VerifyOTP = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, getDashboardRoute } = useAuth()
  const { isLoading, error, tempUserId, signupStep } = useSelector((state) => state.auth)

  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(300) // 5 minutes

  // --- PREMIUM STYLING CLASSES ---
  const glassCard = "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl overflow-hidden"
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600"

  useEffect(() => {
    if (!tempUserId || signupStep !== 'otp') {
      navigate('/signup')
      return
    }

    if (isAuthenticated) {
      const dashboardRoute = getDashboardRoute()
      navigate(dashboardRoute, { replace: true })
    }
  }, [tempUserId, signupStep, isAuthenticated, navigate, getDashboardRoute])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (otp.length === 6) {
      dispatch(verifyOTP({
        userId: tempUserId,
        otp: otp
      }))
    }
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleResendOTP = () => {
    // In a real app, you would dispatch a resend OTP action
    setTimer(300)
    setOtp('')
  }

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
          <div className="mt-6 mx-auto h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-lg ring-1 ring-emerald-100">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-slate-500">
            We've sent a 6-digit code to your email
          </p>
        </div>

        {/* Main Card */}
        <div className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-3">
              <label htmlFor="otp" className="block text-sm font-bold text-slate-700 uppercase tracking-wide text-center">
                Enter 6-Digit Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                required
                value={otp}
                onChange={handleOtpChange}
                className="w-full border border-slate-200 rounded-xl py-4 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-2xl bg-white/80 backdrop-blur font-bold transition-all hover:bg-white/90 text-center tracking-[0.5em]"
                placeholder="000000"
              />
            </div>

            {/* Timer */}
            {timer > 0 && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Code expires in: <span className="font-bold">{formatTime(timer)}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm hover:from-emerald-600 hover:to-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Verify Code
                </>
              )}
            </button>

            {/* Resend Button */}
            {timer === 0 && (
              <button
                type="button"
                onClick={handleResendOTP}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-white/50 transition-all duration-200 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Resend Code
              </button>
            )}
          </form>

          {/* Back Link */}
          <div className="mt-8 pt-6 border-t border-slate-200/50">
            <div className="text-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Wrong email? Go back
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP