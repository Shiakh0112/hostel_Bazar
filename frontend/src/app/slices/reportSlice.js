import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportService from '../../services/report.service';

// Async thunks
export const fetchOwnerDashboard = createAsyncThunk(
  'report/fetchOwnerDashboard',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getOwnerDashboard(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchRevenueReport = createAsyncThunk(
  'report/fetchRevenueReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getRevenueReport(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue report');
    }
  }
);

export const fetchOccupancyReport = createAsyncThunk(
  'report/fetchOccupancyReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getOccupancyReport(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch occupancy report');
    }
  }
);

export const fetchMaintenanceReport = createAsyncThunk(
  'report/fetchMaintenanceReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getMaintenanceReport(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance report');
    }
  }
);

export const fetchStudentReport = createAsyncThunk(
  'report/fetchStudentReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getStudentReport(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch student report');
    }
  }
);

export const exportReport = createAsyncThunk(
  'report/exportReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.exportReport(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export report');
    }
  }
);

const initialState = {
  dashboardData: null,
  revenueReport: null,
  occupancyReport: null,
  maintenanceReport: null,
  studentReport: null,
  exportData: null,
  loading: false,
  error: null
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearReports: (state) => {
      state.dashboardData = null;
      state.revenueReport = null;
      state.occupancyReport = null;
      state.maintenanceReport = null;
      state.studentReport = null;
      state.exportData = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Owner Dashboard
      .addCase(fetchOwnerDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchOwnerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Revenue Report
      .addCase(fetchRevenueReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueReport.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueReport = action.payload;
      })
      .addCase(fetchRevenueReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Occupancy Report
      .addCase(fetchOccupancyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOccupancyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.occupancyReport = action.payload;
      })
      .addCase(fetchOccupancyReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Maintenance Report
      .addCase(fetchMaintenanceReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaintenanceReport.fulfilled, (state, action) => {
        state.loading = false;
        state.maintenanceReport = action.payload;
      })
      .addCase(fetchMaintenanceReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Student Report
      .addCase(fetchStudentReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentReport.fulfilled, (state, action) => {
        state.loading = false;
        state.studentReport = action.payload;
      })
      .addCase(fetchStudentReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Export Report
      .addCase(exportReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportReport.fulfilled, (state, action) => {
        state.loading = false;
        state.exportData = action.payload;
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearReports, clearError } = reportSlice.actions;
export default reportSlice.reducer;