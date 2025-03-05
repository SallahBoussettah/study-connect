import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaGraduationCap, FaBook, FaCalendarAlt, FaEdit, FaCamera } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: currentUser?.firstName || 'John',
    lastName: currentUser?.lastName || 'Doe',
    email: currentUser?.email || 'john.doe@example.com',
    institution: 'University of Technology',
    major: 'Computer Science',
    bio: 'I am a passionate student interested in artificial intelligence and machine learning. I enjoy collaborative learning and helping others understand complex concepts.',
    interests: ['Machine Learning', 'Web Development', 'Data Science', 'Algorithms'],
    yearOfStudy: '3rd Year'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would save the profile data to the backend
    console.log('Saving profile data:', profileData);
    setIsEditing(false);
  };

  const handleAddInterest = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newInterest = e.target.value.trim();
      if (!profileData.interests.includes(newInterest)) {
        setProfileData(prev => ({
          ...prev,
          interests: [...prev.interests, newInterest]
        }));
      }
      e.target.value = '';
    }
  };

  const handleRemoveInterest = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-primary-500 to-primary-700">
          <button className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow hover:bg-secondary-100 transition-colors">
            <FaCamera className="text-secondary-700" />
          </button>
        </div>
        
        <div className="relative px-6 py-8">
          {/* Profile Picture */}
          <div className="absolute -top-16 left-6">
            <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-4xl font-bold">
                {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
              </div>
            </div>
          </div>
          
          {/* Edit Button */}
          <div className="flex justify-end mb-8">
            {isEditing ? (
              <div className="space-x-3">
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="px-4 py-2 border border-secondary-300 rounded-md text-secondary-700 hover:bg-secondary-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center px-4 py-2 bg-secondary-100 text-secondary-700 rounded-md hover:bg-secondary-200 transition-colors"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-secondary-50"
                    disabled
                  />
                  <p className="text-xs text-secondary-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Year of Study</label>
                  <select
                    name="yearOfStudy"
                    value={profileData.yearOfStudy}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Institution</label>
                  <input
                    type="text"
                    name="institution"
                    value={profileData.institution}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Major</label>
                  <input
                    type="text"
                    name="major"
                    value={profileData.major}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Interests</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileData.interests.map((interest, index) => (
                      <div key={index} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full flex items-center">
                        {interest}
                        <button 
                          type="button"
                          onClick={() => handleRemoveInterest(interest)}
                          className="ml-2 text-primary-500 hover:text-primary-700"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add an interest (press Enter)"
                    onKeyDown={handleAddInterest}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="mt-8">
              <h1 className="text-2xl font-bold text-secondary-900 mt-4">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className="text-secondary-600">{profileData.major} • {profileData.yearOfStudy}</p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-secondary-900 mb-3">Contact Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaEnvelope className="text-secondary-500 mr-3" />
                      <span>{profileData.email}</span>
                    </div>
                    <div className="flex items-center">
                      <FaGraduationCap className="text-secondary-500 mr-3" />
                      <span>{profileData.institution}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-secondary-900 mb-3">Academic Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaBook className="text-secondary-500 mr-3" />
                      <span>{profileData.major}</span>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-secondary-500 mr-3" />
                      <span>{profileData.yearOfStudy}</span>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h2 className="text-lg font-semibold text-secondary-900 mb-3">About Me</h2>
                  <p className="text-secondary-700">{profileData.bio}</p>
                </div>
                
                <div className="md:col-span-2">
                  <h2 className="text-lg font-semibold text-secondary-900 mb-3">Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map((interest, index) => (
                      <span key={index} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 