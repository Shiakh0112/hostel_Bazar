import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import staffService from '../../services/staff.service';

// Async thunks
export const fetchOwnerStaff = createAsyncThunk(
  'staff/fetchOwnerStaff',
  async (_, { rejectWithValue }) => {
    try {
      const response = await staffService.getOwnerStaff();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch staff');
    }
  }
);

export const createStaff = createAsyncThunk(
  'staff/createStaff',
  async (staffData, { rejectWithValue }) => {
    try {
      const response = await staffService.createStaff(staffData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create staff');
    }
  }
);

export const updateStaff = createAsyncThunk(
  'staff/updateStaff',
  async ({ staffId, updateData }, { rejectWithValue }) => {
    try {
      const response = await staffService.updateStaff(staffId, updateData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update staff');
    }
  }
);

export const deleteStaff = createAsyncThunk(
  'staff/deleteStaff',
  async (staffId, { rejectWithValue }) => {
    try {
      await staffService.deleteStaff(staffId);
      return staffId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete staff');
    }
  }
);

const initialState = {
  ownerStaff: [],
  selectedStaff: null,
  loading: false,
  error: null
};

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedStaff: (state, action) => {
      state.selectedStaff = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Owner Staff
      .addCase(fetchOwnerStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerStaff.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns { staff: [], pagination: {} }
        state.ownerStaff = action.payload.staff || action.payload;
      })
      .addCase(fetchOwnerStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Staff
      .addCase(createStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.ownerStaff.push(action.payload);
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Staff
      .addCase(updateStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.ownerStaff.findIndex(staff => staff._id === action.payload._id);
        if (index !== -1) {
          state.ownerStaff[index] = action.payload;
        }
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Staff
      .addCase(deleteStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.ownerStaff = state.ownerStaff.filter(staff => staff._id !== action.payload);
      })
      .addCase(deleteStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setSelectedStaff } = staffSlice.actions;
export default staffSlice.reducer;