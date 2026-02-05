import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Modal from '../../common/Modal';

const SystemManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [backups, setBackups] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [smsData, setSmsData] = useState({
    message: '',
    userRole: '',
    recipients: []
  });

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'backups') fetchBackups();
    if (activeTab === 'system') fetchSystemStats();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/system/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/system/backup/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBackups(data.data);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/system/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSystemStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUserOperation = async (operation) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    try {
      const response = await fetch('/api/system/users/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          operation,
          userIds: selectedUsers
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchUsers();
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/system/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type: 'manual' })
      });

      const data = await response.json();
      if (data.success) {
        await fetchBackups();
      }
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulkSMS = async () => {
    try {
      const response = await fetch('/api/system/sms/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(smsData)
      });

      const data = await response.json();
      if (data.success) {
        setShowSMSModal(false);
        setSmsData({ message: '', userRole: '', recipients: [] });
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Management</h1>
          <p className="text-gray-600">Manage users, backups, and system operations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSMSModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Send Bulk SMS
          </button>
          {activeTab === 'backups' && (
            <button
              onClick={handleCreateBackup}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Create Backup
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'users', label: 'User Management' },
              { id: 'backups', label: 'Data Backups' },
              { id: 'system', label: 'System Statistics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-4">
              {selectedUsers.length > 0 && (
                <div className="flex space-x-3 p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-800">
                    {selectedUsers.length} users selected
                  </span>
                  <button
                    onClick={() => handleBulkUserOperation('activate')}
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkUserOperation('deactivate')}
                    className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkUserOperation('delete')}
                    className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users.map(u => u._id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user._id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{backups.length}</div>
                  <div className="text-sm text-gray-600">Total Backups</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {backups.length > 0 ? new Date(backups[0].created).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Last Backup</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {backups.reduce((sum, backup) => sum + backup.size, 0) / (1024 * 1024) || 0} MB
                  </div>
                  <div className="text-sm text-gray-600">Total Size</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Filename
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backups.map((backup) => (
                      <tr key={backup.filename}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {backup.filename}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {backup.sizeFormatted}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(backup.created).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            Restore
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{systemStats.users?.total || 0}</div>
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="text-xs text-gray-500 mt-1">
                  {systemStats.users?.active || 0} active
                </div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{systemStats.bookings?.total || 0}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
                <div className="text-xs text-gray-500 mt-1">
                  {systemStats.bookings?.active || 0} active
                </div>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ₹{systemStats.revenue?.total?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">99.9%</div>
                <div className="text-sm text-gray-600">System Uptime</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk SMS Modal */}
      <Modal
        isOpen={showSMSModal}
        onClose={() => setShowSMSModal(false)}
        title="Send Bulk SMS"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Users
            </label>
            <select
              value={smsData.userRole}
              onChange={(e) => setSmsData({...smsData, userRole: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select user type</option>
              <option value="student">All Students</option>
              <option value="owner">All Owners</option>
              <option value="staff">All Staff</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              value={smsData.message}
              onChange={(e) => setSmsData({...smsData, message: e.target.value})}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your message here..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowSMSModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSendBulkSMS}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Send SMS
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SystemManagement;