import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  Clock,
  Wrench,
  LogOut,
  ArrowRight,
  RefreshCw,
  FileText,
  Activity,
  TrendingUp,
  Star,
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

// --- CUSTOM TOOLTIP FOR CHARTS ---
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50">
        <p className="text-xs text-gray-500 font-bold uppercase mb-1">
          {payload[0].name}
        </p>
        <p className="text-lg font-bold text-slate-800">
          {payload[0].value} Tasks
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    studentsManaged: 0,
    maintenanceRequests: 0,
    checkoutRequests: 0,
    roomTransfers: 0,
    monthlyPayments: 0,
  });

  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const maintenanceRes = await api.get("maintenance/staff-requests");
      const maintenance = Array.isArray(maintenanceRes.data?.data?.requests)
        ? maintenanceRes.data.data.requests
        : [];

      let studentsRes;
      try {
        studentsRes = await api.get("staff/students");
      } catch (error) {
        studentsRes = { data: { students: [], totalStudents: 0 } };
      }

      const students = studentsRes.data?.students || [];
      const totalStudents = studentsRes.data?.totalStudents || students.length;

      const pendingMaintenance = maintenance.filter(
        (m) => m.status === "pending",
      ).length;
      const inProgressMaintenance = maintenance.filter(
        (m) => m.status === "in_progress",
      ).length;
      const completedMaintenance = maintenance.filter(
        (m) => m.status === "completed",
      ).length;

      const uniqueStudents = new Set();
      maintenance.forEach((req) => {
        if (req.student?._id) uniqueStudents.add(req.student._id);
      });

      setStats({
        totalTasks: maintenance.length,
        pendingTasks: pendingMaintenance,
        completedTasks: completedMaintenance,
        inProgressTasks: inProgressMaintenance,
        studentsManaged: Math.max(totalStudents, uniqueStudents.size),
        maintenanceRequests: pendingMaintenance,
        checkoutRequests: 0,
        roomTransfers: 0,
        monthlyPayments: maintenance.filter((m) => m.actualCost > 0).length,
      });

      const recentMaintenanceTasks = maintenance
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((m) => ({
          _id: m._id,
          title: m.title,
          description: m.description,
          status: m.status,
          student: m.student,
          createdAt: m.createdAt,
        }));

      setRecentTasks(recentMaintenanceTasks);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  const taskData = [
    { name: "Pending", count: stats.pendingTasks, color: "#f59e0b" },
    { name: "In Progress", count: stats.inProgressTasks, color: "#3b82f6" },
    { name: "Completed", count: stats.completedTasks, color: "#10b981" },
  ];

  const pieData = [
    { name: "Completed", value: stats.completedTasks, color: "#10b981" },
    { name: "Pending", value: stats.pendingTasks, color: "#f59e0b" },
    { name: "Active", value: stats.inProgressTasks, color: "#3b82f6" },
  ];

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => {
    const gradients = {
      blue: "from-blue-500 to-cyan-500",
      green: "from-emerald-500 to-green-400",
      yellow: "from-amber-500 to-orange-400",
      purple: "from-purple-500 to-pink-500",
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

  const handleQuickAction = (action) => {
    switch (action) {
      case "tasks":
        navigate("/dashboard/staff/assigned-tasks");
        break;
      case "students":
        navigate("/dashboard/staff/students");
        break;
      case "maintenance":
        navigate("/dashboard/staff/maintenance");
        break;
      case "reports":
        navigate("/dashboard/staff/reports");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Staff <span className={gradientText}>Dashboard</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Welcome back,{" "}
              <span className="font-semibold text-slate-700">{user?.name}</span>{" "}
              👋
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-blue-600"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => navigate("/dashboard/staff/assigned-tasks")}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 transition-all flex items-center gap-2 hover:-translate-y-0.5"
            >
              View Tasks <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Completed Tasks"
            value={stats.completedTasks}
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Students"
            value={stats.studentsManaged}
            icon={Users}
            color="purple"
          />
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* BAR CHART */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`${glassCard} p-8`}>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    Task Performance
                  </h3>
                  <p className="text-slate-500">Analytics for current month</p>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                  <Activity className="w-6 h-6" />
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={taskData}
                    margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="0"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontWeight: "600" }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={60}>
                      {taskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* PIE CHART */}
          <div className={`${glassCard} p-8 flex flex-col justify-between`}>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Overview</h3>
              <p className="text-sm text-slate-500">Status Distribution</p>
            </div>

            <div className="h-[220px] w-full flex justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text in Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-slate-800">
                  {stats.totalTasks}
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">
                  Total
                </span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-1 gap-2 mt-4">
              {pieData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-xs font-bold text-slate-600">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RECENT TASKS LIST */}
          <div className="lg:col-span-2">
            <div className={`${glassCard} p-8`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                  Recent Activity
                </h3>
                <button
                  onClick={() => navigate("/dashboard/staff/assigned-tasks")}
                  className="text-blue-600 text-sm font-bold hover:underline"
                >
                  View All
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : recentTasks.length > 0 ? (
                <div className="space-y-4">
                  {recentTasks.map((task, index) => (
                    <div
                      key={task._id || index}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/40 hover:bg-white hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                            task.status === "completed"
                              ? "bg-emerald-500"
                              : task.status === "in_progress"
                                ? "bg-blue-500"
                                : "bg-amber-500"
                          }`}
                        >
                          {task.student?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                            {task.title || "Maintenance"}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {task.student?.name} •{" "}
                            {new Date(task.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                          task.status === "completed"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : task.status === "in_progress"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">
                    No recent tasks found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className={`${glassCard} p-8`}>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Tasks",
                  icon: FileText,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  onClick: () => handleQuickAction("tasks"),
                },
                {
                  label: "Students",
                  icon: Users,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                  onClick: () => handleQuickAction("students"),
                },
                {
                  label: "Repair",
                  icon: Wrench,
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                  onClick: () => handleQuickAction("maintenance"),
                },
                {
                  label: "Reports",
                  icon: LayoutDashboard,
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                  onClick: () => handleQuickAction("reports"),
                },
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/40 border border-white/40 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <div
                    className={`p-3 rounded-xl ${action.bg} ${action.color} mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
