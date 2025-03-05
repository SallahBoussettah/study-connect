import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkLoggedInStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userInfo = localStorage.getItem('userInfo');
        
        if (token && userInfo) {
          // In a real app, you would validate the token with your backend
          setCurrentUser(JSON.parse(userInfo));
        }
      } catch (err) {
        console.error('Error checking authentication status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInStatus();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to your backend
      // Simulating API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data based on email for demonstration
      let userData;
      
      if (email === 'admin@studyconnect.com') {
        userData = {
          id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@studyconnect.com',
          role: 'admin'
        };
      } else {
        userData = {
          id: '2',
          firstName: 'Student',
          lastName: 'User',
          email: email,
          role: 'student'
        };
      }
      
      // Store auth data
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('userInfo', JSON.stringify(userData));
      
      setCurrentUser(userData);
      return userData;
    } catch (err) {
      setError('Authentication failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        ...userData,
        role: 'student' // Default role for new users
      };
      
      // Store auth data
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('userInfo', JSON.stringify(newUser));
      
      setCurrentUser(newUser);
      return newUser;
    } catch (err) {
      setError('Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 