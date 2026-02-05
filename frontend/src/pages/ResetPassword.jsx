import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../app/slices/authSlice';
import { Lock, Eye, EyeOff, Shield, Building, KeyRound } from 'lucide-react';

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    userId: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- PREMIUM STYLING CLASSES ---
  const glassCard = "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl overflow-hidden";
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  useEffect(() => {
    const userId = searchParams.get('userId');
    const otp = searchParams.get('otp');
    
    if (userId) {
      setFormData(prev => ({ ...prev, userId, otp: otp || '' }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId) newErrors.userId = 'User ID is required';
    if (!formData.otp) newErrors.otp = 'OTP is required';
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await dispatch(resetPassword({
        userId: formData.userId,
        otp: formData.otp,
        newPassword: formData.newPassword
      })).unwrap();
      
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to reset password' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200 flex items-center justify-center p-4">
      <BackgroundBlobs />
      
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-3xl font-extrabold text-slate-900">
            <Building className="w-8 h-8 text-blue-600" />
            <span className={gradientText}>HostelBazar</span>
          </div>
          <div className="mt-6 mx-auto h-16 w-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shadow-lg ring-1 ring-purple-100">
            <KeyRound className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-slate-500">
            Enter the OTP and create a new password
          </p>
        </div>

        {/* Main Card */}
        <div className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User ID Field */}
            <div className="space-y-2">
              <label htmlFor="userId" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                User ID
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  value={formData.userId}
                  onChange={handleChange}
                  className="pl-11 w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                  placeholder="User ID from email or URL"
                  readOnly={!!searchParams.get('userId')}
                />
              </div>
              {errors.userId && <p className="text-red-600 text-sm font-medium">{errors.userId}</p>}
            </div>

            {/* OTP Field */}
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                OTP Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={formData.otp}
                  onChange={handleChange}
                  className="pl-11 w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                />
              </div>
              {errors.otp && <p className="text-red-600 text-sm font-medium">{errors.otp}</p>}
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="pl-11 pr-11 w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-red-600 text-sm font-medium">{errors.newPassword}</p>}
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
                  className="pl-11 pr-11 w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                  placeholder="Confirm new password"
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

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {errors.submit}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="bg-green-50/80 backdrop-blur border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm hover:from-purple-600 hover:to-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Resetting...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;