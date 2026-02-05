import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOwnerBookingRequests,
  approveBooking,
  rejectBooking,
  allocateRoomManually,
} from "../../../app/slices/bookingSlice";
import { formatDate } from "../../../utils/formatDate";
import { formatPrice } from "../../../utils/priceFormatter";
import Loader from "../../common/Loader";

import {
  User,
  Phone,
  Mail,
  Calendar,
  BedDouble,
  Clock,
  CheckCircle,
  XCircle,
  Home,
  Filter,
  RefreshCw,
  AlertCircle,
  CreditCard,
  MapPin,
  X,
  ChevronDown,
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const BookingRequests = () => {
  const dispatch = useDispatch();
  const { ownerBookingRequests, isLoading } = useSelector(
    (state) => state.booking,
  );

  const [filter, setFilter] = useState("pending");
  const [rejectModal, setRejectModal] = useState({
    show: false,
    bookingId: null,
  });
  const [rejectReason, setRejectReason] = useState("");

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  useEffect(() => {
    dispatch(fetchOwnerBookingRequests({ status: filter }));
  }, [dispatch, filter]);

  const refresh = () => dispatch(fetchOwnerBookingRequests({ status: filter }));

  const handleApprove = async (id) => {
    await dispatch(approveBooking(id));
    refresh();
  };

  const handleReject = async () => {
    await dispatch(
      rejectBooking({
        bookingId: rejectModal.bookingId,
        reason: rejectReason,
      }),
    );
    setRejectModal({ show: false, bookingId: null });
    setRejectReason("");
    refresh();
  };

  const handleAllocateRoom = async (id) => {
    await dispatch(allocateRoomManually(id));
    refresh();
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Booking <span className={gradientText}>Requests</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Review and manage student bookings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-blue-600"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center">
                <Filter className="w-4 h-4" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-10 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium appearance-none cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="absolute right-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* --- EMPTY STATE --- */}
        {ownerBookingRequests.length === 0 ? (
          <div className={`${glassCard} p-12 text-center`}>
            <Home className="mx-auto mb-4 text-slate-300" size={48} />
            <p className="text-slate-600">
              No <span className="font-bold">{filter}</span> booking requests
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {ownerBookingRequests.map((booking) => (
              <div
                key={booking._id}
                className={`${glassCard} hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
              >
                <div className="p-6 flex flex-col lg:flex-row gap-6">
                  {/* LEFT */}
                  <div className="flex-1 space-y-4">
                    {/* NAME + STATUS */}
                    <div className="flex items-center flex-wrap gap-3">
                      <h3 className="text-xl font-bold text-slate-900">
                        {booking.bookingDetails?.fullName}
                      </h3>
                      <StatusBadge status={booking.status} />
                      <span className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                        {booking.hostel?.name}
                      </span>
                    </div>

                    {/* INFO GRID */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Info
                        icon={<Mail size={14} />}
                        label="Email"
                        value={booking.bookingDetails?.email}
                      />
                      <Info
                        icon={<Phone size={14} />}
                        label="Mobile"
                        value={booking.bookingDetails?.mobile}
                      />
                      <Info
                        icon={<Calendar size={14} />}
                        label="Check-in"
                        value={formatDate(booking.bookingDetails?.checkInDate)}
                      />
                      <Info
                        icon={<BedDouble size={14} />}
                        label="Room Type"
                        value={booking.bookingDetails?.preferredRoomType}
                      />
                      <Info
                        icon={<Clock size={14} />}
                        label="Duration"
                        value={`${booking.bookingDetails?.duration} months`}
                      />
                      <Info
                        icon={<Calendar size={14} />}
                        label="Requested"
                        value={formatDate(booking.createdAt)}
                      />
                    </div>

                    {/* PAYMENT */}
                    {booking.advancePayment && (
                      <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50 flex justify-between">
                        <span className="text-slate-600 font-medium flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Advance Payment
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatPrice(booking.advancePayment.amount)} •{" "}
                          <span
                            className={
                              booking.advancePayment.status === "paid"
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }
                          >
                            {booking.advancePayment.status}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* ALLOCATION */}
                    {booking.allocatedRoom ? (
                      <SuccessBox>
                        Room {booking.allocatedRoom.roomNumber} | Bed{" "}
                        {booking.allocatedBed?.bedNumber}
                      </SuccessBox>
                    ) : (
                      booking.status === "confirmed" &&
                      booking.advancePayment?.status === "paid" && (
                        <WarningBox>
                          <button
                            onClick={() => handleAllocateRoom(booking._id)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                          >
                            Allocate Room
                          </button>
                        </WarningBox>
                      )
                    )}

                    {booking.status === "rejected" && (
                      <ErrorBox>{booking.rejectionReason}</ErrorBox>
                    )}
                  </div>

                  {/* RIGHT */}
                  <div className="w-full lg:w-56 text-right space-y-4">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatPrice(booking.hostel?.pricing?.monthlyRent)}
                      </p>
                      <p className="text-xs text-slate-500">per month</p>
                    </div>

                    {booking.status === "pending" && (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleApprove(booking._id)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() =>
                            setRejectModal({
                              show: true,
                              bookingId: booking._id,
                            })
                          }
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-medium transition-all shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- REJECT MODAL --- */}
        {rejectModal.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`${glassCard} max-w-md w-full mx-4 shadow-2xl`}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Reject Booking
                </h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                  rows={3}
                  placeholder="Enter reason..."
                />
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() =>
                      setRejectModal({
                        show: false,
                        bookingId: null,
                      })
                    }
                    className="px-4 py-2.5 text-slate-600 bg-white/70 backdrop-blur border border-white/50 rounded-xl hover:bg-white/90 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!rejectReason}
                    onClick={handleReject}
                    className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-medium transition-all disabled:opacity-50 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* HELPERS */

const Info = ({ icon, label, value }) => (
  <div className="flex gap-2 items-start">
    <div className="text-slate-400 mt-1">{icon}</div>
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value || "—"}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    approved: "bg-blue-50 text-blue-700 border-blue-100",
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rejected: "bg-red-50 text-red-700 border-red-100",
  };
  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-bold ${map[status]} border`}
    >
      {status}
    </span>
  );
};

const SuccessBox = ({ children }) => (
  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-sm text-emerald-700 font-medium">
    {children}
  </div>
);

const WarningBox = ({ children }) => (
  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex justify-between items-center text-sm">
    <span className="text-amber-700 font-medium flex items-center gap-2">
      <AlertCircle className="w-4 h-4" />
      Payment received, room not allocated
    </span>
    {children}
  </div>
);

const ErrorBox = ({ children }) => (
  <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-sm text-red-700 font-medium">
    {children}
  </div>
);

export default BookingRequests;
