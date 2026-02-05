import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  RefreshCw,
  Filter,
  Home,
  User,
  Calendar,
  DollarSign,
  FileText,
  Search,
  Layers,
  Settings,
  Zap,
  Droplets,
  Wind,
  Sofa,
  Smartphone,
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

const MaintenanceManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    notes: "",
    estimatedCost: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState({ status: '', notes: '' });

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
      red: "from-red-500 to-pink-400",
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
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get("maintenance/staff-requests");
      const requestData = Array.isArray(response.data?.data?.requests)
        ? response.data.data.requests
        : Array.isArray(response.data?.requests)
          ? response.data.requests
          : Array.isArray(response.data?.data)
            ? response.data.data
            : Array.isArray(response.data)
              ? response.data
              : [];
      setRequests(requestData);

      // Calculate statistics
      const statistics = {
        total: requestData.length,
        pending: requestData.filter((r) => r.status === "pending").length,
        inProgress: requestData.filter((r) => r.status === "in_progress")
          .length,
        completed: requestData.filter((r) => r.status === "completed").length,
        cancelled: requestData.filter((r) => r.status === "cancelled").length,
      };
      setStats(statistics);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      toast.error("Failed to fetch maintenance requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedRequests.length === 0 || !bulkAction.status) return;
    
    try {
      await api.put('maintenance/bulk-update', {
        requestIds: selectedRequests,
        status: bulkAction.status,
        notes: bulkAction.notes
      });
      toast.success(`${selectedRequests.length} requests updated successfully`);
      setSelectedRequests([]);
      setBulkAction({ status: '', notes: '' });
      setShowBulkModal(false);
      await fetchMaintenanceRequests();
    } catch (error) {
      toast.error('Failed to update requests');
    }
  };

  const toggleRequestSelection = (requestId) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleStatusUpdate = async (
    requestId,
    status,
    notes = "",
    estimatedCost = 0,
  ) => {
    try {
      await api.put(`maintenance/${requestId}/status`, {
        status,
        notes,
        estimatedCost: parseFloat(estimatedCost) || 0,
        assignedTo: user.id,
      });
      toast.success(`Maintenance request ${status} successfully`);
      await fetchMaintenanceRequests();
      setSelectedRequest(null);
      setUpdateData({ status: "", notes: "", estimatedCost: "" });
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      toast.error("Failed to update maintenance request");
    }
  };

  const filteredRequests = Array.isArray(requests)
    ? requests.filter((request) => {
        return filter === "all" || request.status === filter;
      })
    : [];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-100";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "low":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "plumbing":
        return <Droplets className="w-5 h-5" />;
      case "electrical":
        return <Zap className="w-5 h-5" />;
      case "cleaning":
        return <Wind className="w-5 h-5" />;
      case "furniture":
        return <Sofa className="w-5 h-5" />;
      case "appliance":
        return <Smartphone className="w-5 h-5" />;
      case "other":
        return <Settings className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
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
              Maintenance <span className={gradientText}>Management</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Manage maintenance requests and assignments
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedRequests.length > 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Bulk Update ({selectedRequests.length})
              </button>
            )}
            <button
              onClick={fetchMaintenanceRequests}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Requests"
            value={stats.total}
            icon={FileText}
            color="slate"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={Wrench}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon={X}
            color="red"
          />
        </div>

        {/* --- FILTER --- */}
        <div
          className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <label className="text-sm font-bold text-slate-700">
              Filter by Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur text-sm font-medium min-w-[200px] shadow-sm"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* --- MAINTENANCE REQUESTS --- */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border-l-4 border-l-blue-500 ${selectedRequests.includes(request._id) ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request._id)}
                      onChange={() => toggleRequestSelection(request._id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                          {getCategoryIcon(request.category)}
                        </div>
                        {request.title}
                      </h3>
                      <p className="text-sm text-slate-500 capitalize">
                        {request.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span
                      className={`px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(request.status)} border`}
                    >
                      {request.status.replace("_", " ")}
                    </span>
                    <span
                      className={`px-3 py-1.5 text-xs font-bold rounded-full ${getPriorityColor(request.priority)} border`}
                    >
                      {request.priority} priority
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-sm text-slate-700">
                    {request.description}
                  </p>
                  <div className="bg-white/50 backdrop-blur p-3 rounded-xl border border-white/50">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Student</p>
                          <p className="font-medium text-slate-800">
                            {request.student?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Room</p>
                          <p className="font-medium text-slate-800">
                            Room {request.room?.roomNumber || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Requested:
                    </span>
                    <span className="font-medium">
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  {request.estimatedCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Estimated Cost:
                      </span>
                      <span className="font-medium text-emerald-600">
                        ₹{request.estimatedCost}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {request.status === "pending" && (
                    <>
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                      >
                        <Wrench className="w-4 h-4" />
                        Accept & Start
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(
                            request._id,
                            "cancelled",
                            "Unable to process",
                          )
                        }
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5"
                      >
                        <X className="w-4 h-4" />
                        Cancel Request
                      </button>
                    </>
                  )}
                  {request.status === "in_progress" && (
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setUpdateData({ ...updateData, status: "completed" });
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-2.5 px-4 rounded-xl hover:from-emerald-600 hover:to-green-600 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Completed
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailsModal(true);
                    }}
                    className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-xl hover:bg-slate-800 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5"
                  >
                    <FileText className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredRequests.length === 0 && !loading && (
          <div className={`${glassCard} p-12 text-center`}>
            <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">
              No maintenance requests
            </h3>
            <p className="text-slate-500 mt-2">
              No maintenance requests match your current filters.
            </p>
          </div>
        )}

        {/* --- BULK UPDATE MODAL --- */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`${glassCard} max-w-md w-full mx-4 shadow-2xl`}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Bulk Update {selectedRequests.length} Requests
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={bulkAction.status}
                      onChange={(e) => setBulkAction({...bulkAction, status: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur text-sm font-medium shadow-sm"
                    >
                      <option value="">Select Status</option>
                      <option value="in_progress">Start Work</option>
                      <option value="completed">Mark Completed</option>
                      <option value="cancelled">Cancel Requests</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={bulkAction.notes}
                      onChange={(e) => setBulkAction({...bulkAction, notes: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur text-sm font-medium shadow-sm"
                      placeholder="Add notes for all selected requests..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowBulkModal(false);
                        setBulkAction({ status: '', notes: '' });
                      }}
                      className="px-4 py-2.5 text-slate-600 bg-white/70 backdrop-blur border border-white/50 rounded-xl hover:bg-white/90 font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkUpdate}
                      disabled={!bulkAction.status}
                      className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                    >
                      Update All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- UPDATE STATUS MODAL --- */}
        {selectedRequest && !showDetailsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`${glassCard} max-w-md w-full mx-4 shadow-2xl`}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Update Maintenance Request
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={updateData.status}
                      onChange={(e) =>
                        setUpdateData({ ...updateData, status: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur text-sm font-medium shadow-sm"
                    >
                      <option value="">Select Status</option>
                      <option value="in_progress">Start Work</option>
                      <option value="completed">Mark Completed</option>
                      <option value="cancelled">Cancel Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Estimated Cost (₹)
                    </label>
                    <input
                      type="number"
                      value={updateData.estimatedCost}
                      onChange={(e) =>
                        setUpdateData({
                          ...updateData,
                          estimatedCost: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur text-sm font-medium shadow-sm"
                      placeholder="Enter estimated cost"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={updateData.notes}
                      onChange={(e) =>
                        setUpdateData({ ...updateData, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur text-sm font-medium shadow-sm"
                      placeholder="Add notes about the work..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setSelectedRequest(null);
                        setUpdateData({
                          status: "",
                          notes: "",
                          estimatedCost: "",
                        });
                      }}
                      className="px-4 py-2.5 text-slate-600 bg-white/70 backdrop-blur border border-white/50 rounded-xl hover:bg-white/90 font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          selectedRequest._id,
                          updateData.status,
                          updateData.notes,
                          updateData.estimatedCost,
                        )
                      }
                      disabled={!updateData.status}
                      className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                    >
                      Update Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- DETAILS MODAL --- */}
        {showDetailsModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
              className={`${glassCard} max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Maintenance Request Details
                  </h3>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedRequest(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white/50 rounded-xl transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/50 backdrop-blur p-6 rounded-xl border border-white/50">
                      <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-600" />
                        Request Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Title:</span>
                          <span className="font-medium">
                            {selectedRequest.title}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Category:</span>
                          <span className="font-medium capitalize flex items-center gap-2">
                            <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
                              {getCategoryIcon(selectedRequest.category)}
                            </div>
                            {selectedRequest.category}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Priority:</span>
                          <span
                            className={`px-3 py-1.5 text-xs font-bold rounded-full ${getPriorityColor(selectedRequest.priority)} border`}
                          >
                            {selectedRequest.priority}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          <span
                            className={`px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(selectedRequest.status)} border`}
                          >
                            {selectedRequest.status.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Created:</span>
                          <span className="font-medium">
                            {selectedRequest.createdAt
                              ? new Date(
                                  selectedRequest.createdAt,
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Home className="w-5 h-5 text-blue-600" />
                        Location & Student
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Student:</span>
                          <span className="font-medium">
                            {selectedRequest.student?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Room:</span>
                          <span className="font-medium">
                            Room {selectedRequest.room?.roomNumber || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Floor:</span>
                          <span className="font-medium">
                            {selectedRequest.room?.floor || "N/A"}
                          </span>
                        </div>
                        {selectedRequest.estimatedCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">
                              Estimated Cost:
                            </span>
                            <span className="font-medium text-emerald-600">
                              ₹{selectedRequest.estimatedCost}
                            </span>
                          </div>
                        )}
                        {selectedRequest.actualCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Actual Cost:</span>
                            <span className="font-medium text-blue-600">
                              ₹{selectedRequest.actualCost}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-3">
                      Description
                    </h4>
                    <p className="text-slate-700">
                      {selectedRequest.description || "No description provided"}
                    </p>
                  </div>

                  {selectedRequest.notes &&
                    selectedRequest.notes.length > 0 && (
                      <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                        <h4 className="font-bold text-slate-900 mb-3">
                          Work Notes
                        </h4>
                        <div className="space-y-3">
                          {selectedRequest.notes.map((note, index) => (
                            <div
                              key={index}
                              className="bg-white/70 backdrop-blur p-4 rounded-xl border-l-4 border-l-emerald-500"
                            >
                              <p className="text-sm text-slate-700">
                                {note.content}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {note.createdAt
                                  ? new Date(note.createdAt).toLocaleString()
                                  : "N/A"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                    <div className="space-x-3">
                      {selectedRequest.status === "pending" && (
                        <>
                          <button
                            onClick={() => {
                              setShowDetailsModal(false);
                              setUpdateData({
                                ...updateData,
                                status: "in_progress",
                              });
                            }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                          >
                            Accept & Start
                          </button>
                          <button
                            onClick={() => {
                              handleStatusUpdate(
                                selectedRequest._id,
                                "cancelled",
                                "Unable to process",
                              );
                              setShowDetailsModal(false);
                            }}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 font-medium transition-all shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5"
                          >
                            Cancel Request
                          </button>
                        </>
                      )}
                      {selectedRequest.status === "in_progress" && (
                        <button
                          onClick={() => {
                            setShowDetailsModal(false);
                            setUpdateData({
                              ...updateData,
                              status: "completed",
                            });
                          }}
                          className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-600 font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedRequest(null);
                      }}
                      className="bg-white/70 backdrop-blur text-slate-700 px-6 py-3 rounded-xl hover:bg-white/90 font-medium transition-all border border-white/50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceManagement;
