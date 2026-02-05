import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import maintenanceService from '../../services/maintenance.service'
import toast from 'react-hot-toast'

// Async thunks
export const fetchStudentMaintenanceRequests = createAsyncThunk(
  'maintenance/fetchStudentMaintenanceRequests',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.getStudentMaintenanceRequests(filters)
      return response.data.data || response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch maintenance requests'
      return rejectWithValue(message)
    }
  }
)

export const fetchStaffMaintenanceRequests = createAsyncThunk(
  'maintenance/fetchStaffMaintenanceRequests',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.getStaffMaintenanceRequests(filters)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch assigned requests'
      return rejectWithValue(message)
    }
  }
)

export const createMaintenanceRequest = createAsyncThunk(
  'maintenance/createMaintenanceRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.createMaintenanceRequest(requestData)
      toast.success('Maintenance request created successfully!')
      return response.data.data || response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create maintenance request'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const uploadMaintenanceImages = createAsyncThunk(
  'maintenance/uploadMaintenanceImages',
  async ({ requestId, formData }, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.uploadMaintenanceImages(requestId, formData)
      toast.success('Images uploaded successfully!')
      const images = response.data.data?.images || response.data.images || []
      return { requestId, images }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload images'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const getStudentMaintenanceRequests = createAsyncThunk(
  'maintenance/getStudentMaintenanceRequests',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.getStudentMaintenanceRequests(filters)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch maintenance requests'
      return rejectWithValue(message)
    }
  }
)

export const getOwnerMaintenanceRequests = createAsyncThunk(
  'maintenance/getOwnerMaintenanceRequests',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.getOwnerMaintenanceRequests(filters)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch maintenance requests'
      return rejectWithValue(message)
    }
  }
)

export const getStaffMaintenanceRequests = createAsyncThunk(
  'maintenance/getStaffMaintenanceRequests',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.getStaffMaintenanceRequests(filters)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch assigned requests'
      return rejectWithValue(message)
    }
  }
)

export const assignMaintenanceRequest = createAsyncThunk(
  'maintenance/assignMaintenanceRequest',
  async ({ requestId, assignmentData }, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.assignMaintenanceRequest(requestId, assignmentData)
      toast.success('Maintenance request assigned successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to assign maintenance request'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const updateMaintenanceStatus = createAsyncThunk(
  'maintenance/updateMaintenanceStatus',
  async ({ requestId, statusData }, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.updateMaintenanceStatus(requestId, statusData)
      toast.success('Maintenance status updated successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update maintenance status'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const addMaintenanceNote = createAsyncThunk(
  'maintenance/addMaintenanceNote',
  async ({ requestId, message }, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.addMaintenanceNote(requestId, message)
      toast.success('Note added successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add note'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const rateMaintenanceService = createAsyncThunk(
  'maintenance/rateMaintenanceService',
  async ({ requestId, ratingData }, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.rateMaintenanceService(requestId, ratingData)
      toast.success('Service rated successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to rate service'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const bulkUpdateMaintenanceStatus = createAsyncThunk(
  'maintenance/bulkUpdateMaintenanceStatus',
  async ({ requestIds, statusData }, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.bulkUpdateMaintenanceStatus(requestIds, statusData)
      toast.success(`${requestIds.length} requests updated successfully!`)
      return { requestIds, statusData }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update requests'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const getMaintenanceStats = createAsyncThunk(
  'maintenance/getMaintenanceStats',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.getMaintenanceStats(filters)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch maintenance statistics'
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  studentRequests: [],
  ownerRequests: [],
  staffRequests: [],
  maintenanceStats: null,
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
    category: '',
    priority: '',
    hostelId: '',
    page: 1,
    limit: 10
  }
}

const maintenanceSlice = createSlice({
  name: 'maintenance',
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
    clearMaintenanceStats: (state) => {
      state.maintenanceStats = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Student Maintenance Requests
      .addCase(fetchStudentMaintenanceRequests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStudentMaintenanceRequests.fulfilled, (state, action) => {
        state.isLoading = false
        state.studentRequests = action.payload.requests || action.payload || []
        state.pagination = action.payload.pagination || initialState.pagination
      })
      .addCase(fetchStudentMaintenanceRequests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Staff Maintenance Requests
      .addCase(fetchStaffMaintenanceRequests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStaffMaintenanceRequests.fulfilled, (state, action) => {
        state.isLoading = false
        // Handle both direct array and nested response structure
        const responseData = action.payload?.data || action.payload
        state.staffRequests = responseData?.requests || responseData || []
        state.pagination = responseData?.pagination || initialState.pagination
      })
      .addCase(fetchStaffMaintenanceRequests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.staffRequests = [] // Clear requests on error
      })
      
      // Create Maintenance Request
      .addCase(createMaintenanceRequest.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createMaintenanceRequest.fulfilled, (state, action) => {
        state.isLoading = false
        // Ensure we have a valid maintenance object before adding
        if (action.payload && action.payload._id) {
          state.studentRequests.unshift(action.payload)
        }
      })
      .addCase(createMaintenanceRequest.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Upload Maintenance Images
      .addCase(uploadMaintenanceImages.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadMaintenanceImages.fulfilled, (state, action) => {
        state.isLoading = false
        const { requestId, images } = action.payload
        // Update the request with new images
        const studentRequest = state.studentRequests.find(r => r._id === requestId)
        if (studentRequest) {
          studentRequest.images = [...(studentRequest.images || []), ...images]
        }
      })
      .addCase(uploadMaintenanceImages.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Student Maintenance Requests
      .addCase(getStudentMaintenanceRequests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getStudentMaintenanceRequests.fulfilled, (state, action) => {
        state.isLoading = false
        state.studentRequests = action.payload.requests || action.payload || []
        state.pagination = action.payload.pagination || initialState.pagination
      })
      .addCase(getStudentMaintenanceRequests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Owner Maintenance Requests
      .addCase(getOwnerMaintenanceRequests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOwnerMaintenanceRequests.fulfilled, (state, action) => {
        state.isLoading = false
        state.ownerRequests = action.payload.requests || action.payload || []
        state.pagination = action.payload.pagination || initialState.pagination
      })
      .addCase(getOwnerMaintenanceRequests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Staff Maintenance Requests
      .addCase(getStaffMaintenanceRequests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getStaffMaintenanceRequests.fulfilled, (state, action) => {
        state.isLoading = false
        state.staffRequests = action.payload.requests || action.payload || []
        state.pagination = action.payload.pagination || initialState.pagination
      })
      .addCase(getStaffMaintenanceRequests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Assign Maintenance Request
      .addCase(assignMaintenanceRequest.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(assignMaintenanceRequest.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.ownerRequests.findIndex(r => r._id === action.payload._id)
        if (index !== -1) {
          state.ownerRequests[index] = action.payload
        }
      })
      .addCase(assignMaintenanceRequest.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Maintenance Status
      .addCase(updateMaintenanceStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateMaintenanceStatus.fulfilled, (state, action) => {
        state.isLoading = false
        // Update in all relevant arrays
        const updateRequest = (requests) => {
          const index = requests.findIndex(r => r._id === action.payload._id)
          if (index !== -1) {
            requests[index] = action.payload
          }
        }
        updateRequest(state.studentRequests)
        updateRequest(state.ownerRequests)
        updateRequest(state.staffRequests)
      })
      .addCase(updateMaintenanceStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Add Maintenance Note
      .addCase(addMaintenanceNote.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addMaintenanceNote.fulfilled, (state, action) => {
        state.isLoading = false
        // Update in all relevant arrays
        const updateRequest = (requests) => {
          const index = requests.findIndex(r => r._id === action.payload._id)
          if (index !== -1) {
            requests[index] = action.payload
          }
        }
        updateRequest(state.studentRequests)
        updateRequest(state.ownerRequests)
        updateRequest(state.staffRequests)
      })
      .addCase(addMaintenanceNote.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Rate Maintenance Service
      .addCase(rateMaintenanceService.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(rateMaintenanceService.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.studentRequests.findIndex(r => r._id === action.payload._id)
        if (index !== -1) {
          state.studentRequests[index] = action.payload
        }
      })
      .addCase(rateMaintenanceService.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Maintenance Stats
      .addCase(getMaintenanceStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getMaintenanceStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.maintenanceStats = action.payload
      })
      .addCase(getMaintenanceStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Bulk Update Maintenance Status
      .addCase(bulkUpdateMaintenanceStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(bulkUpdateMaintenanceStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const { requestIds, statusData } = action.payload
        // Update status for all affected requests
        const updateRequests = (requests) => {
          requests.forEach(request => {
            if (requestIds.includes(request._id)) {
              request.status = statusData.status
              if (statusData.notes) {
                request.notes = request.notes || []
                request.notes.push({
                  message: statusData.notes,
                  createdAt: new Date().toISOString()
                })
              }
            }
          })
        }
        updateRequests(state.studentRequests)
        updateRequests(state.ownerRequests)
        updateRequests(state.staffRequests)
      })
      .addCase(bulkUpdateMaintenanceStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  clearMaintenanceStats 
} = maintenanceSlice.actions

export default maintenanceSlice.reducer