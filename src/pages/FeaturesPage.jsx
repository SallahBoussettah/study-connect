import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaUserFriends, FaCalendarAlt, FaComments, FaFileAlt, FaChartLine, FaLock, 
         FaBrain, FaChalkboardTeacher, FaMobileAlt, FaBell, FaHeadset, FaShieldAlt } from 'react-icons/fa';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-secondary-100 hover:border-primary-200 group">
    <div className="text-4xl mb-4 p-3 bg-primary-50 rounded-lg inline-block group-hover:bg-primary-100 transition-colors">{icon}</div>
    <h3 className="text-xl font-semibold text-secondary-900 mb-3">{title}</h3>
    <p className="text-secondary-600">{description}</p>
  </div>
);

const FeaturesPage = () => {
  const coreFeatures = [
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

  const advancedFeatures = [
    {
      icon: <FaBrain className="text-primary-500" />,
      title: "AI Study Recommendations",
      description: "Receive personalized study material recommendations based on your learning patterns and goals."
    },
    {
      icon: <FaChalkboardTeacher className="text-primary-500" />,
      title: "Interactive Flashcards",
      description: "Create and share interactive flashcards with spaced repetition to optimize your memorization."
    },
    {
      icon: <FaMobileAlt className="text-primary-500" />,
      title: "Mobile Access",
      description: "Access your study materials and groups on the go with our responsive mobile interface."
    },
    {
      icon: <FaBell className="text-primary-500" />,
      title: "Smart Notifications",
      description: "Stay updated with intelligent notifications about your study groups and upcoming sessions."
    },
    {
      icon: <FaHeadset className="text-primary-500" />,
      title: "Voice & Video Calls",
      description: "Conduct voice and video calls with your study partners for more effective collaboration."
    },
    {
      icon: <FaShieldAlt className="text-primary-500" />,
      title: "Secure Environment",
      description: "Your data and communications are protected with enterprise-grade security measures."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary-50 to-white">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900">
                Features That <span className="text-primary-600">Empower Learning</span>
              </h1>
              <p className="mt-6 text-xl text-secondary-600">
                Discover all the tools and features designed to enhance your collaborative study experience.
              </p>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Core Features</span>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mt-2">
                Essential Tools for <span className="text-primary-600">Every Student</span>
              </h2>
              <p className="mt-4 text-xl text-secondary-600 max-w-3xl mx-auto">
                Our platform provides everything you need to make your study sessions more productive and collaborative.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreFeatures.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="py-20 bg-secondary-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Advanced Features</span>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mt-2">
                Take Your Learning to the <span className="text-primary-600">Next Level</span>
              </h2>
              <p className="mt-4 text-xl text-secondary-600 max-w-3xl mx-auto">
                Unlock advanced capabilities to enhance your study experience and achieve better results.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {advancedFeatures.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="bg-primary-50 rounded-2xl p-12 text-center max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-secondary-900 mb-6">
                Ready to Experience These Features?
              </h2>
              <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
                Join StudyConnect today and transform the way you learn and collaborate with fellow students.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  to="/register" 
                  className="btn-primary text-lg px-8 py-4"
                >
                  Get Started for Free
                </Link>
                <Link 
                  to="/pricing" 
                  className="btn-secondary text-lg px-8 py-4"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage; 