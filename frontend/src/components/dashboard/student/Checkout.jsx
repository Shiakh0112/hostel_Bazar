import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import Modal from '../../common/Modal';
import api from '../../../services/api';
import { 
  RefreshCw, 
  DoorOpen, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Building2, 
  User,
  MapPin,
  MoreVertical,
  AlertCircle
} from "lucide-react";

const Checkout = () => {
  const { user } = useSelector((state) => state.auth);
  const [checkouts, setCheckouts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    cancelled: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    bookingId: '',
    checkoutDate: '',
    reason: ''
  });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedCheckoutId, setSelectedCheckoutId] = useState(null);

  useEffect(() => {
    fetchCheckouts();
    fetchActiveBookings();
  }, []);

  const fetchCheckouts = async () => {
    setLoading(true);
    try {
      const endpoint = user.role === 'student' ? 'checkout/my-requests' : 'checkout/requests';
      const response = await api.get(endpoint);
      const checkoutData = Array.isArray(response.data?.data) ? response.data.data : 
                          Array.isArray(response.data) ? response.data : [];
      setCheckouts(checkoutData);
      
      const statistics = {
        total: checkoutData.length,
        pending: checkoutData.filter(c => c.status === 'pending').length,
        approved: checkoutData.filter(c => c.status === 'approved').length,
        completed: checkoutData.filter(c => c.status === 'completed').length,
        cancelled: checkoutData.filter(c => c.status === 'cancelled').length
      };
      setStats(statistics);
    } catch (error) {
      console.error('Error fetching checkouts:', error);
      toast.error('Failed to fetch checkout requests');
      setCheckouts([]);
      setStats({ total: 0, pending: 0, approved: 0, completed: 0, cancelled: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveBookings = async () => {
    if (user.role !== 'student') return;
    try {
      const response = await api.get('bookings/student/my-bookings');
      const bookingData = Array.isArray(response.data?.data) ? response.data.data : 
                         Array.isArray(response.data) ? response.data : [];
      const activeBookings = bookingData.filter(booking => booking.status === 'confirmed');
      setBookings(activeBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('checkout/request', formData);
      toast.success('Checkout request submitted successfully');
      await fetchCheckouts();
      setShowModal(false);
      setFormData({ bookingId: '', checkoutDate: '', reason: '' });
    } catch (error) {
      console.error('Error submitting checkout request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit checkout request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (checkoutId) => {
    try {
      await api.put(`checkout/${checkoutId}/approve`);
      toast.success('Checkout request approved successfully');
      await fetchCheckouts();
    } catch (error) {
      console.error('Error approving checkout:', error);
      toast.error('Failed to approve checkout request');
    }
  };

  const handleReject = async () => {
    try {
      await api.put(`checkout/${selectedCheckoutId}/reject`, { reason: rejectReason });
      toast.success('Checkout request rejected successfully');
      await fetchCheckouts();
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedCheckoutId(null);
    } catch (error) {
      console.error('Error rejecting checkout:', error);
      toast.error('Failed to reject checkout request');
    }
  };

  const openRejectModal = (checkoutId) => {
    setSelectedCheckoutId(checkoutId);
    setShowRejectModal(true);
  };

  const handleComplete = async (checkoutId) => {
    try {
      await api.put(`checkout/${checkoutId}/complete`);
      toast.success('Checkout completed successfully');
      await fetchCheckouts();
    } catch (error) {
      console.error('Error completing checkout:', error);
      toast.error('Failed to complete checkout');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'approved': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Checkout <span className="text-indigo-600">Requests</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              {user.role === 'student' 
                ? 'Request checkout from your hostel' 
                : 'Manage student checkout requests'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCheckouts}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all duration-300 font-semibold shadow-sm shadow-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span>Refresh</span>
            </button>
            {user.role === 'student' && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-indigo-600 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center gap-2 shadow-lg shadow-slate-200"
              >
                <DoorOpen className="w-4 h-4" />
                Request Checkout
              </button>
            )}
          </div>
        </div>

        {/* STATS BENTO GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { title: 'Total Requests', count: stats.total, icon: DoorOpen, color: 'bg-slate-600', bg: 'bg-white', border: 'border-slate-100' },
            { title: 'Pending', count: stats.pending, icon: Calendar, color: 'bg-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-200' },
            { title: 'Approved', count: stats.approved, icon: CheckCircle, color: 'bg-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-200' },
            { title: 'Completed', count: stats.completed, icon: Building2, color: 'bg-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-200' },
            { title: 'Cancelled', count: stats.cancelled, icon: XCircle, color: 'bg-red-500', bg: 'bg-red-50/50', border: 'border-red-200' },
          ].map((stat, idx) => (
            <div key={idx} className={`${stat.bg} p-5 rounded-2xl shadow-sm border ${stat.border} hover:shadow-md transition-shadow`}>
               <div className="flex items-center justify-between gap-4">
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.title}</p>
                    <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{stat.count}</p>
                 </div>
                 <div className={`p-3 rounded-xl text-white shadow-lg shadow-slate-200/50 ${stat.color}`}>
                   <stat.icon className="w-6 h-6" strokeWidth={2.5} />
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* TABLE CONTAINER */}
        {loading && (!Array.isArray(checkouts) || checkouts.length === 0) ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    {user.role !== 'student' && (
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Student
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Hostel
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Checkout Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Reason
                    </th>
                    {user.role !== 'student' && (
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                  {Array.isArray(checkouts) && checkouts.map((checkout) => (
                    <tr key={checkout._id} className="hover:bg-slate-50/50 transition-colors">
                      {user.role !== 'student' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                              {checkout.booking?.student?.name?.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">
                                {checkout.booking?.student?.name}
                              </div>
                              <div className="text-xs text-slate-400">
                                {checkout.booking?.student?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                           <Building2 className="w-4 h-4 text-slate-400" />
                           {checkout.hostel?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          Room {checkout.room?.roomNumber} - Bed {checkout.bed?.bedNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700">
                          {new Date(checkout.checkoutDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(checkout.status)}`}>
                          {checkout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 max-w-xs">
                          {checkout.reason}
                          {checkout.status === 'cancelled' && checkout.rejectionReason && (
                            <div className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Rejected: {checkout.rejectionReason}
                            </div>
                          )}
                        </div>
                      </td>
                      {user.role !== 'student' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {checkout.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(checkout._id)}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => openRejectModal(checkout._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {checkout.status === 'approved' && (
                              <button
                                onClick={() => handleComplete(checkout._id)}
                                className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {Array.isArray(checkouts) && checkouts.length === 0 && (
                     <tr>
                       <td colSpan="7" className="text-center py-12">
                         <div className="flex flex-col items-center justify-center text-slate-400">
                            <DoorOpen className="w-12 h-12 mb-3 text-slate-300" />
                            <p className="font-medium">No checkout requests found.</p>
                         </div>
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* CHECKOUT REQUEST MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <DoorOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900">Request Checkout</span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Select Booking
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <select
                value={formData.bookingId}
                onChange={(e) => setFormData({...formData, bookingId: e.target.value})}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium appearance-none cursor-pointer"
              >
                <option value="">Select a booking</option>
                {Array.isArray(bookings) && bookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {booking.hostel?.name} - Room {booking.allocatedRoom?.roomNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Preferred Checkout Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={formData.checkoutDate}
                onChange={(e) => setFormData({...formData, checkoutDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Reason for Checkout
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              required
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 resize-none"
              placeholder="Please provide the reason for checkout..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 disabled:opacity-50 shadow-lg shadow-slate-200"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Checkout Request"
      >
        <div className="space-y-6">
           <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
              <p className="text-sm text-red-800 font-medium">Are you sure you want to reject this checkout request?</p>
            </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Rejection Reason
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 resize-none"
              placeholder="Enter rejection reason..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowRejectModal(false)}
              className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-200"
            >
              Reject Request
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Checkout;