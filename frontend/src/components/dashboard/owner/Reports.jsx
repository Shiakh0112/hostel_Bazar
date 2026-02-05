import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRevenueReport,
  fetchOccupancyReport,
  fetchMaintenanceReport,
  fetchStudentReport,
} from "../../../app/slices/reportSlice";
import { fetchOwnerHostels } from "../../../app/slices/hostelSlice";
import { formatPrice } from "../../../utils/priceFormatter";
import Loader from "../../common/Loader";
import Charts from "./Charts";
import DataExport from "./DataExport";

// Lucide Icons Imports
import {
  Grid,
  TrendingUp,
  Wallet,
  Bed,
  Wrench,
  GraduationCap,
  FileText,
  ChevronDown,
  RefreshCw,
  UserCheck,
  CreditCard,
  Building2,
  AlertTriangle,
  PieChart,
  Users,
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

const Reports = () => {
  const dispatch = useDispatch();
  const {
    revenueReport,
    occupancyReport,
    maintenanceReport,
    studentReport,
    loading,
    error,
  } = useSelector((state) => state.report);
  const { ownerHostels } = useSelector((state) => state.hostel);
  const [activeTab, setActiveTab] = useState("overview");
  const [hostelFilter, setHostelFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  useEffect(() => {
    dispatch(fetchOwnerHostels());
    fetchAllReports();
    const interval = setInterval(fetchAllReports, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const fetchAllReports = () => {
    const params = {};
    if (hostelFilter !== "all") params.hostelId = hostelFilter;

    dispatch(fetchRevenueReport(params));
    dispatch(fetchOccupancyReport(params));
    dispatch(fetchMaintenanceReport(params));
    dispatch(fetchStudentReport(params));
  };

  const handleApplyDateFilter = () => {
    const params = { ...dateRange };
    if (hostelFilter !== "all") params.hostelId = hostelFilter;

    dispatch(fetchRevenueReport(params));
    dispatch(fetchOccupancyReport(params));
    dispatch(fetchMaintenanceReport(params));
    dispatch(fetchStudentReport(params));
  };

  const handleResetFilter = () => {
    setDateRange({
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    });
    setHostelFilter("all");
    fetchAllReports();
  };

  const getOverviewStats = () => {
    const totalRevenue =
      revenueReport?.revenueData?.reduce(
        (sum, item) => sum + item.totalRevenue,
        0,
      ) || 0;
    const totalBeds = Array.isArray(occupancyReport)
      ? occupancyReport.reduce(
          (sum, hostel) => sum + (hostel.totalBeds || 0),
          0,
        )
      : 0;
    const occupiedBeds = Array.isArray(occupancyReport)
      ? occupancyReport.reduce(
          (sum, hostel) => sum + (hostel.occupiedBeds || 0),
          0,
        )
      : 0;
    const occupancyRate =
      totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0;

    return {
      totalRevenue,
      totalBeds,
      occupiedBeds,
      occupancyRate,
      totalStudents: studentReport?.totalStudents || 0,
      activeStudents: studentReport?.activeStudents || 0,
      maintenanceRequests: maintenanceReport?.totalRequests || 0,
      completionRate: maintenanceReport?.completionRate || 0,
    };
  };

  const stats = getOverviewStats();

  // Icon Component Helper
  const Icon = ({ children, className }) => (
    <span className={className}>{children}</span>
  );

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Reports & <span className={gradientText}>Analytics</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Track your business performance and deep insights
            </p>
          </div>

          {/* Filters Toolbar */}
          <div
            className={`${glassCard} p-4 flex flex-wrap items-center gap-3 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
          >
            {/* Hostel Select */}
            <div className="relative">
              <select
                value={hostelFilter}
                onChange={(e) => setHostelFilter(e.target.value)}
                className="appearance-none bg-white/80 backdrop-blur border border-slate-200 text-slate-700 py-2.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer font-medium"
              >
                <option value="all">All Hostels</option>
                {ownerHostels.map((hostel) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Date Inputs */}
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="bg-white/80 backdrop-blur border border-slate-200 text-slate-700 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="bg-white/80 backdrop-blur border border-slate-200 text-slate-700 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />

            {/* Action Buttons */}
            <button
              onClick={handleApplyDateFilter}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              Apply
            </button>
            <button
              onClick={handleResetFilter}
              className="bg-white/70 backdrop-blur border border-white/50 hover:bg-white/90 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              Reset
            </button>
            <button
              onClick={fetchAllReports}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5"
            >
              <RefreshCw
                className={`w-4 h-4 inline-block mr-1 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className={`${glassCard} p-6 flex items-center gap-3 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
          >
            <div className="text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-red-800">{error}</span>
          </div>
        )}

        {/* Main Container */}
        <div
          className={`${glassCard} overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          {/* Tabs with Lucide Icons */}
          <div className="border-b border-slate-100">
            <nav className="flex space-x-8 px-6 overflow-x-auto" id="tabNav">
              {[
                {
                  id: "overview",
                  label: "Overview",
                  icon: <Grid className="w-4 h-4" />,
                },
                {
                  id: "charts",
                  label: "Visual Charts",
                  icon: <TrendingUp className="w-4 h-4" />,
                },
                {
                  id: "revenue",
                  label: "Revenue",
                  icon: <Wallet className="w-4 h-4" />,
                },
                {
                  id: "occupancy",
                  label: "Occupancy",
                  icon: <Bed className="w-4 h-4" />,
                },
                {
                  id: "maintenance",
                  label: "Maintenance",
                  icon: <Wrench className="w-4 h-4" />,
                },
                {
                  id: "students",
                  label: "Students",
                  icon: <GraduationCap className="w-4 h-4" />,
                },
                {
                  id: "export",
                  label: "Data Export",
                  icon: <FileText className="w-4 h-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon
                    className={
                      activeTab === tab.id ? "text-blue-600" : "text-slate-400"
                    }
                  >
                    {tab.icon}
                  </Icon>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Key Metrics - Gradient Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Total Revenue
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-800">
                          {formatPrice(stats.totalRevenue)}
                        </h3>
                      </div>
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg flex-shrink-0">
                        <Wallet className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-1/2 rounded-full"></div>
                    </div>
                  </div>

                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Occupied Beds
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-800">
                          {stats.occupiedBeds}/{stats.totalBeds}
                        </h3>
                      </div>
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 text-white shadow-lg flex-shrink-0">
                        <Bed className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 w-1/2 rounded-full"></div>
                    </div>
                  </div>

                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Active Students
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-800">
                          {stats.activeStudents}
                        </h3>
                      </div>
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg flex-shrink-0">
                        <UserCheck className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-1/2 rounded-full"></div>
                    </div>
                  </div>

                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Occupancy Rate
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-800">
                          {stats.occupancyRate}%
                        </h3>
                      </div>
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-400 text-white shadow-lg flex-shrink-0">
                        <PieChart className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-red-400 w-1/2 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-700">
                        Maintenance Requests
                      </h4>
                      <Wrench className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                      {stats.maintenanceRequests}
                    </div>
                    <div className="text-xs text-green-600 mt-2">
                      {stats.completionRate}% completion rate
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-700">
                        Payment Methods
                      </h4>
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                      {revenueReport?.paymentTypeBreakdown?.length || 0}
                    </div>
                    <div className="text-xs text-blue-600 mt-2 flex items-center">
                      <CreditCard className="w-3 h-3 mr-1" /> Active
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-700">
                        Total Hostels
                      </h4>
                      <Building2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                      {ownerHostels.length}
                    </div>
                    <div className="text-xs text-purple-600 mt-2 flex items-center">
                      <Building2 className="w-3 h-3 mr-1" /> Properties
                    </div>
                  </div>
                </div>

                {/* Quick Insights */}
                <div
                  className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                >
                  <h3 className="text-lg font-bold mb-4 text-slate-800">
                    Quick Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/50 backdrop-blur p-4 rounded-xl shadow-sm flex items-center gap-3 hover:bg-white/70 transition-all">
                      <div className="p-2 bg-blue-50 rounded-full text-blue-500">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">
                          Revenue Trend
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {revenueReport?.revenueData?.length > 0
                            ? `${revenueReport.revenueData.length} months of data available`
                            : "No revenue data available"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/50 backdrop-blur p-4 rounded-xl shadow-sm flex items-center gap-3 hover:bg-white/70 transition-all">
                      <div className="p-2 bg-orange-50 rounded-full text-orange-500">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">
                          Maintenance Status
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {maintenanceReport?.pendingRequests || 0} pending,{" "}
                          {maintenanceReport?.completedRequests || 0} completed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CHARTS & EXPORT TABS */}
            {activeTab === "charts" && <Charts />}
            {activeTab === "export" && <DataExport />}

            {/* REVENUE TAB */}
            {activeTab === "revenue" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    className={`${glassCard} p-6 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-green-600">
                      {formatPrice(
                        revenueReport?.hostelWiseRevenue?.reduce(
                          (sum, h) => sum + h.totalRevenue,
                          0,
                        ) || 0,
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Total Revenue
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-6 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-blue-600">
                      {revenueReport?.hostelWiseRevenue?.reduce(
                        (sum, h) => sum + h.totalPayments,
                        0,
                      ) || 0}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Total Payments
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-6 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-purple-600">
                      {formatPrice(
                        (revenueReport?.hostelWiseRevenue?.reduce(
                          (sum, h) => sum + h.totalRevenue,
                          0,
                        ) || 0) / (ownerHostels.length || 1),
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Average per Hostel
                    </div>
                  </div>
                </div>

                {/* Payment Type Breakdown */}
                {revenueReport?.paymentTypeBreakdown && (
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <h3 className="text-lg font-bold mb-4 text-slate-800">
                      Payment Type Breakdown
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {revenueReport.paymentTypeBreakdown.map((type, index) => (
                        <div
                          key={index}
                          className="bg-white/50 backdrop-blur p-4 rounded-xl text-center border border-slate-100 hover:bg-white/70 transition-all"
                        >
                          <div className="text-xl font-bold text-slate-800">
                            {formatPrice(type.totalAmount)}
                          </div>
                          <div className="text-sm text-slate-600 capitalize mt-1">
                            {type._id}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {type.count} payments
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hostel-wise Revenue Table */}
                {revenueReport?.hostelWiseRevenue && (
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <h3 className="text-lg font-bold mb-4 text-slate-800">
                      Hostel-wise Revenue
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-white/50 backdrop-blur border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-3">Hostel Name</th>
                            <th className="px-6 py-3">Total Revenue</th>
                            <th className="px-6 py-3">Payments</th>
                            <th className="px-6 py-3 text-right">Avg</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {revenueReport.hostelWiseRevenue.map(
                            (hostel, index) => (
                              <tr
                                key={index}
                                className="hover:bg-white/50 transition-colors"
                              >
                                <td className="px-6 py-4 font-medium text-slate-900">
                                  {hostel.hostelName}
                                </td>
                                <td className="px-6 py-4 text-slate-700">
                                  {formatPrice(hostel.totalRevenue)}
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                  {hostel.totalPayments}
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-slate-800">
                                  {formatPrice(
                                    Math.round(
                                      hostel.totalRevenue /
                                        hostel.totalPayments,
                                    ),
                                  )}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OCCUPANCY TAB */}
            {activeTab === "occupancy" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.totalBeds}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Total Beds
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-green-600">
                      {stats.occupiedBeds}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Occupied Beds
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.totalBeds - stats.occupiedBeds}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Available Beds
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.occupancyRate}%
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Occupancy Rate
                    </div>
                  </div>
                </div>

                {/* Hostel-wise Occupancy List */}
                {Array.isArray(occupancyReport) &&
                  occupancyReport.length > 0 && (
                    <div
                      className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                    >
                      <h3 className="text-lg font-bold mb-4 text-slate-800">
                        Hostel-wise Occupancy
                      </h3>
                      <div className="space-y-4">
                        {occupancyReport.map((hostel, index) => (
                          <div
                            key={index}
                            className="bg-white/50 backdrop-blur p-4 rounded-xl border border-slate-100 hover:bg-white/70 transition-all"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-slate-900">
                                {hostel.hostelName}
                              </span>
                              <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                {hostel.occupiedBeds}/{hostel.totalBeds}
                              </span>
                            </div>
                            <div className="bg-slate-100 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-1000"
                                style={{ width: `${hostel.occupancyRate}%` }}
                              ></div>
                            </div>
                            <div className="text-sm text-slate-600 mt-2 text-right font-medium">
                              {hostel.occupancyRate}% occupied
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* MAINTENANCE TAB */}
            {activeTab === "maintenance" && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div
                    className={`${glassCard} p-4 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-yellow-600">
                      {maintenanceReport?.pendingRequests || 0}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 uppercase font-bold">
                      Pending
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-4 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-blue-600">
                      {maintenanceReport?.assignedRequests || 0}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 uppercase font-bold">
                      Assigned
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-4 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-purple-600">
                      {maintenanceReport?.inProgressRequests || 0}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 uppercase font-bold">
                      In Progress
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-4 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-green-600">
                      {maintenanceReport?.completedRequests || 0}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 uppercase font-bold">
                      Completed
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-4 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-red-600">
                      {formatPrice(maintenanceReport?.totalCost || 0)}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 uppercase font-bold">
                      Total Cost
                    </div>
                  </div>
                </div>

                {/* Category-wise Breakdown */}
                {maintenanceReport?.categoryWise && (
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <h3 className="text-lg font-bold mb-4 text-slate-800">
                      Category-wise Breakdown
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {maintenanceReport.categoryWise.map((category, index) => (
                        <div
                          key={index}
                          className="bg-white/50 backdrop-blur p-4 rounded-xl text-center border border-slate-100 hover:bg-white/70 transition-all"
                        >
                          <div className="text-xl font-bold text-slate-800">
                            {category.count}
                          </div>
                          <div className="text-sm text-slate-600 capitalize mt-1">
                            {category._id}
                          </div>
                          <div className="text-xs text-slate-500 mt-2 font-medium">
                            {formatPrice(category.totalCost)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                <div
                  className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                >
                  <h3 className="text-lg font-bold mb-4 text-slate-800">
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/50 backdrop-blur text-center p-4 rounded-xl hover:bg-white/70 transition-all">
                      <div className="text-2xl font-bold text-blue-600">
                        {maintenanceReport?.averageResponseTime || 0} hrs
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Avg Response Time
                      </div>
                    </div>
                    <div className="bg-white/50 backdrop-blur text-center p-4 rounded-xl hover:bg-white/70 transition-all">
                      <div className="text-2xl font-bold text-green-600">
                        {maintenanceReport?.completionRate || 0}%
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Completion Rate
                      </div>
                    </div>
                    <div className="bg-white/50 backdrop-blur text-center p-4 rounded-xl hover:bg-white/70 transition-all">
                      <div className="text-2xl font-bold text-purple-600">
                        {maintenanceReport?.averageRating || 0}/5
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Avg Rating
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === "students" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div
                    className={`${glassCard} p-6 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-blue-600">
                      {studentReport?.totalStudents || 0}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Total Students
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-6 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-green-600">
                      {studentReport?.activeStudents || 0}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Active Students
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-6 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-yellow-600">
                      {studentReport?.pendingPayments || 0}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Pending Payments
                    </div>
                  </div>
                  <div
                    className={`${glassCard} p-6 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-2xl font-bold text-purple-600">
                      {formatPrice(studentReport?.totalRevenue || 0)}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Total Revenue
                    </div>
                  </div>
                </div>

                {/* Monthly Check-ins */}
                {studentReport?.monthlyCheckIns && (
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <h3 className="text-lg font-bold mb-4 text-slate-800">
                      Monthly Check-ins
                    </h3>
                    <div className="space-y-3">
                      {studentReport.monthlyCheckIns.map((month, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-white/50 backdrop-blur rounded-xl hover:bg-white/70 transition-all"
                        >
                          <span className="text-slate-600">
                            {month._id.month}/{month._id.year}
                          </span>
                          <span className="font-bold text-slate-800">
                            {month.checkIns} students
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
