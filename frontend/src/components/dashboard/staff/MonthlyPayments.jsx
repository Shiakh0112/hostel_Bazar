import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { fetchStaffMonthlyPayments } from '../../../app/slices/monthlyPaymentSlice';
import { formatPrice } from '../../../utils/priceFormatter';
import api from '../../../services/api';
import Loader from '../../common/Loader';

const StaffMonthlyPayments = () => {
  const dispatch = useDispatch();
  const { staffPayments, isLoading, error } = useSelector((state) => state.monthlyPayment);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    dispatch(fetchStaffMonthlyPayments());
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchStaffMonthlyPayments());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const sendPaymentReminder = async (paymentId, studentName) => {
    if (window.confirm(`Send payment reminder to ${studentName}?`)) {
      try {
        await api.post(`payments/${paymentId}/reminder`);
        toast.success('Payment reminder sent successfully!');
      } catch (error) {
        console.error('Error sending reminder:', error);
        toast.error('Failed to send reminder: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const markAsPaid = async (paymentId, studentName) => {
    if (window.confirm(`Mark payment as paid for ${studentName}?`)) {
      try {
        await api.put(`payments/${paymentId}/mark-paid`);
        toast.success('Payment marked as paid successfully!');
        dispatch(fetchStaffMonthlyPayments());
      } catch (error) {
        console.error('Error marking as paid:', error);
        toast.error('Failed to mark as paid: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  if (isLoading) return <Loader />;

  const filteredAndSortedPayments = (staffPayments || []).filter(payment => {
      const matchesFilter = filter === 'all' || 
        (filter === 'overdue' && payment.isOverdue) ||
        payment.status === filter;
      
      const matchesSearch = !searchTerm || 
        payment.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.student?.mobile?.includes(searchTerm) ||
        payment.month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.year?.toString().includes(searchTerm);
      
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'student':
          aValue = a.student?.name || '';
          bValue = b.student?.name || '';
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const overduePayments = (staffPayments || []).filter(p => p.isOverdue);
  const pendingPayments = (staffPayments || []).filter(p => p.status === 'pending');
  const completedPayments = (staffPayments || []).filter(p => p.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Monthly Payments</h1>
          <p className="text-gray-600">Monitor student rent payment status</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Payments ({(staffPayments || []).length})</option>
            <option value="pending">Pending ({pendingPayments.length})</option>
            <option value="overdue">Overdue ({overduePayments.length})</option>
            <option value="completed">Completed ({completedPayments.length})</option>
          </select>
          <input
            type="text"
            placeholder="Search by student, month, year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dueDate-asc">Due Date (Earliest)</option>
            <option value="dueDate-desc">Due Date (Latest)</option>
            <option value="student-asc">Student (A-Z)</option>
            <option value="student-desc">Student (Z-A)</option>
            <option value="amount-desc">Amount (High-Low)</option>
            <option value="amount-asc">Amount (Low-High)</option>
          </select>
          <button
            onClick={() => dispatch(fetchStaffMonthlyPayments())}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{(staffPayments || []).length}</div>
          <div className="text-sm text-gray-600">Total Payments</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{overduePayments.length}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{completedPayments.length}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedPayments.map((payment) => (
              <tr key={payment._id} className={`hover:bg-gray-50 ${
                payment.isOverdue ? 'bg-red-50 border-l-4 border-red-500' : ''
              }`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{payment.student?.name}</div>
                  <div className="text-sm text-gray-500">{payment.student?.mobile}</div>
                  <div className="text-sm text-gray-500">{payment.student?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{payment.month} {payment.year}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{formatPrice(payment.amount)}</div>
                  {payment.lateFee && payment.lateFee > 0 && (
                    <div className="text-xs text-red-600">+ {formatPrice(payment.lateFee)} late fee</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </div>
                  {payment.isOverdue && (
                    <div className="text-xs text-red-600 font-medium">
                      ⚠️ {payment.daysOverdue} days overdue
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    payment.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : payment.isOverdue
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status === 'completed' ? 'Paid' : payment.isOverdue ? 'Overdue' : 'Pending'}
                  </span>
                  {payment.status === 'completed' && payment.paidAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      Paid: {new Date(payment.paidAt).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  {payment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => markAsPaid(payment._id, payment.student?.name)}
                        className="text-green-600 hover:text-green-800 font-medium"
                        title="Mark as Paid"
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => sendPaymentReminder(payment._id, payment.student?.name)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        title="Send Reminder"
                      >
                        Remind
                      </button>
                    </>
                  )}
                  {payment.status === 'completed' && (
                    <span className="text-gray-400 text-xs">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedPayments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Found</h3>
          <p className="text-gray-600">
            {searchTerm || filter !== 'all' 
              ? 'No payments match your search criteria.' 
              : 'No payments to display'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default StaffMonthlyPayments;