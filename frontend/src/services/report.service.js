import api from './api';

export const reportService = {
  // Dashboard and analytics
  getOwnerDashboard: (params) => api.get('/reports/dashboard', { params }),
  getRevenueReport: (params) => api.get('/reports/revenue', { params }),
  getOccupancyReport: (params) => api.get('/reports/occupancy', { params }),
  getMaintenanceReport: (params) => api.get('/reports/maintenance', { params }),
  getStudentReport: (params) => api.get('/reports/students', { params }),
  
  // Export reports
  exportReport: (params) => api.get('/reports/export', { params })
};

export default reportService;