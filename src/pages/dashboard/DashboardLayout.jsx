import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaUsers, FaBook, FaUser, FaCog, FaSignOutAlt, 
  FaChartBar, FaBars, FaTimes, FaBell, FaClock, FaGraduationCap
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

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
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                {currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}
              </div>
              <div className="ml-3">
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
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-secondary-500 hover:bg-secondary-100 relative">
                <FaBell />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-xs">
                  {currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}
                </div>
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