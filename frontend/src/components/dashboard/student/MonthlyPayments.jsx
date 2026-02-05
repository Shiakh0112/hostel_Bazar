import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudentMonthlyPayments,
  generateMonthlyRents,
} from "../../../app/slices/monthlyPaymentSlice";
import { formatPrice } from "../../../utils/priceFormatter";
import { formatDate } from "../../../utils/formatDate";
import PayNowButton from "../../booking/PayNowButton";
import Loader from "../../common/Loader";
import toast from "react-hot-toast";
import {
  RefreshCw,
  Calendar,
  DollarSign,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  TrendingUp,
  FileText,
  Info,
  ArrowRight,
  Zap,
  Download,
  Search,
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const MonthlyPayments = () => {
  const dispatch = useDispatch();
  const { studentPayments, isLoading, error } = useSelector(
    (state) => state.monthlyPayment,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  useEffect(() => {
    dispatch(fetchStudentMonthlyPayments());
  }, [dispatch]);

  const handleGeneratePayments = async () => {
    setIsGenerating(true);
    try {
      await dispatch(generateMonthlyRents()).unwrap();
      await dispatch(fetchStudentMonthlyPayments());
      toast.success("Monthly payments generated successfully!");
    } catch (err) {
      toast.error(err || "Failed to generate payments");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchStudentMonthlyPayments());
    setRefreshing(false);
    toast.success("Payments refreshed!");
  };

  const handlePaymentSuccess = () => {
    dispatch(fetchStudentMonthlyPayments());
  };

  if (isLoading) return <Loader />;

  const filteredPayments = studentPayments.filter((payment) => {
    if (filter === "all") return true;
    if (filter === "overdue") return payment.isOverdue;
    return payment.status === filter;
  });

  const pendingPayments = studentPayments.filter((p) => p.status === "pending");
  const completedPayments = studentPayments.filter(
    (p) => p.status === "completed",
  );
  const overduePayments = studentPayments.filter((p) => p.isOverdue);
  const totalAmount = studentPayments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Monthly <span className={gradientText}>Payments</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Manage your monthly hostel rent payments
            </p>
          </div>

          <div
            className={`${glassCard} p-4 flex flex-wrap items-center gap-3 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
          >
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-white/80 backdrop-blur border border-slate-200 text-slate-700 py-2.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer font-medium"
              >
                <option value="all">
                  All Payments ({studentPayments.length})
                </option>
                <option value="pending">
                  Pending ({pendingPayments.length})
                </option>
                <option value="overdue">
                  Overdue ({overduePayments.length})
                </option>
                <option value="completed">
                  Completed ({completedPayments.length})
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <Filter className="w-4 h-4" />
              </div>
            </div>

            <button
              onClick={handleGeneratePayments}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all font-medium shadow-lg shadow-green-500/20"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all font-medium shadow-lg shadow-blue-500/20"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div
            className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Total Payments
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800">
                  {studentPayments.length}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-1/2 rounded-full"></div>
            </div>
          </div>

          <div
            className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Pending
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800">
                  {pendingPayments.length}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 w-1/2 rounded-full"></div>
            </div>
          </div>

          <div
            className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Overdue
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800">
                  {overduePayments.length}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 w-1/2 rounded-full"></div>
            </div>
          </div>

          <div
            className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Completed
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800">
                  {completedPayments.length}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg flex-shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-1/2 rounded-full"></div>
            </div>
          </div>

          <div
            className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Total Amount
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800">
                  {formatPrice(totalAmount)}
                </h3>
                <div className="text-xs text-green-600 mt-1">
                  Paid: {formatPrice(paidAmount)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg flex-shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-1/2 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div
          className={`${glassCard} overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/50 backdrop-blur">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment._id}
                    className={`hover:bg-white/50 transition-colors ${payment.isOverdue ? "bg-red-50/50" : ""}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {payment.month} {payment.year}
                      </div>
                      {payment.hostel && (
                        <div className="text-sm text-slate-500">
                          {payment.hostel.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {formatPrice(payment.amount)}
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                        <div>Rent: {formatPrice(payment.baseRent)}</div>
                        <div>Electricity: {formatPrice(payment.electricityCharges)}</div>
                        {payment.maintenanceCharges > 0 && (
                          <div className="text-orange-600">
                            Maintenance: {formatPrice(payment.maintenanceCharges)}
                          </div>
                        )}
                      </div>
                      {payment.lateFee > 0 && (
                        <div className="text-sm text-red-600">
                          + {formatPrice(payment.lateFee)} late fee
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {formatDate(payment.dueDate)}
                      </div>
                      {payment.isOverdue && (
                        <div className="text-xs text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {payment.daysOverdue} days overdue
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                          payment.status === "completed"
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : payment.isOverdue
                              ? "bg-red-50 text-red-700 border border-red-100"
                              : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                        }`}
                      >
                        {payment.status === "completed"
                          ? "Paid"
                          : payment.isOverdue
                            ? "Overdue"
                            : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.status === "pending" && (
                        <PayNowButton
                          booking={{
                            _id: payment.booking,
                            advancePayment: {
                              amount: payment.amount + (payment.lateFee || 0),
                              status: "pending",
                            },
                            hostel: payment.hostel,
                            status: "approved",
                          }}
                          paymentType="monthly"
                          paymentId={payment._id}
                          onPaymentSuccess={handlePaymentSuccess}
                        />
                      )}
                      {payment.status === "completed" && payment.paidAt && (
                        <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Paid on {formatDate(payment.paidAt)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPayments.length === 0 && studentPayments.length > 0 && (
          <div
            className={`${glassCard} p-12 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-slate-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No {filter} payments found
            </h3>
            <p className="text-slate-500">
              Try changing the filter to see other payments
            </p>
          </div>
        )}

        {studentPayments.length === 0 && (
          <div
            className={`${glassCard} p-12 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-12 h-12 text-slate-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Payments Yet
            </h3>
            <p className="text-slate-500">
              Your monthly rent payments will appear here once you check in
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyPayments;
