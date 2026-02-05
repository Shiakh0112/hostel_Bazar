import api from './api';

export const expenseService = {
  // Create expense
  createExpense: (data) => api.post('/expenses', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Get expenses
  getExpenses: (params) => api.get('/expenses', { params }),
  
  // Get expense statistics
  getExpenseStats: (params) => api.get('/expenses/stats', { params }),
  
  // Update expense
  updateExpense: (expenseId, data) => api.put(`/expenses/${expenseId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Delete expense
  deleteExpense: (expenseId) => api.delete(`/expenses/${expenseId}`)
};

export default expenseService;