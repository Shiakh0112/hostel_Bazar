import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOwnerMonthlyPayments } from "../../../app/slices/monthlyPaymentSlice";
import { formatPrice } from "../../../utils/priceFormatter";
import Loader from "../../common/Loader";
import {
  RefreshCcw,
  Search,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Building,
  User,
  Filter,
  ChevronDown,
  TrendingUp,
  DollarSign,
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const OwnerMonthlyPayments = () => {
  const dispatch = useDispatch();
  const { ownerPayments, summary, isLoading } = useSelector(
    (state) => state.monthlyPayment,
  );
  const [filter, setFilter] = useState({ status: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("all");

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl overflow-hidden";
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
        className={`${glassCard} p-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 h-full flex flex-col`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              {title}
            </p>
            <h3 className="text-2xl font-extrabold text-slate-800 break-words">
              {value}
            </h3>
          </div>
          <div
            className={`p-2 rounded-xl bg-gradient-to-br ${gradients[color]} text-white shadow-lg flex-shrink-0`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-auto">
          <div
            className={`h-full bg-gradient-to-r ${gradients[color]} w-1/2 rounded-full`}
          ></div>
        </div>
      </div>
    );
  };

  const students = [
    ...new Map(ownerPayments.map((p) => [p.student?._id, p.student])).values(),
  ];

  const filteredPayments = ownerPayments.filter((payment) => {
    const matchesSearch =
      searchTerm === "" ||
      payment.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.mobile?.includes(searchTerm) ||
      payment.hostel?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStudent =
      selectedStudent === "all" || payment.student?._id === selectedStudent;

    return matchesSearch && matchesStudent;
  });

  useEffect(() => {
    const params = filter.status !== "all" ? { status: filter.status } : {};
    dispatch(fetchOwnerMonthlyPayments(params));
    const interval = setInterval(
      () => dispatch(fetchOwnerMonthlyPayments(params)),
      30000,
    );
    return () => clearInterval(interval);
  }, [dispatch, filter]);

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Monthly <span className={gradientText}>Rent Collection</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Track student rent payments across all hostels
            </p>
          </div>
          <button
            onClick={() =>
              dispatch(
                fetchOwnerMonthlyPayments(
                  filter.status !== "all" ? { status: filter.status } : {},
                ),
              )
            }
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            <RefreshCcw size={18} /> Refresh
          </button>
        </div>

        {/* --- FILTERS --- */}
        <div
          className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by student, mobile, or hostel"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full border border-slate-200 rounded-xl py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white/80 backdrop-blur font-medium"
              />
            </div>

            {/* Student Filter */}
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="pl-10 pr-10 w-full border border-slate-200 rounded-xl py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white/80 backdrop-blur font-medium appearance-none cursor-pointer"
              >
                <option value="all">All Students ({students.length})</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} - {student.mobile}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center">
                <Filter className="w-4 h-4" />
              </div>
              <select
                value={filter.status}
                onChange={(e) =>
                  setFilter({ ...filter, status: e.target.value })
                }
                className="pl-10 pr-10 w-full border border-slate-200 rounded-xl py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-white/80 backdrop-blur font-medium appearance-none cursor-pointer"
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <div className="absolute right-3 top-3 text-slate-400 w-5 h-5 flex items-center justify-center pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* --- ACTIVE FILTERS --- */}
        {(searchTerm || selectedStudent !== "all") && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <span className="font-bold">Active Filters:</span>
            {searchTerm && (
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full flex items-center gap-2 border border-blue-100">
                <Search className="w-3 h-3" />
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="font-bold hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStudent !== "all" && (
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-2 border border-emerald-100">
                <User className="w-3 h-3" />
                Student: {students.find((s) => s._id === selectedStudent)?.name}
                <button
                  onClick={() => setSelectedStudent("all")}
                  className="font-bold hover:text-emerald-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedStudent("all");
              }}
              className="ml-auto text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}

        {/* --- SUMMARY CARDS --- */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <StatCard
              title="Total Payments"
              value={summary.total}
              icon={CreditCard}
              color="blue"
            />
            <StatCard
              title="Pending"
              value={summary.pending}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Overdue"
              value={summary.overdue}
              icon={AlertCircle}
              color="red"
            />
            <StatCard
              title="Completed"
              value={summary.completed}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Collected"
              value={formatPrice(summary.collectedAmount)}
              icon={DollarSign}
              color="purple"
            />
            <StatCard
              title="Pending Amount"
              value={formatPrice(summary.pendingAmount)}
              icon={TrendingUp}
              color="orange"
            />
          </div>
        )}

        {/* --- PAYMENTS TABLE --- */}
        <div
          className={`${glassCard} overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/50 backdrop-blur">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Hostel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-white/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">
                        {payment.student?.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {payment.student?.mobile}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-400" />
                        {payment.hostel?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {payment.month} {payment.year}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {formatPrice(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </div>
                        {payment.isOverdue && (
                          <div className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {payment.daysOverdue} days overdue
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 text-xs font-bold rounded-full border ${
                          payment.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : payment.isOverdue
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {payment.status === "completed"
                          ? "Paid"
                          : payment.isOverdue
                            ? "Overdue"
                            : "Pending"}
                      </span>
                      {payment.status === "completed" && payment.paidAt && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {new Date(payment.paidAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- NO PAYMENTS / NO MATCH --- */}
        {filteredPayments.length === 0 && ownerPayments.length > 0 && (
          <div className={`${glassCard} p-12 text-center`}>
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Matching Payments
            </h3>
            <p className="text-slate-500">Adjust your search or filters</p>
          </div>
        )}

        {ownerPayments.length === 0 && (
          <div className={`${glassCard} p-12 text-center`}>
            <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Payments Found
            </h3>
            <p className="text-slate-500">No payments to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerMonthlyPayments;
