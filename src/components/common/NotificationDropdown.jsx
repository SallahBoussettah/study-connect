import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaCheck, FaCheckDouble, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await markAllAsRead();
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <FaInfoCircle className="text-blue-500" />;
      case 'success':
        return <FaCheck className="text-green-500" />;
      case 'warning':
        return <FaExclamationCircle className="text-yellow-500" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Icon */}
      <button
        className="p-2 rounded-full text-secondary-500 hover:bg-secondary-100 relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3 border-b border-secondary-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-secondary-700">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="px-4 py-3 text-center text-secondary-500">
              Loading notifications...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="px-4 py-3 text-center text-red-500">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && notifications.length === 0 && (
            <div className="px-4 py-6 text-center text-secondary-500">
              <p>No notifications yet</p>
            </div>
          )}

          {/* Notification List */}
          {!loading && !error && notifications.length > 0 && (
            <div>
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={notification.link || '#'}
                  className={`block px-4 py-3 border-b border-secondary-100 hover:bg-secondary-50 transition-colors duration-150 ${
                    !notification.isRead ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        {notification.timeAgo}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2 border-t border-secondary-200">
            <Link
              to="/dashboard/settings"
              className="block text-xs text-center text-secondary-600 hover:text-primary-600"
              onClick={() => setIsOpen(false)}
            >
              Notification Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 