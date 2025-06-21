import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaUserGraduate, FaBook, FaChartLine, FaServer, FaExclamationTriangle, FaCog, FaSearch, FaFilter, FaDownload, FaDatabase, FaUserClock, FaChartBar, FaCalendarAlt, FaUserPlus, FaFileUpload, FaFilePdf, FaFileAlt, FaImage, FaVideo, FaLink, FaFile } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO, subDays } from 'date-fns';
import { useNotifications } from '../../contexts/NotificationContext';

const AdminDashboard = () => {
  const { currentUser, api } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      totalStorage: '0 GB',
      storagePercentage: 0
    },
    recentUsers: [],
    systemAlerts: []
  });
  const [storageData, setStorageData] = useState({
    users: [],
    totalUsers: 0,
    totalStorageUsed: '0 GB',
    totalStorageLimit: '500 GB',
    storagePercentage: 0
  });
  const [storageLoading, setStorageLoading] = useState(true);
  const [storageError, setStorageError] = useState(null);
  const [userRegistrationData, setUserRegistrationData] = useState([]);
  const [resourceUsageData, setResourceUsageData] = useState([]);
  
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/admin', { params: { timeRange } });
        if (response.data.success) {
          setAdminData(response.data.data);
          
          // Add system alerts to the notification system
          if (response.data.data.systemAlerts && response.data.data.systemAlerts.length > 0) {
            // This would be handled by the backend notification system
            console.log('System alerts loaded:', response.data.data.systemAlerts.length);
          }
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to load admin dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, [api, timeRange]);

  useEffect(() => {
    // Only fetch storage data when the storage tab is active
    if (activeTab === 'storage') {
      const fetchStorageData = async () => {
        try {
          setStorageLoading(true);
          const response = await api.get('/dashboard/admin/storage');
          if (response.data.success) {
            setStorageData(response.data.data);
          }
        } catch (err) {
          console.error('Error fetching storage data:', err);
          setStorageError('Failed to load storage usage data. Please try again later.');
        } finally {
          setStorageLoading(false);
        }
      };
      
      fetchStorageData();
    }
  }, [api, activeTab]);
  
  // Update user registration data processing
  useEffect(() => {
    if (!adminData.registrationStats?.byDay) return;
    
    // Get date range based on selected time range
    let days = 7;
    if (timeRange === '30days') days = 30;
    if (timeRange === '90days') days = 90;
    if (timeRange === 'year') days = 365;
    
    // Create an array of dates for the selected range
    const dateRange = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - i - 1);
      return format(date, 'yyyy-MM-dd');
    });
    
    // Map the backend data to the date range
    const registrationCounts = dateRange.map(date => {
      // Find matching day in backend data
      const matchingDay = adminData.registrationStats.byDay.find(day => day.date === date);
      
      return {
        date,
        count: matchingDay ? matchingDay.count : 0,
        displayDate: format(parseISO(date), 'MMM d')
      };
    });
    
    // Add console log to debug
    console.log('Registration data:', {
      original: adminData.registrationStats.byDay,
      processed: registrationCounts
    });
    
    setUserRegistrationData(registrationCounts);
  }, [adminData.registrationStats, timeRange]);
  
  // Update resource usage data processing
  useEffect(() => {
    if (!adminData.resourceStats) return;
    
    // Process resource type data from backend
    const resourceTypeData = adminData.resourceStats.byType || [];
    
    // Process resource usage by day
    const resourcesByDay = adminData.resourceStats.byDay || [];
    
    // Get top 5 users by storage usage
    const topUsers = storageData.users 
      ? [...storageData.users]
          .sort((a, b) => b.storageUsedBytes - a.storageUsedBytes)
          .slice(0, 5)
      : [];
    
    setResourceUsageData({
      topUsers,
      resourceTypes: resourceTypeData,
      byDay: resourcesByDay
    });
  }, [adminData.resourceStats, storageData.users]);
  
  const { stats, recentUsers, systemAlerts } = adminData;

  // Helper function to get the last N days of resource usage
  const getResourceUsageOverTime = () => {
    if (!resourceUsageData.byDay || !resourceUsageData.byDay.length) return [];
    
    // Get the number of days based on timeRange
    let days = 7;
    if (timeRange === '30days') days = 30;
    if (timeRange === '90days') days = Math.min(30, resourceUsageData.byDay.length); // Limit to 30 data points
    if (timeRange === 'year') days = Math.min(30, resourceUsageData.byDay.length); // Limit to 30 data points
    
    // Get the last N days of data
    return resourceUsageData.byDay
      .slice(-days)
      .map(day => ({
        date: format(parseISO(day.date), 'MMM d'),
        count: day.count,
        size: day.totalSize
      }));
  };

  // Function to render progress bar
  const renderProgressBar = (percentage, size = 'normal') => {
    let bgColor;
    if (percentage > 90) {
      bgColor = 'bg-gradient-to-r from-red-500 to-red-400';
    } else if (percentage > 70) {
      bgColor = 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    } else {
      bgColor = 'bg-gradient-to-r from-green-600 to-green-400';
    }
    
    const height = size === 'small' ? 'h-1.5' : 'h-2.5';
    
    return (
      <div className={`w-full bg-secondary-200 rounded-full ${height} overflow-hidden`}>
        <div 
          className={`${bgColor} ${height} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
        <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
        <p className="text-secondary-600 mt-1">
          Manage users, monitor platform activity, and review system performance.
            {currentUser?.role === 'admin' && (
              <button 
                onClick={() => setDebugMode(!debugMode)}
                className="ml-4 text-xs text-primary-600 hover:text-primary-800 underline"
              >
                {debugMode ? 'Disable Debug Mode' : 'Enable Debug Mode'}
              </button>
            )}
          </p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {debugMode && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
          <h3 className="font-bold">Debug Information</h3>
          <div className="mt-2 text-sm">
            <p>Time Range: {timeRange}</p>
            <p>User Registration Data: {userRegistrationData.length} days</p>
            <p>Recent Users: {adminData.recentUsers?.length || 0} users</p>
            <p>API Endpoint: /api/dashboard/admin</p>
          </div>
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
                  <FaDatabase />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-secondary-500">Storage Used</p>
                  <h3 className="text-2xl font-bold text-secondary-900">{stats.storageUsed}</h3>
                  <p className="text-xs text-secondary-500">of {stats.totalStorage} total</p>
                  <div className="mt-2">
                    {renderProgressBar(stats.storagePercentage)}
                  </div>
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
                  activeTab === 'storage'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
                onClick={() => setActiveTab('storage')}
              >
                Storage
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
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      setLoading(true);
                      api.get('/dashboard/admin', { params: { refresh: true } })
                        .then(response => {
                          if (response.data.success) {
                            setAdminData(response.data.data);
                          }
                        })
                        .catch(err => {
                          console.error('Error refreshing dashboard data:', err);
                          setError('Failed to refresh dashboard data. Please try again.');
                        })
                        .finally(() => {
                          setLoading(false);
                        });
                    }}
                    className="flex items-center px-3 py-2 bg-primary-50 text-primary-600 rounded hover:bg-primary-100 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh All
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-secondary-200 flex justify-between items-center">
                    <div>
                      <h3 className="text-md font-medium text-secondary-900">User Registration Trends</h3>
                      <p className="text-xs text-secondary-500 mt-1">Registration activity over time</p>
                    </div>
                    <div className="flex items-center">
                <select 
                        className="border border-secondary-300 rounded-md text-secondary-700 text-xs py-1 px-2 mr-2"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="year">Last year</option>
                </select>
                </div>
                  </div>
                  <div className="p-6">
                    {userRegistrationData.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-2xl font-bold text-secondary-900">
                              {adminData.stats.newUsersToday}
                            </div>
                            <div className="text-sm text-secondary-500">New users today</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-secondary-900">
                              {userRegistrationData.reduce((sum, day) => sum + day.count, 0)}
                            </div>
                            <div className="text-sm text-secondary-500">
                              New users in the {timeRange === '7days' ? 'last week' : 
                                              timeRange === '30days' ? 'last month' : 
                                              timeRange === '90days' ? 'last 3 months' : 'last year'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="h-48 mt-4">
                          {(() => {
                            // Group data for longer time ranges to avoid overcrowding
                            let chartData = [...userRegistrationData];
                            let dateFormat = 'MMM d';
                            
                            // For longer time ranges, group data to avoid overcrowding
                            if (timeRange === '30days' || timeRange === '90days' || timeRange === 'year') {
                              // Group by week for 30 days, by month for 90 days and year
                              if (timeRange === '30days') {
                                // Group by week
                                const weeklyData = [];
                                let currentWeek = [];
                                let weekNumber = -1;
                                
                                chartData.forEach((day) => {
                                  const date = parseISO(day.date);
                                  const thisWeek = Math.floor(date.getDate() / 7);
                                  
                                  if (thisWeek !== weekNumber) {
                                    if (currentWeek.length > 0) {
                                      const sum = currentWeek.reduce((acc, d) => acc + d.count, 0);
                                      weeklyData.push({
                                        date: currentWeek[0].date,
                                        displayDate: `Week ${weeklyData.length + 1}`,
                                        count: sum,
                                        originalData: [...currentWeek]
                                      });
                                      currentWeek = [];
                                    }
                                    weekNumber = thisWeek;
                                  }
                                  currentWeek.push(day);
                                });
                                
                                // Add the last week
                                if (currentWeek.length > 0) {
                                  const sum = currentWeek.reduce((acc, d) => acc + d.count, 0);
                                  weeklyData.push({
                                    date: currentWeek[0].date,
                                    displayDate: `Week ${weeklyData.length + 1}`,
                                    count: sum,
                                    originalData: [...currentWeek]
                                  });
                                }
                                
                                chartData = weeklyData;
                                dateFormat = 'Week';
                              } else {
                                // Group by month for 90 days and year
                                const monthlyData = [];
                                let currentMonth = [];
                                let monthNumber = -1;
                                
                                chartData.forEach((day) => {
                                  const date = parseISO(day.date);
                                  const thisMonth = date.getMonth();
                                  
                                  if (thisMonth !== monthNumber) {
                                    if (currentMonth.length > 0) {
                                      const sum = currentMonth.reduce((acc, d) => acc + d.count, 0);
                                      monthlyData.push({
                                        date: currentMonth[0].date,
                                        displayDate: format(parseISO(currentMonth[0].date), 'MMM'),
                                        count: sum,
                                        originalData: [...currentMonth]
                                      });
                                      currentMonth = [];
                                    }
                                    monthNumber = thisMonth;
                                  }
                                  currentMonth.push(day);
                                });
                                
                                // Add the last month
                                if (currentMonth.length > 0) {
                                  const sum = currentMonth.reduce((acc, d) => acc + d.count, 0);
                                  monthlyData.push({
                                    date: currentMonth[0].date,
                                    displayDate: format(parseISO(currentMonth[0].date), 'MMM'),
                                    count: sum,
                                    originalData: [...currentMonth]
                                  });
                                }
                                
                                chartData = monthlyData;
                                dateFormat = 'MMM';
                              }
                            }
                            
                            // Calculate max count for scaling
                            const maxCount = Math.max(...chartData.map(d => d.count), 1);
                            
                            // Limit the number of bars to display to avoid overcrowding
                            const maxBars = 14;
                            if (chartData.length > maxBars) {
                              // Sample the data to fit within maxBars
                              const step = Math.ceil(chartData.length / maxBars);
                              chartData = chartData.filter((_, i) => i % step === 0);
                            }
                            
                            return (
                          <div className="flex h-full items-end">
                                {chartData.map((day, index) => {
                                  // Calculate a reasonable height for the bars
                                  const heightPercentage = day.count > 0 
                                    ? Math.max((day.count / maxCount) * 100, 5) 
                                    : 0;
                                  
                                  return (
                              <div 
                                key={day.date} 
                                      className="flex-1 flex flex-col items-center group relative"
                                    >
                                      <div className="w-full px-0.5 md:px-1">
                                        <div 
                                          className={`${
                                            day.count > 0 
                                              ? 'bg-gradient-to-t from-primary-600 to-primary-400' 
                                              : 'bg-secondary-200'
                                          } transition-all rounded-t`}
                                    style={{ 
                                            height: day.count > 0 ? `${heightPercentage}%` : '4px',
                                            minHeight: day.count > 0 ? '10px' : '4px'
                                    }}
                                  ></div>
                                </div>
                                      <div className="text-xs text-secondary-500 mt-2 truncate w-full text-center">
                                        {day.displayDate}
                                  </div>
                                      <div className="absolute bottom-full mb-2 bg-secondary-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        {day.count} user{day.count !== 1 ? 's' : ''}
                                        {day.originalData && (
                                          <span className="block text-xs text-secondary-300">
                                            {day.originalData.length} day{day.originalData.length !== 1 ? 's' : ''}
                                          </span>
                                )}
                              </div>
                          </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-secondary-500">No registration data available</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-secondary-200">
                    <h3 className="text-md font-medium text-secondary-900">Resource Usage</h3>
                  </div>
                  <div className="p-6">
                    {resourceUsageData.resourceTypes ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-2xl font-bold text-secondary-900">
                              {adminData.stats.totalResources}
                            </div>
                            <div className="text-sm text-secondary-500">Total resources</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-secondary-900">
                              {adminData.stats.storageUsed}
                            </div>
                            <div className="text-sm text-secondary-500">Total storage used</div>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-secondary-700 mb-2">Top Users by Storage</h4>
                          <div className="space-y-3">
                            {resourceUsageData.topUsers?.map(user => (
                              <div key={user.id} className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary-200 flex items-center justify-center text-xs">
                                  {user.name.charAt(0)}
                                </div>
                                <div className="ml-3 flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-secondary-900">{user.name}</span>
                                    <span className="text-secondary-500">{user.storageUsed}</span>
                                  </div>
                                  <div className="w-full">
                                    {renderProgressBar(user.storagePercentage, 'small')}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {resourceUsageData.resourceTypes && resourceUsageData.resourceTypes.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-secondary-700 mb-2">Resource Types</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {resourceUsageData.resourceTypes.map(item => (
                                <div key={item.type} className="bg-secondary-50 rounded p-2 flex items-center">
                                  <div className="p-2 rounded-full bg-secondary-100 mr-2">
                                    {item.type === 'PDF' && <FaFilePdf className="text-red-500" />}
                                    {item.type === 'Document' && <FaFileAlt className="text-blue-500" />}
                                    {item.type === 'Image' && <FaImage className="text-green-500" />}
                                    {item.type === 'Video' && <FaVideo className="text-purple-500" />}
                                    {item.type === 'Link' && <FaLink className="text-yellow-500" />}
                                    {item.type === 'Other' && <FaFile className="text-gray-500" />}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{item.type}</div>
                                    <div className="text-xs text-secondary-500">{item.count} files</div>
                                  </div>
                                  <div className="text-xs text-secondary-500">{item.formattedSize}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {resourceUsageData.byDay && resourceUsageData.byDay.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-medium text-secondary-700 mb-2">Resource Usage Over Time</h4>
                            <div className="h-48 mt-4">
                              {(() => {
                                const data = getResourceUsageOverTime();
                                const maxCount = Math.max(...data.map(d => d.count), 1);
                                
                                return (
                                  <div className="flex h-full items-end">
                                    {data.map((day, index) => (
                                      <div 
                                        key={index} 
                                        className="flex-1 flex flex-col items-center group relative"
                                      >
                                        <div className="w-full px-1">
                                          <div 
                                            className="bg-blue-500 hover:bg-blue-600 transition-all rounded-t"
                                            style={{ 
                                              height: `${(day.count / maxCount) * 100}%`,
                                              minHeight: '4px'
                                            }}
                                          ></div>
                                        </div>
                                        <div className="text-xs text-secondary-500 mt-2 truncate w-full text-center">
                                          {day.date}
                                        </div>
                                        <div className="absolute bottom-full mb-2 bg-secondary-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                          {day.count} file{day.count !== 1 ? 's' : ''} uploaded
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-secondary-500">No resource usage data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-secondary-200 flex justify-between items-center">
                    <div>
                    <h3 className="text-md font-medium text-secondary-900">Recent Users</h3>
                      <p className="text-xs text-secondary-500 mt-1">Latest registered users</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-secondary-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="border border-secondary-300 rounded-md text-secondary-700 text-xs py-1 pl-7 pr-7 w-48 md:w-64"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
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
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Storage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-secondary-200">
                        {recentUsers && recentUsers.length > 0 ? (
                          recentUsers
                            .filter(user => {
                              if (!searchTerm) return true;
                              const term = searchTerm.toLowerCase();
                              return (
                                user.name.toLowerCase().includes(term) || 
                                user.email.toLowerCase().includes(term) ||
                                user.role.toLowerCase().includes(term)
                              );
                            })
                            .map(user => (
                              <tr key={user.id} className="hover:bg-secondary-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
                                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div className="ml-3 text-sm font-medium text-secondary-900">{user.name}</div>
                                  </div>
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm text-secondary-500 mr-2">{user.storageUsed}</span>
                                <div className="w-24">
                                  {renderProgressBar(user.storagePercentage, 'small')}
                                </div>
                              </div>
                            </td>
                          </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-secondary-500">
                              No recent users found
                            </td>
                          </tr>
                        )}
                        {recentUsers && recentUsers.length > 0 && 
                         recentUsers.filter(user => {
                           if (!searchTerm) return true;
                           const term = searchTerm.toLowerCase();
                           return (
                             user.name.toLowerCase().includes(term) || 
                             user.email.toLowerCase().includes(term) ||
                             user.role.toLowerCase().includes(term)
                           );
                         }).length === 0 && (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-secondary-500">
                              No users match your search
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-3 border-t border-secondary-200 bg-secondary-50 flex justify-between items-center">
                    <div className="text-xs text-secondary-500">
                      Showing <span className="font-medium">
                        {searchTerm 
                          ? recentUsers?.filter(user => {
                              const term = searchTerm.toLowerCase();
                              return (
                                user.name.toLowerCase().includes(term) || 
                                user.email.toLowerCase().includes(term) ||
                                user.role.toLowerCase().includes(term)
                              );
                            }).length || 0
                          : recentUsers?.length || 0
                        }
                      </span> of <span className="font-medium">{adminData.stats.totalUsers}</span> users
                    </div>
                    <div className="flex space-x-1">
                      <button className="px-2 py-1 border border-secondary-300 rounded text-xs text-secondary-600 hover:bg-secondary-100">
                        Previous
                      </button>
                      <button className="px-2 py-1 border border-secondary-300 rounded text-xs text-secondary-600 hover:bg-secondary-100">
                        Next
                      </button>
                    </div>
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
          
          {/* Storage Tab */}
          {activeTab === 'storage' && (
            <div>
              {storageError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {storageError}
                </div>
              )}
              
              {storageLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-secondary-900">Storage Overview</h3>
                        <button 
                          onClick={() => {
                            setStorageLoading(true);
                            api.get('/dashboard/admin/storage', { params: { refresh: true } })
                              .then(response => {
                                if (response.data.success) {
                                  setStorageData(response.data.data);
                                }
                              })
                              .catch(err => {
                                console.error('Error refreshing storage data:', err);
                                setStorageError('Failed to refresh storage data. Please try again.');
                              })
                              .finally(() => {
                                setStorageLoading(false);
                              });
                          }}
                          className="flex items-center px-3 py-2 bg-primary-50 text-primary-600 rounded hover:bg-primary-100 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                          Refresh Data
                        </button>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center mb-6">
                        <div className="flex-1 mb-4 md:mb-0">
                          <div className="text-4xl font-bold text-secondary-900 mb-1">
                            {storageData.totalStorageUsed}
                          </div>
                          <div className="text-sm text-secondary-500">
                            of {storageData.totalStorageLimit} used ({storageData.storagePercentage}%)
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="w-full h-4 bg-secondary-200 rounded-full">
                            <div 
                              className={`h-4 rounded-full ${
                                storageData.storagePercentage > 90 
                                  ? 'bg-red-500' 
                                  : storageData.storagePercentage > 70 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${storageData.storagePercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-secondary-50 rounded-lg">
                          <div className="text-sm text-secondary-500 mb-1">Total Users</div>
                          <div className="text-xl font-semibold">{storageData.totalUsers}</div>
                        </div>
                        <div className="p-4 bg-secondary-50 rounded-lg">
                          <div className="text-sm text-secondary-500 mb-1">Average Storage Per User</div>
                          <div className="text-xl font-semibold">
                            {storageData.totalUsers > 0 
                              ? (storageData.totalStorageUsedBytes / storageData.totalUsers / (1024 * 1024)).toFixed(1) + ' MB' 
                              : '0 MB'}
                          </div>
                        </div>
                        <div className="p-4 bg-secondary-50 rounded-lg">
                          <div className="text-sm text-secondary-500 mb-1">Storage Limit Per User</div>
                          <div className="text-xl font-semibold">500 MB</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-secondary-200 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-secondary-900">User Storage Usage</h3>
                      <div className="flex items-center">
                        <div className="relative mr-2">
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-secondary-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Search users..."
                            className="border border-secondary-300 rounded-md text-secondary-700 text-xs py-1 pl-7 pr-7 w-48 md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          {searchTerm && (
                            <button 
                              onClick={() => setSearchTerm('')}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                        <button className="flex items-center text-xs text-secondary-500 hover:text-secondary-700">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                          </svg>
                          <span>Filter</span>
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-secondary-200">
                        <thead className="bg-secondary-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              User
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Join Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Resources
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Storage Used
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Usage
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-secondary-200">
                          {storageData.users
                            .filter(user => {
                              if (!searchTerm) return true;
                              const term = searchTerm.toLowerCase();
                              return (
                                user.name.toLowerCase().includes(term) || 
                                user.email.toLowerCase().includes(term) ||
                                user.role.toLowerCase().includes(term)
                              );
                            })
                            .map(user => (
                            <tr key={user.id} className="hover:bg-secondary-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary-200 flex items-center justify-center">
                                    {user.name.charAt(0)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-secondary-900">{user.name}</div>
                                    <div className="text-sm text-secondary-500">{user.email}</div>
                                  </div>
                                </div>
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
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-secondary-900">{user.resourceCount}</div>
                                <div className="text-xs text-secondary-500">
                                  {Object.entries(user.resourceTypes || {}).map(([type, count], index, arr) => (
                                    <span key={type}>
                                      {count} {type}{index < arr.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                                {user.storageUsed}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-full max-w-xs">
                                    {renderProgressBar(user.storagePercentage)}
                                  </div>
                                  <span className="ml-2 text-sm text-secondary-500">{user.storagePercentage}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-primary-600 hover:text-primary-900 mr-3">View</button>
                                <button className="text-red-600 hover:text-red-900">Reset</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-6 py-4 border-t border-secondary-200 flex items-center justify-between">
                      <div className="text-sm text-secondary-500">
                        Showing <span className="font-medium">
                          {searchTerm 
                            ? storageData.users?.filter(user => {
                                const term = searchTerm.toLowerCase();
                                return (
                                  user.name.toLowerCase().includes(term) || 
                                  user.email.toLowerCase().includes(term) ||
                                  user.role.toLowerCase().includes(term)
                                );
                              }).length || 0
                            : storageData.users?.length || 0
                          }
                        </span> of <span className="font-medium">{storageData.totalUsers}</span> users
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 border border-secondary-300 rounded-md text-sm text-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed">
                          Previous
                        </button>
                        <button className="px-3 py-1 border border-secondary-300 rounded-md text-sm text-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed">
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Placeholder for other tabs */}
          {(activeTab === 'users' || activeTab === 'resources' || activeTab === 'system') && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                {activeTab === 'users' && <FaUsers className="text-secondary-400 text-xl" />}
                {activeTab === 'resources' && <FaBook className="text-secondary-400 text-xl" />}
                {activeTab === 'system' && <FaCog className="text-secondary-400 text-xl" />}
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-1">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
              </h3>
              <p className="text-secondary-500 mb-6">This section is under development</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 