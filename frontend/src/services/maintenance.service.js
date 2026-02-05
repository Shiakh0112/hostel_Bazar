import api from './api'

const maintenanceService = {
  // Create maintenance request (student)
  createMaintenanceRequest: async (requestData) => {
    return await api.post('/maintenance/request', requestData)
  },

  // Upload maintenance images
  uploadMaintenanceImages: async (requestId, formData) => {
    return await api.post(`/maintenance/${requestId}/upload-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Get student maintenance requests
  getStudentMaintenanceRequests: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key])
      }
    })
    return await api.get(`/maintenance/student/my-requests?${params.toString()}`)
  },

  // Get owner maintenance requests
  getOwnerMaintenanceRequests: async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })
      const response = await api.get(`/maintenance/owner/requests?${params.toString()}`)
      return response
    } catch (error) {
      console.error('Error fetching owner maintenance requests:', error)
      throw error
    }
  },

  // Get staff maintenance requests
  getStaffMaintenanceRequests: async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })
      const response = await api.get(`/maintenance/staff/assigned?${params.toString()}`)
      return response
    } catch (error) {
      console.error('Error fetching staff maintenance requests:', error)
      throw error
    }
  },

  // Assign maintenance request (owner)
  assignMaintenanceRequest: async (requestId, assignmentData) => {
    return await api.put(`/maintenance/${requestId}/assign`, assignmentData)
  },

  // Update maintenance status
  updateMaintenanceStatus: async (requestId, statusData) => {
    return await api.put(`/maintenance/${requestId}/status`, statusData)
  },

  // Add maintenance note
  addMaintenanceNote: async (requestId, message) => {
    return await api.post(`/maintenance/${requestId}/notes`, { message })
  },

  // Rate maintenance service (student)
  rateMaintenanceService: async (requestId, ratingData) => {
    return await api.post(`/maintenance/${requestId}/rate`, ratingData)
  },

  // Bulk update maintenance requests
  bulkUpdateMaintenanceStatus: async (requestIds, statusData) => {
    return await api.put('/maintenance/bulk-update', {
      requestIds,
      ...statusData
    })
  },

  // Get maintenance statistics
  getMaintenanceStats: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key])
      }
    })
    return await api.get(`/maintenance/stats?${params.toString()}`)
  },
}

export default maintenanceService