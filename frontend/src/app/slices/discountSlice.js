import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import discountService from '../../services/discount.service';

export const createDiscount = createAsyncThunk(
  'discount/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await discountService.createDiscount(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create discount');
    }
  }
);

export const fetchDiscounts = createAsyncThunk(
  'discount/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await discountService.getDiscounts(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch discounts');
    }
  }
);

export const validateDiscount = createAsyncThunk(
  'discount/validate',
  async (data, { rejectWithValue }) => {
    try {
      const response = await discountService.validateDiscount(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid discount code');
    }
  }
);

export const applyDiscount = createAsyncThunk(
  'discount/apply',
  async (data, { rejectWithValue }) => {
    try {
      const response = await discountService.applyDiscount(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply discount');
    }
  }
);

export const updateDiscount = createAsyncThunk(
  'discount/update',
  async ({ discountId, data }, { rejectWithValue }) => {
    try {
      const response = await discountService.updateDiscount(discountId, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update discount');
    }
  }
);

export const deleteDiscount = createAsyncThunk(
  'discount/delete',
  async (discountId, { rejectWithValue }) => {
    try {
      await discountService.deleteDiscount(discountId);
      return discountId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete discount');
    }
  }
);

const initialState = {
  discounts: [],
  validatedDiscount: null,
  isLoading: false,
  error: null
};

const discountSlice = createSlice({
  name: 'discount',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearValidatedDiscount: (state) => {
      state.validatedDiscount = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDiscount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createDiscount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.discounts.unshift(action.payload);
      })
      .addCase(createDiscount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDiscounts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.discounts = action.payload.discounts;
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(validateDiscount.fulfilled, (state, action) => {
        state.validatedDiscount = action.payload.discount;
      })
      .addCase(validateDiscount.rejected, (state, action) => {
        state.error = action.payload;
        state.validatedDiscount = null;
      })
      .addCase(updateDiscount.fulfilled, (state, action) => {
        const index = state.discounts.findIndex(disc => disc._id === action.payload._id);
        if (index !== -1) {
          state.discounts[index] = action.payload;
        }
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.discounts = state.discounts.filter(disc => disc._id !== action.payload);
      });
  }
});

export const { clearError, clearValidatedDiscount } = discountSlice.actions;
export default discountSlice.reducer;