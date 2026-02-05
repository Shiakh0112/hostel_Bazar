import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const BookingManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    confirmed: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('staff/booking-requests');
      const bookingData = Array.isArray(response.data?.data) ? response.data.data : 
                         Array.isArray(response.data) ? response.data : [];
      setBookings(bookingData);
      
      // Calculate statistics
      const statistics = {
        total: bookingData.length,
        pending: bookingData.filter(b => b.status === 'pending').length,
        approved: bookingData.filter(b => b.status === 'approved').length,
        confirmed: bookingData.filter(b => b.status === 'confirmed').length,
        rejected: bookingData.filter(b => b.status === 'rejected').length
      };
      setStats(statistics);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch booking requests');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status, reason = '') => {
    try {
      let endpoint;
      let payload = {};
      
      switch(status) {
        case 'approve':
          endpoint = `bookings/${bookingId}/approve`;
          break;
        case 'reject':
          endpoint = `bookings/${bookingId}/reject`;
          payload = { reason };
          break;
        case 'confirm':
          endpoint = `bookings/${bookingId}/confirm`;
          break;
        default:
          throw new Error('Invalid status');
      }
      
      await api.put(endpoint, payload);
      toast.success(`Booking ${status}d successfully`);
      await fetchBookings();
    } catch (error) {
      console.error(`Error ${status} booking:`, error);
      toast.error(`Failed to ${status} booking`);
    }
  };

  const filteredBookings = Array.isArray(bookings) ? bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = booking.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.hostel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.student?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Manage student booking requests</p>
        </div>
        <button
          onClick={fetchBookings}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
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
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Bookings
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, email, or hostel..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hostel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.student?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.student?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.hostel?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{booking.hostel?.address || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'approve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'reject', 'Staff review')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {booking.status === 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'confirm')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Confirm
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
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

      {filteredBookings.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No booking requests</h3>
          <p className="mt-1 text-sm text-gray-500">No booking requests match your current filters.</p>
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                  <div className="bg-gray-50 p-3 rounded-md space-y-1">
                    <p><span className="font-medium">Name:</span> {selectedBooking.student?.name || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedBooking.student?.email || 'N/A'}</p>
                    <p><span className="font-medium">Mobile:</span> {selectedBooking.student?.mobile || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Hostel Information</h4>
                  <div className="bg-gray-50 p-3 rounded-md space-y-1">
                    <p><span className="font-medium">Name:</span> {selectedBooking.hostel?.name || 'N/A'}</p>
                    <p><span className="font-medium">Address:</span> {selectedBooking.hostel?.address || 'N/A'}</p>
                    <p><span className="font-medium">Monthly Rent:</span> ₹{selectedBooking.hostel?.pricing?.monthlyRent || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Check-in Date:</span> {selectedBooking.checkInDate ? new Date(selectedBooking.checkInDate).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="font-medium">Created:</span> {new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
                    <p><span className="font-medium">Advance Payment:</span> ₹{selectedBooking.advancePayment?.amount || 0}</p>
                  </div>
                  
                  {selectedBooking.bookingDetails && (
                    <div className="mt-3">
                      <p className="font-medium mb-1">Additional Details:</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        {selectedBooking.bookingDetails.fullName && <p>Full Name: {selectedBooking.bookingDetails.fullName}</p>}
                        {selectedBooking.bookingDetails.guardianName && <p>Guardian: {selectedBooking.bookingDetails.guardianName}</p>}
                        {selectedBooking.bookingDetails.guardianMobile && <p>Guardian Mobile: {selectedBooking.bookingDetails.guardianMobile}</p>}
                        {selectedBooking.bookingDetails.address && <p>Address: {selectedBooking.bookingDetails.address}</p>}
                        {selectedBooking.bookingDetails.emergencyContact && <p>Emergency Contact: {selectedBooking.bookingDetails.emergencyContact}</p>}
                      </div>
                    </div>
                  )}
                  
                  {selectedBooking.allocatedRoom && (
                    <div className="mt-3 p-2 bg-green-50 rounded">
                      <p className="font-medium text-green-800">Room Allocated:</p>
                      <p className="text-green-700">Room {selectedBooking.allocatedRoom.roomNumber}, Floor {selectedBooking.allocatedRoom.floorNumber}</p>
                      {selectedBooking.allocatedBed && <p className="text-green-700">Bed {selectedBooking.allocatedBed.bedNumber}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;