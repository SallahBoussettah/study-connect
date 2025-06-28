import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { resourceService } from '../../services/api';
import ResourceForm from '../../components/resources/ResourceForm';

const ResourceUpload = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Create a global resource (not associated with any study room)
      await resourceService.createGlobalResource(formData);
      
      toast.success('Resource uploaded successfully!');
      navigate('/dashboard/resources');
    } catch (error) {
      console.error('Error uploading resource:', error);
      toast.error('Failed to upload resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/resources')}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <FaArrowLeft className="mr-2" /> Back to Resources
        </button>
        
        <h1 className="text-2xl font-bold text-secondary-900">Upload Global Resource</h1>
        <p className="text-secondary-600 mt-1">
          Share study materials with the entire platform
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <ResourceForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard/resources')}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ResourceUpload; 