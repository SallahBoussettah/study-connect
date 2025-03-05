import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaLock, FaGlobe, FaImage, FaPlus, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const CreateStudyRoom = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    isPrivate: false,
    image: null,
    tags: []
  });
  
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  
  // Subject options
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Literature', 'History', 'Geography', 'Economics', 'Business',
    'Psychology', 'Sociology', 'Philosophy', 'Art', 'Music',
    'Engineering', 'Medicine', 'Law', 'Languages', 'Other'
  ];
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required';
    }
    
    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real app, you would send this data to your backend
      console.log('Creating study room with data:', formData);
      
      // Redirect to the study rooms page after creation
      navigate('/dashboard/rooms');
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">Create Study Room</h1>
        <p className="text-secondary-600 mt-1">
          Set up a new virtual space for collaborative learning
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            {/* Room Image */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Room Image (Optional)
              </label>
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 border-2 border-dashed border-secondary-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Room preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaImage className="text-secondary-400 text-4xl" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="text-sm text-secondary-500">
                  <p>Click to upload an image for your study room</p>
                  <p>Max size: 5MB. Recommended: 800x600px</p>
                </div>
              </div>
            </div>
            
            {/* Room Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                Room Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-secondary-300'} rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                placeholder="e.g., Advanced Calculus Study Group"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 mb-2">
                Subject*
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.subject ? 'border-red-500' : 'border-secondary-300'} rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-secondary-300'} rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                placeholder="Describe what your study room is about and what participants can expect..."
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            
            {/* Privacy Setting */}
            <div>
              <span className="block text-sm font-medium text-secondary-700 mb-2">
                Privacy Setting
              </span>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isPrivate"
                    checked={!formData.isPrivate}
                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                  />
                  <span className="ml-2 flex items-center">
                    <FaGlobe className="text-secondary-500 mr-1" /> Public
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                  />
                  <span className="ml-2 flex items-center">
                    <FaLock className="text-secondary-500 mr-1" /> Private
                  </span>
                </label>
              </div>
              <p className="mt-1 text-sm text-secondary-500">
                {formData.isPrivate 
                  ? 'Private rooms require approval to join and are not visible in search results.'
                  : 'Public rooms are visible to everyone and anyone can join.'}
              </p>
            </div>
            
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Tags (Optional)
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-grow px-4 py-2 border border-secondary-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add tags (e.g., calculus, exam-prep)"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors"
                >
                  <FaPlus />
                </button>
              </div>
              <p className="mt-1 text-sm text-secondary-500">
                Press Enter to add multiple tags
              </p>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full flex items-center"
                    >
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-primary-700 hover:text-primary-900"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/dashboard/rooms')}
            className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-md hover:bg-secondary-100 transition-colors mr-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Create Room
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStudyRoom; 