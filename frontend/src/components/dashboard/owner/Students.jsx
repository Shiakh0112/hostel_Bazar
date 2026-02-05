import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentReport } from "../../../app/slices/reportSlice";
import { formatDate } from "../../../utils/formatDate";
import { formatPrice } from "../../../utils/priceFormatter";
import Loader from "../../common/Loader";

import {
  Users,
  UserCheck,
  AlertCircle,
  IndianRupee,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  Calendar,
  MapPin,
  Mail,
  Phone,
  BedDouble,
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const Students = () => {
  const dispatch = useDispatch();
  const { studentReport, loading } = useSelector((state) => state.report);
  const [search, setSearch] = useState("");

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
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
              {label}
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
    dispatch(fetchStudentReport());
  }, [dispatch]);

  const students = studentReport?.students || [];

  /* SEARCH LOGIC */
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;

    return students.filter((s) => {
      const q = search.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.mobile?.includes(q) ||
        s.hostel?.name?.toLowerCase().includes(q)
      );
    });
  }, [students, search]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              <span className={gradientText}>Students</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Manage students across your hostels
            </p>
          </div>

          <button
            onClick={() => dispatch(fetchStudentReport())}
            className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-blue-600"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* --- SUMMARY --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Total Students"
            value={studentReport?.totalStudents || 0}
          />
          <StatCard
            icon={UserCheck}
            label="Active Students"
            value={studentReport?.activeStudents || 0}
            color="green"
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Payments"
            value={studentReport?.pendingPayments || 0}
            color="yellow"
          />
          <StatCard
            icon={IndianRupee}
            label="Total Revenue"
            value={formatPrice(studentReport?.totalRevenue || 0)}
            color="purple"
          />
        </div>

        {/* --- LIST --- */}
        <div
          className={`${glassCard} hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          {/* --- TOP BAR --- */}
          <div className="p-6 border-b border-white/20 flex flex-col md:flex-row justify-between gap-4">
            <h3 className="text-xl font-bold text-slate-900">Student List</h3>

            <div className="relative w-full md:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student, email, hostel..."
                className="w-full pl-9 pr-3 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
              />
            </div>
          </div>

          {/* --- CONTENT --- */}
          <div className="overflow-x-auto">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-16">
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600">No students found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-white/50 backdrop-blur text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold">Student</th>
                    <th className="px-6 py-3 text-left font-bold">Hostel</th>
                    <th className="px-6 py-3 text-left font-bold">Room</th>
                    <th className="px-6 py-3 text-left font-bold">Check-in</th>
                    <th className="px-6 py-3 text-left font-bold">Status</th>
                    <th className="px-6 py-3 text-right font-bold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-white/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">
                          {student.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {student.email}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {student.mobile}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {student.hostel?.name || "—"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {student.room ? (
                          <div className="flex items-center gap-2">
                            <BedDouble className="w-4 h-4 text-slate-400" />
                            {`${student.room.roomNumber} - ${student.bed?.bedNumber}`}
                          </div>
                        ) : (
                          <span className="text-slate-400">Not allocated</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {student.checkInDate
                            ? formatDate(student.checkInDate)
                            : "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={student.status} />
                      </td>

                      <td className="px-6 py-4 text-right space-x-3">
                        <button className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-medium transition-colors">
                          <Eye size={14} /> View
                        </button>
                        <button className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 font-medium transition-colors">
                          <Trash2 size={14} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- SMALL COMPONENTS ---------------- */

const StatusBadge = ({ status }) => {
  const map = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    inactive: "bg-slate-50 text-slate-700 border-slate-100",
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
        map[status] || "bg-slate-50 text-slate-700 border-slate-100"
      }`}
    >
      {status}
    </span>
  );
};

export default Students;
