import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import monthlyPaymentService from '../../services/monthlyPayment.service';

export const generateMonthlyRents = createAsyncThunk(
  'monthlyPayment/generate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await monthlyPaymentService.generateMonthlyRents();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate monthly rents');
    }
  }
);

export const fetchStudentMonthlyPayments = createAsyncThunk(
  'monthlyPayment/fetchStudent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await monthlyPaymentService.getStudentMonthlyPayments();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const fetchStaffMonthlyPayments = createAsyncThunk(
  'monthlyPayment/fetchStaff',
  async (_, { rejectWithValue }) => {
    try {
      const response = await monthlyPaymentService.getStaffMonthlyPayments();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const fetchOwnerMonthlyPayments = createAsyncThunk(
  'monthlyPayment/fetchOwner',
  async (params, { rejectWithValue }) => {
    try {
      const response = await monthlyPaymentService.getOwnerMonthlyPayments(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

const initialState = {
  studentPayments: [],
  staffPayments: [],
  ownerPayments: [],
  summary: null,
  isLoading: false,
  error: null
};

const monthlyPaymentSlice = createSlice({
  name: 'monthlyPayment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateMonthlyRents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generateMonthlyRents.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(generateMonthlyRents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchStudentMonthlyPayments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStudentMonthlyPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.studentPayments = action.payload;
      })
      .addCase(fetchStudentMonthlyPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchStaffMonthlyPayments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStaffMonthlyPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffPayments = action.payload;
      })
      .addCase(fetchStaffMonthlyPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOwnerMonthlyPayments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOwnerMonthlyPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ownerPayments = action.payload.payments || action.payload;
        state.summary = action.payload.summary || null;
      })
      .addCase(fetchOwnerMonthlyPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = monthlyPaymentSlice.actions;
export default monthlyPaymentSlice.reducer;
