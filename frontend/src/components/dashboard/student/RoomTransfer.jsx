import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { formatDate } from '../../../utils/formatDate';
import Modal from '../../common/Modal';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import { 
  RefreshCw, 
  ArrowRightLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  AlertTriangle, 
  Home,
  Calendar,
  MoreVertical
} from "lucide-react";

const RoomTransfer = () => {
  const { user } = useSelector((state) => state.auth);
  const [transfers, setTransfers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [formData, setFormData] = useState({
    transferType: 'room_change',
    reason: '',
    preferredMoveDate: '',
    requestedRoomId: '',
    requestedBedId: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const endpoint = user.role === 'student' ? '/room-transfers/my-transfers' : '/room-transfers/requests';
      const response = await api.get(endpoint);
      if (response.data.success) {
        setTransfers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('Failed to fetch room transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransfers();
    setRefreshing(false);
    toast.success('Room transfers refreshed!');
  };

  const fetchActiveBookings = async () => {
    if (user.role !== 'student') return;
    try {
      const response = await api.get('/bookings/student/my-bookings');
      if (response.data.success) {
        const activeBookings = response.data.data.filter(booking => 
          ['confirmed', 'approved'].includes(booking.status) && 
          booking.hostel && 
          booking.hostel.name
        );
        setBookings(activeBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    }
  };

  const fetchAvailableRooms = async (hostelId) => {
    try {
      const response = await api.get(`/room-transfers/available-rooms?hostelId=${hostelId}`);
      if (response.data.success) {
        setAvailableRooms(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      toast.error('Failed to fetch available rooms');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/room-transfers/request', formData);
      if (response.data.success) {
        await fetchTransfers();
        setShowModal(false);
        resetForm();
        toast.success('Room transfer request submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting transfer request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit transfer request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transferId) => {
    try {
      const response = await api.put(`/room-transfers/${transferId}/approve`);
      if (response.data.success) {
        await fetchTransfers();
        toast.success('Transfer request approved successfully!');
      }
    } catch (error) {
      console.error('Error approving transfer:', error);
      toast.error('Failed to approve transfer request');
    }
  };

  const handleReject = async () => {
    if (!selectedTransfer || !rejectionReason.trim()) return;
    
    try {
      const response = await api.put(`/room-transfers/${selectedTransfer._id}/reject`, {
        rejectionReason
      });
      
      if (response.data.success) {
        await fetchTransfers();
        setShowRejectModal(false);
        setSelectedTransfer(null);
        setRejectionReason('');
        toast.success('Transfer request rejected successfully!');
      }
    } catch (error) {
      console.error('Error rejecting transfer:', error);
      toast.error('Failed to reject transfer request');
    }
  };

  const resetForm = () => {
    setFormData({
      transferType: 'room_change',
      reason: '',
      preferredMoveDate: '',
      requestedRoomId: '',
      requestedBedId: '',
      priority: 'medium'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'approved': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'rejected': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  // Calculate Stats for Bento Grid
  const stats = {
    total: transfers.length,
    pending: transfers.filter(t => t.status === 'pending').length,
    approved: transfers.filter(t => t.status === 'approved' || t.status === 'completed').length,
    rejected: transfers.filter(t => t.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Room <span className="text-indigo-600">Transfer</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              {user.role === 'student' 
                ? 'Request room or bed changes' 
                : 'Manage room transfer requests'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all duration-300 font-semibold shadow-sm shadow-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading || refreshing ? 'animate-spin text-indigo-600' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span>{loading || refreshing ? 'Syncing...' : 'Refresh Data'}</span>
            </button>
            {user.role === 'student' && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-indigo-600 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center gap-2 shadow-lg shadow-slate-200"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Request Transfer
              </button>
            )}
          </div>
        </div>

        {/* STATS BENTO GRID */}
        {transfers.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Total Requests', count: stats.total, icon: Home, color: 'bg-slate-600', bg: 'bg-white', border: 'border-slate-100' },
              { title: 'Pending', count: stats.pending, icon: Clock, color: 'bg-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-200' },
              { title: 'Approved', count: stats.approved, icon: CheckCircle, color: 'bg-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-200' },
              { title: 'Rejected', count: stats.rejected, icon: XCircle, color: 'bg-red-500', bg: 'bg-red-50/50', border: 'border-red-200' },
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
        )}

        {/* TABLE CONTAINER */}
        {loading && transfers.length === 0 ? (
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
                      Current Room
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Requested Room
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Type
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
                  {transfers.map((transfer) => (
                    <tr key={transfer._id} className="hover:bg-slate-50/50 transition-colors">
                      {user.role !== 'student' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                              {transfer.booking?.student?.name?.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              {transfer.booking?.student?.name}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {transfer.currentRoom?.roomNumber} - Bed {transfer.currentBed?.bedNumber}
                        </div>
                        <div className="text-xs text-slate-400">Current</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                           <ArrowRightLeft className="w-4 h-4 text-slate-300" />
                           <div className="text-sm font-medium text-indigo-600">
                            {transfer.requestedRoom ? 
                              `Room ${transfer.requestedRoom?.roomNumber} - Bed ${transfer.requestedBed?.bedNumber}` :
                              'Any Available'
                            }
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700 capitalize bg-slate-50 px-3 py-1 rounded-lg inline-block">
                          {transfer.transferType.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(transfer.status)}`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 max-w-xs truncate" title={transfer.reason}>
                          {transfer.reason}
                        </div>
                      </td>
                      {user.role !== 'student' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {transfer.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleApprove(transfer._id)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTransfer(transfer);
                                  setShowRejectModal(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {transfers.length === 0 && (
                     <tr>
                       <td colSpan="7" className="text-center py-10 text-slate-400">
                         No transfer requests found.
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Transfer Request Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900">Request Room Transfer</span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Transfer Type
              </label>
              <div className="relative">
                 <Home className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                 <select
                  value={formData.transferType}
                  onChange={(e) => setFormData({...formData, transferType: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium appearance-none cursor-pointer"
                >
                  <option value="room_change">Room Change</option>
                  <option value="bed_change">Bed Change</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Priority
              </label>
               <div className="relative">
                 <AlertTriangle className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                 <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium appearance-none cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Preferred Move Date
            </label>
            <div className="relative">
               <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={formData.preferredMoveDate}
                onChange={(e) => setFormData({...formData, preferredMoveDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Reason for Transfer
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              required
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 resize-none"
              placeholder="Please provide the reason for room transfer..."
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

      {/* Reject Transfer Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedTransfer(null);
          setRejectionReason('');
        }}
        title="Reject Transfer Request"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
              <p className="text-sm text-red-800 font-medium">Are you sure you want to reject this request?</p>
            </div>
            {selectedTransfer && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-700 font-medium">{selectedTransfer.booking?.student?.name}</p>
                </div>
                <p className="text-sm text-slate-500 truncate">Reason: {selectedTransfer.reason}</p>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Rejection Reason
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="3"
              placeholder="Provide a reason for rejection..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 resize-none"
              required
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setShowRejectModal(false);
                setSelectedTransfer(null);
                setRejectionReason('');
              }}
              className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
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

export default RoomTransfer;