import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaUsers, FaBook, FaUser, FaCog, FaSignOutAlt, 
  FaChartBar, FaBars, FaTimes, FaClock, FaGraduationCap,
  FaUserFriends
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../../components/common/NotificationDropdown';
import ConversationsDropdown from '../../components/common/ConversationsDropdown';
import { getAvatarUrl } from '../../utils/avatarUtils.jsx';

const DashboardLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/dashboard/rooms', icon: <FaUsers />, label: 'Study Rooms' },
    { path: '/dashboard/friends', icon: <FaUserFriends />, label: 'Friends' },
    { path: '/dashboard/resources', icon: <FaBook />, label: 'Resources' },
    { path: '/dashboard/timer', icon: <FaClock />, label: 'Study Timer' },
    { path: '/dashboard/flashcards', icon: <FaGraduationCap />, label: 'Flashcards' },
    { path: '/dashboard/profile', icon: <FaUser />, label: 'Profile' },
    { path: '/dashboard/settings', icon: <FaCog />, label: 'Settings' },
  ];

  // Add admin-only navigation item
  if (currentUser?.role === 'admin') {
    navItems.splice(1, 0, { 
      path: '/dashboard/admin', 
      icon: <FaChartBar />, 
      label: 'Admin Panel' 
    });
  }

  // Function to render user avatar
  const renderUserAvatar = (size = 'md') => {
    if (!currentUser) return null;
    
    const sizeClasses = size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
    const marginClass = 'mr-3';
    
    if (currentUser.avatar) {
      return (
        <div className={`${sizeClasses} rounded-full overflow-hidden ${marginClass}`}>
          <img 
            src={getAvatarUrl(currentUser.avatar)}
            alt={`${currentUser.firstName} ${currentUser.lastName}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, replace with initials
              const parent = e.target.parentNode;
              if (parent) {
                // Clear the parent node
                while (parent.firstChild) {
                  parent.removeChild(parent.firstChild);
                }
                
                // Create a div for initials
                const initialsDiv = document.createElement('div');
                initialsDiv.className = "flex items-center justify-center h-full w-full bg-primary-500 rounded-full text-white text-xs font-bold";
                
                // Get initials
                const initials = `${currentUser.firstName?.charAt(0) || ''}${currentUser.lastName?.charAt(0) || ''}`;
                initialsDiv.textContent = initials;
                
                // Append to parent
                parent.appendChild(initialsDiv);
              }
            }}
          />
        </div>
      );
    }
    
    // Fallback to initials if no avatar
    return (
      <div className={`${sizeClasses} rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-xs ${marginClass}`}>
        {currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto transition duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-secondary-200">
            <Link to="/dashboard" className="text-xl font-bold text-primary-600">
              StudyConnect
            </Link>
            <button 
              className="p-2 rounded-md lg:hidden text-secondary-500 hover:bg-secondary-100"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes />
            </button>
          </div>
          
          {/* User info */}
          <div className="p-4 border-b border-secondary-200">
            <div className="flex items-center">
              {renderUserAvatar('lg')}
              <div className="ml-2">
                <p className="text-sm font-medium text-secondary-900">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-secondary-500">
                  {currentUser?.email}
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-secondary-700 hover:bg-secondary-100'
                }`}
              >
                <span className={`mr-3 ${isActive(item.path) ? 'text-primary-600' : 'text-secondary-500'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Logout button */}
          <div className="p-4 border-t border-secondary-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-secondary-700 rounded-md hover:bg-secondary-100"
            >
              <FaSignOutAlt className="mr-3 text-secondary-500" />
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              className="p-2 rounded-md lg:hidden text-secondary-500 hover:bg-secondary-100"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars />
            </button>
            
            {/* Empty div to push content to right */}
            <div className="flex-1"></div>
            
            {/* Right-aligned items */}
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              <ConversationsDropdown />
              
              <div className="hidden md:flex items-center space-x-2">
                {renderUserAvatar()}
                <span className="text-sm font-medium text-secondary-700">
                  {currentUser?.firstName}
                </span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-secondary-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 