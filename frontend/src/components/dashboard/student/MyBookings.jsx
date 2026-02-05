import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentBookings, cancelBooking } from '../../../app/slices/bookingSlice';
import BookingStatus from '../../booking/BookingStatus';
import PayNowButton from '../../booking/PayNowButton';
import Loader from '../../common/Loader';
import Modal from '../../common/Modal';
import toast from 'react-hot-toast';
import {
  RefreshCw,
  Calendar,
  Home,
  Filter,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  FileText,
  ArrowRight,
  TrendingUp,
  User,
  MapPin,
  Phone,
  Mail,
  Bed,
  DollarSign,
  Info,
  ChevronRight
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const MyBookings = () => {
  const dispatch = useDispatch();
  const { studentBookings, isLoading: loading } = useSelector((state) => state.booking);
  const [filter, setFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  useEffect(() => {
    dispatch(fetchStudentBookings());
  }, [dispatch]);

  const handlePaymentSuccess = () => {
    dispatch(fetchStudentBookings());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchStudentBookings());
    setRefreshing(false);
    toast.success('Bookings refreshed!');
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      await dispatch(cancelBooking(selectedBooking._id)).unwrap();
      setShowCancelModal(false);
      setSelectedBooking(null);
      dispatch(fetchStudentBookings());
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const filteredBookings = studentBookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />
      
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              My <span className={gradientText}>Bookings</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Track your hostel booking requests and payments
            </p>
          </div>
          
          <div className={`${glassCard} p-4 flex flex-wrap items-center gap-3 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/70 backdrop-blur border border-white/50 text-slate-700 rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all font-medium"
              title="Refresh bookings"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-white/80 backdrop-blur border border-slate-200 text-slate-700 py-2.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer font-medium"
              >
                <option value="all">All Bookings ({studentBookings.length})</option>
                <option value="pending">Pending ({studentBookings.filter(b => b.status === 'pending').length})</option>
                <option value="approved">Approved ({studentBookings.filter(b => b.status === 'approved').length})</option>
                <option value="confirmed">Confirmed ({studentBookings.filter(b => b.status === 'confirmed').length})</option>
                <option value="rejected">Rejected ({studentBookings.filter(b => b.status === 'rejected').length})</option>
                <option value="cancelled">Cancelled ({studentBookings.filter(b => b.status === 'cancelled').length})</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <Filter className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        {studentBookings.length > 0 && (
          <div className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <h3 className="text-lg font-bold mb-4 text-slate-800">Booking Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { status: 'pending', label: 'Pending', color: 'text-yellow-600', icon: <Clock className="w-5 h-5" /> },
                { status: 'approved', label: 'Approved', color: 'text-blue-600', icon: <CheckCircle className="w-5 h-5" /> },
                { status: 'confirmed', label: 'Confirmed', color: 'text-green-600', icon: <Home className="w-5 h-5" /> },
                { status: 'rejected', label: 'Rejected', color: 'text-red-600', icon: <X className="w-5 h-5" /> },
                { status: 'cancelled', label: 'Cancelled', color: 'text-gray-600', icon: <AlertCircle className="w-5 h-5" /> }
              ].map(({ status, label, color, icon }) => {
                const count = studentBookings.filter(b => b.status === status).length;
                return (
                  <div key={status} className={`${glassCard} p-4 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                    <div className={`flex justify-center mb-2 ${color}`}>
                      {icon}
                    </div>
                    <div className={`text-2xl font-bold ${color}`}>{count}</div>
                    <div className="text-sm text-slate-600">{label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className={`${glassCard} p-12 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                <FileText className="w-12 h-12 text-slate-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-slate-500 mb-6">
              {filter === 'all' 
                ? 'Start by browsing hostels and making your first booking request'
                : `You don't have any ${filter} bookings at the moment`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => window.location.href = '/hostels'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                Browse Hostels
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
                <BookingStatus booking={booking} />
                
                <div className="mt-6 flex justify-between items-center">
                  <div className="flex space-x-3">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowCancelModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all font-medium"
                      >
                        <X className="w-4 h-4" />
                        Cancel Booking
                      </button>
                    )}
                  </div>
                  
                  {booking.status === 'approved' && booking.advancePayment?.status === 'pending' && (
                    <PayNowButton 
                      booking={booking} 
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Booking Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedBooking(null);
          }}
          title="Cancel Booking"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-slate-700">
                Are you sure you want to cancel your booking for <strong>{selectedBooking?.hostel?.name}</strong>?
              </p>
            </div>
            <p className="text-sm text-red-600 flex items-center gap-2">
              <Info className="w-4 h-4" />
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                }}
                className="px-5 py-2.5 bg-white/70 backdrop-blur border border-white/50 text-slate-700 rounded-xl hover:bg-white/90 font-medium transition-all"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-medium transition-all shadow-lg shadow-red-500/20"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default MyBookings;