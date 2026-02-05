import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const RoomTransferManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const response = await api.get('room-transfers/requests');
      const transferData = Array.isArray(response.data?.data) ? response.data.data : 
                          Array.isArray(response.data) ? response.data : [];
      setTransfers(transferData);
      
      // Calculate statistics
      const statistics = {
        total: transferData.length,
        pending: transferData.filter(t => t.status === 'pending').length,
        approved: transferData.filter(t => t.status === 'approved').length,
        completed: transferData.filter(t => t.status === 'completed').length,
        rejected: transferData.filter(t => t.status === 'rejected').length
      };
      setStats(statistics);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('Failed to fetch room transfer requests');
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferAction = async (transferId, action) => {
    try {
      let endpoint = '';
      let payload = {};

      switch (action) {
        case 'approve':
          endpoint = `room-transfers/${transferId}/approve`;
          break;
        case 'complete':
          endpoint = `room-transfers/${transferId}/complete`;
          break;
        case 'reject':
          const reason = prompt('Enter rejection reason:');
          if (!reason) return;
          endpoint = `room-transfers/${transferId}/reject`;
          payload = { rejectionReason: reason };
          break;
        default:
          return;
      }

      await api.put(endpoint, payload);
      toast.success(`Transfer ${action}d successfully`);
      await fetchTransfers();
    } catch (error) {
      console.error('Error handling transfer:', error);
      toast.error(`Failed to ${action} transfer`);
    }
  };

  const filteredTransfers = Array.isArray(transfers) ? transfers.filter(transfer => {
    return filter === 'all' || transfer.status === filter;
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Transfer Management</h1>
          <p className="text-gray-600">Manage student room transfer requests</p>
        </div>
        <button
          onClick={fetchTransfers}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
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
              <option value="rejected">Rejected ({stats.rejected})</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredTransfers.length} of {stats.total} requests
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
                    Current Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Requested Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransfers.map((transfer) => (
                  <tr key={transfer._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transfer.booking?.student?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transfer.booking?.student?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Room {transfer.currentRoom?.roomNumber || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Bed {transfer.currentBed?.bedNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transfer.requestedRoom ? 
                          `Room ${transfer.requestedRoom?.roomNumber}` :
                          'Any Available'
                        }
                      </div>
                      {transfer.requestedBed && (
                        <div className="text-sm text-gray-500">
                          Bed {transfer.requestedBed?.bedNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(transfer.priority)}`}>
                        {transfer.priority || 'medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transfer.status)}`}>
                        {transfer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {transfer.reason || 'No reason provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {transfer.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleTransferAction(transfer._id, 'approve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleTransferAction(transfer._id, 'reject')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {transfer.status === 'approved' && (
                          <button
                            onClick={() => handleTransferAction(transfer._id, 'complete')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedTransfer(transfer);
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

      {filteredTransfers.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transfer requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter !== 'all' ? 'No transfer requests match your current filter.' : 'No room transfer requests to manage at this time.'}
          </p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Room Transfer Request Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTransfer(null);
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
                      <span className="font-medium">{selectedTransfer.booking?.student?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedTransfer.booking?.student?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mobile:</span>
                      <span className="font-medium">{selectedTransfer.booking?.student?.mobile || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Transfer Details</h4>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedTransfer.priority)}`}>
                        {selectedTransfer.priority || 'medium'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTransfer.status)}`}>
                        {selectedTransfer.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requested:</span>
                      <span className="font-medium">
                        {selectedTransfer.createdAt ? new Date(selectedTransfer.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Current Room</h4>
                  <div className="bg-blue-50 p-4 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">Room {selectedTransfer.currentRoom?.roomNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bed:</span>
                      <span className="font-medium">Bed {selectedTransfer.currentBed?.bedNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Floor:</span>
                      <span className="font-medium">{selectedTransfer.currentRoom?.floor || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Requested Room</h4>
                  <div className="bg-green-50 p-4 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">
                        {selectedTransfer.requestedRoom ? 
                          `Room ${selectedTransfer.requestedRoom.roomNumber}` : 
                          'Any Available Room'
                        }
                      </span>
                    </div>
                    {selectedTransfer.requestedBed && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bed:</span>
                        <span className="font-medium">Bed {selectedTransfer.requestedBed.bedNumber}</span>
                      </div>
                    )}
                    {selectedTransfer.requestedRoom?.floor && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Floor:</span>
                        <span className="font-medium">{selectedTransfer.requestedRoom.floor}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Transfer Reason</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700">{selectedTransfer.reason || 'No reason provided'}</p>
                </div>
              </div>
              
              {selectedTransfer.rejectionReason && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Rejection Reason</h4>
                  <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-red-700">{selectedTransfer.rejectionReason}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="space-x-2">
                  {selectedTransfer.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleTransferAction(selectedTransfer._id, 'approve');
                          setShowDetailsModal(false);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Approve Transfer
                      </button>
                      <button
                        onClick={() => {
                          handleTransferAction(selectedTransfer._id, 'reject');
                          setShowDetailsModal(false);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      >
                        Reject Transfer
                      </button>
                    </>
                  )}
                  {selectedTransfer.status === 'approved' && (
                    <button
                      onClick={() => {
                        handleTransferAction(selectedTransfer._id, 'complete');
                        setShowDetailsModal(false);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Complete Transfer
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedTransfer(null);
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

export default RoomTransferManagement;