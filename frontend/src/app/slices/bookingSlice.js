import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import bookingService from '../../services/booking.service'
import toast from 'react-hot-toast'

// Async thunks
export const createBookingRequest = createAsyncThunk(
  'bookings/createBookingRequest',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingService.createBookingRequest(bookingData)
      toast.success('Booking request submitted successfully!')
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create booking request'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const fetchStudentBookings = createAsyncThunk(
  'bookings/fetchStudentBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingService.getStudentBookings()
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch bookings'
      return rejectWithValue(message)
    }
  }
)

export const fetchOwnerBookingRequests = createAsyncThunk(
  'bookings/fetchOwnerBookingRequests',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await bookingService.getOwnerBookingRequests(filters)
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch booking requests'
      return rejectWithValue(message)
    }
  }
)

export const getStudentBookings = createAsyncThunk(
  'bookings/getStudentBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingService.getStudentBookings()
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch bookings'
      return rejectWithValue(message)
    }
  }
)

export const getOwnerBookingRequests = createAsyncThunk(
  'bookings/getOwnerBookingRequests',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await bookingService.getOwnerBookingRequests(filters)
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch booking requests'
      return rejectWithValue(message)
    }
  }
)

export const approveBooking = createAsyncThunk(
  'bookings/approveBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await bookingService.approveBooking(bookingId)
      toast.success('Booking approved successfully!')
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve booking'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const rejectBooking = createAsyncThunk(
  'bookings/rejectBooking',
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      const response = await bookingService.rejectBooking(bookingId, reason)
      toast.success('Booking rejected successfully!')
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject booking'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const allocateRoomManually = createAsyncThunk(
  'bookings/allocateRoomManually',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await bookingService.allocateRoomManually(bookingId)
      toast.success('Room allocated successfully!')
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to allocate room'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const confirmBooking = createAsyncThunk(
  'bookings/confirmBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await bookingService.confirmBooking(bookingId)
      toast.success('Booking confirmed and room allocated!')
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to confirm booking'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await bookingService.cancelBooking(bookingId)
      toast.success('Booking cancelled successfully!')
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel booking'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const getBookingById = createAsyncThunk(
  'bookings/getBookingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookingById(id)
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch booking details'
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  studentBookings: [],
  ownerBookingRequests: [],
  currentBooking: null,
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
    page: 1,
    limit: 10
  }
}

const bookingSlice = createSlice({
  name: 'bookings',
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
    clearCurrentBooking: (state) => {
      state.currentBooking = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Booking Request
      .addCase(createBookingRequest.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBookingRequest.fulfilled, (state, action) => {
        state.isLoading = false
        state.studentBookings.unshift(action.payload)
      })
      .addCase(createBookingRequest.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Student Bookings
      .addCase(fetchStudentBookings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStudentBookings.fulfilled, (state, action) => {
        state.isLoading = false
        state.studentBookings = action.payload
      })
      .addCase(fetchStudentBookings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Student Bookings
      .addCase(getStudentBookings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getStudentBookings.fulfilled, (state, action) => {
        state.isLoading = false
        state.studentBookings = action.payload
      })
      .addCase(getStudentBookings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Owner Booking Requests
      .addCase(fetchOwnerBookingRequests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOwnerBookingRequests.fulfilled, (state, action) => {
        state.isLoading = false
        state.ownerBookingRequests = action.payload.bookings || action.payload
        state.pagination = action.payload.pagination || state.pagination
      })
      .addCase(fetchOwnerBookingRequests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Owner Booking Requests
      .addCase(getOwnerBookingRequests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOwnerBookingRequests.fulfilled, (state, action) => {
        state.isLoading = false
        state.ownerBookingRequests = action.payload.bookings || action.payload
        state.pagination = action.payload.pagination || state.pagination
      })
      .addCase(getOwnerBookingRequests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Approve Booking
      .addCase(approveBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(approveBooking.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.ownerBookingRequests.findIndex(b => b._id === action.payload._id)
        if (index !== -1) {
          state.ownerBookingRequests[index] = action.payload
        }
      })
      .addCase(approveBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Reject Booking
      .addCase(rejectBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.ownerBookingRequests.findIndex(b => b._id === action.payload._id)
        if (index !== -1) {
          state.ownerBookingRequests[index] = action.payload
        }
      })
      .addCase(rejectBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Confirm Booking
      .addCase(confirmBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.isLoading = false
        const studentIndex = state.studentBookings.findIndex(b => b._id === action.payload._id)
        if (studentIndex !== -1) {
          state.studentBookings[studentIndex] = action.payload
        }
        const ownerIndex = state.ownerBookingRequests.findIndex(b => b._id === action.payload._id)
        if (ownerIndex !== -1) {
          state.ownerBookingRequests[ownerIndex] = action.payload
        }
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.studentBookings.findIndex(b => b._id === action.payload._id)
        if (index !== -1) {
          state.studentBookings[index] = action.payload
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Booking By ID
      .addCase(getBookingById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentBooking = action.payload
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError, setFilters, clearFilters, clearCurrentBooking } = bookingSlice.actions

export default bookingSlice.reducer