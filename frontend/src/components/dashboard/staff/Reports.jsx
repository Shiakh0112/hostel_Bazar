import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  FileText,
  TrendingUp,
  Users,
  Star,
  Calendar,
  Download,
  RefreshCw,
  Activity,
  Wrench,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart,
  ArrowRight,
  Filter,
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

const Reports = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState({
    tasks: { completed: 0, pending: 0, total: 0 },
    maintenance: { completed: 0, pending: 0, total: 0 },
    students: { managed: 0, active: 0 },
    performance: { rating: 0, completionRate: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [recentActivities, setRecentActivities] = useState([]);

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => {
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
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
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
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Get staff profile to find assigned hostel
      const profileResponse = await api.get('staff/profile');
      const staffData = profileResponse.data?.data || profileResponse.data;
      const hostelId = staffData?.hostel?._id;
      
      if (!hostelId) {
        toast.error('No hostel assigned to staff');
        setLoading(false);
        return;
      }

      // Fetch real data from multiple endpoints
      const [roomsRes, maintenanceRes, paymentsRes] = await Promise.all([
        api.get(`rooms/hostel/${hostelId}`).catch(() => ({ data: { data: { rooms: [] } } })),
        api.get('maintenance/staff-requests').catch(() => ({ data: { data: { requests: [] } } })),
        api.get('staff/monthly-payments').catch(() => ({ data: { data: [] } }))
      ]);

      // Extract room data
      let roomData = [];
      if (roomsRes.data?.data?.rooms && Array.isArray(roomsRes.data.data.rooms)) {
        roomData = roomsRes.data.data.rooms;
      } else if (roomsRes.data?.data && Array.isArray(roomsRes.data.data)) {
        roomData = roomsRes.data.data;
      } else if (Array.isArray(roomsRes.data)) {
        roomData = roomsRes.data;
      }

      // Extract maintenance data
      let maintenanceData = [];
      if (maintenanceRes.data?.data?.requests && Array.isArray(maintenanceRes.data.data.requests)) {
        maintenanceData = maintenanceRes.data.data.requests;
      } else if (maintenanceRes.data?.requests && Array.isArray(maintenanceRes.data.requests)) {
        maintenanceData = maintenanceRes.data.requests;
      } else if (Array.isArray(maintenanceRes.data)) {
        maintenanceData = maintenanceRes.data;
      }

      // Extract payment data
      let paymentData = [];
      if (paymentsRes.data?.data && Array.isArray(paymentsRes.data.data)) {
        paymentData = paymentsRes.data.data;
      } else if (Array.isArray(paymentsRes.data)) {
        paymentData = paymentsRes.data;
      }

      // Calculate room statistics
      const totalRooms = roomData.length;
      const availableRooms = roomData.filter(room => !room.isFull && room.isActive).length;
      const occupiedRooms = roomData.filter(room => room.isFull || room.occupiedBeds > 0).length;
      const maintenanceRooms = roomData.filter(room => !room.isActive).length;

      // Calculate maintenance statistics
      const totalMaintenance = maintenanceData.length;
      const completedMaintenance = maintenanceData.filter(req => req.status === 'completed').length;
      const pendingMaintenance = maintenanceData.filter(req => req.status === 'pending').length;
      const inProgressMaintenance = maintenanceData.filter(req => req.status === 'in_progress').length;

      // Calculate payment statistics
      const totalPayments = paymentData.length;
      const completedPayments = paymentData.filter(payment => payment.status === 'completed').length;
      const pendingPayments = paymentData.filter(payment => payment.status === 'pending').length;
      const overduePayments = paymentData.filter(payment => payment.isOverdue).length;

      // Calculate performance metrics
      const completionRate = totalMaintenance > 0 ? Math.round((completedMaintenance / totalMaintenance) * 100) : 0;
      const paymentCollectionRate = totalPayments > 0 ? Math.round((completedPayments / totalPayments) * 100) : 0;

      // Get unique students from rooms
      const uniqueStudents = new Set();
      roomData.forEach(room => {
        if (room.occupiedBeds > 0) {
          // Assuming each occupied bed represents a student
          for (let i = 0; i < room.occupiedBeds; i++) {
            uniqueStudents.add(`${room._id}-${i}`);
          }
        }
      });

      setReports({
        tasks: {
          completed: completedMaintenance + completedPayments,
          pending: pendingMaintenance + pendingPayments,
          total: totalMaintenance + totalPayments
        },
        maintenance: {
          completed: completedMaintenance,
          pending: pendingMaintenance,
          inProgress: inProgressMaintenance,
          total: totalMaintenance
        },
        rooms: {
          total: totalRooms,
          available: availableRooms,
          occupied: occupiedRooms,
          maintenance: maintenanceRooms
        },
        payments: {
          total: totalPayments,
          completed: completedPayments,
          pending: pendingPayments,
          overdue: overduePayments,
          collectionRate: paymentCollectionRate
        },
        students: {
          managed: uniqueStudents.size,
          active: uniqueStudents.size
        },
        performance: {
          rating: completionRate > 80 ? 4.5 : completionRate > 60 ? 4.0 : completionRate > 40 ? 3.5 : 3.0,
          completionRate: completionRate
        }
      });

      // Generate recent activities from real data
      const activities = [];
      
      // Add recent maintenance activities
      maintenanceData.slice(0, 5).forEach(req => {
        activities.push({
          type: 'maintenance',
          title: `Maintenance: ${req.title}`,
          description: `${req.category} - Room ${req.room?.roomNumber || 'N/A'}`,
          status: req.status,
          date: req.updatedAt || req.createdAt
        });
      });

      // Add recent payment activities
      paymentData.slice(0, 5).forEach(payment => {
        activities.push({
          type: 'payment',
          title: `Payment Collection`,
          description: `${payment.student?.name} - ${payment.month} ${payment.year}`,
          status: payment.status,
          date: payment.updatedAt || payment.createdAt
        });
      });

      // Sort activities by date and take latest 10
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivities(activities.slice(0, 10));

    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type) => {
    try {
      const response = await api.get(
        `staff/reports/export/${type}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `staff-${type}-report-${new Date().toISOString().split("T")[0]}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${type} report exported successfully`);
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "task":
        return <FileText className="w-5 h-5" />;
      case "maintenance":
        return <Wrench className="w-5 h-5" />;
      case "payment":
        return <TrendingUp className="w-5 h-5" />;
      case "student":
        return <Users className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "overdue":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-blue-50 text-blue-700 border-blue-100";
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
              Staff <span className={gradientText}>Reports</span>
            </h1>
            <p className="text-slate-500 text-lg">
              View your performance and activity reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchReports}
              disabled={loading}
              className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-blue-600"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* --- DATE RANGE FILTER --- */}
        <div
          className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur text-sm font-medium shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur text-sm font-medium shadow-sm"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => exportReport("tasks")}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 text-sm font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Tasks
              </button>
              <button
                onClick={() => exportReport("maintenance")}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2.5 rounded-xl hover:from-emerald-600 hover:to-green-600 text-sm font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Maintenance
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* --- PERFORMANCE OVERVIEW --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Task Completion Rate"
                value={`${reports.performance.completionRate}%`}
                icon={BarChart3}
                color="blue"
              />
              <StatCard
                title="Performance Rating"
                value={reports.performance.rating}
                subtitle="out of 5.0"
                icon={Star}
                color="yellow"
              />
              <StatCard
                title="Students Managed"
                value={reports.students.managed}
                subtitle={`${reports.students.active} active`}
                icon={Users}
                color="purple"
              />
              <StatCard
                title="Payment Collection"
                value={`${reports.payments?.collectionRate || 0}%`}
                subtitle={`${reports.payments?.completed || 0} collected`}
                icon={TrendingUp}
                color="green"
              />
            </div>

            {/* --- DETAILED STATISTICS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Room Statistics */}
              <div
                className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Room Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Rooms</span>
                    <span className="font-bold text-blue-600">
                      {reports.rooms?.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Available Rooms</span>
                    <span className="font-bold text-emerald-600">
                      {reports.rooms?.available || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Occupied Rooms</span>
                    <span className="font-bold text-blue-600">
                      {reports.rooms?.occupied || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Under Maintenance</span>
                    <span className="font-bold text-amber-600">
                      {reports.rooms?.maintenance || 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${reports.rooms?.total > 0 ? (reports.rooms.occupied / reports.rooms.total) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Maintenance Statistics */}
              <div
                className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-600" />
                  Maintenance Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Completed Requests</span>
                    <span className="font-bold text-emerald-600">
                      {reports.maintenance.completed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">In Progress</span>
                    <span className="font-bold text-blue-600">
                      {reports.maintenance.inProgress || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Pending Requests</span>
                    <span className="font-bold text-amber-600">
                      {reports.maintenance.pending}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Requests</span>
                    <span className="font-bold text-blue-600">
                      {reports.maintenance.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${reports.maintenance.total > 0 ? (reports.maintenance.completed / reports.maintenance.total) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Payment Statistics */}
              <div
                className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Payment Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Collected Payments</span>
                    <span className="font-bold text-emerald-600">
                      {reports.payments?.completed || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Pending Payments</span>
                    <span className="font-bold text-amber-600">
                      {reports.payments?.pending || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Overdue Payments</span>
                    <span className="font-bold text-red-600">
                      {reports.payments?.overdue || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Payments</span>
                    <span className="font-bold text-blue-600">
                      {reports.payments?.total || 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${reports.payments?.collectionRate || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- RECENT ACTIVITIES --- */}
            <div
              className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Recent Activities
              </h3>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/50 backdrop-blur rounded-xl border border-white/50 hover:bg-white/70 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {activity.title || "Activity"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {activity.description || "No description"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {activity.date
                            ? new Date(activity.date).toLocaleDateString()
                            : "Today"}
                        </p>
                        <span
                          className={`px-3 py-1.5 text-xs font-bold rounded-full ${getActivityColor(activity.status)} border`}
                        >
                          {activity.status || "completed"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No recent activities found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
