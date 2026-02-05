import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import api from "../../../services/api";
// --- ICONS ---
import {
  Search,
  Filter,
  Wrench,
  Zap,
  Home,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  FileText,
  Clock,
  User,
  MapPin,
  X,
} from "lucide-react";

// --- ANIMATED BACKGROUND ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const AssignedTasks = () => {
  const { user } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [updateModal, setUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    notes: "",
    actualCost: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get("staff/assigned-tasks");
      const taskData = Array.isArray(response.data?.data?.requests)
        ? response.data.data.requests
        : Array.isArray(response.data?.requests)
          ? response.data.requests
          : Array.isArray(response.data?.data)
            ? response.data.data
            : Array.isArray(response.data)
              ? response.data
              : [];

      setTasks(taskData);

      // Calculate statistics
      const statistics = {
        total: taskData.length,
        available: taskData.filter(
          (t) => t.status === "pending" && !t.assignedTo,
        ).length,
        assigned: taskData.filter(
          (t) => t.status === "assigned" && t.assignedTo?._id === user?.id,
        ).length,
        inProgress: taskData.filter((t) => t.status === "in_progress").length,
        completed: taskData.filter((t) => t.status === "completed").length,
      };
      setStats(statistics);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch assigned tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, action, additionalData = {}) => {
    try {
      let statusData = { ...additionalData };

      if (!action) {
        await api.post(`maintenance/${taskId}/notes`, {
          message: additionalData.notes,
        });
        toast.success("Note added successfully");
        await fetchTasks();
        setUpdateModal(false);
        setSelectedTask(null);
        setUpdateData({ status: "", notes: "", actualCost: "" });
        return;
      }

      switch (action) {
        case "take_task":
          statusData = { status: "assigned", assignedTo: user.id };
          break;
        case "start":
          statusData = { status: "in_progress" };
          break;
        case "complete":
          statusData = {
            status: "completed",
            completedAt: new Date().toISOString(),
            ...additionalData,
          };
          break;
        case "pause":
          statusData = { status: "assigned" };
          break;
        case "reject":
          statusData = {
            status: "pending",
            assignedTo: null,
            ...additionalData,
          };
          break;
        default:
          return;
      }

      await api.put(`maintenance/${taskId}/status`, statusData);
      toast.success(`Task ${action.replace("_", " ")} successfully`);
      await fetchTasks();
      setUpdateModal(false);
      setSelectedTask(null);
      setUpdateData({ status: "", notes: "", actualCost: "" });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const openUpdateModal = (task, action) => {
    setSelectedTask(task);
    setUpdateData({ status: action, notes: "", actualCost: "" });
    setUpdateModal(true);
  };

  const filteredTasks = Array.isArray(tasks)
    ? tasks.filter((task) => {
        const matchesFilter =
          statusFilter === "all" ||
          (statusFilter === "available" &&
            task.status === "pending" &&
            !task.assignedTo) ||
          (statusFilter === "assigned" &&
            task.status === "assigned" &&
            task.assignedTo?._id === user?.id) ||
          (statusFilter === "in_progress" && task.status === "in_progress") ||
          (statusFilter === "completed" && task.status === "completed");

        const matchesSearch =
          task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.category?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
      })
    : [];

  // --- STYLING HELPERS ---
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "assigned":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "plumbing":
        return <Wrench className="w-5 h-5" />;
      case "electrical":
        return <Zap className="w-5 h-5" />;
      case "cleaning":
        return <Home className="w-5 h-5" />;
      case "furniture":
        return <CreditCard className="w-5 h-5" />;
      case "appliance":
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Assigned{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                Tasks
              </span>
            </h1>
            <p className="text-slate-500 mt-2">
              Manage and track your maintenance requests
            </p>
          </div>
          <button
            onClick={fetchTasks}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm text-sm font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              title: "Total",
              value: stats.total,
              color: "text-slate-700",
              bg: "bg-slate-50",
              icon: FileText,
            },
            {
              title: "Available",
              value: stats.available,
              color: "text-amber-600",
              bg: "bg-amber-50",
              icon: Search,
            },
            {
              title: "Assigned",
              value: stats.assigned,
              color: "text-blue-600",
              bg: "bg-blue-50",
              icon: CheckCircle2,
            },
            {
              title: "In Progress",
              value: stats.inProgress,
              color: "text-purple-600",
              bg: "bg-purple-50",
              icon: Loader2,
            },
            {
              title: "Completed",
              value: stats.completed,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              icon: CheckCircle2,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.bg} p-4 rounded-2xl border border-white/50 shadow-sm`}
            >
              <div className={`text-3xl font-extrabold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {stat.title}
              </div>
            </div>
          ))}
        </div>

        {/* FILTERS & SEARCH */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-auto flex-1">
            <Filter className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold text-slate-700"
            >
              <option value="all">All Tasks</option>
              <option value="available">Available Tasks</option>
              <option value="assigned">Assigned to Me</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="relative w-full flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks, category..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
            />
          </div>
        </div>

        {/* TASKS GRID */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* CARD HEADER */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
                      {getCategoryIcon(task.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base leading-tight">
                        {task.title}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-lg border ${getStatusColor(task.status)}`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-lg border ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>

                {/* CARD BODY */}
                <p className="text-slate-600 text-sm mb-6 line-clamp-2">
                  {task.description}
                </p>

                <div className="space-y-2 mb-6 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <User className="w-4 h-4" />
                    <span className="font-medium text-slate-700">
                      {task.student?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium text-slate-700">
                      Room {task.room?.roomNumber || "N/A"}
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="space-y-2.5">
                  {task.status === "pending" && !task.assignedTo && (
                    <button
                      onClick={() => handleStatusUpdate(task._id, "take_task")}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Take This Task
                    </button>
                  )}

                  {task.status === "assigned" && task.assignedTo?._id && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStatusUpdate(task._id, "start")}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-2.5 px-3 rounded-xl font-bold text-sm transition-colors"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => openUpdateModal(task, "reject")}
                        className="bg-red-50 text-red-700 hover:bg-red-100 py-2.5 px-3 rounded-xl font-bold text-sm transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {task.status === "in_progress" && task.assignedTo?._id && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openUpdateModal(task, "complete")}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-2.5 px-3 rounded-xl font-bold text-sm transition-colors"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(task._id, "pause")}
                        className="bg-amber-50 text-amber-700 hover:bg-amber-100 py-2.5 px-3 rounded-xl font-bold text-sm transition-colors"
                      >
                        Pause
                      </button>
                    </div>
                  )}

                  {(task.status === "assigned" ||
                    task.status === "in_progress") &&
                    task.assignedTo?._id && (
                      <button
                        onClick={() => openUpdateModal(task, "add_note")}
                        className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 py-2.5 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" /> Add Note
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTasks.length === 0 && !loading && (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No tasks found</h3>
            <p className="text-slate-500 mt-2">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {updateModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 relative">
            <button
              onClick={() => {
                setUpdateModal(false);
                setSelectedTask(null);
                setUpdateData({ status: "", notes: "", actualCost: "" });
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              {updateData.status === "complete"
                ? "Complete Task"
                : updateData.status === "reject"
                  ? "Reject Task"
                  : "Add Note"}
            </h3>

            <div className="space-y-5">
              {updateData.status === "complete" && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Actual Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={updateData.actualCost}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        actualCost: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="Enter actual cost"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {updateData.status === "complete"
                    ? "Completion Notes"
                    : updateData.status === "reject"
                      ? "Rejection Reason"
                      : "Add Note"}
                </label>
                <textarea
                  value={updateData.notes}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, notes: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                  placeholder={
                    updateData.status === "complete"
                      ? "Add completion notes..."
                      : updateData.status === "reject"
                        ? "Enter rejection reason..."
                        : "Add your note..."
                  }
                  required={updateData.status === "reject"}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-8">
                <button
                  onClick={() => {
                    setUpdateModal(false);
                    setSelectedTask(null);
                    setUpdateData({ status: "", notes: "", actualCost: "" });
                  }}
                  className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (updateData.status === "add_note") {
                      handleStatusUpdate(selectedTask._id, null, {
                        notes: updateData.notes,
                      });
                    } else {
                      handleStatusUpdate(selectedTask._id, updateData.status, {
                        notes: updateData.notes,
                        ...(updateData.actualCost && {
                          actualCost: parseFloat(updateData.actualCost),
                        }),
                      });
                    }
                  }}
                  disabled={
                    (updateData.status === "reject" ||
                      updateData.status === "add_note") &&
                    !updateData.notes.trim()
                  }
                  className={`px-6 py-2.5 text-white font-bold rounded-xl disabled:opacity-50 shadow-lg transition-all hover:-translate-y-0.5 ${
                    updateData.status === "complete"
                      ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/30"
                      : updateData.status === "reject"
                        ? "bg-red-600 hover:bg-red-700 hover:shadow-red-500/30"
                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30"
                  }`}
                >
                  {updateData.status === "complete"
                    ? "Complete Task"
                    : updateData.status === "reject"
                      ? "Reject Task"
                      : "Add Note"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedTasks;
