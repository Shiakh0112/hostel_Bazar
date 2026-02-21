import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  fetchRevenueReport,
  fetchOccupancyReport,
  fetchMaintenanceReport,
} from "../../../app/slices/reportSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Charts = () => {
  const dispatch = useDispatch();
  const { revenueReport, occupancyReport, maintenanceReport, loading } =
    useSelector((state) => state.report);
  const [activeChart, setActiveChart] = useState("revenue");

  useEffect(() => {
    dispatch(fetchRevenueReport({}));
    dispatch(fetchOccupancyReport({}));
    dispatch(fetchMaintenanceReport({}));
  }, [dispatch]);

  // Revenue Trend Chart Data (UPDATED LOGIC)
  const processRevenueData = () => {
    if (!revenueReport?.revenueData || revenueReport.revenueData.length === 0) {
      return {
        labels: [
          "Jan/2024",
          "Feb/2024",
          "Mar/2024",
          "Apr/2024",
          "May/2024",
          "Jun/2024",
        ],
        data: [0, 5000, 8000, 12000, 15000, 18000],
      };
    }

    // 1. Data ko Chronological Order mein Sort karna (Month & Year ke base par)
    const sortedData = [...revenueReport.revenueData].sort((a, b) => {
      // Year check
      if (a._id.year !== b._id.year) {
        return a._id.year - b._id.year;
      }
      // Month check
      return a._id.month - b._id.month;
    });

    // 2. Cumulative Revenue Calculate karna (Running Total)
    // Isse line hamesha upar jayegi agar revenue positive hai.
    let cumulativeSum = 0;
    const values = sortedData.map((item) => {
      cumulativeSum += item.totalRevenue;
      return cumulativeSum;
    });

    // Labels generate karna
    const labels = sortedData.map(
      (item) => `${item._id.month}/${item._id.year}`,
    );

    // Agar sirf ek data point ho to starting 0 add karein
    if (sortedData.length === 1) {
      return {
        labels: ["Start", labels[0]],
        data: [0, values[0]],
      };
    }

    return { labels, data: values };
  };

  const processedData = processRevenueData();

  const revenueChartData = {
    labels: processedData.labels,
    datasets: [
      {
        label: "Total Cumulative Revenue", // Label updated
        data: processedData.data,
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4, // Smooth curve
        pointBackgroundColor: "rgba(54, 162, 235, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: true,
        spanGaps: true,
      },
    ],
  };

  // Occupancy Rate Chart Data
  const occupancyChartData = {
    labels: Array.isArray(occupancyReport) && occupancyReport.length > 0
      ? occupancyReport.map((hostel) => hostel.hostelName)
      : ["No Data"],
    datasets: [
      {
        label: "Occupancy Rate (%)",
        data: Array.isArray(occupancyReport) && occupancyReport.length > 0
          ? occupancyReport.map((hostel) => parseFloat(hostel.occupancyRate))
          : [0],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 205, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Expense Categories Pie Chart
  const expenseChartData = {
    labels: maintenanceReport?.categoryWise?.length > 0
      ? maintenanceReport.categoryWise.map((cat) => cat._id)
      : ["No Data"],
    datasets: [
      {
        label: "Maintenance Cost by Category",
        data: maintenanceReport?.categoryWise?.length > 0
          ? maintenanceReport.categoryWise.map((cat) => cat.totalCost)
          : [0],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 205, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Monthly Comparison Chart
  const monthlyComparisonData = {
    labels: maintenanceReport?.monthlyTrend?.length > 0
      ? maintenanceReport.monthlyTrend.map(
          (item) => `${item._id.month}/${item._id.year}`,
        )
      : ["No Data"],
    datasets: [
      {
        label: "Maintenance Requests",
        data: maintenanceReport?.monthlyTrend?.length > 0
          ? maintenanceReport.monthlyTrend.map((item) => item.totalRequests)
          : [0],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        tension: 0.1,
      },
      {
        label: "Completed Requests",
        data: maintenanceReport?.monthlyTrend?.length > 0
          ? maintenanceReport.monthlyTrend.map(
              (item) => item.completedRequests,
            )
          : [0],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Analytics Dashboard",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Distribution Analysis",
      },
    },
  };

  // Remove loading check - let charts render with default data

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Charts</h2>
        <div className="flex space-x-2">
          {[
            { id: "revenue", label: "Revenue Trends" },
            { id: "occupancy", label: "Occupancy Rates" },
            { id: "expenses", label: "Expense Categories" },
            { id: "comparison", label: "Monthly Comparison" },
          ].map((chart) => (
            <button
              key={chart.id}
              onClick={() => setActiveChart(chart.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeChart === chart.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {chart.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {activeChart === "revenue" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Revenue Trend Analysis (Cumulative)
            </h3>
            <div className="h-96">
              <Line
                data={revenueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    intersect: false,
                    mode: "index",
                  },
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: "Revenue Analytics",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return "₹" + value.toLocaleString();
                        },
                      },
                    },
                  },
                  elements: {
                    line: {
                      tension: 0.4,
                      borderWidth: 3,
                    },
                    point: {
                      radius: 6,
                      hoverRadius: 8,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {activeChart === "occupancy" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Occupancy Rate by Hostel
            </h3>
            <div className="h-96">
              <Bar 
                data={occupancyChartData} 
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false
                }} 
              />
            </div>
          </div>
        )}

        {activeChart === "expenses" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Maintenance Expenses by Category
            </h3>
            <div className="h-96 flex justify-center items-center">
              <div className="w-full h-full">
                <Pie 
                  data={expenseChartData} 
                  options={{
                    ...pieOptions,
                    maintainAspectRatio: false
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {activeChart === "comparison" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Monthly Maintenance Trends
            </h3>
            <div className="h-96">
              <Line 
                data={monthlyComparisonData} 
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false
                }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="text-2xl font-bold">
            ₹
            {revenueReport?.revenueData
              ?.reduce((sum, item) => sum + item.totalRevenue, 0)
              ?.toLocaleString() || 0}
          </div>
          <div className="text-sm opacity-90">Total Revenue</div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="text-2xl font-bold">
            {Array.isArray(occupancyReport)
              ? occupancyReport.reduce(
                  (sum, hostel) => sum + (hostel.occupiedBeds || 0),
                  0,
                )
              : 0}
          </div>
          <div className="text-sm opacity-90">Occupied Beds</div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="text-2xl font-bold">
            {maintenanceReport?.totalRequests || 0}
          </div>
          <div className="text-sm opacity-90">Maintenance Requests</div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="text-2xl font-bold">
            {maintenanceReport?.completionRate || 0}%
          </div>
          <div className="text-sm opacity-90">Completion Rate</div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
