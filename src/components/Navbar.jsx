import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaCog, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarUrl } from '../utils/avatarUtils.jsx';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if the current page has a gradient background
  const hasGradientBackground = () => {
    // Pages with gradient backgrounds
    const gradientPages = ['/', '/pricing', '/features', '/about', '/contact', '/login', '/register'];
    return gradientPages.includes(location.pathname);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  // Function to render user avatar
  const renderUserAvatar = () => {
    if (!currentUser) return null;
    
    if (currentUser.avatar) {
      return (
        <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
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
      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-xs mr-2">
        {currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}
      </div>
    );
  };

  // Determine the navbar background class based on scroll position and current page
  const getNavbarBackgroundClass = () => {
    if (isScrolled) {
      return 'bg-white shadow-md py-3';
    } else if (hasGradientBackground()) {
      return 'bg-primary-50 py-5';
    } else {
      return 'bg-white py-5';
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${getNavbarBackgroundClass()}`}>
      <div className="container-custom">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            StudyConnect
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="space-x-6">
              <Link to="/features" className="text-secondary-700 hover:text-primary-600 transition-colors">Features</Link>
              <Link to="/pricing" className="text-secondary-700 hover:text-primary-600 transition-colors">Pricing</Link>
              <Link to="/about" className="text-secondary-700 hover:text-primary-600 transition-colors">About</Link>
              <Link to="/contact" className="text-secondary-700 hover:text-primary-600 transition-colors">Contact</Link>
            </div>
            
            {/* Conditional rendering based on authentication status */}
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {renderUserAvatar()}
                  <span className="text-secondary-700">{currentUser.firstName}</span>
                </button>
                
                {/* Profile dropdown menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link 
                      to="/dashboard" 
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FaChartBar className="inline mr-2" />
                      Dashboard
                    </Link>
                    <Link 
                      to="/dashboard/profile" 
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FaUser className="inline mr-2" />
                      Profile
                    </Link>
                    <Link 
                      to="/dashboard/settings" 
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FaCog className="inline mr-2" />
                      Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    >
                      <FaSignOutAlt className="inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">Log in</Link>
                <Link to="/register" className="btn-primary">Sign up</Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-secondary-800 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className={`md:hidden bg-white ${isOpen ? 'block' : 'hidden'} shadow-lg`}>
        <div className="container-custom py-4 space-y-3">
          <Link to="/features" className="block py-2 text-secondary-700 hover:text-primary-600">Features</Link>
          <Link to="/pricing" className="block py-2 text-secondary-700 hover:text-primary-600">Pricing</Link>
          <Link to="/about" className="block py-2 text-secondary-700 hover:text-primary-600">About</Link>
          <Link to="/contact" className="block py-2 text-secondary-700 hover:text-primary-600">Contact</Link>
          
          <div className="pt-3 border-t border-secondary-100">
            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 py-2">
                  {renderUserAvatar()}
                  <span className="text-secondary-700">{currentUser.firstName} {currentUser.lastName}</span>
                </div>
                <Link to="/dashboard" className="block py-2 text-secondary-700 hover:text-primary-600">
                  <FaChartBar className="inline mr-2" />
                  Dashboard
                </Link>
                <Link to="/dashboard/profile" className="block py-2 text-secondary-700 hover:text-primary-600">
                  <FaUser className="inline mr-2" />
                  Profile
                </Link>
                <Link to="/dashboard/settings" className="block py-2 text-secondary-700 hover:text-primary-600">
                  <FaCog className="inline mr-2" />
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-secondary-700 hover:text-primary-600"
                >
                  <FaSignOutAlt className="inline mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link to="/login" className="block py-2 text-primary-600 font-medium">Log in</Link>
                <Link to="/register" className="btn-primary text-center">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
