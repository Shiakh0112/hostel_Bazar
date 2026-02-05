import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import Modal from '../../common/Modal';
import api from '../../../services/api';
import { 
  RefreshCw, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  Filter,
  Edit,
  Trash2,
  User,
  Heart,
  Users,
  MoreVertical,
  X
} from "lucide-react";

const EmergencyContacts = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    primary: 0,
    relationships: {}
  });
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    mobile: '',
    email: '',
    address: '',
    isPrimary: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await api.get('emergency-contacts');
      const contactData = Array.isArray(response.data?.data) ? response.data.data : 
                         Array.isArray(response.data) ? response.data : [];
      setContacts(contactData);
      
      const relationships = {};
      contactData.forEach(contact => {
        relationships[contact.relationship] = (relationships[contact.relationship] || 0) + 1;
      });
      
      setStats({
        total: contactData.length,
        primary: contactData.filter(c => c.isPrimary).length,
        relationships
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch emergency contacts');
      setContacts([]);
      setStats({ total: 0, primary: 0, relationships: {} });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.relationship) {
      errors.relationship = 'Relationship is required';
    }
    
    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile.replace(/[^0-9]/g, ''))) {
      errors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    const existingContact = Array.isArray(contacts) ? contacts.find(contact => 
      contact.mobile === formData.mobile && 
      (!editingContact || contact._id !== editingContact._id)
    ) : null;
    
    if (existingContact) {
      errors.mobile = 'A contact with this mobile number already exists';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      if (editingContact) {
        await api.put(`emergency-contacts/${editingContact._id}`, formData);
        toast.success('Emergency contact updated successfully');
      } else {
        await api.post('emergency-contacts', formData);
        toast.success('Emergency contact added successfully');
      }
      
      await fetchContacts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error(error.response?.data?.message || 'Failed to save emergency contact');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      mobile: contact.mobile,
      email: contact.email || '',
      address: contact.address || '',
      isPrimary: contact.isPrimary
    });
    setShowModal(true);
  };

  const handleDelete = async (contactId) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await api.delete(`emergency-contacts/${contactId}`);
      toast.success('Emergency contact deleted successfully');
      await fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete emergency contact');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      mobile: '',
      email: '',
      address: '',
      isPrimary: false
    });
    setEditingContact(null);
    setFormErrors({});
  };

  const filteredContacts = Array.isArray(contacts) ? contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.mobile.includes(searchTerm) ||
                         (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = !filterRelationship || contact.relationship === filterRelationship;
    
    return matchesSearch && matchesFilter;
  }) : [];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Emergency <span className="text-indigo-600">Contacts</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Manage your emergency contact information</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchContacts}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all duration-300 font-semibold shadow-sm shadow-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-indigo-600 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center gap-2 shadow-lg shadow-slate-200"
            >
              <UserPlus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        </div>

        {/* STATS BENTO GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Total Contacts', count: stats.total, icon: Users, color: 'bg-blue-600', bg: 'bg-white', border: 'border-blue-100' },
            { title: 'Primary Contacts', count: stats.primary, icon: Heart, color: 'bg-rose-600', bg: 'bg-rose-50/50', border: 'border-rose-200' },
            { title: 'Relationship Types', count: Object.keys(stats.relationships).length, icon: Filter, color: 'bg-purple-600', bg: 'bg-purple-50/50', border: 'border-purple-200' },
            { title: 'Parent Contacts', count: stats.relationships.parent || 0, icon: User, color: 'bg-amber-600', bg: 'bg-amber-50/50', border: 'border-amber-200' },
          ].map((stat, idx) => (
            <div key={idx} className={`${stat.bg} p-5 rounded-2xl shadow-sm border ${stat.border} hover:shadow-md transition-shadow`}>
               <div className="flex items-center justify-between gap-4">
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.title}</p>
                    <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{stat.count}</p>
                 </div>
                 <div className={`p-3 rounded-xl text-white shadow-lg shadow-slate-200/50 ${stat.color}`}>
                   <stat.icon className="w-6 h-6" strokeWidth={2.5} />
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* SEARCH & TOOLBAR */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
           <div className="relative w-full md:flex-1">
             <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
             <input
               type="text"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search by name, mobile or email..."
               className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium text-slate-700"
             />
           </div>
           <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
           <div className="relative w-full md:w-64">
             <Filter className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
             <select
               value={filterRelationship}
               onChange={(e) => setFilterRelationship(e.target.value)}
               className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-bold text-slate-700 appearance-none cursor-pointer"
             >
               <option value="">All Relationships</option>
               <option value="parent">Parent</option>
               <option value="guardian">Guardian</option>
               <option value="sibling">Sibling</option>
               <option value="spouse">Spouse</option>
               <option value="friend">Friend</option>
               <option value="relative">Relative</option>
               <option value="other">Other</option>
             </select>
             <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
           </div>
        </div>

        {/* CONTACTS GRID */}
        {loading && (!Array.isArray(contacts) || contacts.length === 0) ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <div key={contact._id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 hover:-translate-y-1 transition-all duration-300 relative">
                 {contact.isPrimary && (
                   <div className="absolute top-6 right-6">
                     <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                       <Heart className="w-3 h-3 fill-current" /> Primary
                     </div>
                   </div>
                 )}
                 
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-2xl shadow-inner">
                       {contact.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-slate-900">{contact.name}</h3>
                       <p className="text-sm text-slate-500 capitalize">{contact.relationship}</p>
                    </div>
                 </div>

                 <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                       <Phone className="w-5 h-5 text-indigo-500" />
                       <span className="text-sm font-medium">{contact.mobile}</span>
                    </div>

                    {contact.email && (
                      <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                         <Mail className="w-5 h-5 text-blue-500" />
                         <span className="text-sm font-medium truncate">{contact.email}</span>
                      </div>
                    )}

                    {contact.address && (
                      <div className="flex items-start gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                         <MapPin className="w-5 h-5 text-rose-500 mt-0.5" />
                         <span className="text-sm font-medium">{contact.address}</span>
                      </div>
                    )}
                 </div>

                 <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-slate-600 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-slate-600 bg-slate-50 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                 </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATES */}
        {Array.isArray(filteredContacts) && filteredContacts.length === 0 && !loading && Array.isArray(contacts) && contacts.length > 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="p-4 bg-slate-100 rounded-full mb-4">
               <Search className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-800">No contacts found</h3>
             <p className="text-slate-500 max-w-xs mx-auto mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {(!Array.isArray(contacts) || contacts.length === 0) && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="p-4 bg-slate-100 rounded-full mb-4">
               <Users className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-800">No emergency contacts</h3>
             <p className="text-slate-500 max-w-xs mx-auto mt-2">Get started by adding your first emergency contact.</p>
          </div>
        )}

      </div>

      {/* ADD/EDIT MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
              <div className="relative">
                 <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                 <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                    formErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {formErrors.name && <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Relationship</label>
               <div className="relative">
                 <Heart className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                 <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 appearance-none cursor-pointer ${
                    formErrors.relationship ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                >
                  <option value="">Select Relationship</option>
                  <option value="parent">Parent</option>
                  <option value="guardian">Guardian</option>
                  <option value="sibling">Sibling</option>
                  <option value="spouse">Spouse</option>
                  <option value="friend">Friend</option>
                  <option value="relative">Relative</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {formErrors.relationship && <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.relationship}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number</label>
              <div className="relative">
                 <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                 <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                    formErrors.mobile ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="1234567890"
                />
              </div>
              {formErrors.mobile && <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.mobile}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <div className="relative">
                 <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                 <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 ${
                    formErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="email@example.com"
                />
              </div>
              {formErrors.email && <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
             <div className="relative">
                 <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                 <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 resize-none"
                  placeholder="Full address..."
                />
              </div>
          </div>

          <div className="flex items-center p-3 bg-indigo-50 rounded-xl border border-indigo-100">
             <input
              type="checkbox"
              name="isPrimary"
              checked={formData.isPrimary}
              onChange={handleInputChange}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
            />
            <label className="ml-3 block text-sm font-bold text-slate-900">
              Set as primary contact
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 disabled:opacity-50 shadow-lg shadow-slate-200"
            >
              {loading ? 'Saving...' : editingContact ? 'Update' : 'Add'} Contact
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmergencyContacts;