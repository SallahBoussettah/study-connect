import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaEnvelope, FaGraduationCap, FaBook, FaCalendarAlt, FaEdit, FaCamera, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const Profile = () => {
  const { currentUser, api, updateCurrentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    institution: currentUser?.institution || '',
    major: currentUser?.major || '',
    bio: currentUser?.bio || '',
    interests: currentUser?.interests || [],
    yearOfStudy: currentUser?.yearOfStudy || '1st Year',
    avatar: currentUser?.avatar || null
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/me');
        
        if (response.data.success) {
          const userData = response.data.data;
          
          setProfileData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            institution: userData.institution || '',
            major: userData.major || '',
            bio: userData.bio || '',
            interests: userData.interests || [],
            yearOfStudy: userData.yearOfStudy || '1st Year',
            avatar: userData.avatar || null
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await api.put('/auth/me', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio,
        institution: profileData.institution,
        major: profileData.major,
        yearOfStudy: profileData.yearOfStudy,
        interests: profileData.interests
      });
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        
        // Update the current user in auth context
        updateCurrentUser(response.data.data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
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
  
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };
  
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      e.target.value = null; // Reset file input
      return;
    }

    // Show specific message for GIF files
    if (file.type === 'image/gif') {
      toast.info('GIF uploaded. Note that only the first frame may be displayed in some browsers.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size should be less than 5MB');
      e.target.value = null; // Reset file input
      return;
    }

    setAvatarFile(file);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        console.log('Avatar upload successful. Server response:', response.data);
        
        // Update profile data with new avatar URL
        setProfileData(prev => ({
          ...prev,
          avatar: response.data.data.avatar
        }));
        
        // Update the current user in context with the new avatar
        updateCurrentUser({
          ...currentUser,
          avatar: response.data.data.avatar
        });
        
        toast.success('Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error.response?.data?.error || 'Failed to upload profile picture');
      e.target.value = null; // Reset file input
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get avatar URL or placeholder
  const getAvatarContent = () => {
    if (avatarFile) {
      return <img src={URL.createObjectURL(avatarFile)} alt="Profile" className="h-full w-full object-cover rounded-full" />;
    } else if (profileData?.avatar) {
      // Construct the full URL for the avatar
      const avatarUrl = profileData.avatar.startsWith('http') 
        ? profileData.avatar 
        : `${API_URL}${profileData.avatar}`;
        
      return (
        <img
          src={avatarUrl}
          alt="Profile"
          className="h-full w-full object-cover rounded-full"
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
              initialsDiv.className = "flex items-center justify-center h-full w-full bg-blue-500 rounded-full text-white text-2xl font-bold";
              
              // Get initials from profile data
              const initials = `${profileData.firstName?.charAt(0) || ''}${profileData.lastName?.charAt(0) || ''}`;
              initialsDiv.textContent = initials;
              
              // Append to parent
              parent.appendChild(initialsDiv);
            }
          }}
        />
      );
    } else {
      // Display initials if no avatar
      const initials = `${profileData.firstName?.charAt(0) || ''}${profileData.lastName?.charAt(0) || ''}`;
      return (
        <div className="flex items-center justify-center h-full w-full bg-blue-500 rounded-full text-white text-2xl font-bold">
          {initials}
        </div>
      );
    }
  };

  if (loading && !isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-primary-600 mr-3" />
        <span className="text-secondary-600">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-primary-500 to-primary-700">
          <button 
            onClick={handleAvatarClick}
            className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow hover:bg-secondary-100 transition-colors"
            disabled={uploadingAvatar}
          >
            <FaCamera className="text-secondary-700" />
          </button>
        </div>
        
        <div className="relative px-6 py-8">
          {/* Profile Picture */}
          <div className="absolute -top-16 left-6">
            <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg">
              {getAvatarContent()}
            </div>
            {/* Hidden file input for avatar upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
            />
          </div>
          
          {/* Edit Button */}
          <div className="flex justify-end mb-8">
            {isEditing ? (
              <div className="space-x-3">
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="px-4 py-2 border border-secondary-300 rounded-md text-secondary-700 hover:bg-secondary-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                  {loading ? 'Saving...' : 'Save Changes'}
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
                    value={profileData.yearOfStudy || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select year of study</option>
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
                    value={profileData.institution || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Major</label>
                  <input
                    type="text"
                    name="major"
                    value={profileData.major || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Interests</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileData.interests && profileData.interests.map((interest, index) => (
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
              <p className="text-secondary-600">
                {profileData.major ? `${profileData.major} • ` : ''}
                {profileData.yearOfStudy || ''}
              </p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-secondary-900 mb-3">Contact Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaEnvelope className="text-secondary-500 mr-3" />
                      <span>{profileData.email}</span>
                    </div>
                    {profileData.institution && (
                      <div className="flex items-center">
                        <FaGraduationCap className="text-secondary-500 mr-3" />
                        <span>{profileData.institution}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-secondary-900 mb-3">Academic Information</h2>
                  <div className="space-y-3">
                    {profileData.major && (
                      <div className="flex items-center">
                        <FaBook className="text-secondary-500 mr-3" />
                        <span>{profileData.major}</span>
                      </div>
                    )}
                    {profileData.yearOfStudy && (
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-secondary-500 mr-3" />
                        <span>{profileData.yearOfStudy}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {profileData.bio && (
                  <div className="md:col-span-2">
                    <h2 className="text-lg font-semibold text-secondary-900 mb-3">About Me</h2>
                    <p className="text-secondary-700">{profileData.bio}</p>
                  </div>
                )}
                
                {profileData.interests && profileData.interests.length > 0 && (
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
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 