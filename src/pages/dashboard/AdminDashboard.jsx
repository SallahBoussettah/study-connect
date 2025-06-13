import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaUserGraduate, FaBook, FaChartLine, FaServer, FaExclamationTriangle, FaCog, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { currentUser, api } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminData, setAdminData] = useState({
    stats: {
      totalUsers: 0,
      newUsersToday: 0,
      activeUsers: 0,
      activePercentage: 0,
      totalResources: 0,
      totalStudyRooms: 0,
      activeStudyRooms: 0,
      storageUsed: '0 GB',
      totalStorage: '0 GB'
    },
    recentUsers: [],
    systemAlerts: []
  });
  
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/admin');
        if (response.data.success) {
          setAdminData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to load admin dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, [api]);
  
  const { stats, recentUsers, systemAlerts } = adminData;
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
        <p className="text-secondary-600 mt-1">
          Manage users, monitor platform activity, and review system performance.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <FaUsers />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Total Users</p>
                  <h3 className="text-2xl font-bold text-secondary-900">{stats.totalUsers}</h3>
                  <p className="text-xs text-green-600">+{stats.newUsersToday} today</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                  <FaUserGraduate />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Active Users</p>
                  <h3 className="text-2xl font-bold text-secondary-900">{stats.activeUsers}</h3>
                  <p className="text-xs text-secondary-500">{stats.activePercentage}% of total</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <FaBook />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Total Resources</p>
                  <h3 className="text-2xl font-bold text-secondary-900">{stats.totalResources}</h3>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mb-6 border-b border-secondary-200">
            <div className="flex space-x-8">
              <button
                className={`py-4 px-1 font-medium text-sm focus:outline-none ${
                  activeTab === 'overview'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`py-4 px-1 font-medium text-sm focus:outline-none ${
                  activeTab === 'users'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
                onClick={() => setActiveTab('users')}
              >
                Users
              </button>
              <button
                className={`py-4 px-1 font-medium text-sm focus:outline-none ${
                  activeTab === 'groups'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
                onClick={() => setActiveTab('groups')}
              >
                Groups
              </button>
              <button
                className={`py-4 px-1 font-medium text-sm focus:outline-none ${
                  activeTab === 'resources'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
                onClick={() => setActiveTab('resources')}
              >
                Resources
              </button>
              <button
                className={`py-4 px-1 font-medium text-sm focus:outline-none ${
                  activeTab === 'system'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
                onClick={() => setActiveTab('system')}
              >
                System
              </button>
            </div>
          </div>
          
          {activeTab === 'overview' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-secondary-900">Platform Overview</h2>
                <select 
                  className="border border-secondary-300 rounded-md text-secondary-700 text-sm py-2 px-3"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="year">Last year</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-secondary-200">
                    <h3 className="text-md font-medium text-secondary-900">Recent User Registrations</h3>
                  </div>
                  <div className="p-6 h-64 flex items-center justify-center">
                    <p className="text-secondary-500">User growth chart will be displayed here</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-secondary-200">
                    <h3 className="text-md font-medium text-secondary-900">Resource Usage</h3>
                  </div>
                  <div className="p-6 h-64 flex items-center justify-center">
                    <p className="text-secondary-500">Resource usage chart will be displayed here</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-secondary-200">
                    <h3 className="text-md font-medium text-secondary-900">Recent Users</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-secondary-200">
                      <thead className="bg-secondary-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Join Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-secondary-200">
                        {recentUsers.map(user => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-secondary-900">{user.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-secondary-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                              {new Date(user.joinDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-secondary-200">
                    <h3 className="text-md font-medium text-secondary-900">System Alerts</h3>
                  </div>
                  <div className="p-6">
                    {systemAlerts.length > 0 ? (
                      <div className="space-y-4">
                        {systemAlerts.map(alert => (
                          <div 
                            key={alert.id} 
                            className={`p-4 rounded-md ${
                              alert.type === 'warning' 
                                ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                                : alert.type === 'error'
                                ? 'bg-red-50 border-l-4 border-red-400'
                                : 'bg-blue-50 border-l-4 border-blue-400'
                            }`}
                          >
                            <div className="flex">
                              <div className="flex-shrink-0">
                                {alert.type === 'warning' && (
                                  <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                                )}
                                {alert.type === 'error' && (
                                  <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                                )}
                                {alert.type === 'info' && (
                                  <FaServer className="h-5 w-5 text-blue-400" />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-secondary-700">{alert.message}</p>
                                <p className="text-xs text-secondary-500 mt-1">{alert.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-secondary-500 text-center py-4">No system alerts</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Placeholder for other tabs */}
          {activeTab !== 'overview' && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                {activeTab === 'users' && <FaUsers className="text-secondary-400 text-xl" />}
                {activeTab === 'groups' && <FaUsers className="text-secondary-400 text-xl" />}
                {activeTab === 'resources' && <FaBook className="text-secondary-400 text-xl" />}
                {activeTab === 'system' && <FaCog className="text-secondary-400 text-xl" />}
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-1">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
              </h3>
              <p className="text-secondary-500 mb-6">This section is under development</p>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                View Documentation
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 