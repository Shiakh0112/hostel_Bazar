import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import api from "../../../services/api";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  X,
  Eye,
  ChevronDown,
  AlertTriangle,
  UserRound,
  Calendar,
  PhoneCall,
  CheckCircle,
  Clock,
} from "lucide-react";

const StudentManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(12);

  useEffect(() => {
    fetchStudents();
    const interval = setInterval(fetchStudents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("staff/students");
      if (response.data?.success) {
        setStudents(response.data.data.students || []);
      } else {
        setError(response.data?.message || "Failed to fetch students");
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to connect to server";
      setError(errorMessage);
      toast.error(errorMessage);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmergencyContacts = async (studentId) => {
    try {
      const response = await api.get(`emergency-contacts/student/${studentId}`);
      if (response.data?.success) {
        setEmergencyContacts(response.data.data || []);
      } else {
        setEmergencyContacts([]);
      }
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      setEmergencyContacts([]);
      toast.error("Failed to fetch emergency contacts");
    }
  };

  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setEmergencyContacts([]);
    await fetchEmergencyContacts(student._id);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobile?.includes(searchTerm) ||
      student.room?.roomNumber?.toString().includes(searchTerm);

    const matchesFilter =
      statusFilter === "all" || student.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  // --- STYLING HELPERS (Matching HostelManagement) ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "pending_allocation":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "inactive":
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const statusCounts = {
    all: students.length,
    active: students.filter((s) => s.status === "active").length,
    pending_allocation: students.filter(
      (s) => s.status === "pending_allocation",
    ).length,
    inactive: students.filter((s) => s.status === "inactive").length,
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent,
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Student{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                Directory
              </span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Manage student profiles and emergency contacts
            </p>
          </div>
          <button
            onClick={fetchStudents}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all font-bold shadow-sm hover:shadow-md"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              title: "Total Students",
              value: statusCounts.all,
              icon: Users,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              title: "Active",
              value: statusCounts.active,
              icon: CheckCircle,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              title: "Pending Allocation",
              value: statusCounts.pending_allocation,
              icon: Clock,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              title: "Inactive",
              value: statusCounts.inactive,
              icon: X,
              color: "text-slate-600",
              bg: "bg-slate-50",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.bg} p-5 rounded-2xl border border-transparent shadow-sm`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {stat.title}
                </p>
                <div
                  className={`p-1.5 rounded-lg bg-white shadow-sm ${stat.color}`}
                >
                  <stat.icon className="w-4 h-4" strokeWidth={2.5} />
                </div>
              </div>
              <p className={`text-2xl font-extrabold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* --- SEARCH & FILTER --- */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students by name, email, phone or room..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium text-slate-700"
            />
          </div>
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none text-sm font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All Students ({statusCounts.all})</option>
              <option value="active">Active ({statusCounts.active})</option>
              <option value="pending_allocation">
                Pending ({statusCounts.pending_allocation})
              </option>
              <option value="inactive">
                Inactive ({statusCounts.inactive})
              </option>
            </select>
          </div>
        </div>

        {/* --- STUDENTS LIST (CARD GRID) --- */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentStudents.map((student) => {
              const addressString =
                typeof student.address === "object"
                  ? `${student.address.street || ""}, ${student.address.city || ""}`
                  : student.address || "Address not available";

              return (
                <div
                  key={student._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Card Header */}
                  <div className="p-2 border-b border-slate-100 flex justify-between items-start gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {student.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {student.name}
                        </h3>
                        <p className="text-slate-500 text-sm">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wide border ${getStatusBadge(student.status)}`}
                    >
                      {student.status?.replace("_", " ")}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-6 flex-1">
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">
                          Room {student.room?.roomNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <UserRound className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">
                          Bed {student.bed?.bedNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">
                          {student.mobile}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">
                          {student.checkInDate
                            ? new Date(student.checkInDate).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Rent & Action */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Monthly Rent
                        </p>
                        <p className="text-lg font-bold text-slate-900">
                          ₹{student.monthlyRent?.toLocaleString() || "N/A"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all text-sm flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-300">
            <Users className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">
              No students found
            </h3>
            <p className="text-slate-500 mt-2">
              Try adjusting your search filters
            </p>
          </div>
        )}

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-all"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                        page === currentPage
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                return null;
              })}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </div>
        )}

        {/* --- MODAL (Clean Layout) --- */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => {
                setSelectedStudent(null);
                setEmergencyContacts([]);
              }}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative flex flex-col">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                    {selectedStudent.name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-slate-500 text-sm">
                      {selectedStudent.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setEmergencyContacts([]);
                  }}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 hover:text-red-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Details */}
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                        Personal Information
                      </h4>
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-4">
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">
                              Room
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              {selectedStudent.room?.roomNumber || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">
                              Bed
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              {selectedStudent.bed?.bedNumber || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">
                              Status
                            </p>
                            <span
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusBadge(selectedStudent.status)}`}
                            >
                              {selectedStudent.status?.replace("_", " ")}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">
                              Mobile
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              {selectedStudent.mobile}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">
                              Check-in
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              {selectedStudent.checkInDate
                                ? new Date(
                                    selectedStudent.checkInDate,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">
                              Rent
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              ₹
                              {selectedStudent.monthlyRent?.toLocaleString() ||
                                "0"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                        Emergency Contacts
                      </h4>
                      <div className="bg-white border-2 border-dashed border-red-200 rounded-2xl p-6">
                        {emergencyContacts.length > 0 ? (
                          <div className="space-y-4">
                            {emergencyContacts.map((contact, index) => (
                              <div
                                key={contact._id}
                                className="flex justify-between items-start gap-4 pb-4 last:pb-0 border-b border-red-50 last:border-transparent"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                      <UserRound className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-bold text-slate-900">
                                        {contact.name}
                                      </p>
                                      <p className="text-xs text-slate-500 uppercase">
                                        {contact.relationship}
                                      </p>
                                    </div>
                                    {contact.isPrimary && (
                                      <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold rounded-lg uppercase">
                                        Primary
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Phone className="w-4 h-4" />
                                    <span className="font-semibold text-slate-900">
                                      {contact.mobile}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Mail className="w-4 h-4" />
                                    <span className="font-semibold text-slate-900 truncate">
                                      {contact.email}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 text-slate-600">
                                    <MapPin className="w-4 h-4 mt-0.5" />
                                    <span className="text-slate-800 text-xs leading-tight">
                                      {contact.address}
                                    </span>
                                  </div>
                                  <a
                                    href={`tel:${contact.mobile}`}
                                    className="mt-2 p-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 font-bold transition-colors block text-center"
                                  >
                                    <PhoneCall className="w-4 h-4 mx-auto" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-400 italic">
                            No emergency contacts found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
