import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import paymentService from '../../services/payment.service'
import toast from 'react-hot-toast'

// Async thunks
export const fetchStudentPayments = createAsyncThunk(
  'payments/fetchStudentPayments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await paymentService.getStudentPayments(filters)
      console.log('🔍 Redux: fetchStudentPayments response:', response.data)
      return response.data.data // Extract the nested data object
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch payments'
      return rejectWithValue(message)
    }
  }
)

export const fetchInvoices = createAsyncThunk(
  'payments/fetchInvoices',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await paymentService.getInvoices(filters)
      console.log('🔍 Redux: fetchInvoices response:', response.data)
      return response.data.data // Extract the nested data object
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch invoices'
      return rejectWithValue(message)
    }
  }
)

export const createPaymentOrder = createAsyncThunk(
  'payments/createPaymentOrder',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentService.createPaymentOrder(paymentData)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create payment order'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const verifyPayment = createAsyncThunk(
  'payments/verifyPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentService.verifyPayment(paymentData)
      toast.success('Payment successful!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Payment verification failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const getStudentPayments = createAsyncThunk(
  'payments/getStudentPayments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await paymentService.getStudentPayments(filters)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch payments'
      return rejectWithValue(message)
    }
  }
)

export const getOwnerPayments = createAsyncThunk(
  'payments/getOwnerPayments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await paymentService.getOwnerPayments(filters)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch payments'
      return rejectWithValue(message)
    }
  }
)

export const generateMonthlyInvoices = createAsyncThunk(
  'payments/generateMonthlyInvoices',
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await paymentService.generateMonthlyInvoices(invoiceData)
      toast.success('Monthly invoices generated successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate invoices'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const getInvoices = createAsyncThunk(
  'payments/getInvoices',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await paymentService.getInvoices(filters)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch invoices'
      return rejectWithValue(message)
    }
  }
)

export const payInvoice = createAsyncThunk(
  'payments/payInvoice',
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await paymentService.payInvoice(invoiceId)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create payment order'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const getPaymentStats = createAsyncThunk(
  'payments/getPaymentStats',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentStats(filters)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch payment statistics'
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  studentPayments: [],
  ownerPayments: [],
  invoices: [],
  paymentStats: null,
  currentPaymentOrder: null,
  isLoading: false,
  error: null,
  pagination: {
    current: 1,
    total: 0,
    count: 0,
    totalRecords: 0
  },
  filters: {
    status: '',
    paymentType: '',
    hostelId: '',
    month: '',
    year: '',
    page: 1,
    limit: 10
  }
}

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    clearCurrentPaymentOrder: (state) => {
      state.currentPaymentOrder = null
    },
    clearPaymentStats: (state) => {
      state.paymentStats = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Payment Order
      .addCase(createPaymentOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPaymentOrder = action.payload
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPaymentOrder = null
        // Add to student payments if it's a student payment
        if (action.payload.student) {
          state.studentPayments.unshift(action.payload)
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Student Payments
      .addCase(fetchStudentPayments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStudentPayments.fulfilled, (state, action) => {
        state.isLoading = false
        state.studentPayments = action.payload.payments
        state.pagination = action.payload.pagination
      })
      .addCase(fetchStudentPayments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false
        state.invoices = action.payload.invoices
        state.pagination = action.payload.pagination
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Owner Payments
      .addCase(getOwnerPayments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOwnerPayments.fulfilled, (state, action) => {
        state.isLoading = false
        state.ownerPayments = action.payload.payments
        state.pagination = action.payload.pagination
      })
      .addCase(getOwnerPayments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Generate Monthly Invoices
      .addCase(generateMonthlyInvoices.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(generateMonthlyInvoices.fulfilled, (state, action) => {
        state.isLoading = false
        // Refresh invoices after generation
      })
      .addCase(generateMonthlyInvoices.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Invoices
      .addCase(getInvoices.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getInvoices.fulfilled, (state, action) => {
        state.isLoading = false
        state.invoices = action.payload.invoices
        state.pagination = action.payload.pagination
      })
      .addCase(getInvoices.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Pay Invoice
      .addCase(payInvoice.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(payInvoice.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPaymentOrder = action.payload
      })
      .addCase(payInvoice.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Payment Stats
      .addCase(getPaymentStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPaymentStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.paymentStats = action.payload
      })
      .addCase(getPaymentStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  clearCurrentPaymentOrder,
  clearPaymentStats 
} = paymentSlice.actions

export default paymentSlice.reducer