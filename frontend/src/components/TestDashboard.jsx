import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const TestDashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">🧪 Dashboard Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">✅ Route Information:</h3>
          <p><strong>Current Path:</strong> {location.pathname}</p>
          <p><strong>Search:</strong> {location.search || 'None'}</p>
        </div>

        <div className="p-4 bg-green-50 rounded">
          <h3 className="font-semibold mb-2">✅ Authentication Status:</h3>
          <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes ✓' : 'No ✗'}</p>
          <p><strong>User Role:</strong> {user?.role || 'Not logged in'}</p>
          <p><strong>User Name:</strong> {user?.name || 'N/A'}</p>
          <p><strong>User Email:</strong> {user?.email || 'N/A'}</p>
        </div>

        <div className="p-4 bg-yellow-50 rounded">
          <h3 className="font-semibold mb-2">✅ Expected Behavior:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>You should see this page with all details above</li>
            <li>Current path should be /dashboard/{user?.role || 'role'}</li>
            <li>Is Authenticated should be "Yes"</li>
            <li>User details should be filled</li>
          </ul>
        </div>

        <div className="p-4 bg-purple-50 rounded">
          <h3 className="font-semibold mb-2">🔗 Quick Navigation Test:</h3>
          <div className="space-x-2">
            <a href="/dashboard/owner" className="text-blue-600 underline">Test Owner Route</a>
            <a href="/dashboard/student" className="text-blue-600 underline">Test Student Route</a>
            <a href="/dashboard/staff" className="text-blue-600 underline">Test Staff Route</a>
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded">
          <h3 className="font-semibold mb-2">⚠️ If you see "Page Not Found" instead:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Routes are not matching properly</li>
            <li>Check browser console (F12) for errors</li>
            <li>Verify token exists in localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;