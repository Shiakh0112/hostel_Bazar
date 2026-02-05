import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/auth.service'
import toast from 'react-hot-toast'

// Async thunks
export const fetchStaffProfile = createAsyncThunk(
  'auth/fetchStaffProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile()
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch profile'
      return rejectWithValue(message)
    }
  }
)

export const updateStaffProfile = createAsyncThunk(
  'auth/updateStaffProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData)
      toast.success('Profile updated successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Signup request:', userData)
      const response = await authService.signup(userData)
      console.log('Signup response:', response.data)
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      console.error('Signup error:', error)
      const message = error.response?.data?.message || 'Signup failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTP(otpData)
      const responseData = response.data.data !== undefined ? response.data.data : response.data
      localStorage.setItem('token', responseData.token)
      toast.success('Account verified successfully!')
      return responseData
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      const responseData = response.data.data !== undefined ? response.data.data : response.data
      localStorage.setItem('token', responseData.token)
      toast.success('Login successful!')
      return responseData
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const staffLogin = createAsyncThunk(
  'auth/staffLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.staffLogin(credentials)
      const responseData = response.data.data !== undefined ? response.data.data : response.data
      localStorage.setItem('token', responseData.token)
      toast.success('Staff login successful!')
      return responseData
    } catch (error) {
      const message = error.response?.data?.message || 'Staff login failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(emailData.email);
      toast.success('Password reset OTP sent to your email!');
      return response.data.data || response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(resetData)
      toast.success('Password reset successful!')
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile()
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      localStorage.removeItem('token')
      return rejectWithValue('Authentication failed')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData)
      toast.success('Profile updated successfully!')
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: false,
  signupStep: 'form', // form, otp, complete
  tempUserId: null,
  resetUserId: null,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token')
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.signupStep = 'form'
      state.tempUserId = null
      state.resetUserId = null
      state.error = null
      toast.success('Logged out successfully!')
    },
    clearError: (state) => {
      state.error = null
    },
    setSignupStep: (state, action) => {
      state.signupStep = action.payload
    },
    setTempUserId: (state, action) => {
      state.tempUserId = action.payload
    },
    setResetUserId: (state, action) => {
      state.resetUserId = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signup.fulfilled, (state, action) => {
        console.log('Signup fulfilled:', action.payload)
        state.isLoading = false
        state.signupStep = 'otp'
        state.tempUserId = action.payload.userId
        console.log('Updated state:', { signupStep: state.signupStep, tempUserId: state.tempUserId })
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.signupStep = 'complete'
        state.tempUserId = null
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Staff Login
      .addCase(staffLogin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(staffLogin.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(staffLogin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.resetUserId = action.payload.userId
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
        state.resetUserId = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = { ...state.user, ...action.payload }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { 
  logout, 
  clearError, 
  setSignupStep, 
  setTempUserId, 
  setResetUserId 
} = authSlice.actions

export default authSlice.reducer