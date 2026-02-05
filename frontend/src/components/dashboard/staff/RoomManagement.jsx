import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Building2,
  MapPin,
  Phone,
  Search,
  Filter,
  RefreshCw,
  BedDouble,
  ChevronDown,
  Shield,
  X,
  Users,
  Home,
  Key,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Wrench,
  Building,
  Mail,
  CreditCard,
  Sparkles,
  Calendar,
  Wifi,
  Coffee,
  Utensils,
  Star,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import api from "../../../services/api";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const RoomManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [hostelInfo, setHostelInfo] = useState(null);
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    occupancyRate: 0,
  });

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => {
    const gradients = {
      blue: "from-blue-500 to-cyan-500",
      green: "from-emerald-500 to-green-400",
      yellow: "from-amber-500 to-orange-400",
      purple: "from-purple-500 to-pink-500",
      slate: "from-slate-500 to-slate-400",
      orange: "from-orange-500 to-red-400",
    };

    return (
      <div
        className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              {title}
            </p>
            <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
          </div>
          <div
            className={`p-3 rounded-2xl bg-gradient-to-br ${gradients[color]} text-white shadow-lg shadow-blue-500/20`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradients[color]} w-1/2 rounded-full`}
          ></div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching staff room data...");

      // Get staff profile to find assigned hostel - SAME AS HOSTEL MANAGEMENT
      const profileResponse = await api.get("staff/profile");
      console.log("👤 Profile response:", profileResponse.data);

      const staffData = profileResponse.data?.data || profileResponse.data;
      const hostelId = staffData?.hostel?._id;

      if (!hostelId) {
        toast.error("No hostel assigned to staff");
        setRooms([]);
        setHostelInfo(null);
        setStats({
          totalRooms: 0,
          availableRooms: 0,
          occupiedRooms: 0,
          maintenanceRooms: 0,
          totalBeds: 0,
          occupiedBeds: 0,
          availableBeds: 0,
          occupancyRate: 0,
        });
        return;
      }

      console.log("🏨 Found hostel ID:", hostelId);

      // Fetch complete hostel details - SAME AS HOSTEL MANAGEMENT
      const hostelResponse = await api.get(`hostels/${hostelId}`);
      console.log("🏨 Complete hostel response:", hostelResponse.data);

      const completeHostelData =
        hostelResponse.data?.data || hostelResponse.data;

      if (!completeHostelData) {
        toast.error("Hostel details not found");
        setRooms([]);
        setHostelInfo(null);
        return;
      }

      setHostelInfo(completeHostelData);

      // Fetch rooms for this hostel - SAME AS HOSTEL MANAGEMENT
      const roomsResponse = await api.get(`rooms/hostel/${hostelId}`);
      console.log("✅ Rooms response:", roomsResponse.data);

      let roomData = [];
      if (
        roomsResponse.data?.data?.rooms &&
        Array.isArray(roomsResponse.data.data.rooms)
      ) {
        roomData = roomsResponse.data.data.rooms;
      } else if (
        roomsResponse.data?.data &&
        Array.isArray(roomsResponse.data.data)
      ) {
        roomData = roomsResponse.data.data;
      } else if (Array.isArray(roomsResponse.data)) {
        roomData = roomsResponse.data;
      }

      console.log("🏠 Room data extracted:", roomData);
      setRooms(roomData);

      // Calculate statistics EXACTLY LIKE HOSTEL MANAGEMENT
      // Use hostel model's pre-calculated values directly
      const totalBeds = completeHostelData.totalBeds || 0;
      const occupiedBeds = completeHostelData.occupiedBeds || 0;
      const availableBeds =
        completeHostelData.availableBeds || totalBeds - occupiedBeds;

      // Calculate total rooms from structure
      const totalRooms = completeHostelData.structure
        ? completeHostelData.structure.totalFloors *
          completeHostelData.structure.roomsPerFloor
        : Math.ceil(
            totalBeds / (completeHostelData.structure?.bedsPerRoom || 1),
          );

      // Calculate room statistics from actual room data if available
      let availableRooms, occupiedRooms, maintenanceRooms;

      if (roomData.length > 0 && roomData.length === totalRooms) {
        // Use actual room data only if we have all rooms
        availableRooms = roomData.filter(
          (room) => !room.isFull && room.isActive,
        ).length;
        occupiedRooms = roomData.filter(
          (room) => room.isFull || room.occupiedBeds > 0,
        ).length;
        maintenanceRooms = roomData.filter((room) => !room.isActive).length;
      } else {
        // Estimate from bed data - a room is occupied if it has any occupied beds
        const bedsPerRoom = completeHostelData.structure?.bedsPerRoom || 1;
        occupiedRooms =
          occupiedBeds > 0 ? Math.ceil(occupiedBeds / bedsPerRoom) : 0;
        availableRooms = totalRooms - occupiedRooms;
        maintenanceRooms = 0;
      }

      const occupancyRate =
        totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      // Set final statistics
      setStats({
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate,
      });

      if (roomData.length > 0) {
        toast.success(
          `Loaded ${roomData.length} rooms from ${completeHostelData.name}`,
        );
      } else {
        toast.info("No rooms found in this hostel");
      }
    } catch (error) {
      console.error("💥 API Error:", error);
      toast.error(
        "Failed to fetch rooms: " +
          (error.response?.data?.message || error.message),
      );
      setRooms([]);
      setHostelInfo(null);
      setStats({
        totalRooms: 0,
        availableRooms: 0,
        occupiedRooms: 0,
        maintenanceRooms: 0,
        totalBeds: 0,
        occupiedBeds: 0,
        availableBeds: 0,
        occupancyRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoomStatusUpdate = async (roomId, isActive) => {
    try {
      await api.put(`rooms/${roomId}`, { isActive });
      toast.success(
        `Room ${isActive ? "activated" : "marked for maintenance"}`,
      );
      await fetchRooms(); // Refresh data
    } catch (error) {
      console.error("Error updating room status:", error);
      toast.error("Failed to update room status");
    }
  };

  const filteredRooms = Array.isArray(rooms)
    ? rooms.filter((room) => {
        if (filter === "all") return true;
        if (filter === "available") return !room.isFull && room.isActive;
        if (filter === "occupied") return room.isFull || room.occupiedBeds > 0;
        if (filter === "maintenance") return !room.isActive;
        return true;
      })
    : [];

  // Pagination constants and logic
  const roomsPerPage = 10;
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const getStatusColor = (room) => {
    if (!room.isActive) return "bg-amber-50 text-amber-700 border-amber-100";
    if (room.isFull) return "bg-red-50 text-red-700 border-red-100";
    if (room.occupiedBeds > 0)
      return "bg-blue-50 text-blue-700 border-blue-100";
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  };

  const getStatusText = (room) => {
    if (!room.isActive) return "Maintenance";
    if (room.isFull) return "Full";
    if (room.occupiedBeds > 0) return "Partially Occupied";
    return "Available";
  };

  const getRoomTypeIcon = (type) => {
    switch (type) {
      case "single":
        return "🛏️";
      case "double":
        return "🛏️🛏️";
      case "triple":
        return "🛏️🛏️🛏️";
      case "dormitory":
        return "🏠";
      default:
        return "🛏️";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Room <span className={gradientText}>Management</span>
            </h1>
            <p className="text-slate-500 text-lg">
              {hostelInfo
                ? `Managing rooms for ${hostelInfo.name}`
                : "Manage room allocations and availability"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRooms}
              disabled={loading}
              className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-blue-600"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Rooms"
            value={rooms.length}
            icon={Layers}
            color="slate"
          />
          <StatCard
            title="Available"
            value={rooms.filter((room) => !room.isFull && room.isActive).length}
            icon={Key}
            color="green"
          />
          <StatCard
            title="Occupied"
            value={
              rooms.filter((room) => room.isFull || room.occupiedBeds > 0)
                .length
            }
            icon={Users}
            color="orange"
          />
          <StatCard
            title="Maintenance"
            value={rooms.filter((room) => !room.isActive).length}
            icon={Wrench}
            color="yellow"
          />
        </div>

        {/* --- BED STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Beds"
            value={stats.totalBeds}
            icon={BedDouble}
            color="slate"
          />
          <StatCard
            title="Occupied Beds"
            value={stats.occupiedBeds}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Available Beds"
            value={stats.availableBeds}
            icon={Key}
            color="green"
          />
          <StatCard
            title="Occupancy Rate"
            value={`${stats.occupancyRate}%`}
            icon={CheckCircle2}
            color="purple"
          />
        </div>

        {/* Enhanced Filters with Better Design */}
        <div
          className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-600" />
                <label className="text-sm font-bold text-slate-700">
                  Filter by Status
                </label>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur text-sm font-medium min-w-[200px] shadow-sm"
              >
                <option value="all">🏠 All Rooms ({rooms.length})</option>
                <option value="available">
                  🔑 Available (
                  {rooms.filter((room) => !room.isFull && room.isActive).length}
                  )
                </option>
                <option value="occupied">
                  👥 Occupied (
                  {
                    rooms.filter((room) => room.isFull || room.occupiedBeds > 0)
                      .length
                  }
                  )
                </option>
                <option value="maintenance">
                  🔧 Maintenance (
                  {rooms.filter((room) => !room.isActive).length})
                </option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600 bg-white/50 backdrop-blur px-3 py-2 rounded-xl border border-white/50">
                <span className="font-medium">Showing:</span>{" "}
                {indexOfFirstRoom + 1}-
                {Math.min(indexOfLastRoom, filteredRooms.length)} of{" "}
                {filteredRooms.length} rooms
              </div>
              <div className="text-sm text-slate-600 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                <span className="font-medium">Page:</span> {currentPage} of{" "}
                {totalPages}
              </div>
              {hostelInfo && (
                <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 font-medium">
                  📍 {hostelInfo.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentRooms.length > 0 ? (
              currentRooms.map((room) => (
                <div
                  key={room._id}
                  className={`${glassCard} p-5 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-2xl">
                          {getRoomTypeIcon(room.roomType)}
                        </span>
                        <span>Room {room.roomNumber}</span>
                      </h3>
                      <p className="text-sm text-slate-500 capitalize font-medium">
                        {room.roomType} Room
                      </p>
                      {room.floorNumber && (
                        <p className="text-xs text-slate-400">
                          Floor {room.floorNumber}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(room)} border`}
                    >
                      {getStatusText(room)}
                    </span>
                  </div>

                  {/* Room Stats with Better Visual Design */}
                  <div className="space-y-3 mb-5">
                    <div className="bg-white/50 backdrop-blur p-3 rounded-xl border border-white/50">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <BedDouble className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Total Beds</p>
                            <p className="font-bold text-slate-800">
                              {room.totalBeds || 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-slate-500">Occupied</p>
                            <p className="font-bold text-blue-600">
                              {room.occupiedBeds || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Key className="w-3 h-3" /> Available:
                      </span>
                      <span className="font-bold text-emerald-600">
                        {room.availableBeds ||
                          room.totalBeds - room.occupiedBeds ||
                          0}{" "}
                        beds
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                      <span className="text-slate-600">Monthly Rent:</span>
                      <span className="font-bold text-purple-600">
                        ₹{room.monthlyRent || 0}
                      </span>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Occupancy</span>
                        <span>
                          {room.totalBeds > 0
                            ? Math.round(
                                ((room.occupiedBeds || 0) / room.totalBeds) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${room.totalBeds > 0 ? ((room.occupiedBeds || 0) / room.totalBeds) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="space-y-2">
                    {room.isActive && !room.isFull && (
                      <button
                        onClick={() => handleRoomStatusUpdate(room._id, false)}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 px-4 rounded-xl hover:from-amber-600 hover:to-orange-600 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
                      >
                        <Shield className="w-4 h-4" />
                        Mark for Maintenance
                      </button>
                    )}
                    {!room.isActive && (
                      <button
                        onClick={() => handleRoomStatusUpdate(room._id, true)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-2.5 px-4 rounded-xl hover:from-emerald-600 hover:to-green-600 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                      >
                        <Key className="w-4 h-4" />
                        Mark Available
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setShowDetailsModal(true);
                      }}
                      className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-xl hover:bg-slate-800 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5"
                    >
                      <ArrowRight className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-slate-500">
                  No rooms to display on this page
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Total rooms: {rooms.length}, Filtered: {filteredRooms.length},
                  Current page: {currentPage}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className={`${glassCard} p-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {indexOfFirstRoom + 1}-
                {Math.min(indexOfLastRoom, filteredRooms.length)} of{" "}
                {filteredRooms.length} rooms
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-slate-500 bg-white/50 backdrop-blur border border-white/50 rounded-xl hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => {
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                              currentPage === pageNumber
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                : "text-slate-500 bg-white/50 backdrop-blur border border-white/50 hover:bg-white/70"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <span
                            key={pageNumber}
                            className="px-2 py-2 text-slate-400"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    },
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-slate-500 bg-white/50 backdrop-blur border border-white/50 rounded-xl hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredRooms.length === 0 && !loading && (
          <div className={`${glassCard} p-12 text-center`}>
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No rooms found</h3>
            <p className="text-slate-500 mt-2">
              {filter !== "all"
                ? "No rooms match your current filter."
                : "No rooms available in your assigned hostel."}
            </p>
          </div>
        )}

        {/* Room Details Modal */}
        {showDetailsModal && selectedRoom && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
              className={`${glassCard} max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl`}
            >
              <div className="flex justify-between items-center mb-6 p-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Room {selectedRoom.roomNumber}
                  </h3>
                  <p className="text-slate-500 capitalize">
                    {selectedRoom.roomType} Room • Floor{" "}
                    {selectedRoom.floorNumber || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white/50 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/50 backdrop-blur p-6 rounded-xl border border-white/50">
                    <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5 text-slate-600" />
                      Room Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <Home className="w-4 h-4" /> Room Number:
                        </span>
                        <span className="font-bold text-slate-900">
                          {selectedRoom.roomNumber}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <BedDouble className="w-4 h-4" /> Type:
                        </span>
                        <span className="font-bold text-slate-900 capitalize">
                          {selectedRoom.roomType}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <Layers className="w-4 h-4" /> Floor:
                        </span>
                        <span className="font-bold text-slate-900">
                          {selectedRoom.floorNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Status:
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(selectedRoom)}`}
                        >
                          {getStatusText(selectedRoom)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <CreditCard className="w-4 h-4" /> Monthly Rent:
                        </span>
                        <span className="font-bold text-purple-600 text-lg">
                          ₹{selectedRoom.monthlyRent}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <Shield className="w-4 h-4" /> Attached Bathroom:
                        </span>
                        <span className="font-bold text-slate-900">
                          {selectedRoom.attachedBathroom ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Occupancy Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <BedDouble className="w-4 h-4" /> Total Beds:
                        </span>
                        <span className="font-bold text-slate-900">
                          {selectedRoom.totalBeds || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <Users className="w-4 h-4" /> Occupied Beds:
                        </span>
                        <span className="font-bold text-blue-600">
                          {selectedRoom.occupiedBeds || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <Key className="w-4 h-4" /> Available Beds:
                        </span>
                        <span className="font-bold text-emerald-600">
                          {selectedRoom.availableBeds ||
                            selectedRoom.totalBeds -
                              selectedRoom.occupiedBeds ||
                            0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Occupancy Rate:
                        </span>
                        <span className="font-bold text-purple-600">
                          {selectedRoom.totalBeds > 0
                            ? Math.round(
                                ((selectedRoom.occupiedBeds || 0) /
                                  selectedRoom.totalBeds) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Room Full:
                        </span>
                        <span
                          className={`font-bold ${selectedRoom.isFull ? "text-red-600" : "text-emerald-600"}`}
                        >
                          {selectedRoom.isFull ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedRoom.amenities &&
                  selectedRoom.amenities.length > 0 && (
                    <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                      <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                        Amenities
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {selectedRoom.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-white text-emerald-800 px-4 py-2 rounded-xl text-sm font-medium border border-emerald-200 flex items-center gap-2"
                          >
                            {amenity === "WiFi" ? (
                              <Wifi className="w-4 h-4" />
                            ) : amenity === "Mess" ? (
                              <Utensils className="w-4 h-4" />
                            ) : amenity === "AC" ? (
                              <Coffee className="w-4 h-4" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                  <div className="flex gap-3">
                    {selectedRoom.isActive && !selectedRoom.isFull && (
                      <button
                        onClick={() => {
                          handleRoomStatusUpdate(selectedRoom._id, false);
                          setShowDetailsModal(false);
                        }}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
                      >
                        <Wrench className="w-4 h-4" />
                        Mark for Maintenance
                      </button>
                    )}
                    {!selectedRoom.isActive && (
                      <button
                        onClick={() => {
                          handleRoomStatusUpdate(selectedRoom._id, true);
                          setShowDetailsModal(false);
                        }}
                        className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-600 font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Available
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="bg-white/70 backdrop-blur text-slate-700 px-6 py-3 rounded-xl hover:bg-white/90 font-medium transition-all duration-200 border border-white/50"
                  >
                    Close
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

export default RoomManagement;
