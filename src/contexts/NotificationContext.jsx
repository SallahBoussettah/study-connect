import React, { createContext, useState, useContext, useEffect } from 'react';
import { notificationService } from '../services/api';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

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
      });
    }
    
    return () => {
      // Unsubscribe from socket events when component unmounts
      if (currentUser) {
        socketService.unsubscribeFromNotifications();
      }
    };
  }, [currentUser]);

  // Fetch all notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      
      // Calculate unread count
      const unread = data.filter(notification => !notification.isRead).length;
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