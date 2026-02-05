import api from "./api";

const paymentService = {
  // Create payment order
  createPaymentOrder: async (paymentData) => {
    return await api.post("/payments/create-order", paymentData);
  },

  // Verify payment
  verifyPayment: async ({
    paymentId,
    stripePaymentIntentId,
    paymentMethod,
  }) => {
    return await api.post("/payments/verify", {
      paymentId,
      stripePaymentIntentId,
      paymentMethod,
    });
  },
  // Get student payments
  getStudentPayments: async (filters = {}) => {
    console.log('🔍 Frontend: Fetching student payments with filters:', filters);
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    const url = `/payments/student/my-payments?${params.toString()}`;
    console.log('🔍 Frontend: API URL:', url);
    const response = await api.get(url);
    console.log('🔍 Frontend: API response:', response.data);
    return response;
  },

  // Get owner payments
  getOwnerPayments: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return await api.get(`/payments/owner/payments?${params.toString()}`);
  },

  // Generate monthly invoices (owner)
  generateMonthlyInvoices: async (invoiceData) => {
    return await api.post("/payments/owner/generate-invoices", invoiceData);
  },

  // Get invoices
  getInvoices: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return await api.get(`/payments/invoices?${params.toString()}`);
  },

  // Pay invoice (student)
  payInvoice: async (invoiceId) => {
    return await api.post(`/payments/invoices/${invoiceId}/pay`);
  },

  // Get payment statistics
  getPaymentStats: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return await api.get(`/payments/stats?${params.toString()}`);
  },
};

export default paymentService;
