import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSelector } from "react-redux";
import {
  Bell,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Home,
  Building2,
  Search,
  User,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, handleLogout, getDashboardRoute } = useAuth();
  const { unreadCount = 0 } = useSelector((state) => state.notification || {});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDashboardClick = () => {
    const dashboardRoute = getDashboardRoute();
    navigate(dashboardRoute);
    setIsMenuOpen(false);
  };

  const NavLinks = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
    {
      name: "Hostels",
      path: "/hostels",
      icon: <Building2 className="w-4 h-4" />,
    },
    { name: "About", path: "/about", icon: <User className="w-4 h-4" /> },
    { name: "Services", path: "/services", icon: <Building2 className="w-4 h-4" /> },
    { name: "Contact", path: "/contact", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* FIXED: Moved Mobile Menu OUTSIDE the nav tag to fix z-index issues */}
      {/* MOBILE MENU (Glassmorphic Overlay) */}
      <div
        className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-[80%] px-6 pt-24 pb-8 overflow-y-auto">
          {/* Mobile Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Find a hostel..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm text-sm"
            />
          </div>

          <div className="flex-1 space-y-2">
            {NavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-5 py-4 rounded-2xl text-lg font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
              >
                {link.icon}
                <span className="ml-3">{link.name}</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-4 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleDashboardClick();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center px-5 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center px-5 py-4 rounded-2xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-5 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-5 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <nav className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-3xl border-b border-white/20 shadow-xl shadow-slate-900/5 mb-8">
        {/* Navbar Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-2xl shadow-2xl shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-105 border border-white/20">
                  <Building2 className="w-6 h-6 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-700 to-violet-700 tracking-tight group-hover:from-blue-600 group-hover:to-violet-600 transition-all duration-300">
                    HostelBazar
                  </span>
                  <span className="text-xs font-semibold text-slate-500 -mt-1 tracking-wide">
                    Premium Hostels
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {NavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative group px-5 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:text-blue-600 transition-all duration-300 overflow-hidden"
                >
                  {/* Enhanced Hover Effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 shadow-lg shadow-blue-500/10"></span>
                  <div className="flex items-center gap-2.5 relative z-10">
                    <span className="p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                      {link.icon}
                    </span>
                    <span className="font-bold">{link.name}</span>
                  </div>
                  {/* Bottom border effect */}
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 group-hover:w-3/4 group-hover:left-1/8 transition-all duration-300 rounded-full"></div>
                </Link>
              ))}

              {isAuthenticated ? (
                <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-slate-200/50">
                  {/* Dashboard Button */}
                  <button
                    onClick={handleDashboardClick}
                    className="relative group inline-flex items-center px-5 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:text-blue-600 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 shadow-lg shadow-blue-500/10"></span>
                    <div className="flex items-center gap-2.5 relative z-10">
                      <span className="p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                        <LayoutDashboard className="w-4 h-4" />
                      </span>
                      <span>Dashboard</span>
                    </div>
                  </button>

                  {/* Notifications */}
                  <button className="relative p-3 rounded-2xl text-slate-500 hover:text-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group border border-transparent hover:border-blue-100 shadow-sm hover:shadow-lg hover:shadow-blue-500/10">
                    <Bell className="w-5 h-5 group-hover:animate-swing" />
                    {unreadCount > 0 && (
                      <>
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white animate-pulse shadow-lg"></span>
                        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black shadow-lg border-2 border-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      </>
                    )}
                  </button>

                  {/* User Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-3 pl-4 pr-2 py-2 rounded-2xl border-2 border-slate-200/50 hover:border-blue-300/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 bg-white/60 backdrop-blur-sm group"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 via-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg border-2 border-white group-hover:scale-105 transition-transform">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white rounded-full shadow-lg"></span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-all duration-300 group-hover:text-blue-600 ${isDropdownOpen ? "rotate-180 text-blue-600" : ""}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    <div
                      className={`absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/50 py-2 z-50 transition-all duration-300 transform origin-top-right ${
                        isDropdownOpen
                          ? "opacity-100 scale-100 translate-y-0"
                          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                      }`}
                    >
                      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-sm font-bold text-slate-800">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          handleDashboardClick();
                          setIsDropdownOpen(false);
                        }}
                        className="flex w-full items-center px-5 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex w-full items-center px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors group"
                      >
                        <LogOut className="mr-3 h-4 w-4 group-hover:text-red-700" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-slate-200">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="group relative px-6 py-2.5 rounded-xl overflow-hidden bg-white border border-slate-200 text-slate-900 font-bold text-sm transition-all hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10 group-hover:text-white transition-colors">
                      Get Started
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

// Utility Component for dropdown arrow
const ChevronDown = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default Navbar;
