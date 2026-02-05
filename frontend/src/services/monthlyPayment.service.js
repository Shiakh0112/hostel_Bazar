import api from './api';

export const monthlyPaymentService = {
  // Student APIs
  generateMonthlyRents: () => api.post('/monthly-payments/generate'),
  getStudentMonthlyPayments: () => api.get('/monthly-payments/student'),
  
  // Staff APIs
  getStaffMonthlyPayments: () => api.get('/monthly-payments/staff'),
  
  // Owner APIs
  getOwnerMonthlyPayments: (params) => api.get('/monthly-payments/owner', { params })
};

export default monthlyPaymentService;
