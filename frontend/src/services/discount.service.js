import api from './api';

export const discountService = {
  // Owner APIs
  createDiscount: (data) => api.post('/discounts', data),
  getDiscounts: (params) => api.get('/discounts', { params }),
  updateDiscount: (discountId, data) => api.put(`/discounts/${discountId}`, data),
  deleteDiscount: (discountId) => api.delete(`/discounts/${discountId}`),
  
  // Student APIs
  validateDiscount: (data) => api.post('/discounts/validate', data),
  applyDiscount: (data) => api.post('/discounts/apply', data)
};

export default discountService;