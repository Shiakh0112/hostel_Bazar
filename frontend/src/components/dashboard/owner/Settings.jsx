import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../../../app/slices/authSlice";
import api from "../../../services/api";
import toast from "react-hot-toast";
import Loader from "../../common/Loader";
import {
  User,
  Bell,
  Shield,
  Camera,
  Key,
  CalendarCheck,
  DollarSign,
  Wrench,
  Users,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Unlock,
  Info,
  Activity,
  Settings,
  Globe,
  MapPin,
  Phone,
  Building,
  CreditCard,
  FileText,
  Save,
  X,
  Edit,
  RefreshCw,
  ChevronRight,
  Zap,
  ShieldCheck,
  Fingerprint,
  Smartphone,
  Laptop,
  Tablet,
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const SettingsComponent = () => {
  // Renamed to avoid conflict during declaration
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    businessName: "",
    gstNumber: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notificationSettings, setNotificationSettings] = useState({
    booking_requests: true,
    payment_received: true,
    maintenance_requests: true,
    staff_updates: true,
    email_notifications: true,
    sms_notifications: false,
  });
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errors, setErrors] = useState({});

  // --- PREMIUM STYLING CLASSES ---
  const glassCard =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600";

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        mobile: user.mobile || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        businessName: user.businessName || "",
        gstNumber: user.gstNumber || "",
      });
      loadNotificationSettings();
    }
  }, [user]);

  const loadNotificationSettings = async () => {
    try {
      setLoadingNotifications(true);
      const response = await api.get("/notifications/settings");
      if (response.data.data) {
        setNotificationSettings(response.data.data);
      }
    } catch (error) {
      console.log("Notification settings not found, using defaults");
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("mobile", formData.mobile);
      submitData.append("address", formData.address);
      submitData.append("city", formData.city);
      submitData.append("state", formData.state);
      submitData.append("pincode", formData.pincode);
      submitData.append("businessName", formData.businessName);
      submitData.append("gstNumber", formData.gstNumber);
      if (avatarFile) {
        submitData.append("avatar", avatarFile);
      }

      await api.put("/auth/profile", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await dispatch(checkAuth());
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      mobile: user.mobile || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
      businessName: user.businessName || "",
      gstNumber: user.gstNumber || "",
    });
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setErrors({});
  };

  const handleNotificationChange = async (setting, value) => {
    try {
      const updatedSettings = { ...notificationSettings, [setting]: value };
      setNotificationSettings(updatedSettings);

      await api.put("/notifications/settings", updatedSettings);
      toast.success("Notification preferences updated!");
    } catch (error) {
      // Revert on error
      setNotificationSettings((prev) => ({ ...prev, [setting]: !value }));
      toast.error("Failed to update notification preferences");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Account <span className={gradientText}>Settings</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Manage your profile details and security preferences
            </p>
          </div>
        </div>

        {/* Main Card Container */}
        <div
          className={`${glassCard} overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          {/* Navigation Tabs */}
          <div className="border-b border-slate-100">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                {
                  id: "profile",
                  label: "Profile",
                  icon: <User className="w-4 h-4" />,
                },
                {
                  id: "notifications",
                  label: "Notifications",
                  icon: <Bell className="w-4 h-4" />,
                },
                {
                  id: "security",
                  label: "Security",
                  icon: <Shield className="w-4 h-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-5 px-2 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span
                    className={
                      activeTab === tab.id ? "text-blue-600" : "text-slate-400"
                    }
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="animate-fade-in">
                {/* Profile Header / Cover */}
                <div className="relative mb-12">
                  <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl"></div>
                  <div className="absolute -bottom-12 left-8 flex items-end">
                    <div className="relative">
                      <img
                        src={
                          avatarPreview ||
                          user?.avatar ||
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="40" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E👤%3C/text%3E%3C/svg%3E'
                        }
                        alt="Profile"
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                      />
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-full cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm border-2 border-white">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          <Camera className="w-4 h-4" />
                        </label>
                      )}
                    </div>
                    <div className="mb-4 ml-4 pb-1">
                      <h3 className="text-xl font-bold text-slate-900">
                        {user?.name}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {user?.email}
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold tracking-wide">
                          {user?.role}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end mb-6">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                      >
                        <Edit className="w-4 h-4" /> Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={handleCancel}
                          className="px-5 py-2.5 bg-white/70 backdrop-blur border border-white/50 text-slate-700 text-sm font-semibold rounded-xl hover:bg-white/90 transition-all"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-70 shadow-lg shadow-blue-500/20 transition-all"
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />{" "}
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" /> Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Grid */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium text-slate-900 ${
                          !isEditing
                            ? "bg-slate-50 border-slate-200 text-slate-600"
                            : "bg-white/80 backdrop-blur border-slate-200"
                        } ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1 ml-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed text-sm font-medium pl-10"
                        />
                        <Lock className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium text-slate-900 ${
                          !isEditing
                            ? "bg-slate-50 border-slate-200 text-slate-600"
                            : "bg-white/80 backdrop-blur border-slate-200"
                        } ${errors.mobile ? "border-red-500 focus:ring-red-500" : ""}`}
                      />
                      {errors.mobile && (
                        <p className="text-red-500 text-xs mt-1 ml-1">
                          {errors.mobile}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Business Name
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium text-slate-900 ${
                          !isEditing
                            ? "bg-slate-50 border-slate-200 text-slate-600"
                            : "bg-white/80 backdrop-blur border-slate-200"
                        }`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium text-slate-900 ${
                          !isEditing
                            ? "bg-slate-50 border-slate-200 text-slate-600"
                            : "bg-white/80 backdrop-blur border-slate-200"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium text-slate-900 ${
                          !isEditing
                            ? "bg-slate-50 border-slate-200 text-slate-600"
                            : "bg-white/80 backdrop-blur border-slate-200"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium text-slate-900 ${
                          !isEditing
                            ? "bg-slate-50 border-slate-200 text-slate-600"
                            : "bg-white/80 backdrop-blur border-slate-200"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium text-slate-900 ${
                          !isEditing
                            ? "bg-slate-50 border-slate-200 text-slate-600"
                            : "bg-white/80 backdrop-blur border-slate-200"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        GST Number
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium text-slate-900 ${
                          !isEditing
                            ? "bg-slate-50 border-slate-200 text-slate-600"
                            : "bg-white/80 backdrop-blur border-slate-200"
                        }`}
                      />
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    Notification Preferences
                  </h3>
                  {loadingNotifications && (
                    <div className="text-sm text-slate-500 flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Syncing...
                    </div>
                  )}
                </div>

                {/* Section 1: Activity */}
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">
                    Activities & Alerts
                  </h4>
                  <div
                    className={`${glassCard} p-2 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    {[
                      {
                        id: "booking_requests",
                        label: "New booking requests",
                        desc: "Get notified when students submit requests",
                        icon: <CalendarCheck className="w-4 h-4" />,
                        color: "text-blue-500",
                      },
                      {
                        id: "payment_received",
                        label: "Payment received",
                        desc: "Notifications for successful payments",
                        icon: <DollarSign className="w-4 h-4" />,
                        color: "text-green-500",
                      },
                      {
                        id: "maintenance_requests",
                        label: "Maintenance requests",
                        desc: "Alerts for repair and issues",
                        icon: <Wrench className="w-4 h-4" />,
                        color: "text-orange-500",
                      },
                      {
                        id: "staff_updates",
                        label: "Staff updates",
                        desc: "Updates from hostel staff members",
                        icon: <Users className="w-4 h-4" />,
                        color: "text-purple-500",
                      },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-white/50 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl bg-white/50 backdrop-blur flex items-center justify-center shadow-sm ${item.color}`}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {item.label}
                            </div>
                            <div className="text-xs text-slate-500">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings[item.id] || false}
                            onChange={(e) =>
                              handleNotificationChange(
                                item.id,
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Delivery */}
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">
                    Delivery Method
                  </h4>
                  <div
                    className={`${glassCard} p-2 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    {[
                      {
                        id: "email_notifications",
                        label: "Email Notifications",
                        desc: "Receive updates via email",
                        icon: <Mail className="w-4 h-4" />,
                        color: "text-red-500",
                      },
                      {
                        id: "sms_notifications",
                        label: "SMS Notifications",
                        desc: "Receive updates via text message",
                        icon: <MessageSquare className="w-4 h-4" />,
                        color: "text-yellow-500",
                      },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-white/50 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl bg-white/50 backdrop-blur flex items-center justify-center shadow-sm ${item.color}`}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {item.label}
                            </div>
                            <div className="text-xs text-slate-500">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings[item.id] || false}
                            onChange={(e) =>
                              handleNotificationChange(
                                item.id,
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="animate-fade-in max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Change Password */}
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-500" /> Change Password
                    </h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white/80 backdrop-blur"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white/80 backdrop-blur"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white/80 backdrop-blur"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-sm shadow-lg shadow-blue-500/20"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>

                  {/* Account Info */}
                  <div
                    className={`${glassCard} p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-6">
                      Account Status
                    </h3>
                    <div className="bg-white/50 backdrop-blur p-4 rounded-xl shadow-sm mb-4 flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        Current Status
                      </span>
                      <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>{" "}
                        Active
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-2">
                          Member Since
                        </p>
                        <p className="text-sm font-medium text-slate-900 bg-white/50 backdrop-blur px-3 py-2 rounded-xl border border-slate-200">
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-2">
                          Last Updated
                        </p>
                        <p className="text-sm font-medium text-slate-900 bg-white/50 backdrop-blur px-3 py-2 rounded-xl border border-slate-200">
                          {user?.updatedAt
                            ? new Date(user.updatedAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsComponent;
