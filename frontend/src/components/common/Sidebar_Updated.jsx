import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const getMenuItems = () => {
    if (user?.role === "owner") {
      return [
        { path: "/dashboard/owner", label: "Overview", icon: "📊" },
        { path: "/dashboard/owner/hostels", label: "My Hostels", icon: "🏠" },
        {
          path: "/dashboard/owner/booking-requests",
          label: "Booking Requests",
          icon: "📋",
        },
        { path: "/dashboard/owner/students", label: "Students", icon: "👥" },
        { path: "/dashboard/owner/staff", label: "Staff", icon: "👨‍💼" },
        {
          path: "/dashboard/owner/monthly-payments",
          label: "Monthly Payments",
          icon: "💰",
        },
        { path: "/dashboard/owner/expenses", label: "Expenses", icon: "💸" },
        { path: "/dashboard/owner/discounts", label: "Discounts", icon: "🎫" },
        { path: "/dashboard/owner/reports", label: "Reports", icon: "📈" },
        { path: "/dashboard/owner/settings", label: "Settings", icon: "⚙️" },
      ];
    } else if (user?.role === "student") {
      return [
        { path: "/dashboard/student", label: "My Bookings", icon: "📋" },
        { path: "/dashboard/student/my-room", label: "My Room", icon: "🛏️" },
        {
          path: "/dashboard/student/monthly-payments",
          label: "Monthly Rent",
          icon: "💰",
        },
        {
          path: "/dashboard/student/payments",
          label: "Payment History",
          icon: "💳",
        },
        {
          path: "/dashboard/student/payment-plans",
          label: "Payment Plans",
          icon: "📅",
        },
        {
          path: "/dashboard/student/maintenance",
          label: "Maintenance",
          icon: "🔧",
        },
        {
          path: "/dashboard/student/room-transfer",
          label: "Room Transfer",
          icon: "🔄",
        },
        { path: "/dashboard/student/checkout", label: "Checkout", icon: "🚪" },
        {
          path: "/dashboard/student/emergency-contacts",
          label: "Emergency Contacts",
          icon: "🆘",
        },
        { path: "/dashboard/student/profile", label: "Profile", icon: "👤" },
      ];
    } else if (user?.role === "staff") {
      return [
        { path: "/dashboard/staff", label: "Dashboard", icon: "📊" },
        {
          path: "/dashboard/staff/assigned-tasks",
          label: "Assigned Tasks",
          icon: "📝",
        },
        {
          path: "/dashboard/staff/hostels",
          label: "Hostel Management",
          icon: "🏠",
        },
        {
          path: "/dashboard/staff/bookings",
          label: "Booking Management",
          icon: "📋",
        },
        {
          path: "/dashboard/staff/students",
          label: "Student Management",
          icon: "👥",
        },
        {
          path: "/dashboard/staff/rooms",
          label: "Room Management",
          icon: "🛏️",
        },
        {
          path: "/dashboard/staff/maintenance",
          label: "Maintenance",
          icon: "🔧",
        },
        {
          path: "/dashboard/staff/checkout",
          label: "Checkout Management",
          icon: "🚪",
        },
        {
          path: "/dashboard/staff/room-transfers",
          label: "Room Transfers",
          icon: "🔄",
        },
        {
          path: "/dashboard/staff/monthly-payments",
          label: "Monthly Payments",
          icon: "💰",
        },
        { path: "/dashboard/staff/reports", label: "Reports", icon: "📈" },
        { path: "/dashboard/staff/profile", label: "Profile", icon: "👤" },
        { path: "/dashboard/staff/settings", label: "Settings", icon: "⚙️" },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  // Group menu items by category
  const groupedItems = menuItems.reduce((groups, item) => {
    // Extract the first word as category, or use 'General' as default
    const category = item.label.split(" ")[0] || "General";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-300 ease-in-out z-50 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo & Title */}
        <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-white to-gray-50">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
            HostelBazar
          </h2>
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {user?.role
              ? user?.role.charAt(0).toUpperCase() + user?.role.slice(1)
              : "User"}{" "}
            Dashboard
          </div>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="mx-5 mt-5 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-md">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role} Dashboard
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="mt-6 px-4 flex-1 overflow-y-auto scrollbar-hide">
          {Object.keys(groupedItems).map((category, index) => (
            <div key={index} className="mb-4">
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                {category}
                <span className="ml-2 flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></span>
              </h3>
              <div className="space-y-1">
                {groupedItems[category].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={onClose}
                  >
                    {/* Active indicator */}
                    {location.pathname === item.path && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-r-full"></div>
                    )}

                    {/* Icon with hover effect */}
                    <span
                      className={`mr-3 text-lg transition-transform duration-200 ${location.pathname === item.path ? "scale-110" : "group-hover:scale-110"}`}
                    >
                      {item.icon}
                    </span>

                    {/* Text */}
                    <span className="relative z-10">{item.label}</span>

                    {/* Hover ripple effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
