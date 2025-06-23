import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBell, 
  FaCheck, 
  FaCheckDouble, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaUserFriends, 
  FaUserPlus
} from 'react-icons/fa';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigation } from '../../hooks/useNavigation';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigation();
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
  const handleNotificationClick = async (notification, e) => {
    e.preventDefault();
    
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    setIsOpen(false);
    
    // Navigate to the appropriate page based on notification type and relatedType
    if (notification.relatedType === 'friendship') {
      if (notification.message.includes('sent you a friend request')) {
        navigate('/dashboard/friends/requests');
      } else {
        navigate('/dashboard/friends');
      }
    } else if (notification.link) {
      // For other notifications, use the link provided
      navigate(notification.link);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await markAllAsRead();
  };

  // Get icon based on notification type and relatedType
  const getNotificationIcon = (notification) => {
    // First check for friendship-related notifications
    if (notification.relatedType === 'friendship') {
      return notification.type === 'success' 
        ? <FaUserFriends className="text-green-500" /> 
        : <FaUserPlus className="text-blue-500" />;
    }
    
    // Then fall back to type-based icons
    switch (notification.type) {
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
  
  // Format the notification time display
  const formatNotificationTime = (notification) => {
    if (!notification.time && !notification.timeAgo) {
      // If neither time nor timeAgo is available, format from createdAt
      if (notification.createdAt) {
        const date = new Date(notification.createdAt);
        const now = new Date();
        const diffMs = now - date;
        
        // Less than a minute
        if (diffMs < 60 * 1000) {
          return 'Just now';
        }
        
        // Less than an hour
        if (diffMs < 60 * 60 * 1000) {
          const minutes = Math.floor(diffMs / (60 * 1000));
          return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        }
        
        // Less than a day
        if (diffMs < 24 * 60 * 60 * 1000) {
          const hours = Math.floor(diffMs / (60 * 60 * 1000));
          return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        }
        
        // Less than a week
        if (diffMs < 7 * 24 * 60 * 60 * 1000) {
          const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
          return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }
        
        // Format as date
        return date.toLocaleDateString();
      }
      
      return '';
    }
    
    // Use timeAgo if available, otherwise use time
    return notification.timeAgo || notification.time;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Icon */}
      <button
        className="p-2 rounded-full text-secondary-500 hover:bg-secondary-100 relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FaBell className="text-xl" />
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
                <a
                  key={notification.id}
                  href="#"
                  className={`block px-4 py-3 border-b border-secondary-100 hover:bg-secondary-50 transition-colors duration-150 ${
                    !notification.isRead ? 'bg-primary-50' : ''
                  }`}
                  onClick={(e) => handleNotificationClick(notification, e)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        {formatNotificationTime(notification)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="ml-2 h-2 w-2 bg-primary-500 rounded-full"></div>
                    )}
                  </div>
                </a>
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