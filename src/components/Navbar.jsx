import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
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
            <div className="space-x-4">
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">Log in</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </div>
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
          <div className="pt-3 border-t border-secondary-100 flex flex-col space-y-3">
            <Link to="/login" className="block py-2 text-primary-600 font-medium">Log in</Link>
            <Link to="/register" className="btn-primary text-center">Sign up</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
