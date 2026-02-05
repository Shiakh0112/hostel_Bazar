import { formatDate } from '../../utils/formatDate';
import { formatPrice } from '../../utils/priceFormatter';

const BookingStatus = ({ booking }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved - Payment Required';
      case 'confirmed': return 'Confirmed';
      case 'rejected': return 'Rejected';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {booking.hostel?.name}
          </h3>
          <p className="text-gray-600">
            {booking.hostel?.address?.area}, {booking.hostel?.address?.city}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
          {getStatusText(booking.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Check-in Date</p>
          <p className="font-medium">{formatDate(booking.bookingDetails?.checkInDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Expected Check-out</p>
          <p className="font-medium">{formatDate(booking.bookingDetails?.expectedCheckOutDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Room Type</p>
          <p className="font-medium capitalize">{booking.bookingDetails?.preferredRoomType}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Monthly Rent</p>
          <p className="font-medium">{formatPrice(booking.hostel?.pricing?.monthlyRent)}</p>
        </div>
      </div>

      {booking.advancePayment && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Advance Payment</p>
              <p className="font-medium">{formatPrice(booking.advancePayment.amount)}</p>
            </div>
            <span className={`px-2 py-1 rounded text-sm ${
              booking.advancePayment.status === 'paid' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {booking.advancePayment.status === 'paid' ? 'Paid' : 'Pending'}
            </span>
          </div>
        </div>
      )}

      {booking.rejectionReason && (
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">Rejection Reason</p>
          <p className="text-red-600">{booking.rejectionReason}</p>
        </div>
      )}

      {(booking.allocatedRoom || booking.allocatedBed) && (
        <div className="border-t pt-4 bg-green-50 p-4 rounded">
          <p className="text-sm font-semibold text-green-800 mb-2">✅ Room Allocated</p>
          <div className="space-y-1">
            {booking.allocatedRoom && (
              <p className="font-medium text-gray-900">
                Room: {booking.allocatedRoom.roomNumber || 'Assigned'}
              </p>
            )}
            {booking.allocatedBed && (
              <p className="font-medium text-gray-900">
                Bed: {booking.allocatedBed.bedNumber || 'Assigned'}
              </p>
            )}
            {booking.actualCheckIn && (
              <p className="text-sm text-gray-600">
                Check-in: {formatDate(booking.actualCheckIn)}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="border-t pt-4 text-sm text-gray-500">
        <p>Booking ID: {booking._id}</p>
        <p>Requested on: {formatDate(booking.createdAt)}</p>
      </div>
    </div>
  );
};

export default BookingStatus;