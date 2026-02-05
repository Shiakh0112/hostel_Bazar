import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import roomService from '../../services/room.service'
import toast from 'react-hot-toast'

// Async thunks
export const fetchStudentRoom = createAsyncThunk(
  'rooms/fetchStudentRoom',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomService.getStudentRoom()
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'No room allocated'
      return rejectWithValue(message)
    }
  }
)

export const fetchRoomAvailability = createAsyncThunk(
  'rooms/fetchRoomAvailability',
  async (hostelId, { rejectWithValue }) => {
    try {
      const response = await roomService.getRoomAvailability(hostelId)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch room availability'
      return rejectWithValue(message)
    }
  }
)

export const getHostelRooms = createAsyncThunk(
  'rooms/getHostelRooms',
  async ({ hostelId, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await roomService.getHostelRooms(hostelId, filters)
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch rooms'
      return rejectWithValue(message)
    }
  }
)

export const getRoomAvailability = createAsyncThunk(
  'rooms/getRoomAvailability',
  async (hostelId, { rejectWithValue }) => {
    try {
      const response = await roomService.getRoomAvailability(hostelId)
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch room availability'
      return rejectWithValue(message)
    }
  }
)

export const getFloorWiseRooms = createAsyncThunk(
  'rooms/getFloorWiseRooms',
  async (hostelId, { rejectWithValue }) => {
    try {
      const response = await roomService.getFloorWiseRooms(hostelId)
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch floor-wise rooms'
      return rejectWithValue(message)
    }
  }
)

export const getStudentRoom = createAsyncThunk(
  'rooms/getStudentRoom',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomService.getStudentRoom()
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'No room allocated'
      return rejectWithValue(message)
    }
  }
)

export const getRoomById = createAsyncThunk(
  'rooms/getRoomById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await roomService.getRoomById(id)
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch room details'
      return rejectWithValue(message)
    }
  }
)

export const updateRoom = createAsyncThunk(
  'rooms/updateRoom',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await roomService.updateRoom(id, data)
      toast.success('Room updated successfully!')
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update room'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  rooms: [],
  floorWiseRooms: [],
  studentRoom: null,
  currentRoom: null,
  availability: null,
  isLoading: false,
  error: null,
  pagination: {
    current: 1,
    total: 0,
    count: 0,
    totalRecords: 0
  },
  filters: {
    floor: '',
    status: '',
    page: 1,
    limit: 20
  }
}

const roomSlice = createSlice({
  name: 'rooms',
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
    clearRooms: (state) => {
      state.rooms = []
      state.floorWiseRooms = []
      state.availability = null
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Hostel Rooms
      .addCase(getHostelRooms.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getHostelRooms.fulfilled, (state, action) => {
        state.isLoading = false
        state.rooms = action.payload.rooms
        state.pagination = action.payload.pagination
      })
      .addCase(getHostelRooms.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Room Availability
      .addCase(getRoomAvailability.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getRoomAvailability.fulfilled, (state, action) => {
        state.isLoading = false
        state.availability = action.payload
      })
      .addCase(getRoomAvailability.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Floor-wise Rooms
      .addCase(getFloorWiseRooms.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getFloorWiseRooms.fulfilled, (state, action) => {
        state.isLoading = false
        state.floorWiseRooms = action.payload
      })
      .addCase(getFloorWiseRooms.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Student Room (using fetchStudentRoom)
      .addCase(fetchStudentRoom.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStudentRoom.fulfilled, (state, action) => {
        state.isLoading = false
        state.studentRoom = action.payload
      })
      .addCase(fetchStudentRoom.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.studentRoom = null
      })
      
      // Get Room By ID
      .addCase(getRoomById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getRoomById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentRoom = action.payload
      })
      .addCase(getRoomById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Room
      .addCase(updateRoom.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.rooms.findIndex(r => r._id === action.payload._id)
        if (index !== -1) {
          state.rooms[index] = action.payload
        }
        if (state.currentRoom?._id === action.payload._id) {
          state.currentRoom = action.payload
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  clearRooms, 
  clearCurrentRoom 
} = roomSlice.actions

export default roomSlice.reducer