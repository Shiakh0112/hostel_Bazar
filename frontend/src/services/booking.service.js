import api from './api'

const bookingService = {
  // Create booking request (student)
  createBookingRequest: async (bookingData) => {
    return await api.post('/bookings/request', bookingData)
  },

  // Get student bookings
  getStudentBookings: async () => {
    return await api.get('/bookings/student/my-bookings')
  },

  // Get owner booking requests
  getOwnerBookingRequests: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key])
      }
    })
    return await api.get(`/bookings/owner/requests?${params.toString()}`)
  },

  // Approve booking (owner)
  approveBooking: async (bookingId) => {
    return await api.put(`/bookings/${bookingId}/approve`)
  },

  // Reject booking (owner)
  rejectBooking: async (bookingId, reason) => {
    return await api.put(`/bookings/${bookingId}/reject`, { reason })
  },

  // Confirm booking (after payment)
  confirmBooking: async (bookingId) => {
    return await api.put(`/bookings/${bookingId}/confirm`)
  },

  // Get booking by ID
  getBookingById: async (id) => {
    return await api.get(`/bookings/${id}`)
  },

  // Cancel booking (student)
  cancelBooking: async (bookingId) => {
    return await api.put(`/bookings/${bookingId}/cancel`)
  },

  // Allocate room manually (owner)
  allocateRoomManually: async (bookingId) => {
    return await api.put(`/bookings/${bookingId}/allocate-room`)
  },
}

export default bookingService