import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { resourceService } from '../../services/api';
import ResourceForm from '../../components/resources/ResourceForm';

const ResourceEdit = () => {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the resource data
  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const resourceData = await resourceService.getResourceById(resourceId);
        setResource(resourceData);
      } catch (err) {
        console.error('Error fetching resource:', err);
        setError('Failed to load resource. It may have been deleted or you do not have permission to edit it.');
        toast.error('Failed to load resource');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [resourceId]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await resourceService.updateResource(resourceId, formData);
      toast.success('Resource updated successfully!');
      navigate('/dashboard/resources');
    } catch (err) {
      console.error('Error updating resource:', err);
      toast.error('Failed to update resource. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <FaSpinner className="animate-spin text-primary-600 text-3xl mr-3" />
        <span className="text-secondary-600">Loading resource...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <h2 className="text-lg font-medium mb-2">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate('/dashboard/resources')}
          className="mt-4 px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700"
        >
          Back to Resources
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/resources')}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <FaArrowLeft className="mr-2" /> Back to Resources
        </button>
        
        <h1 className="text-2xl font-bold text-secondary-900">Edit Resource</h1>
        <p className="text-secondary-600 mt-1">
          Update your resource details
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {resource && (
          <ResourceForm
            resource={resource}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/dashboard/resources')}
            loading={submitting}
          />
        )}
      </div>
    </div>
  );
};

export default ResourceEdit; 