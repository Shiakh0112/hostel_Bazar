import { formatDate } from '../../utils/formatDate';

const MaintenanceList = ({ requests, onStatusUpdate, userRole }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      case 'urgent': return 'text-red-800 font-bold';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'electrical': return '⚡';
      case 'plumbing': return '🚰';
      case 'furniture': return '🪑';
      case 'cleaning': return '🧹';
      case 'ac_heating': return '❄️';
      case 'internet': return '📶';
      case 'security': return '🔒';
      default: return '🔧';
    }
  };

  if (!requests?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No maintenance requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getCategoryIcon(request.category)}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                <p className="text-sm text-gray-600">
                  Ticket: {request.ticketNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-sm font-medium capitalize ${getPriorityColor(request.priority || 'medium')}`}>
                {request.priority || 'medium'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status || 'pending')}`}>
                {(request.status || 'pending').replace('_', ' ')}
              </span>
            </div>
          </div>

          <p className="text-gray-700 mb-4">{request.description}</p>

          {request.images?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Images:</p>
              <div className="flex space-x-2">
                {request.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Issue ${index + 1}`}
                    className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                    onClick={() => window.open(image, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-600">Category</p>
              <p className="font-medium capitalize">{(request.category || 'other').replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-600">Created</p>
              <p className="font-medium">{formatDate(request.createdAt)}</p>
            </div>
            {request.assignedTo && (
              <div>
                <p className="text-gray-600">Assigned To</p>
                <p className="font-medium">{request.assignedTo.name}</p>
              </div>
            )}
          </div>

          {request.estimatedCost && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">Estimated Cost</p>
              <p className="font-medium">₹{request.estimatedCost}</p>
            </div>
          )}

          {request.actualCost && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">Actual Cost</p>
              <p className="font-medium">₹{request.actualCost}</p>
            </div>
          )}

          {request.notes?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Notes:</p>
              <div className="space-y-2">
                {request.notes.map((note, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">{note.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {note.user?.name || 'Staff'} - {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {request.rating && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Rating:</p>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${star <= request.rating.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">({request.rating.rating}/5)</span>
              </div>
              {request.rating.feedback && (
                <p className="text-sm text-gray-600 mt-1">{request.rating.feedback}</p>
              )}
            </div>
          )}

          {/* Action buttons based on user role and status */}
          {userRole === 'owner' && request.status === 'pending' && (
            <div className="flex space-x-2">
              <button
                onClick={() => onStatusUpdate?.(request._id, 'assign')}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Assign Staff
              </button>
            </div>
          )}

          {userRole === 'staff' && (
            <div className="flex flex-wrap gap-2">
              {/* Available task - staff can take it */}
              {request.status === 'pending' && !request.assignedTo && (
                <button
                  onClick={() => onStatusUpdate?.(request._id, 'take_task')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Take Task
                </button>
              )}
              
              {/* Assigned to staff - can start */}
              {request.status === 'assigned' && (
                <>
                  <button
                    onClick={() => onStatusUpdate?.(request._id, 'start')}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                  >
                    Start Work
                  </button>
                  <button
                    onClick={() => onStatusUpdate?.(request._id, 'reject')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}
              
              {/* In progress - can complete */}
              {request.status === 'in_progress' && (
                <>
                  <button
                    onClick={() => onStatusUpdate?.(request._id, 'complete')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => onStatusUpdate?.(request._id, 'pause')}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    Pause
                  </button>
                </>
              )}
              
              {/* Add note and message buttons for all active tasks */}
              {['assigned', 'in_progress'].includes(request.status) && (
                <>
                  <button
                    onClick={() => onStatusUpdate?.(request._id, 'add_note')}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Add Note
                  </button>
                  <button
                    onClick={() => onStatusUpdate?.(request._id, 'message_student')}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                  >
                    Message Student
                  </button>
                </>
              )}
            </div>
          )}

          {userRole === 'student' && request.status === 'completed' && !request.rating && (
            <button
              onClick={() => onStatusUpdate?.(request._id, 'rate')}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              Rate Service
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MaintenanceList;