import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { studyRoomService } from '../../services/api';

const CreateStudyRoom = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subjectId: '',
    image: ''
  });

  // Fetch subjects for dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Note: You would need to create an API endpoint to fetch subjects
        // For now, we'll use mock data
        const mockSubjects = [
          { id: '1', name: 'Mathematics' },
          { id: '2', name: 'Physics' },
          { id: '3', name: 'Computer Science' },
          { id: '4', name: 'Literature' },
          { id: '5', name: 'Chemistry' },
          { id: '6', name: 'Biology' }
        ];
        
        setSubjects(mockSubjects);
        setLoadingSubjects(false);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setLoadingSubjects(false);
      }
    };
    
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Study room name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Call API to create study room
      const newRoom = await studyRoomService.createStudyRoom(formData);
      
      // Navigate to the study room page
      navigate(`/dashboard/rooms/${newRoom.id}`);
    } catch (err) {
      console.error('Error creating study room:', err);
      setError('Failed to create study room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate('/dashboard/rooms')} 
        className="mb-6 flex items-center text-sm text-secondary-600 hover:text-secondary-800"
      >
        <FaArrowLeft className="mr-2" /> Back to Study Rooms
      </button>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">Create New Study Room</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
              Room Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-secondary-300 rounded-md focus:ring focus:ring-primary-200 focus:border-primary-500"
              placeholder="e.g., Advanced Calculus Study Group"
              maxLength={100}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border border-secondary-300 rounded-md focus:ring focus:ring-primary-200 focus:border-primary-500"
              placeholder="Describe what your study room is about..."
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="subjectId" className="block text-sm font-medium text-secondary-700 mb-1">
              Subject
            </label>
            <select
              id="subjectId"
              name="subjectId"
              value={formData.subjectId}
              onChange={handleChange}
              className="w-full p-2 border border-secondary-300 rounded-md focus:ring focus:ring-primary-200 focus:border-primary-500"
              disabled={loadingSubjects}
            >
              <option value="">Select a subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {loadingSubjects && (
              <p className="text-xs text-secondary-500 mt-1">Loading subjects...</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="image" className="block text-sm font-medium text-secondary-700 mb-1">
              Cover Image URL (optional)
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full p-2 border border-secondary-300 rounded-md focus:ring focus:ring-primary-200 focus:border-primary-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-secondary-500 mt-1">
              Provide a URL to an image. If left empty, a default image will be generated.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/dashboard/rooms')}
              className="mr-2 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-md hover:bg-secondary-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" /> Creating...
                </span>
              ) : (
                'Create Study Room'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudyRoom; 