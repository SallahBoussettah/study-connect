import React, { createContext, useState, useContext, useEffect } from 'react';
import { notificationService } from '../services/api';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { useNavigation } from '../hooks/useNavigation';
import { FaUserPlus, FaUserFriends, FaInfoCircle, FaExclamationCircle, FaCheck } from 'react-icons/fa';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigation();
  
  // Fetch notifications when user logs in
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      
      // Subscribe to socket events for real-time notifications
      socketService.subscribeToNotifications((notification) => {
        // Add new notification to the list
        setNotifications(prev => [notification, ...prev]);
        
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        showToastNotification(notification);
      });
    }
    
    return () => {
      // Unsubscribe from socket events when component unmounts
      if (currentUser) {
        socketService.unsubscribeFromNotifications();
      }
    };
  }, [currentUser]);
  
  // Get notification icon based on type and relatedType
  const getNotificationIcon = (notification) => {
    // First check for friendship-related notifications
    if (notification.relatedType === 'friendship') {
      return notification.type === 'success' 
        ? <FaUserFriends className="text-green-500 text-xl" /> 
        : <FaUserPlus className="text-blue-500 text-xl" />;
    }
    
    // Then fall back to type-based icons
    switch (notification.type) {
      case 'info':
        return <FaInfoCircle className="text-blue-500 text-xl" />;
      case 'success':
        return <FaCheck className="text-green-500 text-xl" />;
      case 'warning':
      case 'error':
        return <FaExclamationCircle className={`${notification.type === 'warning' ? 'text-yellow-500' : 'text-red-500'} text-xl`} />;
      default:
        return <FaInfoCircle className="text-blue-500 text-xl" />;
    }
  };
  
  // Show toast notification
  const showToastNotification = (notification) => {
    // Get toast type based on notification type
    const toastType = getToastType(notification.type);
    
    // Get appropriate icon
    const icon = getNotificationIcon(notification);
    
    // Create toast message with icon
    const message = (
      <div className="flex items-center">
        <span className="mr-2">{icon}</span>
        <span>{notification.message}</span>
      </div>
    );
    
    // Show toast
    toast[toastType](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onClick: () => {
        // Mark notification as read
        markAsRead(notification.id);
        
        // Navigate to appropriate page when toast is clicked
        if (navigate) {
          if (notification.relatedType === 'friendship') {
            if (notification.message.includes('sent you a friend request')) {
              navigate('/dashboard/friends/requests');
            } else {
              navigate('/dashboard/friends');
            }
          } else if (notification.link) {
            navigate(notification.link);
          }
        }
      }
    });
  };
  
  // Get toast type based on notification type
  const getToastType = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  };

  // Fetch all notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await notificationService.getNotifications();
      
      // Process and format notifications
      const processedNotifications = data.map(notification => {
        // Add relatedType and relatedId if not present
        if (!notification.relatedType && notification.message.includes('friend request')) {
          if (notification.message.includes('sent you')) {
            notification.relatedType = 'friendship';
          } else if (notification.message.includes('accepted')) {
            notification.relatedType = 'friendship';
          }
        }
        
        return notification;
      });
      
      setNotifications(processedNotifications);
      
      // Calculate unread count
      const unread = processedNotifications.filter(notification => !notification.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error(`Error marking notification ${notificationId} as read:`, err);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  return useContext(NotificationContext);
}; 