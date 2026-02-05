import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Building2,
  Users,
  BadgeCheck,
  Wallet,
  TrendingDown,
  Percent,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ReceiptText,
  BedDouble,
  Wrench,
  Calendar,
  CreditCard,
  Phone,
  User,
  Repeat,
  X,
} from "lucide-react";

const NAVBAR_HEIGHT = "4rem";
const LG_BREAKPOINT = 1024;

const Sidebar = ({ onCollapseChange }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    window.innerWidth >= LG_BREAKPOINT,
  );

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= LG_BREAKPOINT;
      setIsDesktop(desktop);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  const getMenuItems = () => {
    if (user?.role === "owner") {
      return [
        { path: "/dashboard/owner", label: "Overview", icon: LayoutDashboard },
        {
          path: "/dashboard/owner/hostels",
          label: "My Hostels",
          icon: Building2,
        },
        {
          path: "/dashboard/owner/booking-requests",
          label: "Bookings",
          icon: ReceiptText,
        },
        { path: "/dashboard/owner/students", label: "Students", icon: Users },
        { path: "/dashboard/owner/staff", label: "Staff", icon: BadgeCheck },
        {
          path: "/dashboard/owner/monthly-payments",
          label: "Payments",
          icon: Wallet,
        },
        {
          path: "/dashboard/owner/expenses",
          label: "Expenses",
          icon: TrendingDown,
        },
        {
          path: "/dashboard/owner/discounts",
          label: "Discounts",
          icon: Percent,
        },
        {
          path: "/dashboard/owner/reports",
          label: "Reports",
          icon: TrendingUp,
        },
        {
          path: "/dashboard/owner/settings",
          label: "Settings",
          icon: Settings,
        },
      ];
    }

    if (user?.role === "student") {
      return [
        { path: "/dashboard/student", label: "My Bookings", icon: ReceiptText },
        {
          path: "/dashboard/student/my-room",
          label: "My Room",
          icon: BedDouble,
        },
        {
          path: "/dashboard/student/monthly-payments",
          label: "Rent",
          icon: Wallet,
        },
        {
          path: "/dashboard/student/payments",
          label: "History",
          icon: CreditCard,
        },
        {
          path: "/dashboard/student/payment-plans",
          label: "Plans",
          icon: Calendar,
        },
        {
          path: "/dashboard/student/maintenance",
          label: "Maintenance",
          icon: Wrench,
        },
        {
          path: "/dashboard/student/room-transfer",
          label: "Transfer",
          icon: Repeat,
        },
        {
          path: "/dashboard/student/checkout",
          label: "Checkout",
          icon: LogOut, // using logout icon for checkout visually
        },
        {
          path: "/dashboard/student/emergency-contacts",
          label: "Emergency",
          icon: Phone,
        },
        { path: "/dashboard/student/profile", label: "Profile", icon: User },
      ];
    }

    if (user?.role === "staff") {
      return [
        { path: "/dashboard/staff", label: "Dashboard", icon: LayoutDashboard },
        {
          path: "/dashboard/staff/assigned-tasks",
          label: "Tasks",
          icon: ReceiptText,
        },
        { path: "/dashboard/staff/hostels", label: "Hostels", icon: Building2 },
        { path: "/dashboard/staff/students", label: "Students", icon: Users },
        { path: "/dashboard/staff/rooms", label: "Rooms", icon: BedDouble },
        {
          path: "/dashboard/staff/maintenance",
          label: "Maintenance",
          icon: Wrench,
        },
        {
          path: "/dashboard/staff/reports",
          label: "Reports",
          icon: TrendingUp,
        },
        { path: "/dashboard/staff/profile", label: "Profile", icon: User },
        {
          path: "/dashboard/staff/settings",
          label: "Settings",
          icon: Settings,
        },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* SIDEBAR (Glassmorphism) */}
      <aside
        className={`fixed left-0 z-30 flex flex-col
        transition-all duration-300 ease-in-out
        bg-white/70 backdrop-blur-xl border-r border-white/50 shadow-2xl shadow-slate-900/5
        ${isCollapsed ? "w-20" : "w-72"}`}
        style={{
          top: NAVBAR_HEIGHT,
          height: `calc(100vh - ${NAVBAR_HEIGHT})`,
        }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-white/50 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform">
              H
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                HostelBazar
              </span>
            )}
          </div>

          {/* COLLAPSE BUTTON */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* USER INFO (Glass Card Style) */}
        {user && (
          <div className="p-1  mt-2 rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 border border-white/50">
            <div
              className={`flex items-center gap-3 ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 border-2 border-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              {!isCollapsed && (
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">
                    {user?.role}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MENU ITEMS */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/30 border border-transparent"
                    : "text-slate-600 hover:bg-white/50 hover:text-slate-900 border border-transparent hover:border-slate-100"
                }
                ${isCollapsed ? "justify-center" : ""}`}
              >
                <div
                  className={`transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                {!isCollapsed && <span>{item.label}</span>}
                {/* Active Indicator Dot */}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER LOGOUT */}
        <div className="p-4">
          <button
            className={`w-full flex items-center gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl p-3 text-sm font-bold transition-all duration-200
            ${isCollapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

