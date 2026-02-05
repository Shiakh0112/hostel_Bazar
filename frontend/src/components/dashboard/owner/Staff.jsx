import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOwnerStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../../../app/slices/staffSlice";
import { fetchOwnerHostels } from "../../../app/slices/hostelSlice";
import staffService from "../../../services/staff.service";
import { formatDate } from "../../../utils/formatDate";
import Modal from "../../common/Modal";
import Loader from "../../common/Loader";
import {
  Users,
  Plus,
  RefreshCcw,
  Search,
  Pencil,
  Trash2,
  KeyRound,
  Mail,
  Phone,
  Building,
  Calendar,
  Filter,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const Staff = () => {
  const dispatch = useDispatch();
  const {
    ownerStaff = [],
    loading,
    error,
  } = useSelector((state) => state.staff);
  const { ownerHostels = [] } = useSelector((state) => state.hostel);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    hostelId: "",
    permissions: [],
  });

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    dispatch(fetchOwnerStaff());
    dispatch(fetchOwnerHostels());
  }, [dispatch]);

  /* ---------------- FILTER ---------------- */
  const filteredStaff = ownerStaff.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile?.includes(search) ||
      s.hostel?.name?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && s.isActive) ||
      (statusFilter === "inactive" && !s.isActive);

    return matchSearch && matchStatus;
  });

  const counts = {
    all: ownerStaff.length,
    active: ownerStaff.filter((s) => s.isActive).length,
    inactive: ownerStaff.filter((s) => !s.isActive).length,
  };

  /* ---------------- HANDLERS ---------------- */
  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      mobile: staff.mobile,
      hostelId: staff.hostel?._id || "",
      permissions: staff.permissions || [],
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this staff member?")) {
      await dispatch(deleteStaff(id));
      dispatch(fetchOwnerStaff());
    }
  };

  const handleResetPassword = async (id, name, email) => {
    if (window.confirm(`Reset password for ${name}?`)) {
      await staffService.resetStaffPassword(id);
      alert("New password sent to staff email");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* --- HEADER + FILTER --- */}
        <div
          className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <Users size={32} className="text-blue-600" />
                Staff <span className={gradientText}>Management</span>
              </h1>
              <p className="text-slate-500 text-lg">
                Manage staff members across your hostels
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Add Staff
            </button>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center gap-4">
            {/* SEARCH */}
            <div className="relative w-full md:w-72">
              <Search
                size={16}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff..."
                className="pl-9 w-full border border-slate-200 rounded-xl py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 backdrop-blur font-medium"
              />
            </div>

            {/* STATUS */}
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center">
                <Filter className="w-4 h-4" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 backdrop-blur font-medium appearance-none cursor-pointer"
              >
                <option value="all">All ({counts.all})</option>
                <option value="active">Active ({counts.active})</option>
                <option value="inactive">Inactive ({counts.inactive})</option>
              </select>
              <div className="absolute right-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center pointer-events-none">
                <Filter className="w-4 h-4" />
              </div>
            </div>

            {/* REFRESH */}
            <button
              onClick={() => dispatch(fetchOwnerStaff())}
              className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* --- ERROR --- */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* --- TABLE --- */}
        <div
          className={`${glassCard} overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          {filteredStaff.length === 0 ? (
            <div className="py-14 text-center">
              <Users size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600">No staff found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/50 backdrop-blur text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Staff</th>
                    <th className="px-6 py-3">Hostel</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((s) => (
                    <tr
                      key={s._id}
                      className="hover:bg-white/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{s.name}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {s.email}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {s.mobile}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400" />
                          {s.hostel?.name || "—"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                            s.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}
                        >
                          {s.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {formatDate(s.createdAt)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-2 rounded-xl hover:bg-white/70 text-blue-600 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleResetPassword(s._id, s.name, s.email)
                          }
                          className="p-2 rounded-xl hover:bg-white/70 text-amber-600 transition-colors"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="p-2 rounded-xl hover:bg-white/70 text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- MODALS (same as your existing code) --- */}
      </div>
    </div>
  );
};

export default Staff;
