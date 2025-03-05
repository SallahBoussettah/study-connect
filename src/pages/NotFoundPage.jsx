import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-20 flex items-center">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-9xl font-bold text-primary-600">404</h1>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mt-6">
              Page Not Found
            </h2>
            <p className="mt-6 text-xl text-secondary-600">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/" 
                className="btn-primary text-lg px-8 py-4"
              >
                Go to Homepage
              </Link>
              <Link 
                to="/contact" 
                className="btn-secondary text-lg px-8 py-4"
              >
                Contact Support
              </Link>
            </div>
            
            <div className="mt-16">
              <h3 className="text-xl font-semibold text-secondary-800 mb-4">
                You might be looking for:
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/features" className="text-primary-600 hover:text-primary-700 hover:underline">
                  Features
                </Link>
                <Link to="/pricing" className="text-primary-600 hover:text-primary-700 hover:underline">
                  Pricing
                </Link>
                <Link to="/about" className="text-primary-600 hover:text-primary-700 hover:underline">
                  About Us
                </Link>
                <Link to="/login" className="text-primary-600 hover:text-primary-700 hover:underline">
                  Login
                </Link>
                <Link to="/register" className="text-primary-600 hover:text-primary-700 hover:underline">
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFoundPage;