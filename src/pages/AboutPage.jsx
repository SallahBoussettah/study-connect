import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaGraduationCap, FaUsers, FaLightbulb, FaGlobe } from 'react-icons/fa';

const TeamMember = ({ name, role, image, bio }) => (
  <div className="flex flex-col items-center text-center">
    <img 
      src={image} 
      alt={name} 
      className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-white shadow-lg"
    />
    <h3 className="text-xl font-semibold text-secondary-900">{name}</h3>
    <p className="text-primary-600 mb-3">{role}</p>
    <p className="text-secondary-600">{bio}</p>
  </div>
);

const ValueCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-secondary-100">
    <div className="text-3xl text-primary-500 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-secondary-900 mb-3">{title}</h3>
    <p className="text-secondary-600">{description}</p>
  </div>
);

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      bio: "Former education technology researcher with a passion for improving collaborative learning experiences."
    },
    {
      name: "Sophia Chen",
      role: "Chief Product Officer",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      bio: "Education specialist with 10+ years experience in developing digital learning tools for students."
    },
    {
      name: "Marcus Williams",
      role: "Head of Engineering",
      image: "https://randomuser.me/api/portraits/men/86.jpg",
      bio: "Full-stack developer who previously built collaboration tools for remote teams and educational institutions."
    },
    {
      name: "Priya Patel",
      role: "UX/UI Designer",
      image: "https://randomuser.me/api/portraits/women/24.jpg",
      bio: "Designer focused on creating intuitive and accessible interfaces for educational platforms."
    }
  ];

  const values = [
    {
      icon: <FaGraduationCap />,
      title: "Education First",
      description: "We believe in the transformative power of education and strive to make learning more accessible and effective for everyone."
    },
    {
      icon: <FaUsers />,
      title: "Community Driven",
      description: "We foster a supportive community where students can connect, collaborate, and help each other succeed."
    },
    {
      icon: <FaLightbulb />,
      title: "Innovation",
      description: "We continuously explore new technologies and methodologies to enhance the collaborative learning experience."
    },
    {
      icon: <FaGlobe />,
      title: "Inclusivity",
      description: "We're committed to creating a platform that serves diverse learning needs and is accessible to students worldwide."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary-50 to-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900">
                About <span className="text-primary-600">StudyConnect</span>
              </h1>
              <p className="mt-6 text-xl text-secondary-600">
                We're on a mission to transform how students collaborate and learn together.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" 
                  alt="Students collaborating" 
                  className="rounded-xl shadow-lg"
                />
              </div>
              <div className="space-y-6">
                <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Story</span>
                <h2 className="text-3xl md:text-4xl font-bold text-secondary-900">
                  How StudyConnect Began
                </h2>
                <p className="text-lg text-secondary-600">
                  StudyConnect was born out of a simple observation: students learn better together, but finding the right study partners and collaborating effectively can be challenging.
                </p>
                <p className="text-lg text-secondary-600">
                  Founded in 2022 by a team of education enthusiasts and technologists, we set out to create a platform that makes collaborative learning seamless, engaging, and productive.
                </p>
                <p className="text-lg text-secondary-600">
                  What started as a simple tool for connecting study partners has evolved into a comprehensive platform that supports various aspects of collaborative learning, from resource sharing to real-time communication.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-secondary-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Values</span>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mt-2">
                What Drives Us
              </h2>
              <p className="mt-4 text-xl text-secondary-600 max-w-3xl mx-auto">
                These core principles guide everything we do at StudyConnect.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <ValueCard key={index} {...value} />
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mt-2 mb-6">
                Why We Do What We Do
              </h2>
              <p className="text-xl text-secondary-600">
                We believe that learning is inherently social, and that students achieve more when they collaborate effectively. Our mission is to break down the barriers to collaborative learning and create tools that make studying together more accessible, productive, and enjoyable for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-secondary-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Team</span>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mt-2">
                The People Behind StudyConnect
              </h2>
              <p className="mt-4 text-xl text-secondary-600 max-w-3xl mx-auto">
                We're a team of educators, technologists, and designers passionate about improving education.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {teamMembers.map((member, index) => (
                <TeamMember key={index} {...member} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-50">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold text-secondary-900 mb-6">
              Join Our Community
            </h2>
            <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
              Be part of the StudyConnect community and transform the way you learn.
            </p>
            <Link 
              to="/register" 
              className="btn-primary text-lg px-8 py-4 inline-block"
            >
              Get Started Today
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;