import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import staffService from "../../../services/staff.service";
import { checkAuth } from "../../../app/slices/authSlice";
import { toast } from "react-hot-toast";
import Loader from "../../common/Loader";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit,
  X,
  Check,
  Lock,
  Calendar,
  Shield,
  Key,
  Save,
  RefreshCw,
} from "lucide-react";

// --- ANIMATED BACKGROUND COMPONENTS ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

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
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
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
      if (avatarFile) {
        submitData.append("avatar", avatarFile);
      }

      await staffService.updateStaffProfile(submitData);
      await dispatch(checkAuth());
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Profile update failed");
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordData.currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!passwordData.newPassword)
      newErrors.newPassword = "New password is required";
    if (passwordData.newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      await staffService.changeStaffPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
    } catch (error) {
      console.error("Password change failed:", error);
      toast.error(error.response?.data?.message || "Password change failed");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || "",
        mobile: user.mobile || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
      });
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    setErrors({});
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              My <span className={gradientText}>Profile</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Manage your personal information
            </p>
          </div>
        </div>

        {/* --- PROFILE CARD --- */}
        <div
          className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-900">
              Personal Information
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Avatar Section */}
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-slate-100">
            <div className="relative">
              <img
                src={
                  avatarPreview ||
                  user?.avatar ||
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="40" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E👤%3C/text%3E%3C/svg%3E'
                }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white/50 shadow-lg"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-full cursor-pointer hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
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
            <div>
              <h4 className="text-xl font-bold text-slate-900">{user?.name}</h4>
              <p className="text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              {avatarFile && (
                <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  New photo selected
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing
                        ? "bg-slate-50 text-slate-500"
                        : "bg-white/80 backdrop-blur"
                    } ${errors.name ? "border-red-500" : "border-slate-200"}`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Mobile *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing
                        ? "bg-slate-50 text-slate-500"
                        : "bg-white/80 backdrop-blur"
                    } ${errors.mobile ? "border-red-500" : "border-slate-200"}`}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={user?.role || ""}
                    disabled
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 capitalize"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing
                        ? "bg-slate-50 text-slate-500"
                        : "bg-white/80 backdrop-blur"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing
                      ? "bg-slate-50 text-slate-500"
                      : "bg-white/80 backdrop-blur"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing
                      ? "bg-slate-50 text-slate-500"
                      : "bg-white/80 backdrop-blur"
                  }`}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 text-slate-600 bg-white/70 backdrop-blur border border-white/50 rounded-xl hover:bg-white/90 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* --- ACCOUNT INFORMATION --- */}
        <div
          className={`${glassCard} p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-900">
              Account Information
            </h3>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 font-medium transition-all shadow-lg shadow-slate-600/20 hover:shadow-xl hover:shadow-slate-700/30 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
          </div>

          {showPasswordForm && (
            <div className="mb-6 p-6 bg-white/50 backdrop-blur rounded-xl border border-white/50">
              <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-slate-600" />
                Change Password
              </h4>
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur ${
                          passwordErrors.currentPassword
                            ? "border-red-500"
                            : "border-slate-200"
                        }`}
                      />
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur ${
                          passwordErrors.newPassword
                            ? "border-red-500"
                            : "border-slate-200"
                        }`}
                      />
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {passwordErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur ${
                          passwordErrors.confirmPassword
                            ? "border-red-500"
                            : "border-slate-200"
                        }`}
                      />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setPasswordErrors({});
                      }}
                      className="px-6 py-3 text-slate-600 bg-white/70 backdrop-blur border border-white/50 rounded-xl hover:bg-white/90 font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Change Password
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50">
              <p className="text-sm text-slate-500 mb-1">Account Status</p>
              <p className="font-medium flex items-center gap-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    user?.isActive ? "bg-emerald-500" : "bg-red-500"
                  }`}
                ></span>
                {user?.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50">
              <p className="text-sm text-slate-500 mb-1">Member Since</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            {user?.permissions && (
              <div className="md:col-span-2 bg-white/50 backdrop-blur p-4 rounded-xl border border-white/50">
                <p className="text-sm text-slate-500 mb-2">Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {user.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium border border-blue-100"
                    >
                      {permission.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
