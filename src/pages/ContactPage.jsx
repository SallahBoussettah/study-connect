import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaTwitter, FaFacebook, FaLinkedin, FaInstagram } from 'react-icons/fa';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend
    console.log('Form submitted:', formData);
    
    // Simulate form submission success
    setFormStatus('success');
    
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setFormStatus(null);
    }, 5000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary-50 to-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900">
                Get in <span className="text-primary-600">Touch</span>
              </h1>
              <p className="mt-6 text-xl text-secondary-600">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="bg-secondary-50 p-8 rounded-xl">
                <h2 className="text-2xl font-bold text-secondary-900 mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="text-primary-600 mt-1 mr-4">
                      <FaMapMarkerAlt size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">Our Location</h3>
                      <p className="text-secondary-600">Menara Marrakech, Marrakech, Morocco</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-primary-600 mt-1 mr-4">
                      <FaEnvelope size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">Email Us</h3>
                      <p className="text-secondary-600">info@studyconnect.com</p>
                      <p className="text-secondary-600">support@studyconnect.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-primary-600 mt-1 mr-4">
                      <FaPhone size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">Call Us</h3>
                      <p className="text-secondary-600">+212 661 234 567</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12">
                  <h3 className="font-semibold text-secondary-900 mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 transition-colors">
                      <FaTwitter size={24} />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 transition-colors">
                      <FaFacebook size={24} />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 transition-colors">
                      <FaLinkedin size={24} />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 transition-colors">
                      <FaInstagram size={24} />
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold text-secondary-900 mb-6">Send Us a Message</h2>
                
                {formStatus === 'success' && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    Thank you for your message! We'll get back to you soon.
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-secondary-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-secondary-700 mb-2">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-secondary-700 mb-2">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-secondary-700 mb-2">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn-primary px-8 py-3"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-secondary-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-xl text-secondary-600 max-w-3xl mx-auto">
                Find quick answers to common questions about StudyConnect.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">How do I create a study group?</h3>
                <p className="text-secondary-600">After signing up, navigate to the "Groups" section and click "Create New Group." You can then set a name, description, and invite members to join your study group.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">Is StudyConnect free to use?</h3>
                <p className="text-secondary-600">StudyConnect offers a free tier with essential features for individual students. We also offer premium plans with advanced features for more serious students and groups. Visit our <a href="/pricing" className="text-primary-600 hover:underline">pricing page</a> for details.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">How secure is my data on StudyConnect?</h3>
                <p className="text-secondary-600">We take data security seriously. All communications are encrypted, and we implement industry-standard security measures to protect your personal information and study materials.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">Can I use StudyConnect on my mobile device?</h3>
                <p className="text-secondary-600">Yes! StudyConnect is fully responsive and works on all devices. We're also developing dedicated mobile apps for iOS and Android for an enhanced mobile experience.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage; 