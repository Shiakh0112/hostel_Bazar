import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { checkAuth } from '../../../app/slices/authSlice';
import api from '../../../services/api';
import Loader from '../../common/Loader';
import { 
  RefreshCw, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield,
  Lock,
  Camera,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Globe,
  CreditCard
} from "lucide-react";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    idProofType: '',
    idProofNumber: '',
    emergencyContact: {
      name: '',
      mobile: '',
      relation: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [hostelInfo, setHostelInfo] = useState(null);
  const [showRoomChangeModal, setShowRoomChangeModal] = useState(false);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await api.get('students/profile');
      const userData = response.data?.data || response.data;
      if (userData) {
        setFormData({
          name: userData.name || '',
          mobile: userData.mobile || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          pincode: userData.pincode || '',
          idProofType: userData.idProof?.type || '',
          idProofNumber: userData.idProof?.number || '',
          emergencyContact: {
            name: userData.emergencyContact?.name || '',
            mobile: userData.emergencyContact?.mobile || '',
            relation: userData.emergencyContact?.relation || ''
          }
        });
      }
      
      // Fetch hostel info
      const hostelResponse = await api.get('students/hostel-info');
      setHostelInfo(hostelResponse.data?.data || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile data');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        mobile: user.mobile || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        idProofType: user.idProof?.type || '',
        idProofNumber: user.idProof?.number || '',
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          mobile: user.emergencyContact?.mobile || '',
          relation: user.emergencyContact?.relation || ''
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile.replace(/[^0-9]/g, ''))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    if (formData.pincode && !/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }
    
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
      setProfileLoading(true);
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('mobile', formData.mobile);
      submitData.append('address', formData.address);
      submitData.append('city', formData.city);
      submitData.append('state', formData.state);
      submitData.append('pincode', formData.pincode);
      submitData.append('idProofType', formData.idProofType);
      submitData.append('idProofNumber', formData.idProofNumber);
      submitData.append('emergencyContactName', formData.emergencyContact.name);
      submitData.append('emergencyContactMobile', formData.emergencyContact.mobile);
      submitData.append('emergencyContactRelation', formData.emergencyContact.relation);
      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }

      await api.put('students/profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      await dispatch(checkAuth());
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      await fetchProfile();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Profile update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      setProfileLoading(true);
      await api.put('students/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Password change failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;
    
    setFormData({
      name: user.name || '',
      mobile: user.mobile || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || '',
      idProofType: user.idProof?.type || '',
      idProofNumber: user.idProof?.number || ''
    });
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setErrors({});
  };

  // Early return if user data is not available
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              My <span className="text-indigo-600">Profile</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">View and manage your personal information</p>
          </div>
          
          <button
            onClick={fetchProfile}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all duration-300 font-semibold shadow-sm shadow-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${profileLoading ? 'animate-spin text-indigo-600' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* PERSONAL INFO CARD */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                   <User className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                   <p className="text-slate-500 text-sm">Update your details here</p>
                </div>
             </div>
             {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-indigo-600 hover:shadow-lg transition-all"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-10 border-b border-slate-100">
            <div className="relative group cursor-pointer">
              <img
                src={avatarPreview || user?.avatar || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23f1f5f9" width="200" height="200"/%3E%3Ctext fill="%2394a3b8" font-family="sans-serif" font-size="60" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E👤%3C/text%3E%3C/svg%3E'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg shadow-slate-200"
              />
              {isEditing && (
                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-8 h-8" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
              {isEditing && avatarFile && (
                 <div className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                    <CheckCircle className="w-5 h-5 fill-current" />
                 </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-2xl font-bold text-slate-900">{user?.name || 'Loading...'}</h4>
              <p className="text-slate-500 font-medium">{user?.email || 'Loading...'}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user?.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {user?.isVerified ? 'Verified' : 'Not Verified'}
                 </span>
                 <span className="text-slate-400 text-sm capitalize">{user?.role || 'student'}</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                      !isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 focus:border-indigo-500'
                    } ${errors.name ? 'border-red-300 bg-red-50' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                      !isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 focus:border-indigo-500'
                    } ${errors.mobile ? 'border-red-300 bg-red-50' : ''}`}
                  />
                </div>
                {errors.mobile && <p className="text-red-500 text-xs mt-1 font-medium">{errors.mobile}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 capitalize cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                      !isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                      !isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">State</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                      !isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pincode</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                      !isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 focus:border-indigo-500'
                    } ${errors.pincode ? 'border-red-300 bg-red-50' : ''}`}
                  />
                </div>
                {errors.pincode && <p className="text-red-500 text-xs mt-1 font-medium">{errors.pincode}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ID Proof Type</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <select
                    name="idProofType"
                    value={formData.idProofType}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 appearance-none ${
                      !isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  >
                    <option value="">Select ID Proof</option>
                    <option value="aadhar">Aadhar Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="voter_id">Voter ID</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ID Proof Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="idProofNumber"
                    value={formData.idProofNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                      !isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Emergency Contact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contact Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                        !isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contact Mobile</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      name="emergencyContact.mobile"
                      value={formData.emergencyContact.mobile}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                        !isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Relation</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <select
                      name="emergencyContact.relation"
                      value={formData.emergencyContact.relation}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 appearance-none ${
                        !isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    >
                      <option value="">Select Relation</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="guardian">Guardian</option>
                      <option value="sibling">Sibling</option>
                      <option value="spouse">Spouse</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-indigo-600 disabled:opacity-50 shadow-lg shadow-slate-200 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* ACCOUNT & SECURITY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hostel Info Card */}
            {hostelInfo && (
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Hostel Information</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Hostel</span>
                    <span className="text-slate-900 font-bold">{hostelInfo.hostelName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Room</span>
                    <span className="text-slate-900 font-bold">
                      {hostelInfo.roomNumber ? `Room ${hostelInfo.roomNumber}` : 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Bed</span>
                    <span className="text-slate-900 font-bold">
                      {hostelInfo.bedNumber ? `Bed ${hostelInfo.bedNumber}` : 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Check-in</span>
                    <span className="text-slate-900 font-bold">
                      {hostelInfo.checkInDate ? new Date(hostelInfo.checkInDate).toLocaleDateString() : 'Not Checked In'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      hostelInfo.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {hostelInfo.status || 'Inactive'}
                    </span>
                  </div>
                  {hostelInfo.roomNumber && (
                    <button
                      onClick={() => setShowRoomChangeModal(true)}
                      className="w-full mt-4 px-4 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      Request Room Change
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Account Info Card */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                     <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Account Information</h3>
               </div>
               <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                     <span className="text-slate-500 font-medium">Account Status</span>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user?.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {user?.isVerified ? 'Verified' : 'Not Verified'}
                     </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                     <span className="text-slate-500 font-medium">Member Since</span>
                     <span className="text-slate-900 font-bold">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-slate-500 font-medium">Last Updated</span>
                     <span className="text-slate-900 font-bold">
                        {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                     </span>
                  </div>
               </div>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
               <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-red-100 rounded-lg text-red-600">
                        <Lock className="w-5 h-5" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900">Security Settings</h3>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                     <span className="text-slate-500 font-medium">Password</span>
                     <span className="text-slate-900 font-bold tracking-widest">••••••••</span>
                  </div>
                  <div className="flex justify-end">
                     <button
                       onClick={() => setShowPasswordModal(true)}
                       className="px-5 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
                     >
                       <Lock className="w-4 h-4" />
                       Change Password
                     </button>
                  </div>
               </div>
            </div>
        </div>

        {/* Room Change Modal */}
        {showRoomChangeModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Room Change Request</h3>
                </div>
                <button 
                  onClick={() => setShowRoomChangeModal(false)} 
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Request Room Change</h4>
                  <p className="text-slate-500 text-sm">
                    Current Room: {hostelInfo?.roomNumber}<br/>
                    This will notify the hostel management about your room change request.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRoomChangeModal(false)}
                    className="flex-1 px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Room change request submitted!');
                      setShowRoomChangeModal(false);
                    }}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* PASSWORD MODAL (Styled like common Modal) */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    <Lock className="w-5 h-5" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                 <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                      passwordErrors.currentPassword ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                </div>
                {passwordErrors.currentPassword && <p className="text-red-500 text-xs mt-1 font-medium">{passwordErrors.currentPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                      passwordErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                </div>
                {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1 font-medium">{passwordErrors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                      passwordErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                </div>
                {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{passwordErrors.confirmPassword}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordErrors({});
                  }}
                  className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 disabled:opacity-50 shadow-lg shadow-slate-200"
                >
                  {profileLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;