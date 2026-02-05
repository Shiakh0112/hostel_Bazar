import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentMaintenanceRequests, rateMaintenanceService } from '../../../app/slices/maintenanceSlice';
import MaintenanceForm from '../../maintenance/MaintenanceForm';
import MaintenanceList from '../../maintenance/MaintenanceList';
import Modal from '../../common/Modal';
import Loader from '../../common/Loader';
import toast from 'react-hot-toast';
import { 
  RefreshCw, 
  Star, 
  MessageSquare, 
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Wrench,
  Layers
} from "lucide-react";

const Maintenance = () => {
  const dispatch = useDispatch();
  const { studentRequests, loading } = useSelector((state) => state.maintenance);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [ratingData, setRatingData] = useState({ rating: 5, feedback: '' });

  useEffect(() => {
    dispatch(fetchStudentMaintenanceRequests());
  }, [dispatch]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    dispatch(fetchStudentMaintenanceRequests());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchStudentMaintenanceRequests());
    setRefreshing(false);
    toast.success('Maintenance requests refreshed!');
  };

  const handleStatusUpdate = (requestId, action) => {
    if (action === 'rate') {
      const request = studentRequests.find(r => r._id === requestId);
      setSelectedRequest(request);
      setShowRatingModal(true);
    }
  };

  const handleRatingSubmit = async () => {
    if (!selectedRequest) return;
    
    try {
      await dispatch(rateMaintenanceService({
        requestId: selectedRequest._id,
        ratingData
      })).unwrap();
      
      setShowRatingModal(false);
      setSelectedRequest(null);
      setRatingData({ rating: 5, feedback: '' });
      dispatch(fetchStudentMaintenanceRequests());
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const filteredRequests = studentRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  if (loading) {
    return <Loader />;
  }

  // Stats Calculation for Bento Grid
  const counts = {
    all: studentRequests.length,
    pending: studentRequests.filter(r => r.status === 'pending').length,
    assigned: studentRequests.filter(r => r.status === 'assigned').length,
    in_progress: studentRequests.filter(r => r.status === 'in_progress').length,
    completed: studentRequests.filter(r => r.status === 'completed').length,
    cancelled: studentRequests.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8">
        
        {/* HEADER SECTION (Same as RoomManagement) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Maintenance <span className="text-indigo-600">Requests</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Report issues and track maintenance progress.</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all duration-300 font-semibold shadow-sm shadow-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading || refreshing ? 'animate-spin text-indigo-600' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            <span>{loading || refreshing ? 'Syncing...' : 'Refresh Data'}</span>
          </button>
        </div>

        {/* STATS BENTO GRID (Same style as RoomManagement) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { title: 'Total Requests', count: counts.all, icon: Layers, color: 'bg-blue-600', bg: 'bg-white', border: 'border-blue-100' },
            { title: 'Pending', count: counts.pending, icon: Clock, color: 'bg-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-200' },
            { title: 'Assigned', count: counts.assigned, icon: User, color: 'bg-indigo-600', bg: 'bg-indigo-50/50', border: 'border-indigo-200' },
            { title: 'In Progress', count: counts.in_progress, icon: Wrench, color: 'bg-purple-600', bg: 'bg-purple-50/50', border: 'border-purple-200' },
            { title: 'Completed', count: counts.completed, icon: CheckCircle, color: 'bg-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-200' },
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

        {/* SEARCH & TOOLBAR (Re-purposed for Filter and Create Button) */}
        <div className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-1 group">
             <Filter className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
             <select
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
               className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer shadow-sm text-slate-700 font-medium"
             >
               <option value="all">All Statuses ({counts.all})</option>
               <option value="pending">Pending ({counts.pending})</option>
               <option value="assigned">Assigned ({counts.assigned})</option>
               <option value="in_progress">In Progress ({counts.in_progress})</option>
               <option value="completed">Completed ({counts.completed})</option>
               <option value="cancelled">Cancelled ({counts.cancelled})</option>
             </select>
             <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
           </div>
           
           <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-indigo-600 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center gap-2 shadow-lg shadow-slate-200"
           >
            <Wrench className="w-4 h-4" />
            Report Issue
           </button>
        </div>

        {/* MAINTENANCE LIST CONTAINER */}
        {studentRequests.length === 0 && !loading ? (
           <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="p-4 bg-slate-100 rounded-full mb-4">
               <Wrench className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-800">No requests found</h3>
             <p className="text-slate-500 max-w-xs mx-auto mt-2">You haven't submitted any maintenance requests yet.</p>
           </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-slate-50">
               <h2 className="text-xl font-bold text-slate-800">History & Status</h2>
            </div>
            <div className="p-6">
               <MaintenanceList 
                 requests={filteredRequests} 
                 userRole="student"
                 onStatusUpdate={handleStatusUpdate}
               />
            </div>
          </div>
        )}
      </div>

      {/* CREATE MAINTENANCE REQUEST MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Report Maintenance Issue"
        size="lg"
      >
        <MaintenanceForm onClose={handleCreateSuccess} />
      </Modal>

      {/* RATING MODAL */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setSelectedRequest(null);
          setRatingData({ rating: 5, feedback: '' });
        }}
        title="Rate Maintenance Service"
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1">{selectedRequest.title}</h3>
              <p className="text-sm text-slate-500">{selectedRequest.description}</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Rating</label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingData(prev => ({ ...prev, rating: star }))}
                    className={`text-3xl transition-all transform hover:scale-125 ${star <= ratingData.rating ? 'text-yellow-400 drop-shadow-sm' : 'text-slate-200'}`}
                  >
                    <Star fill={star <= ratingData.rating ? "currentColor" : "none"} className="w-8 h-8" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Feedback (Optional)</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
                <textarea
                  value={ratingData.feedback}
                  onChange={(e) => setRatingData(prev => ({ ...prev, feedback: e.target.value }))}
                  rows="3"
                  placeholder="Share your experience..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedRequest(null);
                  setRatingData({ rating: 5, feedback: '' });
                }}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRatingSubmit}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                Submit Rating
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Maintenance;