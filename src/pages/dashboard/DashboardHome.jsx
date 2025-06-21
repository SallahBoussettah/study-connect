import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaBook, FaCalendarAlt, FaBell, FaVideo, FaComments, FaPlus } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const DashboardHome = () => {
  const { currentUser, api } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    activeRooms: [],
    upcomingEvents: [],
    recentResources: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [api]);

  const { activeRooms, upcomingEvents, recentResources, notifications } = dashboardData;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">
          Welcome back, {currentUser?.firstName}!
        </h1>
        <p className="text-secondary-600 mt-1">
          Here's what's happening with your study rooms today.
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Study Rooms */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-secondary-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-secondary-900">Active Study Rooms</h2>
                <Link to="/dashboard/rooms" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="p-6">
                {activeRooms.length > 0 ? (
                  <div className="space-y-4">
                    {activeRooms.map(room => (
                      <div key={room.id} className="flex items-center p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <img 
                            src={room.image} 
                            alt={room.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-grow">
                          <h3 className="font-medium text-secondary-900">{room.name}</h3>
                          <p className="text-sm text-secondary-500">
                            <span className="text-green-500">{room.activeMembers} active</span> / {room.totalMembers} members
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Link 
                            to={`/dashboard/groups/${room.id}`} 
                            className="p-2 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 transition-colors"
                            title="Enter Room"
                          >
                            <FaUsers />
                          </Link>
                          <button 
                            className="p-2 bg-secondary-50 text-secondary-600 rounded-full hover:bg-secondary-100 transition-colors"
                            title="Start Video Call"
                          >
                            <FaVideo />
                          </button>
                          <button 
                            className="p-2 bg-secondary-50 text-secondary-600 rounded-full hover:bg-secondary-100 transition-colors"
                            title="Open Chat"
                          >
                            <FaComments />
                          </button>
                        </div>
                      </div>
                    ))}
                    <Link 
                      to="/dashboard/groups/create" 
                      className="block w-full py-2 px-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-center"
                    >
                      <FaPlus className="inline mr-2" /> Create New Study Room
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                      <FaUsers className="text-secondary-400 text-xl" />
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">No active study rooms</h3>
                    <p className="text-secondary-500 mb-4">Join or create a study room to collaborate with others</p>
                    <Link 
                      to="/dashboard/groups/create" 
                      className="inline-block py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <FaPlus className="inline mr-2" /> Create Study Room
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b border-secondary-200">
                <h2 className="text-lg font-medium text-secondary-900">Upcoming Study Sessions</h2>
              </div>
              <div className="p-6">
                {upcomingEvents.length > 0 ? (
                  <div className="divide-y divide-secondary-200">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="bg-primary-100 text-primary-700 rounded p-2 mr-4">
                            <FaCalendarAlt />
                          </div>
                          <div>
                            <h3 className="font-medium text-secondary-900">{event.title}</h3>
                            <p className="text-sm text-secondary-500">
                              {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            <p className="text-sm text-secondary-600 mt-1">
                              Group: {event.group}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary-500 text-center py-4">No upcoming study sessions</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Notifications */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-secondary-200">
                <h2 className="text-lg font-medium text-secondary-900">Notifications</h2>
              </div>
              <div className="p-6">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-secondary-200">
                    {notifications.map(notification => (
                      <div key={notification.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="bg-secondary-100 text-secondary-600 rounded p-2 mr-3">
                            <FaBell />
                          </div>
                          <div>
                            <p className="text-secondary-800">{notification.message}</p>
                            <p className="text-xs text-secondary-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary-500 text-center py-4">No new notifications</p>
                )}
              </div>
            </div>

            {/* Recent Resources */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b border-secondary-200">
                <h2 className="text-lg font-medium text-secondary-900">Recent Resources</h2>
              </div>
              <div className="p-6">
                {recentResources.length > 0 ? (
                  <div className="divide-y divide-secondary-200">
                    {recentResources.map(resource => (
                      <div key={resource.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="bg-secondary-100 text-secondary-600 rounded p-2 mr-3">
                            <FaBook />
                          </div>
                          <div>
                            <h3 className="font-medium text-secondary-900">{resource.title}</h3>
                            <p className="text-xs text-secondary-500">
                              {resource.type} • Uploaded by {resource.uploadedBy} • {new Date(resource.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary-500 text-center py-4">No recent resources</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b border-secondary-200">
                <h2 className="text-lg font-medium text-secondary-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <Link 
                    to="/dashboard/groups/create" 
                    className="block w-full py-2 px-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-center"
                  >
                    Create New Study Room
                  </Link>
                  <Link 
                    to="/dashboard/resources/upload" 
                    className="block w-full py-2 px-4 bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors text-center"
                  >
                    Upload Resource
                  </Link>
                  <Link 
                    to="/dashboard/timer" 
                    className="block w-full py-2 px-4 bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors text-center"
                  >
                    Start Study Timer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome; 