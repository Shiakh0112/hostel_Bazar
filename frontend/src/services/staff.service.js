import api from './api';

export const staffService = {
  // Owner staff management
  createStaff: (staffData) => api.post('/staff', staffData),
  getOwnerStaff: () => api.get('/staff/owner/my-staff'),
  getStaffById: (staffId) => api.get(`/staff/${staffId}`),
  updateStaff: (staffId, updateData) => api.put(`/staff/${staffId}`, updateData),
  deleteStaff: (staffId) => api.delete(`/staff/${staffId}`),
  getStaffStats: () => api.get('/staff/owner/stats'),

  // Staff profile management
  getStaffProfile: () => api.get('/staff/profile'),
  updateStaffProfile: (profileData) => {
    // Check if profileData is FormData
    if (profileData instanceof FormData) {
      return api.put('/staff/profile', profileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.put('/staff/profile', profileData);
  },
  changeStaffPassword: (passwordData) => api.put('/staff/change-password', passwordData),
  resetStaffPassword: (staffId) => api.put(`/staff/${staffId}/reset-password`)
};

export default staffService;