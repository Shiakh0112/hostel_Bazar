import api from './api'

const roomService = {
  // Get hostel rooms
  getHostelRooms: async (hostelId, filters = {}) => {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key])
      }
    })
    return await api.get(`/rooms/hostel/${hostelId}?${params.toString()}`)
  },

  // Get room availability
  getRoomAvailability: async (hostelId) => {
    return await api.get(`/rooms/hostel/${hostelId}/availability`)
  },

  // Get floor-wise rooms
  getFloorWiseRooms: async (hostelId) => {
    return await api.get(`/rooms/hostel/${hostelId}/floors`)
  },

  // Get student room
  getStudentRoom: async () => {
    return await api.get('/rooms/student/my-room')
  },

  // Get room by ID
  getRoomById: async (id) => {
    return await api.get(`/rooms/${id}`)
  },

  // Update room (owner)
  updateRoom: async (id, data) => {
    return await api.put(`/rooms/${id}`, data)
  },
}

export default roomService