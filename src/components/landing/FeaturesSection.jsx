import React from 'react';
import { FaUserFriends, FaCalendarAlt, FaComments, FaFileAlt, FaChartLine, FaLock } from 'react-icons/fa';

const features = [
  {
    icon: <FaUserFriends className="text-primary-500" />,
    title: "Study Groups",
    description: "Create or join study groups based on courses, topics, or interests to collaborate with peers."
  },
  {
    icon: <FaCalendarAlt className="text-primary-500" />,
    title: "Smart Scheduling",
    description: "Plan study sessions, set reminders, and coordinate meeting times with your study partners."
  },
  {
    icon: <FaComments className="text-primary-500" />,
    title: "Real-time Collaboration",
    description: "Chat, video call, and share screens with your study group for effective remote learning."
  },
  {
    icon: <FaFileAlt className="text-primary-500" />,
    title: "Resource Sharing",
    description: "Share notes, documents, and study materials securely with your study groups."
  },
  {
    icon: <FaChartLine className="text-primary-500" />,
    title: "Progress Tracking",
    description: "Monitor your study habits, track progress, and identify areas for improvement."
  },
  {
    icon: <FaLock className="text-primary-500" />,
    title: "Private Spaces",
    description: "Create private study spaces with controlled access for focused group work."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mt-2">
            Tools for <span className="text-primary-600">Effective Learning</span>
          </h2>
          <p className="mt-4 text-xl text-secondary-600 max-w-3xl mx-auto">
            Our platform provides everything you need to make your study sessions more productive and collaborative.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-secondary-100 hover:border-primary-200 group"
            >
              <div className="text-4xl mb-4 p-3 bg-primary-50 rounded-lg inline-block group-hover:bg-primary-100 transition-colors">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">{feature.title}</h3>
              <p className="text-secondary-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 