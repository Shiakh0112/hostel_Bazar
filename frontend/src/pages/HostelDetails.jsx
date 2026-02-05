import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Wifi,
  ShieldCheck,
  Utensils,
  Car,
  Dumbbell,
  Users,
  DollarSign,
} from "lucide-react"; // Icons added for professional look
import { fetchHostelById } from "../app/slices/hostelSlice";
import { fetchRoomAvailability } from "../app/slices/roomSlice";
import HostelGallery from "../components/hostel/HostelGallery";
import AvailabilityBadge from "../components/hostel/AvailabilityBadge";
import BookingForm from "../components/booking/BookingForm";
import Modal from "../components/common/Modal";
import Loader from "../components/common/Loader";
import { formatPrice } from "../utils/priceFormatter";

const HostelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentHostel, isLoading } = useSelector((state) => state.hostel);
  const { availability } = useSelector((state) => state.room);
  const { user } = useSelector((state) => state.auth);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      dispatch(fetchHostelById(id));
      dispatch(fetchRoomAvailability(id));
    }
  }, [dispatch, id]);

  const handleBookNow = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      alert("Only students can book hostels");
      return;
    }
    setShowBookingModal(true);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!currentHostel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Hostel not found
          </h2>
          <button
            onClick={() => navigate("/hostels")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to hostels
          </button>
        </div>
      </div>
    );
  }

  const hostel = currentHostel;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
              {/* Left: Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100">
                    {hostel.hostelType}
                  </span>
                  {hostel.rating && (
                    <div className="flex items-center text-sm font-medium text-gray-700 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1.5" />
                      {hostel.rating.average}{" "}
                      <span className="text-gray-400 mx-1">•</span>{" "}
                      {hostel.rating.count} reviews
                    </div>
                  )}
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
                  {hostel.name}
                </h1>

                <div className="flex items-start gap-2 text-gray-500 mb-6">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" />
                  <p className="text-base leading-relaxed">
                    {hostel.address?.street}, {hostel.address?.area},{" "}
                    {hostel.address?.city}, {hostel.address?.state} -{" "}
                    {hostel.address?.pincode}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <AvailabilityBadge
                    available={hostel.availableBeds}
                    total={hostel.totalBeds}
                  />
                </div>
              </div>

              {/* Right: Price & Action */}
              <div className="lg:w-64 flex-shrink-0 flex flex-col items-end border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                <div className="text-right mb-4">
                  <div className="text-sm text-gray-500 font-medium mb-1">
                    Starting from
                  </div>
                  <div className="text-4xl font-bold text-gray-900 flex items-baseline justify-end gap-1">
                    <span className="text-2xl text-gray-400 font-normal">
                      ₹
                    </span>
                    {formatPrice((hostel.pricing?.monthlyRent || 0) + (hostel.pricing?.electricityCharges || 0))}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    / month (incl. electricity)
                  </div>
                </div>

                <button
                  onClick={handleBookNow}
                  disabled={hostel.availableBeds === 0}
                  className="w-full lg:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {hostel.availableBeds === 0 ? "Fully Occupied" : "Book Now"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Tabs Navigation */}
        <div className="sticky top-4 z-30 mb-8">
          <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-sm p-1.5 max-w-max mx-auto lg:mx-0">
            <nav className="flex space-x-1">
              {[
                { id: "overview", label: "Overview" },
                { id: "gallery", label: "Gallery" },
                { id: "amenities", label: "Amenities" },
                { id: "availability", label: "Availability" },
                { id: "pricing", label: "Pricing" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-black/5"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content (Left) */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    About this hostel
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {hostel.description}
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Hostel Structure
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      {
                        label: "Total Floors",
                        value: hostel.structure?.totalFloors,
                      },
                      {
                        label: "Rooms/Floor",
                        value: hostel.structure?.roomsPerFloor,
                      },
                      {
                        label: "Beds/Room",
                        value: hostel.structure?.bedsPerRoom,
                      },
                      { label: "Room Type", value: hostel.structure?.roomType },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100"
                      >
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {item.value}
                        </div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-semibold">Attached Bathroom:</span>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-bold ${hostel.structure?.attachedBathroom ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {hostel.structure?.attachedBathroom ? "YES" : "NO"}
                      </span>
                    </div>
                  </div>
                </div>

                {hostel.rules?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-500" />
                      House Rules
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {hostel.rules.map((rule, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-gray-600"
                        >
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></div>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar (Right) */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">
                    Contact Info
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-semibold uppercase">
                          Phone
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {hostel.contact?.phone}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-semibold uppercase">
                          Email
                        </div>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {hostel.contact?.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        {/* Using a simple icon for WhatsApp */}
                        <span className="font-bold text-xs">W</span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-semibold uppercase">
                          WhatsApp
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {hostel.contact?.whatsapp}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Photo Gallery
              </h3>
              <HostelGallery images={hostel.images} />
            </div>
          )}

          {activeTab === "amenities" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-blue-500" />
                Amenities & Facilities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {hostel.amenities?.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "availability" && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {hostel.totalRooms || 0}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Rooms
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {hostel.availableRooms || 0}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Available Rooms
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {hostel.availableBeds || 0}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Available Beds
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {hostel.totalBeds > 0 ? Math.round(((hostel.totalBeds - hostel.availableBeds) / hostel.totalBeds) * 100) : 0}%
                  </div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Occupied
                  </div>
                </div>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Overall Occupancy
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Occupied Beds</span>
                    <span className="text-sm font-bold text-gray-900">
                      {(hostel.totalBeds || 0) - (hostel.availableBeds || 0)} / {hostel.totalBeds || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${hostel.totalBeds > 0 ? (((hostel.totalBeds - hostel.availableBeds) / hostel.totalBeds) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Room Type Breakdown */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Room Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {hostel.structure?.roomType || 'Shared'}
                    </div>
                    <div className="text-sm text-gray-600">Room Type</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {hostel.structure?.bedsPerRoom || 2}
                    </div>
                    <div className="text-sm text-gray-600">Beds per Room</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {hostel.structure?.totalFloors || 1}
                    </div>
                    <div className="text-sm text-gray-600">Total Floors</div>
                  </div>
                </div>
              </div>

              {/* Booking Status */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Booking Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-800">Available for Booking</span>
                    </div>
                    <span className="text-green-700 font-bold">{hostel.availableBeds || 0} beds</span>
                  </div>
                  
                  {hostel.availableBeds > 0 ? (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-blue-800 text-sm">
                        <strong>Good news!</strong> This hostel has available beds. Book now to secure your spot.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <p className="text-red-800 text-sm">
                        <strong>Fully Occupied:</strong> This hostel is currently full. You can join the waiting list.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Monthly Costs
                  </h3>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      label: "Monthly Rent",
                      value: hostel.pricing?.monthlyRent,
                    },
                    {
                      label: "Maintenance",
                      value: hostel.pricing?.maintenanceCharges,
                    },
                    {
                      label: "Electricity",
                      value: hostel.pricing?.electricityCharges,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-gray-600 font-medium">
                        {item.label}
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatPrice(item.value)}
                      </span>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Base Monthly Cost
                    </span>
                    <span className="text-2xl font-extrabold text-blue-600">
                      {formatPrice(
                        (hostel.pricing?.monthlyRent || 0) +
                          (hostel.pricing?.electricityCharges || 0),
                      )}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    * Maintenance charges added only when work is performed
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    One-time Charges
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-600 font-medium">
                      Advance Payment
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatPrice(hostel.pricing?.advancePayment)}
                    </span>
                  </div>
                  <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <p className="text-sm text-blue-800 leading-relaxed">
                      <strong>Note:</strong> Advance payment is required to confirm booking and secure your bed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Complete Your Booking"
        size="lg"
      >
        <BookingForm
          hostel={hostel}
          onClose={() => setShowBookingModal(false)}
        />
      </Modal>
    </div>
  );
};

export default HostelDetails;
