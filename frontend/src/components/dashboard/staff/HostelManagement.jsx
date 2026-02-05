import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../../services/api";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Wrench,
  Users,
  Key,
  Search,
  Filter,
  RefreshCw,
  Layers,
  X,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Star,
  Wifi,
  Coffee,
  Utensils,
  Building2,
  Home,
  BedDouble,
  Shield,
  CreditCard,
  Sparkles,
  Calendar,
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const HostelManagement = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    maintenanceRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    occupancyRate: 0,
  });

  useEffect(() => {
    fetchHostelData();
  }, []);

  const fetchHostelData = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching staff hostel data...");

      // Get staff profile to find assigned hostel
      const profileResponse = await api.get("staff/profile");
      console.log("👤 Profile response:", profileResponse.data);

      const staffData = profileResponse.data?.data || profileResponse.data;
      const hostelId = staffData?.hostel?._id;

      if (!hostelId) {
        toast.error("No hostel assigned to staff");
        setHostel(null);
        setStats({
          totalRooms: 0,
          occupiedRooms: 0,
          availableRooms: 0,
          maintenanceRooms: 0,
          totalBeds: 0,
          occupiedBeds: 0,
          availableBeds: 0,
          occupancyRate: 0,
        });
        return;
      }

      console.log("🏨 Found hostel ID:", hostelId);

      // Fetch complete hostel details from owner's hostel data
      const hostelResponse = await api.get(`hostels/${hostelId}`);
      console.log("🏨 Complete hostel response:", hostelResponse.data);

      const completeHostelData =
        hostelResponse.data?.data || hostelResponse.data;

      if (!completeHostelData) {
        toast.error("Hostel details not found");
        setHostel(null);
        return;
      }

      // Fetch room data for the assigned hostel
      try {
        const roomsResponse = await api.get(`rooms/hostel/${hostelId}`);
        console.log("🏠 Rooms response:", roomsResponse.data);

        let rooms = [];
        if (
          roomsResponse.data?.data?.rooms &&
          Array.isArray(roomsResponse.data.data.rooms)
        ) {
          rooms = roomsResponse.data.data.rooms;
        } else if (
          roomsResponse.data?.data &&
          Array.isArray(roomsResponse.data.data)
        ) {
          rooms = roomsResponse.data.data;
        } else if (Array.isArray(roomsResponse.data)) {
          rooms = roomsResponse.data;
        }

        console.log("📊 Processing room data:", rooms);

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

        if (rooms.length > 0 && rooms.length === totalRooms) {
          // Use actual room data only if we have all rooms
          availableRooms = rooms.filter(
            (room) => !room.isFull && room.isActive,
          ).length;
          occupiedRooms = rooms.filter(
            (room) => room.isFull || room.occupiedBeds > 0,
          ).length;
          maintenanceRooms = rooms.filter((room) => !room.isActive).length;
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

        // Add room status for display
        const roomsWithStatus = rooms.map((room) => ({
          ...room,
          status: !room.isActive
            ? "maintenance"
            : room.isFull
              ? "occupied"
              : room.occupiedBeds > 0
                ? "occupied"
                : "available",
        }));

        const hostelWithCompleteData = {
          ...completeHostelData, // Use complete hostel data from owner
          totalRooms,
          availableRooms,
          occupiedRooms,
          maintenanceRooms,
          rooms,
          roomsWithStatus,
          // Use hostel model's pre-calculated values
          totalBeds,
          occupiedBeds,
          availableBeds,
          occupancyRate,
        };

        setHostel(hostelWithCompleteData);
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

        toast.success(`Loaded complete details for ${completeHostelData.name}`);
      } catch (roomError) {
        console.error("Error fetching rooms:", roomError);
        // Use hostel model's pre-calculated values for fallback
        const totalBeds = completeHostelData.totalBeds || 0;
        const occupiedBeds = completeHostelData.occupiedBeds || 0;
        const availableBeds =
          completeHostelData.availableBeds || totalBeds - occupiedBeds;

        const totalRooms = completeHostelData.structure
          ? completeHostelData.structure.totalFloors *
            completeHostelData.structure.roomsPerFloor
          : Math.ceil(
              totalBeds / (completeHostelData.structure?.bedsPerRoom || 1),
            );

        // Calculate rooms properly - a room is occupied if it has any occupied beds
        const bedsPerRoom = completeHostelData.structure?.bedsPerRoom || 1;
        const occupiedRooms =
          occupiedBeds > 0 ? Math.ceil(occupiedBeds / bedsPerRoom) : 0;
        const availableRooms = totalRooms - occupiedRooms;
        const occupancyRate =
          totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

        const hostelWithoutRooms = {
          ...completeHostelData,
          totalRooms,
          availableRooms,
          occupiedRooms,
          maintenanceRooms: 0,
          rooms: [],
          roomsWithStatus: [],
          totalBeds,
          occupiedBeds,
          availableBeds,
          occupancyRate,
        };

        setHostel(hostelWithoutRooms);
        setStats({
          totalRooms,
          availableRooms,
          occupiedRooms,
          maintenanceRooms: 0,
          totalBeds,
          occupiedBeds,
          availableBeds,
          occupancyRate,
        });

        toast.warning(
          "Complete hostel data loaded but room details unavailable",
        );
      }
    } catch (error) {
      console.error("💥 Error fetching hostel data:", error);
      toast.error(
        "Failed to fetch hostel details: " +
          (error.response?.data?.message || error.message),
      );
      setHostel(null);
      setStats({
        totalRooms: 0,
        occupiedRooms: 0,
        availableRooms: 0,
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

  const handleManageRooms = (hostel) => {
    navigate("/dashboard/staff/rooms", {
      state: { selectedHostelId: hostel._id },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "inactive":
        return "bg-red-50 text-red-700 border-red-100";
      case "maintenance":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const formatAddress = (address) => {
    if (typeof address === "object" && address) {
      return `${address.street || ""}, ${address.area || ""}, ${address.city || ""}, ${address.state || ""} - ${address.pincode || ""}`;
    }
    return address || "Address not available";
  };

  const getMainImage = (hostel) => {
    return (
      hostel.mainImage ||
      hostel.images?.find((img) => img.type === "building")?.url ||
      hostel.images?.[0]?.url ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    );
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Hostel <span className={gradientText}>Management</span>
            </h1>
            <p className="text-slate-500 text-lg">
              {hostel
                ? `Managing ${hostel.name}`
                : "Manage assigned hostel and monitor room status"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchHostelData}
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
            value={stats.totalRooms}
            icon={Layers}
            color="slate"
          />
          <StatCard
            title="Available"
            value={stats.availableRooms}
            icon={Key}
            color="green"
          />
          <StatCard
            title="Occupied"
            value={stats.occupiedRooms}
            icon={Users}
            color="orange"
          />
          <StatCard
            title="Maintenance"
            value={stats.maintenanceRooms}
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

        {/* --- HOSTEL CARD --- */}
        {hostel ? (
          <div
            className={`${glassCard} overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
          >
            {/* Card Header with Image */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={getMainImage(hostel)}
                alt={hostel.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

              {/* Overlay Content */}
              <div className="absolute bottom-4 left-6 text-white">
                <h2 className="text-2xl font-bold mb-1">{hostel.name}</h2>
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {formatAddress(hostel.address)}
                  </span>
                </div>
              </div>

              {/* Hostel Type Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-md text-gray-800 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm capitalize flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> {hostel.hostelType}
                </span>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border ${getStatusColor(hostel.isActive ? "active" : "inactive")}`}
                >
                  {hostel.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">
                          Structure
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {hostel.structure?.totalFloors || 0} Floors,{" "}
                          {hostel.structure?.roomsPerFloor || 0} Rooms/Floor
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BedDouble className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">
                          Room Type
                        </p>
                        <p className="text-sm font-semibold text-slate-800 capitalize">
                          {hostel.structure?.roomType || "N/A"} (
                          {hostel.structure?.bedsPerRoom || 0} beds/room)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">
                          Bathroom
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {hostel.structure?.attachedBathroom
                            ? "Attached"
                            : "Common"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle: Contact & Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    Contact & Pricing
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">
                          Phone
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {hostel.contact?.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {hostel.contact?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">
                          Monthly Rent
                        </p>
                        <p className="text-lg font-bold text-slate-900">
                          ₹{hostel.pricing?.monthlyRent?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Amenities */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {hostel.amenities && hostel.amenities.length > 0 ? (
                      hostel.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 flex items-center gap-1"
                        >
                          {amenity === "WiFi" ? (
                            <Wifi className="w-3 h-3" />
                          ) : amenity === "Mess" ? (
                            <Utensils className="w-3 h-3" />
                          ) : amenity === "AC" ? (
                            <Coffee className="w-3 h-3" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          {amenity}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">
                        No amenities listed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {hostel.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    Description
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {hostel.description}
                  </p>
                </div>
              )}

              {/* Additional Hostel Details */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Additional Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">
                      Additional Details
                    </h3>
                    <div className="space-y-3">
                      {hostel.pricing?.securityDeposit && (
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">
                              Security Deposit
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                              ₹{hostel.pricing.securityDeposit.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                      {hostel.pricing?.maintenanceCharges && (
                        <div className="flex items-center gap-3">
                          <Wrench className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">
                              Maintenance Charges
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                              ₹
                              {hostel.pricing.maintenanceCharges.toLocaleString()}
                              /month
                            </p>
                          </div>
                        </div>
                      )}
                      {hostel.pricing?.electricityCharges && (
                        <div className="flex items-center gap-3">
                          <Coffee className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">
                              Electricity Charges
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                              ₹
                              {hostel.pricing.electricityCharges.toLocaleString()}
                              /month
                            </p>
                          </div>
                        </div>
                      )}
                      {hostel.contact?.whatsapp && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">
                              WhatsApp
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                              {hostel.contact.whatsapp}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Rules & Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">
                      Rules & Settings
                    </h3>
                    <div className="space-y-3">
                      {hostel.rules && hostel.rules.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold mb-2">
                            Hostel Rules
                          </p>
                          <div className="space-y-1">
                            {hostel.rules.slice(0, 3).map((rule, index) => (
                              <p
                                key={index}
                                className="text-sm text-slate-600 flex items-start gap-2"
                              >
                                <span className="text-blue-500 mt-1">•</span>
                                {rule}
                              </p>
                            ))}
                            {hostel.rules.length > 3 && (
                              <p className="text-xs text-slate-400 italic">
                                +{hostel.rules.length - 3} more rules
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {hostel.rating?.average > 0 && (
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">
                              Rating
                            </p>
                            <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                              {hostel.rating.average.toFixed(1)}
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ({hostel.rating.count} reviews)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <button
                  onClick={() => handleManageRooms(hostel)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 transition-all hover:-translate-y-0.5"
                >
                  <Layers className="w-5 h-5" />
                  Manage Rooms
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${glassCard} p-12 text-center`}>
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">
              No hostel assigned
            </h3>
            <p className="text-slate-500 mt-2">
              Contact your administrator to get a hostel assigned
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelManagement;
