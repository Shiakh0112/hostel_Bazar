import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const CheckoutManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [checkouts, setCheckouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [damageAssessment, setDamageAssessment] = useState({
    damages: [],
    notes: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0
  });

  useEffect(() => {
    fetchCheckouts();
  }, []);

  const fetchCheckouts = async () => {
    setLoading(true);
    try {
      const response = await api.get('checkout/requests');
      const checkoutData = Array.isArray(response.data?.data) ? response.data.data : 
                          Array.isArray(response.data) ? response.data : [];
      setCheckouts(checkoutData);
      
      // Calculate statistics
      const statistics = {
        total: checkoutData.length,
        pending: checkoutData.filter(c => c.status === 'pending').length,
        approved: checkoutData.filter(c => c.status === 'approved').length,
        completed: checkoutData.filter(c => c.status === 'completed').length
      };
      setStats(statistics);
    } catch (error) {
      console.error('Error fetching checkouts:', error);
      toast.error('Failed to fetch checkout requests');
      setCheckouts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDamageAssessment = async (checkoutId) => {
    try {
      await api.put(`checkout/${checkoutId}/assess`, damageAssessment);
      toast.success('Damage assessment completed successfully');
      await fetchCheckouts();
      setSelectedCheckout(null);
      setDamageAssessment({ damages: [], notes: '' });
    } catch (error) {
      console.error('Error conducting assessment:', error);
      toast.error('Failed to complete damage assessment');
    }
  };

  const addDamage = () => {
    setDamageAssessment(prev => ({
      ...prev,
      damages: [...prev.damages, { item: '', description: '', cost: 0 }]
    }));
  };

  const updateDamage = (index, field, value) => {
    setDamageAssessment(prev => ({
      ...prev,
      damages: prev.damages.map((damage, i) => 
        i === index ? { ...damage, [field]: value } : damage
      )
    }));
  };

  const removeDamage = (index) => {
    setDamageAssessment(prev => ({
      ...prev,
      damages: prev.damages.filter((_, i) => i !== index)
    }));
  };

  const filteredCheckouts = Array.isArray(checkouts) ? checkouts.filter(checkout => {
    return filter === 'all' || checkout.status === filter;
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout Management</h1>
          <p className="text-gray-600">Manage student checkout requests and damage assessments</p>
        </div>
        <button
          onClick={fetchCheckouts}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Requests ({stats.total})</option>
              <option value="pending">Pending ({stats.pending})</option>
              <option value="approved">Approved ({stats.approved})</option>
              <option value="completed">Completed ({stats.completed})</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredCheckouts.length} of {stats.total} requests
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Checkout Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCheckouts.map((checkout) => (
                  <tr key={checkout._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {checkout.booking?.student?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {checkout.booking?.student?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Room {checkout.room?.roomNumber || 'N/A'} - Bed {checkout.bed?.bedNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {checkout.checkoutDate ? new Date(checkout.checkoutDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(checkout.status)}`}>
                        {checkout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {checkout.status === 'approved' && (
                          <button
                            onClick={() => setSelectedCheckout(checkout)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Assess Damage
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedCheckout(checkout);
                            setShowDetailsModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Damage Assessment Modal */}
      {selectedCheckout && !showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Damage Assessment - Room {selectedCheckout.room?.roomNumber || 'N/A'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Damages Found
                </label>
                {damageAssessment.damages.map((damage, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Item"
                      value={damage.item}
                      onChange={(e) => updateDamage(index, 'item', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={damage.description}
                      onChange={(e) => updateDamage(index, 'description', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Cost"
                      value={damage.cost}
                      onChange={(e) => updateDamage(index, 'cost', parseFloat(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={() => removeDamage(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addDamage}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Add Damage
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Notes
                </label>
                <textarea
                  value={damageAssessment.notes}
                  onChange={(e) => setDamageAssessment(prev => ({...prev, notes: e.target.value}))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter assessment notes..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedCheckout(null);
                    setDamageAssessment({ damages: [], notes: '' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDamageAssessment(selectedCheckout._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Complete Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Checkout Request Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedCheckout(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Student Information</h4>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedCheckout.booking?.student?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedCheckout.booking?.student?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mobile:</span>
                      <span className="font-medium">{selectedCheckout.booking?.student?.mobile || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Room Information</h4>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">Room {selectedCheckout.room?.roomNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bed:</span>
                      <span className="font-medium">Bed {selectedCheckout.bed?.bedNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Floor:</span>
                      <span className="font-medium">{selectedCheckout.room?.floor || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Checkout Details</h4>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCheckout.status)}`}>
                      {selectedCheckout.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Checkout Date:</span>
                    <span className="font-medium">
                      {selectedCheckout.checkoutDate ? new Date(selectedCheckout.checkoutDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requested:</span>
                    <span className="font-medium">
                      {selectedCheckout.createdAt ? new Date(selectedCheckout.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {selectedCheckout.reason && (
                    <div className="mt-3">
                      <span className="text-gray-600">Reason:</span>
                      <p className="mt-1 text-gray-900">{selectedCheckout.reason}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedCheckout.damageAssessment && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Damage Assessment</h4>
                  <div className="bg-red-50 p-4 rounded-md">
                    {selectedCheckout.damageAssessment.damages?.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCheckout.damageAssessment.damages.map((damage, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{damage.item} - {damage.description}</span>
                            <span className="font-medium text-red-600">₹{damage.cost}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-medium">
                            <span>Total Damage Cost:</span>
                            <span className="text-red-600">
                              ₹{selectedCheckout.damageAssessment.damages.reduce((sum, d) => sum + d.cost, 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-green-600">No damages found</p>
                    )}
                    {selectedCheckout.damageAssessment.notes && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">Notes: {selectedCheckout.damageAssessment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="space-x-2">
                  {selectedCheckout.status === 'approved' && (
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        // Keep selectedCheckout for damage assessment modal
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Assess Damage
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedCheckout(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutManagement;