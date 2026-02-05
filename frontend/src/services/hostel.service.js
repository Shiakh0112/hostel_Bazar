import api from './api'

const hostelService = {
  // Get all hostels (public)
  getAllHostels: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key])
      }
    })
    return await api.get(`/hostels?${params.toString()}`)
  },

  // Get hostel by ID
  getHostelById: async (id) => {
    return await api.get(`/hostels/${id}`)
  },

  // Create hostel (owner only)
  createHostel: async (hostelData) => {
    const config = {
      timeout: 120000, // 2 minutes for file uploads
    };
    
    if (hostelData instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    
    return await api.post('/hostels', hostelData, config);
  },

  // Get owner hostels
  getOwnerHostels: async () => {
    return await api.get('/hostels/owner/my-hostels')
  },

  // Update hostel
  updateHostel: async (id, data) => {
    return await api.put(`/hostels/${id}`, data)
  },

  // Upload hostel images
  uploadHostelImages: async (id, formData) => {
    return await api.post(`/hostels/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Delete hostel
  deleteHostel: async (id) => {
    return await api.delete(`/hostels/${id}`)
  },
}

export default hostelService