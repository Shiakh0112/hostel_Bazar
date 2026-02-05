import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Bar,
  BarChart,
} from "recharts";
import {
  Building,
  DollarSign,
  BedDouble,
  TrendingUp,
  RefreshCw,
  FileText,
  Wrench,
  MapPin,
  Star,
  CreditCard,
} from "lucide-react";
import { fetchOwnerDashboard } from "../../../app/slices/reportSlice";
import { formatPrice } from "../../../utils/priceFormatter";
import Loader from "../../common/Loader";

// --- ANIMATED BACKGROUND COMPONENT ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50">
        <p className="text-xs text-gray-500 font-bold uppercase mb-2">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 mb-1"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm font-medium text-slate-600">
                {entry.name || entry.dataKey}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-800">
              {formatPrice(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- COLORS ---
const COLORS = {
  primary: "#3b82f6", // blue-500
  success: "#10b981", // green-500
  warning: "#f59e0b", // amber-500
  bg: "#f1f5f9",
};

const Overview = () => {
  const dispatch = useDispatch();
  const { dashboardData, loading } = useSelector((state) => state.report);
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");

  useEffect(() => {
    dispatch(fetchOwnerDashboard());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading Dashboard..." />
      </div>
    );
  }

  const overview = dashboardData?.overview || {};
  const maintenance = dashboardData?.maintenance || [];
  const hostelPerformance = dashboardData?.hostelPerformance || [];

  // --- UPDATED LOGIC FOR REVENUE DATA ---
  const rawData = dashboardData?.monthlyRevenue || [];

  // Process the data to ensure we always have at least 2 points for line display
  const processRevenueData = () => {
    if (rawData.length === 0) {
      // Default demo data
      return [
        { name: 'Jan/2024', revenue: 0, advancePayments: 0 },
        { name: 'Feb/2024', revenue: 12000, advancePayments: 2000 },
        { name: 'Mar/2024', revenue: 27000, advancePayments: 5000 },
        { name: 'Apr/2024', revenue: 45000, advancePayments: 9000 },
        { name: 'May/2024', revenue: 70000, advancePayments: 14000 },
        { name: 'Jun/2024', revenue: 98000, advancePayments: 20000 },
      ];
    }

    // Sort data chronologically
    const sortedData = [...rawData].sort((a, b) => {
      const yearA = a._id.year;
      const monthA = a._id.month;
      const yearB = b._id.year;
      const monthB = b._id.month;
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    // Calculate cumulative revenue
    let cumulativeSum = 0;
    const processedData = sortedData.map((item) => {
      cumulativeSum += item.revenue || 0;
      return {
        name: `${item._id.month}/${item._id.year}`,
        revenue: cumulativeSum,
        advancePayments: item.advancePayments || 0,
      };
    });

    // If only one data point, add a starting point at 0
    if (processedData.length === 1) {
      return [
        { name: 'Start', revenue: 0, advancePayments: 0 },
        processedData[0]
      ];
    }

    return processedData;
  };

  const revenueData = processRevenueData();

  const occupancyRate =
    overview.totalBeds > 0
      ? Math.round((overview.occupiedBeds / overview.totalBeds) * 100)
      : 0;

  const occupancyData = [
    {
      name: "Occupied",
      value: overview.occupiedBeds || 0,
      color: COLORS.success,
    },
    {
      name: "Available",
      value: (overview.totalBeds || 0) - (overview.occupiedBeds || 0),
      color: "#e2e8f0", // slate-200
    },
  ];

  // --- HELPER CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";
  const subTextClass =
    "text-xs text-slate-400 font-bold uppercase tracking-wider";

  // --- SUB-COMPONENTS UPGRADED ---

  const StatCard = ({
    title,
    value,
    subText,
    icon: Icon,
    color = "blue",
    trend,
  }) => {
    const gradients = {
      blue: "from-blue-500 to-cyan-500",
      green: "from-emerald-500 to-green-400",
      purple: "from-purple-500 to-pink-500",
      orange: "from-orange-500 to-amber-400",
    };

    return (
      <div
        className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className={subTextClass}>{title}</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">
              {value}
            </h3>
            {trend && (
              <span className="text-xs font-bold text-emerald-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {trend}
              </span>
            )}
            {subText && (
              <p className="text-xs text-slate-400 mt-1">{subText}</p>
            )}
          </div>
          <div
            className={`p-3 rounded-2xl bg-gradient-to-br ${gradients[color]} text-white shadow-lg shadow-blue-500/20`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {/* Mini Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradients[color]} w-2/3 rounded-full`}
          ></div>
        </div>
      </div>
    );
  };

  const ChartCard = ({ title, action, children }) => (
    <div className={`${glassCard} p-6 md:p-8`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );

  const ListCard = ({ title, data }) => (
    <div className={`${glassCard} p-6 md:p-8`}>
      <h3 className="text-xl font-bold text-slate-800 mb-6">{title}</h3>
      <div className="space-y-3">
        {data.length > 0 ? (
          data.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/40 hover:bg-white hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm">{item._id}</p>
                  <p className="text-xs text-slate-400">ID: #123{idx}</p>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-bold uppercase rounded-lg bg-orange-100 text-orange-700">
                {item.count} Open
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">
              No pending requests
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const PerformanceCard = ({ data }) => (
    <div className={`${glassCard} p-6 md:p-8`}>
      <h3 className="text-xl font-bold text-slate-800 mb-6">Top Hostels</h3>
      <div className="space-y-4">
        {data.length > 0 ? (
          data.slice(0, 3).map((h, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-slate-800">{h.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {h.occupancyRate}% Occupied
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">
                    {formatPrice(h.revenue)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-400 justify-end">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{" "}
                    {h.rating || "4.5"}
                  </div>
                </div>
              </div>
              {/* Mini Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${h.occupancyRate}%` }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No performance data</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Owner <span className={gradientText}>Dashboard</span>
            </h1>
            <p className="text-slate-500 text-lg mt-2">
              Overview of your business performance
            </p>
          </div>
          <button
            onClick={() => dispatch(fetchOwnerDashboard())}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all font-bold shadow-sm hover:shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh Data
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Hostels"
            value={overview.totalHostels || 0}
            icon={Building}
            color="blue"
          />
          <StatCard
            title="Available Beds"
            value={overview.availableBeds || 0}
            subText={`of ${overview.totalBeds || 0}`}
            icon={BedDouble}
            color="green"
          />
          <StatCard
            title="Pending Bookings"
            value={overview.pendingBookings || 0}
            subText={`of ${overview.totalBookings || 0}`}
            icon={FileText}
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={formatPrice(overview.totalRevenue || 0)}
            subText={`${overview.totalPayments || 0} payments`}
            icon={DollarSign}
            color="orange"
          />
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* REVENUE CHART */}
          <ChartCard
            title="Revenue Analytics"
            action={
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            }
          >
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                    <linearGradient
                      id="advanceFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS.success}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.success}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="2 4"
                    vertical={false}
                    stroke="#e2e8f0"
                    strokeOpacity={0.6}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(v) => `₹${v / 1000}k`}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "transparent" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.primary}
                    strokeWidth={4}
                    dot={{ r: 6, fill: COLORS.primary, stroke: "#fff", strokeWidth: 3 }}
                    activeDot={{
                      r: 8,
                      fill: COLORS.primary,
                      stroke: "#fff",
                      strokeWidth: 3,
                      filter: "drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))"
                    }}
                    fill="url(#lineFill)"
                    name="Total Revenue"
                    connectNulls={true}
                    animationDuration={2000}
                    animationEasing="ease-in-out"
                  />
                  <Line
                    type="monotone"
                    dataKey="advancePayments"
                    stroke={COLORS.success}
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    dot={{ r: 4, fill: COLORS.success, stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{
                      r: 6,
                      fill: COLORS.success,
                      stroke: "#fff",
                      strokeWidth: 2,
                      filter: "drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))"
                    }}
                    name="Advance Payments"
                    connectNulls={true}
                    animationDuration={2500}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-blue-500 rounded"></div>
                  <span className="text-xs font-medium text-slate-600">
                    Total Revenue
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-0.5 bg-green-500 rounded"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to right, #10b981 0, #10b981 3px, transparent 3px, transparent 6px)",
                    }}
                  ></div>
                  <span className="text-xs font-medium text-slate-600">
                    Advance Payments
                  </span>
                </div>
              </div>
            </div>
          </ChartCard>

          {/* OCCUPANCY PIE CHART */}
          <ChartCard title="Occupancy Rate">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 h-[320px]">
              <div className="h-[240px] w-full md:w-1/2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-extrabold text-slate-800">
                    {occupancyRate}%
                  </span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">
                    Occupancy
                  </span>
                </div>
              </div>

              {/* Custom Legend / Details */}
              <div className="w-full md:w-1/2 space-y-6">
                <div className="space-y-4">
                  {occupancyData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full ${item.color === COLORS.success ? "bg-emerald-500" : "bg-slate-200"}`}
                        ></div>
                        <span className="text-sm font-semibold text-slate-600">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xl font-bold text-slate-800">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ListCard title="Maintenance Requests" data={maintenance} />
          <PerformanceCard data={hostelPerformance} />
        </div>
      </div>
    </div>
  );
};

export default Overview;
