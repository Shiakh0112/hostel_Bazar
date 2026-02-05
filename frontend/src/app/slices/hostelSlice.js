import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import hostelService from '../../services/hostel.service'
import toast from 'react-hot-toast'

// Async thunks
export const fetchHostels = createAsyncThunk(
  'hostels/fetchHostels',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await hostelService.getAllHostels(filters)
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch hostels'
      return rejectWithValue(message)
    }
  }
)

export const fetchHostelById = createAsyncThunk(
  'hostels/fetchHostelById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hostelService.getHostelById(id)
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch hostel details'
      return rejectWithValue(message)
    }
  }
)

export const fetchOwnerHostels = createAsyncThunk(
  'hostels/fetchOwnerHostels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hostelService.getOwnerHostels()
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch owner hostels'
      return rejectWithValue(message)
    }
  }
)

export const getAllHostels = createAsyncThunk(
  'hostels/getAllHostels',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await hostelService.getAllHostels(filters)
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch hostels'
      return rejectWithValue(message)
    }
  }
)

export const getHostelById = createAsyncThunk(
  'hostels/getHostelById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hostelService.getHostelById(id)
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch hostel details'
      return rejectWithValue(message)
    }
  }
)

export const createHostel = createAsyncThunk(
  'hostels/createHostel',
  async (hostelData, { rejectWithValue }) => {
    try {
      const response = await hostelService.createHostel(hostelData)
      console.log('API Response:', response.data)
      
      // Check if response is successful
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Hostel created successfully!')
        return response.data.data
      } else {
        throw new Error(response.data?.message || 'Failed to create hostel')
      }
    } catch (error) {
      console.error('Create hostel error:', error)
      const message = error.response?.data?.message || error.message || 'Failed to create hostel'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const getOwnerHostels = createAsyncThunk(
  'hostels/getOwnerHostels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hostelService.getOwnerHostels()
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch owner hostels'
      return rejectWithValue(message)
    }
  }
)

export const updateHostel = createAsyncThunk(
  'hostels/updateHostel',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await hostelService.updateHostel(id, data)
      toast.success('Hostel updated successfully!')
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update hostel'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const uploadHostelImages = createAsyncThunk(
  'hostels/uploadHostelImages',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await hostelService.uploadHostelImages(id, formData)
      const responseData = response.data.data !== undefined ? response.data.data : response.data
      toast.success('Images uploaded successfully!')
      return { hostelId: id, images: responseData }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload images'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const deleteHostel = createAsyncThunk(
  'hostels/deleteHostel',
  async (id, { rejectWithValue }) => {
    try {
      await hostelService.deleteHostel(id)
      toast.success('Hostel deleted successfully!')
      return id
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete hostel'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  hostels: [],
  ownerHostels: [],
  currentHostel: null,
  isLoading: false,
  error: null,
  pagination: {
    current: 1,
    total: 0,
    count: 0,
    totalRecords: 0
  },
  filters: {
    search: '',
    city: '',
    hostelType: '',
    roomType: '',
    minPrice: '',
    maxPrice: '',
    amenities: [],
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  }
}

const hostelSlice = createSlice({
  name: 'hostels',
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
    clearCurrentHostel: (state) => {
      state.currentHostel = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Hostels (used by Home page)
      .addCase(fetchHostels.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchHostels.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.hostels) {
          state.hostels = action.payload.hostels
          state.pagination = action.payload.pagination
        } else if (Array.isArray(action.payload)) {
          state.hostels = action.payload
        } else {
          state.hostels = []
        }
      })
      .addCase(fetchHostels.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get All Hostels
      .addCase(getAllHostels.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAllHostels.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.hostels) {
          state.hostels = action.payload.hostels
          state.pagination = action.payload.pagination
        } else if (Array.isArray(action.payload)) {
          state.hostels = action.payload
        } else {
          state.hostels = []
        }
      })
      .addCase(getAllHostels.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Hostel By ID (used by detail pages)
      .addCase(fetchHostelById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchHostelById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentHostel = action.payload
      })
      .addCase(fetchHostelById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Hostel By ID
      .addCase(getHostelById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getHostelById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentHostel = action.payload
      })
      .addCase(getHostelById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Hostel
      .addCase(createHostel.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createHostel.fulfilled, (state, action) => {
        state.isLoading = false
        state.ownerHostels.push(action.payload)
      })
      .addCase(createHostel.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Owner Hostels (used by owner dashboard)
      .addCase(fetchOwnerHostels.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOwnerHostels.fulfilled, (state, action) => {
        state.isLoading = false
        state.ownerHostels = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchOwnerHostels.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Owner Hostels
      .addCase(getOwnerHostels.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOwnerHostels.fulfilled, (state, action) => {
        state.isLoading = false
        state.ownerHostels = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(getOwnerHostels.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Hostel
      .addCase(updateHostel.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateHostel.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.ownerHostels.findIndex(h => h._id === action.payload._id)
        if (index !== -1) {
          state.ownerHostels[index] = action.payload
        }
        if (state.currentHostel?._id === action.payload._id) {
          state.currentHostel = action.payload
        }
      })
      .addCase(updateHostel.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Upload Hostel Images
      .addCase(uploadHostelImages.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadHostelImages.fulfilled, (state, action) => {
        state.isLoading = false
        const { hostelId, images } = action.payload
        const hostel = state.ownerHostels.find(h => h._id === hostelId)
        if (hostel) {
          hostel.images = [...(hostel.images || []), ...images]
        }
        if (state.currentHostel?._id === hostelId) {
          state.currentHostel.images = [...(state.currentHostel.images || []), ...images]
        }
      })
      .addCase(uploadHostelImages.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Hostel
      .addCase(deleteHostel.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteHostel.fulfilled, (state, action) => {
        state.isLoading = false
        state.ownerHostels = state.ownerHostels.filter(h => h._id !== action.payload)
      })
      .addCase(deleteHostel.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError, setFilters, clearFilters, clearCurrentHostel } = hostelSlice.actions

export default hostelSlice.reducer