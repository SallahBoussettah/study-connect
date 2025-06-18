import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaSpinner } from 'react-icons/fa';

// Components
import StudyRoomLayout from '../../components/layouts/StudyRoomLayout';
import ResourceList from '../../components/resources/ResourceList';
import ResourceModal from '../../components/resources/ResourceModal';
import EmptyState from '../../components/common/EmptyState';

// Services and Context
import { resourceService, studyRoomService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const StudyRoomResources = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [resources, setResources] = useState([]);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [error, setError] = useState(null);
  const [isUserRoomOwner, setIsUserRoomOwner] = useState(false);

  // Load study room information and resources
  useEffect(() => {
    const loadRoomAndResources = async () => {
      setLoading(true);
      try {
        // Load room data
        const roomData = await studyRoomService.getStudyRoomById(roomId);
        setRoom(roomData);
        setIsUserRoomOwner(roomData.ownerId === currentUser?.id);

        // Load room resources
        const resourcesData = await resourceService.getStudyRoomResources(roomId);
        setResources(resourcesData);
      } catch (err) {
        console.error('Error loading room data:', err);
        
        // Handle unauthorized or room not found
        if (err.response?.status === 403 || err.response?.status === 404) {
          toast.error('You do not have access to this study room');
          navigate('/study-rooms');
        } else {
          setError('Failed to load resources. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadRoomAndResources();
  }, [roomId, navigate, currentUser?.id]);

  // Open modal to add a new resource
  const handleAddResource = () => {
    setSelectedResource(null);
    setModalOpen(true);
  };

  // Open modal to edit an existing resource
  const handleEditResource = (resource) => {
    setSelectedResource(resource);
    setModalOpen(true);
  };

  // Handle resource deletion
  const handleResourceDeleted = (resourceId) => {
    setResources(prevResources => prevResources.filter(r => r.id !== resourceId));
    toast.success('Resource deleted successfully');
  };

  // Handle form submission (create/update)
  const handleSubmitResource = async (formData) => {
    setSubmitting(true);
    
    try {
      let result;
      
      if (selectedResource) {
        // Update existing resource
        result = await resourceService.updateResource(selectedResource.id, formData);
        setResources(prevResources => 
          prevResources.map(r => r.id === result.id ? result : r)
        );
        toast.success('Resource updated successfully');
      } else {
        // Create new resource
        result = await resourceService.createResource(roomId, formData);
        setResources(prevResources => [...prevResources, result]);
        toast.success('Resource added successfully');
      }
      
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving resource:', err);
      toast.error(err.response?.data?.message || 'Failed to save resource. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudyRoomLayout roomId={roomId} activeTab="resources">
      <div className="container mx-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-primary-600 text-3xl" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-secondary-900">Resources</h1>
              <button
                onClick={handleAddResource}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <FaPlus className="mr-2" /> Add Resource
              </button>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
                {error}
              </div>
            )}

            {resources.length === 0 && !loading ? (
              <EmptyState
                title="No resources yet"
                description="Share documents, links, and other materials with your study group."
                actionText="Add your first resource"
                onAction={handleAddResource}
              />
            ) : (
              <ResourceList
                resources={resources}
                roomId={roomId}
                isOwner={isUserRoomOwner}
                onResourceEdit={handleEditResource}
                onResourceDeleted={handleResourceDeleted}
              />
            )}
          </>
        )}
      </div>

      <ResourceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitResource}
        resource={selectedResource}
        loading={submitting}
      />
    </StudyRoomLayout>
  );
};

export default StudyRoomResources; 