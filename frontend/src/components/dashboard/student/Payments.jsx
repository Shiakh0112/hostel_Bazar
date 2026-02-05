import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentPayments, fetchInvoices, payInvoice } from '../../../app/slices/paymentSlice';
import { formatDate } from '../../../utils/formatDate';
import { formatPrice } from '../../../utils/priceFormatter';
import Loader from '../../common/Loader';
import Modal from '../../common/Modal';
import toast from 'react-hot-toast';
import {
  RefreshCw,
  CreditCard,
  FileText,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  Calendar,
  Download,
  Eye,
  Info,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Zap,
  Search,
  Receipt,
  FileCheck,
  XCircle,
  Coins,
  PiggyBank
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const Payments = () => {
  const dispatch = useDispatch();
  const { studentPayments = [], invoices = [], isLoading } = useSelector((state) => state.payment);
  const [activeTab, setActiveTab] = useState('payments');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  useEffect(() => {
    dispatch(fetchStudentPayments());
    dispatch(fetchInvoices());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchStudentPayments()),
      dispatch(fetchInvoices())
    ]);
    setRefreshing(false);
    toast.success('Payment data refreshed!');
  };

  const handlePayInvoice = async (invoiceId) => {
    try {
      await dispatch(payInvoice(invoiceId)).unwrap();
      await dispatch(fetchInvoices());
      toast.success('Payment initiated successfully!');
    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border border-green-100';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
      case 'failed': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-gray-50 text-gray-700 border border-gray-100';
    }
  };

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'advance': return 'Advance Payment';
      case 'monthly': return 'Monthly Rent';
      case 'security': return 'Security Deposit';
      case 'maintenance': return 'Maintenance';
      default: return type;
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const filteredPayments = (studentPayments || []).filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const completedPayments = (studentPayments || []).filter(p => p.status === 'completed');
  const pendingPayments = (studentPayments || []).filter(p => p.status === 'pending');
  const failedPayments = (studentPayments || []).filter(p => p.status === 'failed');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />
      
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Payments & <span className={gradientText}>Invoices</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Track your payment history and pending invoices
            </p>
          </div>
          
          <div className={`${glassCard} p-4 flex flex-wrap items-center gap-3 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            {activeTab === 'payments' && (
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none bg-white/80 backdrop-blur border border-slate-200 text-slate-700 py-2.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer font-medium"
                >
                  <option value="all">All Payments ({(studentPayments || []).length})</option>
                  <option value="completed">Completed ({completedPayments.length})</option>
                  <option value="pending">Pending ({pendingPayments.length})</option>
                  <option value="failed">Failed ({failedPayments.length})</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <Filter className="w-4 h-4" />
                </div>
              </div>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/70 backdrop-blur border border-white/50 text-slate-700 rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all font-medium"
              title="Refresh payment data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${glassCard} overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
          <div className="border-b border-slate-100">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'payments', label: `Payment History (${(studentPayments || []).length})`, icon: <Receipt className="w-4 h-4" /> },
                { id: 'invoices', label: `Pending Invoices (${(invoices || []).length})`, icon: <FileText className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className={activeTab === tab.id ? "text-blue-600" : "text-slate-400"}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'payments' && (
              <div>
                {filteredPayments.length === 0 && (studentPayments || []).length > 0 ? (
                  <div className={`${glassCard} p-12 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                    <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                        <Search className="w-12 h-12 text-slate-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      No {filter} payments found
                    </h3>
                    <p className="text-slate-500">Try changing the filter to see other payments</p>
                  </div>
                ) : filteredPayments.length === 0 ? (
                  <div className={`${glassCard} p-12 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                    <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                        <PiggyBank className="w-12 h-12 text-slate-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No payments yet</h3>
                    <p className="text-slate-500">Your payment history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredPayments.map((payment) => (
                      <div key={payment._id} className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-bold text-slate-900">
                                {getPaymentTypeLabel(payment.paymentType)}
                              </h4>
                              <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(payment.status)}`}>
                                {payment.status === 'completed' ? 'Completed' : payment.status === 'pending' ? 'Pending' : 'Failed'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FileCheck className="w-4 h-4" />
                              <span>Payment ID: {payment._id}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {payment.status === 'completed' ? 'Paid on' : 'Created on'}: {formatDate(payment.createdAt)}
                              </span>
                            </div>
                            {payment.paidAt && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Completed on: {formatDate(payment.paidAt)}</span>
                              </div>
                            )}
                            
                            {/* Payment Breakdown */}
                            {payment.paymentType === 'monthly' && (payment.baseRent || payment.electricityCharges || payment.maintenanceCharges) && (
                              <div className="bg-white/50 backdrop-blur p-3 rounded-xl border border-white/30 mt-3">
                                <p className="text-xs font-medium text-slate-700 mb-2">Breakdown:</p>
                                <div className="space-y-1">
                                  {payment.baseRent > 0 && (
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-600">Monthly Rent:</span>
                                      <span className="font-medium text-slate-900">{formatPrice(payment.baseRent)}</span>
                                    </div>
                                  )}
                                  {payment.electricityCharges > 0 && (
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-600">Electricity:</span>
                                      <span className="font-medium text-slate-900">{formatPrice(payment.electricityCharges)}</span>
                                    </div>
                                  )}
                                  {payment.maintenanceCharges > 0 && (
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-600">Maintenance:</span>
                                      <span className="font-medium text-slate-900">{formatPrice(payment.maintenanceCharges)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-5 h-5 text-slate-500" />
                              <p className="text-2xl font-bold text-slate-900">
                                {formatPrice(payment.amount)}
                              </p>
                            </div>
                            {payment.razorpayPaymentId && (
                              <div className="text-xs text-slate-500">
                                Razorpay ID: {payment.razorpayPaymentId}
                              </div>
                            )}
                            {payment.status === 'completed' && payment.receipt && (
                              <a
                                href={`/api/payments/receipts/${payment._id}/download`}
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="w-3 h-3" />
                                Receipt
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div>
                {(invoices || []).length === 0 ? (
                  <div className={`${glassCard} p-12 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                    <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-slate-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No pending invoices</h3>
                    <p className="text-slate-500">You're all caught up with your payments!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(invoices || []).map((invoice) => (
                      <div key={invoice._id} className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-5 h-5 text-slate-500" />
                              <h4 className="font-bold text-slate-900">
                                Invoice #{invoice.invoiceNumber}
                              </h4>
                              <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(invoice.status)}`}>
                                {invoice.status === 'completed' ? 'Completed' : invoice.status === 'pending' ? 'Pending' : 'Failed'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4" />
                                <span>For: {invoice.month}/{invoice.year}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock className="w-4 h-4" />
                                <span>Due: {formatDate(invoice.dueDate)}</span>
                              </div>
                            </div>
                            
                            <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/30">
                              <p className="text-sm font-medium text-slate-700 mb-2">Breakdown:</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Monthly Rent:</span>
                                  <span className="font-medium text-slate-900">{formatPrice(invoice.breakdown.monthlyRent)}</span>
                                </div>
                                {invoice.breakdown.maintenanceCharges > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Maintenance:</span>
                                    <span className="font-medium text-slate-900">{formatPrice(invoice.breakdown.maintenanceCharges)}</span>
                                  </div>
                                )}
                                {invoice.breakdown.electricityCharges > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Electricity:</span>
                                    <span className="font-medium text-slate-900">{formatPrice(invoice.breakdown.electricityCharges)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-2 mb-2">
                              <Coins className="w-5 h-5 text-slate-500" />
                              <p className="text-2xl font-bold text-slate-900">
                                {formatPrice(invoice.totalAmount)}
                              </p>
                            </div>
                            {invoice.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handlePayInvoice(invoice._id)}
                                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  Pay Now
                                </button>
                                <a
                                  href={`/api/payments/invoices/${invoice._id}/download`}
                                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium transition-all"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="w-4 h-4" />
                                  PDF
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        {((studentPayments || []).length > 0 || (invoices || []).length > 0) && (
          <div className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <h3 className="text-lg font-bold mb-4 text-slate-800">Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`${glassCard} p-6 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                <div className="flex justify-center mb-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatPrice((studentPayments || []).filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
                </div>
                <div className="text-sm text-slate-600">Total Paid</div>
              </div>
              <div className={`${glassCard} p-6 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                <div className="flex justify-center mb-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatPrice((invoices || []).filter(i => i.status === 'pending').reduce((sum, i) => sum + i.totalAmount, 0))}
                </div>
                <div className="text-sm text-slate-600">Pending Amount</div>
              </div>
              <div className={`${glassCard} p-6 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                <div className="flex justify-center mb-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
                    <FileCheck className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {(studentPayments || []).filter(p => p.status === 'completed').length}
                </div>
                <div className="text-sm text-slate-600">Completed Payments</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;