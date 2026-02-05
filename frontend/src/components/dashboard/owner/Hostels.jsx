import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOwnerHostels } from "../../../app/slices/hostelSlice";
import HostelCard from "../../hostel/HostelCard";
import HostelForm from "../../hostel/HostelForm";
import Modal from "../../common/Modal";
import Loader from "../../common/Loader";

// Lucide Icons
import {
  Building,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Grid3x3,
  MapPin,
  ArrowRight,
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const Hostels = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, action } = useParams();
  const { ownerHostels, isLoading } = useSelector((state) => state.hostel);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);

  // Local state for search and filter UI (visual only for this example)
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  useEffect(() => {
    dispatch(fetchOwnerHostels());
  }, [dispatch]);

  useEffect(() => {
    if (id && action && ownerHostels.length > 0) {
      const hostel = ownerHostels.find((h) => h._id === id);
      if (hostel) {
        setSelectedHostel(hostel);
        if (action === "edit") {
          setShowEditModal(true);
        } else if (action === "manage") {
          setShowManageModal(true);
        }
      }
    }
  }, [id, action, ownerHostels]);

  const handleHostelCreated = () => {
    dispatch(fetchOwnerHostels());
    setShowCreateModal(false);
  };

  const handleHostelUpdated = () => {
    dispatch(fetchOwnerHostels());
    setShowEditModal(false);
    setSelectedHostel(null);
    navigate("/dashboard/owner/hostels");
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowManageModal(false);
    setSelectedHostel(null);
    navigate("/dashboard/owner/hostels");
  };

  // Filter hostels based on search term
  const filteredHostels = ownerHostels.filter(
    (hostel) =>
      hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hostel.address &&
        hostel.address.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Simple sorting logic
  const sortedHostels = [...filteredHostels].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "created")
      return new Date(b.createdAt) - new Date(a.createdAt);
    // 'occupancy' placeholder logic
    return 0;
  });

  if (isLoading && ownerHostels.length === 0) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              My <span className={gradientText}>Hostels</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Manage your properties and monitor performance
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 font-medium transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Add New Hostel
          </button>
        </div>

        {/* --- FILTERS & SEARCH TOOLBAR --- */}
        <div
          className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search hostels by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
              />
            </div>

            {/* Sort By */}
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium appearance-none cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="created">Sort by Newest</option>
                <option value="occupancy">Sort by Occupancy</option>
              </select>
            </div>

            {/* Filter (Visual Placeholder) */}
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center">
                <Filter className="w-4 h-4" />
              </div>
              <select className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium appearance-none cursor-pointer">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- EMPTY STATE --- */}
        {sortedHostels.length === 0 && !isLoading ? (
          <div
            className={`${glassCard} p-12 text-center flex flex-col items-center justify-center`}
          >
            <div className="p-6 bg-white/50 backdrop-blur rounded-full mb-6">
              <Building className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No hostels found
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              {searchTerm
                ? "No hostels match your search criteria."
                : "Get started by adding your first property to the system."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 font-medium transition-all hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Hostel
              </button>
            )}
          </div>
        ) : (
          <>
            {/* --- RESULTS COUNT --- */}
            <div className="flex justify-between items-center px-2">
              <p className="text-sm font-medium text-slate-600">
                Showing{" "}
                <span className="text-blue-600 font-bold">
                  {sortedHostels.length}
                </span>{" "}
                properties
              </p>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Grid3x3 className="w-4 h-4" />
                <MapPin className="w-4 h-4 opacity-50" />
              </div>
            </div>

            {/* --- HOSTELS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
              {sortedHostels.map((hostel) => (
                <div key={hostel._id} className="group">
                  {/* Assuming HostelCard returns a standard div. 
                      We wrap it to apply hover effects if needed, or just render it */}
                  <div className="hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                    <HostelCard hostel={hostel} isOwner />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- CREATE MODAL --- */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        title="Create New Hostel"
        size="xl"
      >
        <HostelForm
          onClose={handleCloseModals}
          onSuccess={handleHostelCreated}
        />
      </Modal>

      {/* --- EDIT MODAL --- */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        title="Edit Hostel"
        size="xl"
      >
        {selectedHostel && (
          <HostelForm
            hostel={selectedHostel}
            isEdit={true}
            onClose={handleCloseModals}
            onSuccess={handleHostelUpdated}
          />
        )}
      </Modal>

      {/* --- MANAGE MODAL --- */}
      <Modal
        isOpen={showManageModal}
        onClose={handleCloseModals}
        title={`Manage ${selectedHostel?.name || "Hostel"}`}
        size="xl"
      >
        {selectedHostel && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/50 backdrop-blur p-6 rounded-xl border border-white/50">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Hostel Details
                </h3>
                <div className="space-y-3">
                  <p>
                    <span className="text-slate-600">Name:</span>{" "}
                    <span className="font-bold text-slate-900">
                      {selectedHostel.name}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600">Type:</span>{" "}
                    <span className="font-bold text-slate-900">
                      {selectedHostel.hostelType}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600">Total Beds:</span>{" "}
                    <span className="font-bold text-slate-900">
                      {selectedHostel.totalBeds || 0}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600">Available:</span>{" "}
                    <span className="font-bold text-emerald-600">
                      {selectedHostel.availableBeds || 0}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600">Occupied:</span>{" "}
                    <span className="font-bold text-blue-600">
                      {selectedHostel.occupiedBeds || 0}
                    </span>
                  </p>
                </div>
              </div>
              <div className="bg-white/50 backdrop-blur p-6 rounded-xl border border-white/50">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-emerald-600" />
                  Pricing
                </h3>
                <div className="space-y-3">
                  <p>
                    <span className="text-slate-600">Monthly Rent:</span>{" "}
                    <span className="font-bold text-slate-900">
                      ₹{selectedHostel.pricing?.monthlyRent || 0}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600">Security Deposit:</span>{" "}
                    <span className="font-bold text-slate-900">
                      ₹{selectedHostel.pricing?.securityDeposit || 0}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600">Maintenance:</span>{" "}
                    <span className="font-bold text-slate-900">
                      ₹{selectedHostel.pricing?.maintenanceCharges || 0}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowManageModal(false);
                  setShowEditModal(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 font-medium transition-all hover:-translate-y-0.5"
              >
                Edit Hostel
              </button>
              <button
                onClick={handleCloseModals}
                className="px-6 py-3 bg-white/70 backdrop-blur text-slate-700 rounded-xl hover:bg-white/90 font-medium transition-all border border-white/50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Hostels;
