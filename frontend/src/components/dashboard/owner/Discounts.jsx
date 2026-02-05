import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from "../../../app/slices/discountSlice";
import { fetchOwnerHostels } from "../../../app/slices/hostelSlice";
import { formatPrice } from "../../../utils/priceFormatter";
import Loader from "../../common/Loader";
import Modal from "../../common/Modal";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Wrench,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  PieChart,
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  Star,
  Wifi,
  Coffee,
  Utensils,
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

const Discounts = () => {
  const dispatch = useDispatch();
  const { discounts, isLoading, error } = useSelector(
    (state) => state.discount,
  );
  const { ownerHostels } = useSelector((state) => state.hostel);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hostelFilter, setHostelFilter] = useState("all");
  const [formData, setFormData] = useState({
    hostelId: "",
    name: "",
    code: "",
    type: "percentage",
    value: "",
    maxDiscount: "",
    minAmount: "",
    applicableOn: "all",
    validTill: "",
    usageLimit: "",
    description: "",
    terms: "",
  });

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
            className={`p-3 rounded-2xl bg-gradient-to-br ${gradients[color]} text-white shadow-lg flex-shrink-0`}
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
    dispatch(fetchOwnerHostels());
    fetchDiscountsData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDiscountsData, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const fetchDiscountsData = () => {
    const params = {};
    if (hostelFilter !== "all") params.hostelId = hostelFilter;
    if (statusFilter !== "all") params.isActive = statusFilter === "active";
    dispatch(fetchDiscounts(params));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        value: Number(formData.value),
        maxDiscount: formData.maxDiscount
          ? Number(formData.maxDiscount)
          : undefined,
        minAmount: formData.minAmount ? Number(formData.minAmount) : 0,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      };

      if (editingDiscount) {
        await dispatch(
          updateDiscount({ discountId: editingDiscount._id, data }),
        ).unwrap();
      } else {
        await dispatch(createDiscount(data)).unwrap();
      }
      setShowModal(false);
      resetForm();
      fetchDiscountsData();
    } catch (error) {
      console.error("Failed to save discount:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      hostelId: "",
      name: "",
      code: "",
      type: "percentage",
      value: "",
      maxDiscount: "",
      minAmount: "",
      applicableOn: "all",
      validTill: "",
      usageLimit: "",
      description: "",
      terms: "",
    });
    setEditingDiscount(null);
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      ...discount,
      hostelId: discount.hostel._id,
      validTill: new Date(discount.validTill).toISOString().split("T")[0],
      maxDiscount: discount.maxDiscount || "",
      usageLimit: discount.usageLimit || "",
      terms: discount.terms || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (discountId) => {
    if (window.confirm("Are you sure you want to delete this discount?")) {
      await dispatch(deleteDiscount(discountId));
      fetchDiscountsData();
    }
  };

  const toggleStatus = async (discount) => {
    await dispatch(
      updateDiscount({
        discountId: discount._id,
        data: { isActive: !discount.isActive },
      }),
    );
    fetchDiscountsData();
  };

  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch =
      !searchTerm ||
      discount.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatistics = () => {
    return {
      total: discounts.length,
      active: discounts.filter((d) => d.isActive).length,
      inactive: discounts.filter((d) => !d.isActive).length,
      expired: discounts.filter((d) => new Date(d.validTill) < new Date())
        .length,
      totalUsage: discounts.reduce((sum, d) => sum + (d.usedCount || 0), 0),
    };
  };

  const stats = getStatistics();

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Discount <span className={gradientText}>Management</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Create and manage discount codes for students
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDiscountsData}
              disabled={isLoading}
              className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-blue-600"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Add Discount
            </button>
          </div>
        </div>

        {/* --- ERROR MESSAGE --- */}
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

        {/* --- STATISTICS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Discounts"
            value={stats.total}
            icon={PieChart}
            color="blue"
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Inactive"
            value={stats.inactive}
            icon={X}
            color="red"
          />
          <StatCard
            title="Expired"
            value={stats.expired}
            icon={AlertTriangle}
            color="yellow"
          />
          <StatCard
            title="Total Usage"
            value={stats.totalUsage}
            icon={Star}
            color="purple"
          />
        </div>

        {/* --- FILTERS --- */}
        <div
          className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center">
                <Filter className="w-4 h-4" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-10 w-full border border-slate-200 rounded-xl py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur font-medium appearance-none cursor-pointer"
              >
                <option value="all">All Status ({stats.total})</option>
                <option value="active">Active ({stats.active})</option>
                <option value="inactive">Inactive ({stats.inactive})</option>
              </select>
              <div className="absolute right-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center pointer-events-none">
                <Filter className="w-4 h-4" />
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <select
                value={hostelFilter}
                onChange={(e) => setHostelFilter(e.target.value)}
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
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search discounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>

            <button
              onClick={fetchDiscountsData}
              className="px-4 py-2.5 bg-white/70 backdrop-blur border border-white/50 rounded-xl hover:bg-white/90 font-medium transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* --- DISCOUNTS TABLE --- */}
        <div
          className={`${glassCard} overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/50 backdrop-blur">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Hostel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Valid Till
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredDiscounts.map((discount) => {
                  const isExpired = new Date(discount.validTill) < new Date();
                  return (
                    <tr
                      key={discount._id}
                      className={`hover:bg-white/50 transition-colors ${isExpired ? "opacity-60" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {discount.code}
                        </div>
                        {isExpired && (
                          <div className="text-xs text-red-600">Expired</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {discount.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {discount.hostel?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 capitalize border border-blue-100">
                          {discount.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {discount.type === "percentage"
                          ? `${discount.value}%`
                          : formatPrice(discount.value)}
                        {discount.maxDiscount && (
                          <div className="text-xs text-slate-500">
                            Max: {formatPrice(discount.maxDiscount)}
                          </div>
                        )}
                        {discount.minAmount > 0 && (
                          <div className="text-xs text-slate-500">
                            Min: {formatPrice(discount.minAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        <div className="flex items-center">
                          <span className="font-medium text-slate-700">
                            {discount.usedCount || 0}
                          </span>
                          <span className="text-slate-400">/</span>
                          <span className="text-slate-400">
                            {discount.usageLimit || "∞"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(discount.validTill).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleStatus(discount)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                            discount.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}
                        >
                          {discount.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="text-blue-600 hover:text-blue-900 font-medium transition-colors mr-3"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(discount._id)}
                          className="text-red-600 hover:text-red-900 font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredDiscounts.length === 0 && (
          <div className={`${glassCard} p-12 text-center`}>
            <PieChart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Discounts Found
            </h3>
            <p className="text-slate-500">
              {searchTerm || statusFilter !== "all" || hostelFilter !== "all"
                ? "No discounts match your search criteria."
                : "Create your first discount code to attract students"}
            </p>
          </div>
        )}

        {/* --- ADD/EDIT MODAL --- */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingDiscount ? "Edit Discount" : "Create New Discount"}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Hostel
                </label>
                <select
                  value={formData.hostelId}
                  onChange={(e) =>
                    setFormData({ ...formData, hostelId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
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
                  Discount Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  placeholder="e.g., WELCOME10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Discount Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Valid Till
                </label>
                <input
                  type="date"
                  value={formData.validTill}
                  onChange={(e) =>
                    setFormData({ ...formData, validTill: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Value {formData.type === "percentage" ? "(%)" : "(₹)"}
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  required
                />
              </div>
              {formData.type === "percentage" && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Max Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minAmount: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Applicable On
                </label>
                <select
                  value={formData.applicableOn}
                  onChange={(e) =>
                    setFormData({ ...formData, applicableOn: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                  <option value="all">All Payments</option>
                  <option value="advance">Advance Payment</option>
                  <option value="monthly">Monthly Payment</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Usage Limit
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  rows="3"
                  placeholder="Optional terms and conditions"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
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
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                {editingDiscount ? "Update" : "Create"} Discount
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Discounts;
