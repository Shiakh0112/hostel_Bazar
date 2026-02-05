import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOwnerHostels } from '../../../app/slices/hostelSlice';
import Loader from '../../common/Loader';
import {
  Edit,
  Users,
  Bed,
  IndianRupee,
  Settings,
  ArrowLeft,
  Home,
  MapPin,
  Phone,
  Mail,
  Wifi,
  Coffee,
  Utensils,
  Star,
  CreditCard,
  Shield,
  TrendingUp,
  Activity,
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const HostelManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ownerHostels, isLoading } = useSelector((state) => state.hostel);
  const [hostel, setHostel] = useState(null);

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
    if (ownerHostels.length === 0) {
      dispatch(fetchOwnerHostels());
    }
  }, [dispatch, ownerHostels.length]);

  useEffect(() => {
    if (id && ownerHostels.length > 0) {
      const foundHostel = ownerHostels.find(h => h._id === id);
      setHostel(foundHostel);
    }
  }, [id, ownerHostels]);

  if (isLoading) return <Loader />;

  if (!hostel) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200 flex items-center justify-center">
        <BackgroundBlobs />
        <div className={`${glassCard} p-12 text-center max-w-md mx-auto`}>
          <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Hostel not found</h2>
          <p className="text-slate-500 mb-6">The hostel you're looking for doesn't exist or you don't have permission to view it.</p>
          <button 
            onClick={() => navigate('/dashboard/owner/hostels')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hostels
          </button>
        </div>
      </div>
    );
  }

  const occupancyRate = hostel.totalBeds > 0 ? Math.round((hostel.occupiedBeds / hostel.totalBeds) * 100) : 0;

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'WiFi': return <Wifi className="w-4 h-4" />;
      case 'Mess': return <Utensils className="w-4 h-4" />;
      case 'AC': return <Coffee className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard/owner/hostels')}
              className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                {hostel.name}
              </h1>
              <p className="text-slate-500 text-lg">Manage hostel operations</p>
            </div>
          </div>
          <Link
            to={`/dashboard/owner/hostels/${id}/edit`}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            <Edit className="w-4 h-4" />
            Edit Hostel
          </Link>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Beds"
            value={hostel.totalBeds || 0}
            icon={Bed}
            color="blue"
          />
          <StatCard
            title="Occupied"
            value={hostel.occupiedBeds || 0}
            icon={Users}
            color="orange"
          />
          <StatCard
            title="Available"
            value={hostel.availableBeds || 0}
            icon={Bed}
            color="green"
          />
          <StatCard
            title="Occupancy"
            value={`${occupancyRate}%`}
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hostel Details */}
          <div className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Home className="w-6 h-6 text-blue-600" />
              Hostel Information
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50">
                <label className="text-sm text-slate-500 font-medium">Name</label>
                <p className="font-bold text-slate-900">{hostel.name}</p>
              </div>
              <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50">
                <label className="text-sm text-slate-500 font-medium">Type</label>
                <p className="font-bold text-slate-900 capitalize">{hostel.hostelType}</p>
              </div>
              <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50">
                <label className="text-sm text-slate-500 font-medium">Address</label>
                <p className="font-bold text-slate-900 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  {typeof hostel.address === 'object' 
                    ? `${hostel.address.street}, ${hostel.address.area}, ${hostel.address.city}` 
                    : hostel.address
                  }
                </p>
              </div>
              <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50">
                <label className="text-sm text-slate-500 font-medium">Description</label>
                <p className="font-bold text-slate-900">{hostel.description}</p>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <IndianRupee className="w-6 h-6 text-emerald-600" />
              Pricing Information
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Monthly Rent</span>
                <span className="font-bold text-xl text-slate-900">₹{hostel.pricing?.monthlyRent || 0}</span>
              </div>
              <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Security Deposit</span>
                <span className="font-bold text-slate-900">₹{hostel.pricing?.securityDeposit || 0}</span>
              </div>
              <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Maintenance Charges</span>
                <span className="font-bold text-slate-900">₹{hostel.pricing?.maintenanceCharges || 0}</span>
              </div>
              <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Electricity Charges</span>
                <span className="font-bold text-slate-900">₹{hostel.pricing?.electricityCharges || 0}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Phone className="w-6 h-6 text-blue-600" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50">
                <label className="text-sm text-slate-500 font-medium">Phone</label>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {hostel.contact?.phone || 'Not provided'}
                </p>
              </div>
              <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50">
                <label className="text-sm text-slate-500 font-medium">Email</label>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {hostel.contact?.email || 'Not provided'}
                </p>
              </div>
              <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50">
                <label className="text-sm text-slate-500 font-medium">WhatsApp</label>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {hostel.contact?.whatsapp || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500" />
              Amenities
            </h3>
            {hostel.amenities && hostel.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {hostel.amenities.map((amenity, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium border border-blue-100 flex items-center gap-2"
                  >
                    {getAmenityIcon(amenity)}
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No amenities listed</p>
              </div>
            )}
          </div>
        </div>

        {/* --- QUICK ACTIONS --- */}
        <div className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
          <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <button className="p-6 text-center bg-white/50 backdrop-blur rounded-xl border border-white/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all group">
              <Users className="w-8 h-8 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-800">View Students</span>
            </button>
            <button className="p-6 text-center bg-white/50 backdrop-blur rounded-xl border border-white/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all group">
              <Bed className="w-8 h-8 mx-auto mb-3 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-800">Manage Rooms</span>
            </button>
            <button className="p-6 text-center bg-white/50 backdrop-blur rounded-xl border border-white/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all group">
              <CreditCard className="w-8 h-8 mx-auto mb-3 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-800">View Payments</span>
            </button>
            <button className="p-6 text-center bg-white/50 backdrop-blur rounded-xl border border-white/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all group">
              <Settings className="w-8 h-8 mx-auto mb-3 text-slate-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-800">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelManage;