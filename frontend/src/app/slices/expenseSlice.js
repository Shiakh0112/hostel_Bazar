import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import expenseService from '../../services/expense.service';

export const createExpense = createAsyncThunk(
  'expense/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await expenseService.createExpense(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create expense');
    }
  }
);

export const fetchExpenses = createAsyncThunk(
  'expense/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await expenseService.getExpenses(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }
);

export const fetchExpenseStats = createAsyncThunk(
  'expense/fetchStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await expenseService.getExpenseStats(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense stats');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expense/update',
  async ({ expenseId, data }, { rejectWithValue }) => {
    try {
      const response = await expenseService.updateExpense(expenseId, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update expense');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expense/delete',
  async (expenseId, { rejectWithValue }) => {
    try {
      await expenseService.deleteExpense(expenseId);
      return expenseId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete expense');
    }
  }
);

const initialState = {
  expenses: [],
  stats: null,
  summary: null,
  categoryBreakdown: [],
  isLoading: false,
  error: null
};

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses.unshift(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload.expenses;
        state.summary = action.payload.summary;
        state.categoryBreakdown = action.payload.categoryBreakdown;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchExpenseStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(exp => exp._id === action.payload._id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(exp => exp._id !== action.payload);
      });
  }
});

export const { clearError } = expenseSlice.actions;
export default expenseSlice.reducer;