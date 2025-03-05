import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-primary-50 via-primary-50 to-white py-24">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight">
              Revolutionize Your <span className="text-primary-600 relative">
                Study Experience
                <span className="absolute bottom-0 left-0 w-full h-2 bg-primary-200 -z-10 transform -rotate-1"></span>
              </span>
            </h1>
            <p className="text-xl text-secondary-600 max-w-2xl leading-relaxed">
              Connect with fellow students, share resources, and collaborate in real-time. 
              StudyConnect is your all-in-one platform for productive learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/register" className="btn-primary text-center text-lg shadow-lg shadow-primary-200 transform transition hover:-translate-y-1">
                Get Started
              </Link>
              <Link to="/features" className="btn-secondary text-center text-lg transform transition hover:-translate-y-1">
                Learn More
              </Link>
            </div>
            <div className="flex items-center space-x-4 text-secondary-600">
              <div className="flex -space-x-2">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                <img src="https://randomuser.me/api/portraits/men/86.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                <img src="https://randomuser.me/api/portraits/women/24.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
              </div>
              <span className="text-sm">Joined by 10,000+ students</span>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-200 rounded-full opacity-50"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-300 rounded-full opacity-40"></div>
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
              alt="Students collaborating" 
              className="w-full h-auto rounded-xl shadow-2xl relative z-10 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 