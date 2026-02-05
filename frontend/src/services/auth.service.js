import api from './api'

const authService = {
  // User signup
  signup: async (userData) => {
    return await api.post('/auth/signup', userData)
  },

  // Verify OTP
  verifyOTP: async (otpData) => {
    return await api.post('/auth/verify-otp', otpData)
  },

  // User login
  login: async (credentials) => {
    return await api.post('/auth/login', credentials)
  },

  // Staff login
  staffLogin: async (credentials) => {
    return await api.post('/auth/staff-login', credentials)
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email })
  },

  // Reset password
  resetPassword: async (resetData) => {
    return await api.post('/auth/reset-password', resetData)
  },

  // Get user profile
  getProfile: async () => {
    return await api.get('/auth/profile')
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await api.put('/auth/profile', profileData)
  },

  // Upload profile image
  uploadProfileImage: async (formData) => {
    return await api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export default authService