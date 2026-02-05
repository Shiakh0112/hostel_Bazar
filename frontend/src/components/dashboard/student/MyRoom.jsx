import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentRoom } from "../../../app/slices/roomSlice";
import { formatPrice } from "../../../utils/priceFormatter";
import { formatDate } from "../../../utils/formatDate";
import Loader from "../../common/Loader";
import Modal from "../../common/Modal";
import toast from 'react-hot-toast';
import {
  RefreshCw,
  Home,
  Bed,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  CreditCard,
  Wrench,
  FileText,
  Info,
  Image,
  CheckCircle,
  X,
  DollarSign,
  Users,
  Settings,
  AlertTriangle,
  Star,
  Shield,
  Clock,
  MessageSquare,
  ArrowRight
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const MyRoom = () => {
  const dispatch = useDispatch();
  const { studentRoom, isLoading, error } = useSelector((state) => state.room || {});
  const [showRoomRules, setShowRoomRules] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  useEffect(() => {
    dispatch(fetchStudentRoom());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchStudentRoom());
    setRefreshing(false);
    toast.success('Room details refreshed!');
  };

  const handleContactHostel = () => {
    if (studentRoom?.bed?.hostel?.contact?.phone) {
      window.open(`tel:${studentRoom.bed.hostel.contact.phone}`);
    } else {
      toast.error('Hostel contact number not available');
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!studentRoom) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
        <BackgroundBlobs />
        <div className="max-w-7xl mx-auto p-6 lg:p-10">
          <div className={`${glassCard} p-12 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                <Bed className="w-12 h-12 text-slate-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Room Allocated
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              You don't have a room allocated yet. Complete your booking and payment
              to get a room.
            </p>
            <button
              onClick={() => (window.location.href = "/student/bookings")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              View My Bookings
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { bed, roommates } = studentRoom;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />
      
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              My <span className={gradientText}>Room</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Your current accommodation details
            </p>
          </div>
          
          <div className={`${glassCard} p-4 flex flex-wrap items-center gap-3 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/70 backdrop-blur border border-white/50 text-slate-700 rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all font-medium"
              title="Refresh room details"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Room Details */}
        <div className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-4 text-slate-800">Room Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Room Number:</span>
                  <span className="font-medium text-slate-900">{bed.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Bed Number:</span>
                  <span className="font-medium text-slate-900">{bed.bedNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Floor:</span>
                  <span className="font-medium text-slate-900">{bed.floorNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Room Type:</span>
                  <span className="font-medium capitalize text-slate-900">
                    {bed.room?.roomType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Monthly Rent:</span>
                  <span className="font-medium text-slate-900">
                    {formatPrice(bed.monthlyRent)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Check-in Date:</span>
                  <span className="font-medium text-slate-900">
                    {bed.checkInDate ? formatDate(bed.checkInDate) : 'Not available'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Bed Status:</span>
                  <span className={`font-medium ${
                    bed.isOccupied ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {bed.isOccupied ? 'Occupied' : 'Available'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 text-slate-800">Hostel Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-600">Hostel Name:</span>
                  <p className="font-medium text-slate-900">{bed.hostel?.name}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                  <div>
                    <span className="text-slate-600">Address:</span>
                    <p className="font-medium text-slate-900">
                      {bed.hostel?.address?.street}, {bed.hostel?.address?.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-slate-500 mt-0.5" />
                  <div>
                    <span className="text-slate-600">Contact:</span>
                    <div className="font-medium text-slate-900">
                      <p>{bed.hostel?.contact?.phone}</p>
                      {bed.hostel?.contact?.email && (
                        <p className="text-sm text-slate-600">{bed.hostel.contact.email}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-slate-600">Hostel Manager:</span>
                  <p className="font-medium text-slate-900">
                    {bed.hostel?.contact?.managerName || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Room Images */}
        {bed?.room?.images?.length > 0 && (
          <div className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <h3 className="text-lg font-bold mb-4 text-slate-800">Room Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bed.room.images.map((image, index) => (
                <div key={index} className="aspect-square rounded-2xl overflow-hidden hover:-translate-y-1 transition-all">
                  <img
                    src={image}
                    alt={`Room ${bed.roomNumber} - ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Room Amenities */}
        {bed.room?.amenities?.length > 0 && (
          <div className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <h3 className="text-lg font-bold mb-4 text-slate-800">Room Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {bed.room.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 bg-white/50 backdrop-blur rounded-xl border border-white/30"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-slate-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roommates */}
        {roommates?.length > 0 && (
          <div className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <h3 className="text-lg font-bold mb-4 text-slate-800">Roommates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roommates.map((roommate, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 bg-white/50 backdrop-blur rounded-xl border border-white/30"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {roommate.occupant?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{roommate.occupant?.name}</p>
                    <p className="text-sm text-slate-600">
                      {roommate.occupant?.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
          <h3 className="text-lg font-bold mb-4 text-slate-800">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => (window.location.href = "/student/maintenance")}
              className="p-4 bg-white/50 backdrop-blur border border-white/30 rounded-xl hover:bg-white/70 transition-all text-center group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-slate-900">Report Issue</p>
            </button>
            <button
              onClick={() => (window.location.href = "/student/payments")}
              className="p-4 bg-white/50 backdrop-blur border border-white/30 rounded-xl hover:bg-white/70 transition-all text-center group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-slate-900">Pay Rent</p>
            </button>
            <button 
              onClick={handleContactHostel}
              className="p-4 bg-white/50 backdrop-blur border border-white/30 rounded-xl hover:bg-white/70 transition-all text-center group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-slate-900">Contact Hostel</p>
            </button>
            <button 
              onClick={() => setShowRoomRules(true)}
              className="p-4 bg-white/50 backdrop-blur border border-white/30 rounded-xl hover:bg-white/70 transition-all text-center group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-slate-900">Room Rules</p>
            </button>
          </div>
        </div>

        {/* Room Rules Modal */}
        <Modal
          isOpen={showRoomRules}
          onClose={() => setShowRoomRules(false)}
          title="Room Rules & Guidelines"
          size="md"
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                General Rules:
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Maintain cleanliness in your room and common areas</span>
                </li>
                <li className="flex items-start space-x-2">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>No smoking or alcohol consumption in the premises</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Visitors allowed only during designated hours (9 AM - 8 PM)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MessageSquare className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Keep noise levels low, especially after 10 PM</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Wrench className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Report any maintenance issues immediately</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Payment Rules:
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Monthly rent due by 5th of each month</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Late payment charges apply after 10th of the month</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Security deposit refundable upon checkout</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5" />
                <span>
                  <strong>Note:</strong> Violation of rules may result in warnings or termination of accommodation.
                </span>
              </p>
            </div>
          </div>
        </Modal>

        {/* Image Modal */}
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          title="Room Image"
          size="lg"
        >
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt="Room"
                className="max-w-full max-h-96 rounded-xl"
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MyRoom;