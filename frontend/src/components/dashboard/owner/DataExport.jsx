import { useState } from "react";
import { useSelector } from "react-redux";

// Lucide Icons
import {
  Download,
  FileSpreadsheet,
  Users,
  Wrench,
  FileJson,
  FileText,
  Calendar,
  Info,
  CheckCircle,
  Clock,
  ArrowDown,
} from "lucide-react";

const DataExport = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState("revenue");
  const [format, setFormat] = useState("excel");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const exportOptions = [
    {
      id: "revenue",
      label: "Revenue Report",
      description: "Payment history and revenue trends",
      icon: <FileSpreadsheet className="w-8 h-8 text-indigo-600" />,
      color: "bg-indigo-50 border-indigo-100",
    },
    {
      id: "students",
      label: "Students Report",
      description: "Student details and bookings",
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      color: "bg-emerald-50 border-emerald-100",
    },
    {
      id: "maintenance",
      label: "Maintenance Report",
      description: "Requests, costs and status logs",
      icon: <Wrench className="w-8 h-8 text-orange-600" />,
      color: "bg-orange-50 border-orange-100",
    },
  ];

  const formatOptions = [
    {
      id: "excel",
      label: "Excel Sheet",
      ext: ".xlsx",
      icon: <FileSpreadsheet className="w-6 h-6" />,
      color: "text-green-600 bg-green-50",
    },
    {
      id: "csv",
      label: "CSV Data",
      ext: ".csv",
      icon: <FileJson className="w-6 h-6" />,
      color: "text-blue-600 bg-blue-50",
    },
    {
      id: "pdf",
      label: "PDF Document",
      ext: ".pdf",
      icon: <FileText className="w-6 h-6" />,
      color: "text-red-600 bg-red-50",
    },
  ];

  const handleExport = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        format,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await fetch(
        `http://localhost:5000/api/system/export/${exportType}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.ok) {
        const contentDisposition = response.headers.get("content-disposition");
        const filename = contentDisposition
          ? contentDisposition.split("filename=")[1].replace(/"/g, "")
          : `${exportType}_export_${Date.now()}.${format === "excel" ? "xlsx" : format}`;

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error("Export failed");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Data Export
        </h1>
        <p className="text-gray-500 mt-1">
          Generate detailed reports for your business analysis
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selection Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <Download className="w-5 h-5 mr-2 text-indigo-600" />
              Select Data Source
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exportOptions.map((option) => (
                <div key={option.id} onClick={() => setExportType(option.id)}>
                  <div
                    className={`
                    relative rounded-xl p-4 cursor-pointer border-2 transition-all duration-200 flex flex-col items-center text-center h-full
                    ${
                      exportType === option.id
                        ? "border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                  >
                    {/* Hidden Radio */}
                    <input
                      type="radio"
                      name="exportType"
                      value={option.id}
                      checked={exportType === option.id}
                      onChange={() => setExportType(option.id)}
                      className="absolute opacity-0"
                    />

                    <div
                      className={`p-3 rounded-full mb-3 transition-colors ${option.color}`}
                    >
                      {option.icon}
                    </div>
                    <h4
                      className={`font-semibold text-sm mb-1 ${exportType === option.id ? "text-indigo-900" : "text-gray-700"}`}
                    >
                      {option.label}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {option.description}
                    </p>

                    {exportType === option.id && (
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-0.5">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              File Format
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {formatOptions.map((option) => (
                <div key={option.id} onClick={() => setFormat(option.id)}>
                  <div
                    className={`
                    relative rounded-xl p-4 cursor-pointer border-2 transition-all duration-200 flex flex-col items-center justify-center text-center h-28
                    ${
                      format === option.id
                        ? "border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={option.id}
                      checked={format === option.id}
                      onChange={() => setFormat(option.id)}
                      className="absolute opacity-0"
                    />
                    <div
                      className={`p-2 rounded-lg mb-2 transition-colors ${option.color}`}
                    >
                      {option.icon}
                    </div>
                    <span
                      className={`text-sm font-semibold ${format === option.id ? "text-indigo-900" : "text-gray-700"}`}
                    >
                      {option.label}
                    </span>
                    <span
                      className={`text-xs font-medium ${format === option.id ? "text-indigo-600" : "text-gray-400"}`}
                    >
                      {option.ext}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-400" />
              Date Range
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & History */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 shadow-xl shadow-indigo-500/30 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Ready to Export?</h3>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Download className="w-6 h-6" />
              </div>
            </div>
            <p className="text-indigo-100 text-sm mb-6">
              You are exporting{" "}
              <span className="font-semibold text-white">
                {exportOptions.find((o) => o.id === exportType)?.label}
              </span>{" "}
              in{" "}
              <span className="font-semibold text-white uppercase">
                {format}
              </span>{" "}
              format.
            </p>
            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-50 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <ArrowDown className="mr-2 w-4 h-4" />
                  Export Now
                </>
              )}
            </button>
          </div>

          {/* Export History (Empty State) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="h-2 w-24 bg-gray-200 rounded mb-1.5"></div>
                      <div className="h-2 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <Clock className="w-4 h-4 text-gray-300" />
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              Your recent exports will appear here.
            </p>
          </div>

          {/* Tips Card */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-amber-800 text-sm mb-1">
                  Pro Tip
                </h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  For large datasets, CSV format is recommended as it's
                  lightweight and handles thousands of rows efficiently in
                  spreadsheet software.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExport;
