import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Shield, Bell, FileText, CreditCard } from "lucide-react";

const StaffForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    name: initialData.name || "",
    email: initialData.email || "",
    mobile: initialData.mobile || "",
    alternatePhone: initialData.alternatePhone || "",
    dateOfBirth: initialData.dateOfBirth || "",
    gender: initialData.gender || "",
    bloodGroup: initialData.bloodGroup || "",
    
    // Address
    address: initialData.address || "",
    city: initialData.city || "",
    state: initialData.state || "",
    pincode: initialData.pincode || "",
    
    // Emergency Contact (Assignment Requirement)
    emergencyContactName: initialData.emergencyContactName || "",
    emergencyContactNumber: initialData.emergencyContactNumber || "",
    emergencyContactRelation: initialData.emergencyContactRelation || "",
    
    // Professional Details
    staffId: initialData.staffId || "",
    designation: initialData.designation || "",
    department: initialData.department || "",
    role: initialData.role || "staff",
    joiningDate: initialData.joiningDate || "",
    workShift: initialData.workShift || "",
    salary: initialData.salary || "",
    
    // Qualifications
    qualification: initialData.qualification || "",
    experience: initialData.experience || "",
    previousEmployer: initialData.previousEmployer || "",
    
    // Documents
    aadharNumber: initialData.aadharNumber || "",
    panNumber: initialData.panNumber || "",
    
    // Role-Based Permissions (Assignment: User Roles & Permissions)
    canManageMaintenance: initialData.canManageMaintenance || false,
    canManageRooms: initialData.canManageRooms || false,
    canViewReports: initialData.canViewReports || false,
    canProcessPayments: initialData.canProcessPayments || false,
    
    // Notification Preferences (Assignment: Notifications & Alerts)
    emailNotifications: initialData.emailNotifications !== undefined ? initialData.emailNotifications : true,
    smsNotifications: initialData.smsNotifications || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile) {
      alert("Please fill all required fields");
      return;
    }
    onSubmit(formData);
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 backdrop-blur transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
  const sectionClass = "space-y-4 p-6 bg-white/40 backdrop-blur rounded-2xl border border-white/60";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
      {/* Personal Information */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Staff ID</label>
            <input type="text" name="staffId" value={formData.staffId} onChange={handleChange} className={inputClass} placeholder="AUTO-GENERATED" />
          </div>
          <div>
            <label className={labelClass}>Date of Birth</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Blood Group</label>
            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className={inputClass}>
              <option value="">Select</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">Contact Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Mobile *</label>
            <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Alternate Phone</label>
            <input type="tel" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} className={inputClass} rows="2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>City</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input type="text" name="state" value={formData.state} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Pincode</label>
            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Emergency Contact (Assignment Requirement) */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-bold text-slate-800">Emergency Contact</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Contact Name</label>
            <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Contact Number</label>
            <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Relation</label>
            <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleChange} className={inputClass} placeholder="Father, Mother, Spouse" />
          </div>
        </div>
      </div>

      {/* Professional Details */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">Professional Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Role *</label>
            <select name="role" value={formData.role} onChange={handleChange} className={inputClass} required>
              <option value="staff">General Staff</option>
              <option value="maintenance">Maintenance Staff</option>
              <option value="security">Security</option>
              <option value="housekeeping">Housekeeping</option>
              <option value="reception">Reception</option>
              <option value="accounts">Accounts</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Designation</label>
            <input type="text" name="designation" value={formData.designation} onChange={handleChange} className={inputClass} placeholder="Manager, Supervisor" />
          </div>
          <div>
            <label className={labelClass}>Department</label>
            <select name="department" value={formData.department} onChange={handleChange} className={inputClass}>
              <option value="">Select</option>
              <option value="management">Management</option>
              <option value="maintenance">Maintenance</option>
              <option value="housekeeping">Housekeeping</option>
              <option value="security">Security</option>
              <option value="reception">Reception</option>
              <option value="accounts">Accounts</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Work Shift</label>
            <select name="workShift" value={formData.workShift} onChange={handleChange} className={inputClass}>
              <option value="">Select</option>
              <option value="morning">Morning (6 AM - 2 PM)</option>
              <option value="afternoon">Afternoon (2 PM - 10 PM)</option>
              <option value="night">Night (10 PM - 6 AM)</option>
              <option value="general">General (9 AM - 6 PM)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Joining Date</label>
            <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Salary (₹/month)</label>
            <input type="number" name="salary" value={formData.salary} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Qualification</label>
            <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className={inputClass} placeholder="B.Tech, MBA" />
          </div>
          <div>
            <label className={labelClass}>Experience (Years)</label>
            <input type="number" name="experience" value={formData.experience} onChange={handleChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Previous Employer</label>
            <input type="text" name="previousEmployer" value={formData.previousEmployer} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">Documents</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Aadhar Number</label>
            <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} className={inputClass} placeholder="XXXX-XXXX-XXXX" />
          </div>
          <div>
            <label className={labelClass}>PAN Number</label>
            <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} className={inputClass} placeholder="ABCDE1234F" />
          </div>
        </div>
      </div>

      {/* Permissions (Assignment: User Roles & Permissions) */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">Permissions & Access</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3 bg-white/60 rounded-xl cursor-pointer hover:bg-white/80 transition-all">
            <input type="checkbox" name="canManageMaintenance" checked={formData.canManageMaintenance} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm font-medium text-slate-700">Manage Maintenance Requests</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-white/60 rounded-xl cursor-pointer hover:bg-white/80 transition-all">
            <input type="checkbox" name="canManageRooms" checked={formData.canManageRooms} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm font-medium text-slate-700">Manage Room Allocation</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-white/60 rounded-xl cursor-pointer hover:bg-white/80 transition-all">
            <input type="checkbox" name="canViewReports" checked={formData.canViewReports} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm font-medium text-slate-700">View Financial Reports</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-white/60 rounded-xl cursor-pointer hover:bg-white/80 transition-all">
            <input type="checkbox" name="canProcessPayments" checked={formData.canProcessPayments} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm font-medium text-slate-700">Process Payments & Billing</span>
          </label>
        </div>
      </div>

      {/* Notification Preferences (Assignment: Notifications & Alerts) */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">Notification Preferences</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3 bg-white/60 rounded-xl cursor-pointer hover:bg-white/80 transition-all">
            <input type="checkbox" name="emailNotifications" checked={formData.emailNotifications} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm font-medium text-slate-700">Email Notifications</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-white/60 rounded-xl cursor-pointer hover:bg-white/80 transition-all">
            <input type="checkbox" name="smsNotifications" checked={formData.smsNotifications} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm font-medium text-slate-700">SMS Notifications</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white/90 backdrop-blur p-4 -mx-2 rounded-xl">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg hover:shadow-xl"
        >
          Continue to Hostel Assignment
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default StaffForm;
