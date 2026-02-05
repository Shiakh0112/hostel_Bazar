import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Lock, Building, Send } from "lucide-react";
import { forgotPassword } from "../app/slices/authSlice";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // --- PREMIUM STYLING CLASSES ---
  const glassCard = "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl overflow-hidden";
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      const result = await dispatch(forgotPassword({ email })).unwrap();
      setMessage("Password reset OTP sent to your email");
      
      // Redirect to reset password page with userId
      setTimeout(() => {
        const userId = result.userId || result.data?.userId;
        navigate(`/reset-password?userId=${userId}`);
      }, 2000);
    } catch (error) {
      setError(error.message || "Failed to send reset email");
    }
  };

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
          <div className="mt-6 mx-auto h-16 w-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shadow-lg ring-1 ring-amber-100">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Forgot Password?
          </h2>
          <p className="mt-2 text-slate-500">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Main Card */}
        <div className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="bg-green-50/80 backdrop-blur border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm font-medium">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    {message}
                    <br />
                    <span className="text-xs">Redirecting to reset password page...</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/reset-password')}
                  className="mt-2 text-xs underline hover:no-underline"
                >
                  Click here if not redirected automatically
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || message}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm hover:from-amber-600 hover:to-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending Instructions...
                </>
              ) : message ? (
                <>
                  Redirecting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-8 pt-6 border-t border-slate-200/50">
            <div className="text-center space-y-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Login
              </Link>
              
              {/* Manual Reset Password Link */}
              <div className="pt-2">
                <Link
                  to="/reset-password"
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Already have OTP? Reset Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
