import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../../../app/slices/expenseSlice";
import { fetchOwnerHostels } from "../../../app/slices/hostelSlice";
import { formatPrice } from "../../../utils/priceFormatter";
import Loader from "../../common/Loader";
import Modal from "../../common/Modal";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

// Lucide Icons
import {
  Wallet,
  TrendingDown,
  ArrowUpRight,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  PieChart,
  Calendar,
  Building,
  CreditCard,
  X,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react";

// Register Chart.js Components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const Expenses = () => {
  const dispatch = useDispatch();
  const { expenses, summary, categoryBreakdown, isLoading, error } =
    useSelector((state) => state.expense);
  const { ownerHostels } = useSelector((state) => state.hostel);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    category: "all",
    hostelId: "all",
    startDate: "",
    endDate: "",
  });
  const [formData, setFormData] = useState({
    hostelId: "",
    category: "maintenance",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    vendor: { name: "", contact: "", email: "" },
    isRecurring: false,
    recurringFrequency: "monthly",
  });

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  const StatCard = ({ title, value, icon: Icon, color = "blue", isGradient = false }) => {
    const gradients = {
      blue: "from-blue-500 to-cyan-500",
      green: "from-emerald-500 to-green-400",
      yellow: "from-amber-500 to-orange-400",
      purple: "from-purple-500 to-pink-500",
      orange: "from-orange-500 to-red-400",
      red: "from-red-500 to-pink-400",
    };

    return (
      <div
        className={`${isGradient ? `bg-gradient-to-br ${gradients[color]} text-white` : glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-xs font-bold ${isGradient ? 'text-white/80' : 'text-slate-400'} uppercase tracking-widest mb-2`}>
              {title}
            </p>
            <h3 className={`text-3xl font-extrabold ${isGradient ? 'text-white' : 'text-slate-800'}`}>{value}</h3>
          </div>
          <div
            className={`p-3 rounded-2xl ${isGradient ? 'bg-white/20' : `bg-gradient-to-br ${gradients[color]}`} ${isGradient ? 'text-white' : 'text-white'} shadow-lg flex-shrink-0`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className={`w-full ${isGradient ? 'bg-white/20' : 'bg-slate-100'} h-1.5 rounded-full mt-4 overflow-hidden`}>
          <div
            className={`h-full ${isGradient ? 'bg-white/40' : `bg-gradient-to-r ${gradients[color]}`} w-1/2 rounded-full`}
          ></div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    dispatch(fetchOwnerHostels());
    fetchExpensesData();
  }, [dispatch]);

  useEffect(() => {
    fetchExpensesData();
  }, [filter]);

  const fetchExpensesData = () => {
    const params = {};
    if (filter.category !== "all") params.category = filter.category;
    if (filter.hostelId !== "all") params.hostelId = filter.hostelId;
    if (filter.startDate) params.startDate = filter.startDate;
    if (filter.endDate) params.endDate = filter.endDate;
    dispatch(fetchExpenses(params));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await dispatch(
          updateExpense({ expenseId: editingExpense._id, data: formData }),
        ).unwrap();
      } else {
        await dispatch(createExpense(formData)).unwrap();
      }
      setShowModal(false);
      resetForm();
      fetchExpensesData();
    } catch (error) {
      alert(error);
    }
  };

  const resetForm = () => {
    setFormData({
      hostelId: "",
      category: "maintenance",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "cash",
      vendor: { name: "", contact: "", email: "" },
      isRecurring: false,
      recurringFrequency: "monthly",
    });
    setEditingExpense(null);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      ...expense,
      date: new Date(expense.date).toISOString().split("T")[0],
      hostelId: expense.hostel._id,
      vendor: expense.vendor || { name: "", contact: "", email: "" },
    });
    setShowModal(true);
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      await dispatch(deleteExpense(expenseId));
      fetchExpensesData();
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      !searchTerm ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Chart Data Preparation
  const chartData = {
    labels: categoryBreakdown.map((c) => c._id.replace("_", " ")),
    datasets: [
      {
        label: "Amount",
        data: categoryBreakdown.map((c) => c.totalAmount),
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)", // red
          "rgba(59, 130, 246, 0.8)", // blue
          "rgba(16, 185, 129, 0.8)", // emerald
          "rgba(245, 158, 11, 0.8)", // amber
          "rgba(139, 92, 246, 0.8)", // violet
          "rgba(236, 72, 153, 0.8)", // pink
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  if (isLoading && expenses.length === 0) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />
      
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Expense <span className={gradientText}>Management</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Track your spending and analyze cash flow
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchExpensesData}
              disabled={isLoading}
              className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-blue-600"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </div>
        </div>

        {/* --- ERROR MESSAGE --- */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-4 flex items-center gap-3">
            <div className="text-red-500">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-red-800">{error}</span>
          </div>
        )}

        {/* --- SUMMARY CARDS --- */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Expense */}
            <StatCard
              title="Total Expenses"
              value={formatPrice(summary.totalAmount)}
              icon={Wallet}
              color="red"
              isGradient={true}
            />

            {/* Records */}
            <StatCard
              title="Total Records"
              value={summary.totalExpenses}
              icon={Filter}
              color="blue"
            />

            {/* Average */}
            <StatCard
              title="Avg. Expense"
              value={formatPrice(
                summary.totalExpenses > 0
                  ? Math.round(summary.totalAmount / summary.totalExpenses)
                  : 0,
              )}
              icon={DollarSign}
              color="green"
            />
          </div>
        )}

        {/* --- CHARTS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doughnut Chart */}
          <div className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 lg:col-span-1 flex flex-col items-center`}>
            <h3 className="text-xl font-bold text-slate-900 mb-6 w-full flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Breakdown by Category
            </h3>
            <div className="w-full max-w-[250px] relative">
              <Doughnut
                data={chartData}
                options={{
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { usePointStyle: true, boxWidth: 8 },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Category Detail Cards (Visual Bars) */}
          <div className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 lg:col-span-2`}>
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Category Analytics
            </h3>
            <div className="space-y-4">
              {categoryBreakdown.map((category, idx) => {
                const maxVal = Math.max(
                  ...categoryBreakdown.map((c) => c.totalAmount),
                );
                const percentage = (category.totalAmount / maxVal) * 100;

                // Mapping colors
                const colors = [
                  "bg-rose-500",
                  "bg-blue-500",
                  "bg-emerald-500",
                  "bg-amber-500",
                  "bg-violet-500",
                  "bg-pink-500",
                ];
                const colorClass = colors[idx % colors.length];

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-700 capitalize">
                        {category._id.replace("_", " ")}
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatPrice(category.totalAmount)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full ${colorClass} transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- FILTERS TOOLBAR --- */}
        <div className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center">
                <Filter className="w-4 h-4" />
              </div>
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="pl-10 pr-10 w-full border border-slate-200 rounded-xl py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur font-medium appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="maintenance">Maintenance</option>
                <option value="utilities">Utilities</option>
                <option value="staff_salary">Staff Salary</option>
                <option value="supplies">Supplies</option>
                <option value="marketing">Marketing</option>
                <option value="insurance">Insurance</option>
                <option value="rent">Rent</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute right-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center pointer-events-none">
                <Filter className="w-4 h-4" />
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <select
                value={filter.hostelId}
                onChange={(e) => setFilter({ ...filter, hostelId: e.target.value })}
                className="pl-10 pr-10 w-full border border-slate-200 rounded-xl py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur font-medium appearance-none cursor-pointer"
              >
                <option value="all">All Hostels</option>
                {ownerHostels.map((hostel) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center pointer-events-none">
                <Filter className="w-4 h-4" />
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) =>
                  setFilter({ ...filter, startDate: e.target.value })
                }
                className="pl-10 w-full border border-slate-200 rounded-xl py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur font-medium"
              />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                className="pl-10 w-full border border-slate-200 rounded-xl py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur font-medium"
              />
            </div>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className={`${glassCard} overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/50 backdrop-blur">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Hostel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="hover:bg-white/50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-white/50 backdrop-blur flex items-center justify-center text-slate-500 border border-white/50">
                            <Wallet className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">
                            {expense.description}
                          </div>
                          {expense.vendor?.name && (
                            <div className="text-xs text-slate-500">
                              Vendor: {expense.vendor.name}
                            </div>
                          )}
                          {expense.isRecurring && (
                            <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-800 mt-1 border border-blue-100">
                              🔄 Recurring
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-50 text-slate-700 capitalize border border-slate-100">
                        {expense.category.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-400" />
                        {expense.hostel?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      -{formatPrice(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 rounded-xl hover:bg-white/70 text-blue-600 transition-colors mr-3"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="p-2 rounded-xl hover:bg-white/70 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredExpenses.length === 0 && (
            <div className="text-center py-12 bg-white/50 backdrop-blur border-b border-white/50">
              <div className="inline-block p-4 rounded-full bg-white/70 backdrop-blur shadow-sm mb-4 text-slate-400">
                <PieChart className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                No Expenses Found
              </h3>
              <p className="text-slate-500">
                {searchTerm ||
                filter.category !== "all" ||
                filter.hostelId !== "all"
                  ? "No expenses match your current filters."
                  : "Start by adding your first expense."}
              </p>
            </div>
          )}
        </div>

        {/* --- ADD/EDIT MODAL --- */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingExpense ? "Edit Expense" : "Add New Expense"}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Hostel
                </label>
                <select
                  value={formData.hostelId}
                  onChange={(e) =>
                    setFormData({ ...formData, hostelId: e.target.value })
                  }
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur font-medium"
                  required
                >
                  <option value="">Select Hostel</option>
                  {ownerHostels.map((hostel) => (
                    <option key={hostel._id} value={hostel._id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur font-medium"
                  required
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="utilities">Utilities</option>
                  <option value="staff_salary">Staff Salary</option>
                  <option value="supplies">Supplies</option>
                  <option value="marketing">Marketing</option>
                  <option value="insurance">Insurance</option>
                  <option value="rent">Rent</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur font-medium"
                rows="3"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur font-medium"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Vendor Name
                </label>
                <input
                  type="text"
                  value={formData.vendor.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vendor: { ...formData.vendor, name: e.target.value },
                    })
                  }
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur font-medium"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) =>
                    setFormData({ ...formData, isRecurring: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-900">
                  This is a recurring expense
                </span>
              </label>
              {formData.isRecurring && (
                <select
                  value={formData.recurringFrequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recurringFrequency: e.target.value,
                    })
                  }
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur font-medium"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-5 py-2.5 text-slate-600 bg-white/70 backdrop-blur border border-white/50 rounded-xl hover:bg-white/90 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
              >
                {editingExpense ? "Update" : "Create"} Expense
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Expenses;