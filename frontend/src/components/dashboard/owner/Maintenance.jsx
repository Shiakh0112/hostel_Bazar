import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOwnerMaintenanceRequests } from '../../../app/slices/maintenanceSlice';
import Loader from '../../common/Loader';

const Maintenance = () => {
  const dispatch = useDispatch();
  const { ownerRequests, isLoading } = useSelector((state) => state.maintenance);

  useEffect(() => {
    dispatch(getOwnerMaintenanceRequests());
  }, [dispatch]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
        <p className="text-gray-600">Manage maintenance requests from your hostels</p>
      </div>

      {ownerRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Maintenance Requests</h3>
          <p className="text-gray-600">There are no maintenance requests at the moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ownerRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{request.title}</div>
                    <div className="text-sm text-gray-500">{request.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{request.student?.name}</div>
                    <div className="text-sm text-gray-500">{request.student?.mobile}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Room {request.room?.roomNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.priority === 'high' ? 'bg-red-100 text-red-800' :
                      request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.status === 'completed' ? 'bg-green-100 text-green-800' :
                      request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'assigned' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Maintenance;