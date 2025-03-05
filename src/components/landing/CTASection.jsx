import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-primary-500 rounded-full opacity-20 transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-primary-500 rounded-full opacity-20 transform translate-x-1/3 translate-y-1/3"></div>
      
      <div className="container-custom text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
          Ready to Transform Your Study Experience?
        </h2>
        <p className="mt-6 text-xl text-primary-100 max-w-3xl mx-auto">
          Join StudyConnect today and connect with fellow students, share resources, and collaborate in real-time.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/register" 
            className="btn bg-white text-primary-600 hover:bg-primary-50 focus:ring-white text-lg px-8 py-4 shadow-lg transform transition hover:-translate-y-1"
          >
            Get Started for Free
          </Link>
          <Link 
            to="/demo" 
            className="btn bg-transparent text-white border-2 border-white hover:bg-primary-500 focus:ring-white text-lg px-8 py-4 transform transition hover:-translate-y-1"
          >
            Watch Demo
          </Link>
        </div>
        <div className="mt-8 text-primary-100 text-sm">
          No credit card required • Free 14-day trial • Cancel anytime
        </div>
      </div>
    </section>
  );
};

export default CTASection; 