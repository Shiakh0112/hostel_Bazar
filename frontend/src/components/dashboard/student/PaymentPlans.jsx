import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { formatPrice } from '../../../utils/priceFormatter';
import { formatDate } from '../../../utils/formatDate';
import Modal from '../../common/Modal';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import {
  RefreshCw,
  CreditCard,
  FileText,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  Plus,
  X,
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Info,
  ArrowRight,
  Zap,
  Search,
  Receipt,
  FileCheck,
  Settings,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  CalendarDays,
  Calculator,
  PiggyBank,
  Coins,
  Activity
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const PaymentPlans = () => {
  const { user } = useSelector((state) => state.auth);
  const [plans, setPlans] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    bookingId: '',
    planType: 'monthly',
    totalAmount: '',
    numberOfInstallments: 3,
    startDate: '',
    interestRate: 0,
    processingFee: 0
  });

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  useEffect(() => {
    fetchPaymentPlans();
    if (user.role === 'student') {
      fetchActiveBookings();
    }
  }, []);

  const fetchPaymentPlans = async () => {
    setLoading(true);
    try {
      const endpoint = user.role === 'student' ? '/payment-plans/my-plans' : '/payment-plans/owner-plans';
      const response = await api.get(endpoint);
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payment plans:', error);
      toast.error('Failed to fetch payment plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveBookings = async () => {
    try {
      const response = await api.get('/bookings/student/my-bookings');
      if (response.data.success) {
        const activeBookings = response.data.data.filter(booking => 
          ['confirmed', 'approved'].includes(booking.status) && 
          booking.hostel && 
          booking.hostel.name
        );
        console.log('Active bookings found:', activeBookings);
        setBookings(activeBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPaymentPlans();
    if (user.role === 'student') {
      await fetchActiveBookings();
    }
    setRefreshing(false);
    toast.success('Payment plans refreshed!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/payment-plans/create', formData);
      
      if (response.data.success) {
        await fetchPaymentPlans();
        setShowModal(false);
        resetForm();
        toast.success('Payment plan created successfully!');
      }
    } catch (error) {
      console.error('Error creating payment plan:', error);
      toast.error(error.response?.data?.message || 'Failed to create payment plan');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (planId) => {
    try {
      const response = await api.put(`/payment-plans/${planId}/approve`);
      if (response.data.success) {
        await fetchPaymentPlans();
        toast.success('Payment plan approved successfully!');
      }
    } catch (error) {
      console.error('Error approving payment plan:', error);
      toast.error('Failed to approve payment plan');
    }
  };

  const handlePayInstallment = async (planId, installmentNumber) => {
    try {
      const response = await api.post(`/payment-plans/${planId}/pay/${installmentNumber}`, {
        paymentMethod: 'online',
        paymentId: `pay_${date.now()}`
      });

      if (response.data.success) {
        await fetchPaymentPlans();
        toast.success('Installment paid successfully!');
      }
    } catch (error) {
      console.error('Error paying installment:', error);
      toast.error(error.response?.data?.message || 'Failed to pay installment');
    }
  };

  const resetForm = () => {
    setFormData({
      bookingId: '',
      planType: 'monthly',
      totalAmount: '',
      numberOfInstallments: 3,
      startDate: '',
      interestRate: 0,
      processingFee: 0
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border border-green-100';
      case 'completed': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border border-red-100';
      case 'defaulted': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-gray-50 text-gray-700 border border-gray-100';
    }
  };

  const getInstallmentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-50 text-green-700 border border-green-100';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
      case 'overdue': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-gray-50 text-gray-700 border border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />
      
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Payment <span className={gradientText}>Plans</span>
            </h1>
            <p className="text-slate-500 text-lg">
              {user.role === 'student' 
                ? 'Manage your installment payment plans' 
                : 'Review and approve student payment plans'
              }
            </p>
          </div>
          
          <div className={`${glassCard} p-4 flex flex-wrap items-center gap-3 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/70 backdrop-blur border border-white/50 text-slate-700 rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all font-medium"
              title="Refresh payment plans"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            {user.role === 'student' && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                Create Plan
              </button>
            )}
          </div>
        </div>

        {loading && plans.length === 0 ? (
          <div className={`${glassCard} p-12 flex justify-center items-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div key={plan._id} className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border-l-4 border-blue-500`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-5 h-5 text-slate-500" />
                      <h3 className="text-lg font-bold text-slate-900">
                        {plan.hostel?.name}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 capitalize">{plan.planType} Plan</p>
                    {user.role !== 'student' && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-slate-500" />
                        <p className="text-sm text-slate-600">{plan.student?.name}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                    {user.role !== 'student' && !plan.approvedBy && plan.status === 'active' && (
                      <button
                        onClick={() => handleApprove(plan._id)}
                        className="mt-2 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                      >
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Approve
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`${glassCard} p-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Total Amount</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{formatPrice(plan.totalAmount)}</p>
                  </div>
                  <div className={`${glassCard} p-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Receipt className="w-4 h-4" />
                      <span className="text-sm font-medium">Installments</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{plan.installments?.length}</p>
                  </div>
                </div>

                <div className={`${glassCard} p-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-600">Progress</span>
                    <span className="text-sm font-medium text-slate-900">
                      {plan.installments?.filter(inst => inst.status === 'paid').length || 0} / {plan.installments?.length || 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-1000"
                      style={{
                        width: `${((plan.installments?.filter(inst => inst.status === 'paid').length || 0) / (plan.installments?.length || 1)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  {user.role === 'student' && plan.status === 'active' && (
                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                    >
                      <Calculator className="w-4 h-4" />
                      Pay Installment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {plans.length === 0 && !loading && (
          <div className={`${glassCard} p-12 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                <Receipt className="w-12 h-12 text-slate-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No payment plans</h3>
            <p className="text-slate-500">
              {user.role === 'student' 
                ? 'Create your first payment plan to manage installments.' 
                : 'No payment plans to review.'
              }
            </p>
          </div>
        )}

        {/* Create Payment Plan Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title="Create Payment Plan"
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Select Booking *
                </label>
                <select
                  value={formData.bookingId}
                  onChange={(e) => setFormData({...formData, bookingId: e.target.value})}
                  required
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-medium"
                >
                  <option value="">Select a booking</option>
                  {bookings.length === 0 ? (
                    <option disabled>No active bookings found</option>
                  ) : (
                    bookings.map((booking) => (
                      <option key={booking._id} value={booking._id}>
                        {booking.hostel?.name} - {booking.allocatedRoom?.roomNumber ? `Room ${booking.allocatedRoom.roomNumber}` : 'Room Pending'}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Plan Type *
                </label>
                <select
                  value={formData.planType}
                  onChange={(e) => setFormData({...formData, planType: e.target.value})}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-medium"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semester">Semester</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Total Amount *
                </label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                  required
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Number of Installments *
                </label>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={formData.numberOfInstallments}
                  onChange={(e) => setFormData({...formData, numberOfInstallments: parseInt(e.target.value)})}
                  required
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                  min="0"
                  max="20"
                  step="0.1"
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-medium"
                />
              </div>
            </div>
          </form>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-5 py-2.5 bg-white/70 backdrop-blur border border-white/50 text-slate-700 rounded-xl hover:bg-white/90 font-medium transition-all"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 font-medium transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Create Plan
                </>
              )}
            </button>
          </div>
        </Modal>

        {/* Installments Modal */}
        <Modal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          title={`Installments - ${selectedPlan?.hostel?.name}`}
          size="xl"
        >
          {selectedPlan && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${glassCard} p-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm font-medium">Total Amount</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">{formatPrice(selectedPlan.totalAmount)}</div>
                </div>
                <div className={`${glassCard} p-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <Receipt className="w-5 h-5" />
                    <span className="text-sm font-medium">Plan Type</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 capitalize">{selectedPlan.planType}</div>
                </div>
                <div className={`${glassCard} p-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <Activity className="w-5 h-5" />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(selectedPlan.status)}`}>
                    {selectedPlan.status}
                  </span>
                </div>
              </div>

              <div className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-slate-500" />
                  Installment Schedule
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedPlan.installments?.map((installment) => (
                    <div key={installment.installmentNumber} className={`${glassCard} p-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-slate-900">Installment #{installment.installmentNumber}</div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4" />
                            <span>Due: {new Date(installment.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <Coins className="w-4 h-4 text-slate-500" />
                            <span className="text-lg font-bold text-slate-900">{formatPrice(installment.amount)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${getInstallmentStatusColor(installment.status)}`}>
                              {installment.status}
                            </span>
                            {user.role === 'student' && installment.status === 'pending' && (
                              <button
                                onClick={() => handlePayInstallment(selectedPlan._id, installment.installmentNumber)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20"
                              >
                                <CreditCard className="w-4 h-4" />
                                Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PaymentPlans;