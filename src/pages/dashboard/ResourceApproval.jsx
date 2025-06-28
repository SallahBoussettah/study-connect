import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSpinner, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaImage, FaFile, FaFileAlt, FaLink, FaFileCode, FaFileArchive, FaFileAudio, FaFileVideo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { resourceService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const ResourceApproval = () => {
  const [pendingResources, setPendingResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [previewResource, setPreviewResource] = useState(null);
  const { currentUser } = useAuth();

  // Check if user has permission to access this page
  const hasPermission = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  // Fetch pending resources
  useEffect(() => {
    const fetchPendingResources = async () => {
      try {
        setLoading(true);
        const resources = await resourceService.getPendingResources();
        setPendingResources(resources);
      } catch (error) {
        console.error('Error fetching pending resources:', error);
        toast.error('Failed to load pending resources');
      } finally {
        setLoading(false);
      }
    };

    if (hasPermission) {
      fetchPendingResources();
    }
  }, [hasPermission]);

  // Handle resource approval
  const handleApprove = async (resourceId) => {
    try {
      setReviewingId(resourceId);
      const updatedResource = await resourceService.reviewResource(resourceId, 'approved', reviewNotes);
      
      // Update the state to remove the approved resource
      setPendingResources(prevResources => 
        prevResources.filter(resource => resource.id !== resourceId)
      );
      
      toast.success('Resource approved successfully');
      setReviewNotes('');
    } catch (error) {
      console.error('Error approving resource:', error);
      toast.error('Failed to approve resource');
    } finally {
      setReviewingId(null);
    }
  };

  // Handle resource rejection
  const handleReject = async (resourceId) => {
    try {
      setReviewingId(resourceId);
      const updatedResource = await resourceService.reviewResource(resourceId, 'rejected', reviewNotes);
      
      // Update the state to remove the rejected resource
      setPendingResources(prevResources => 
        prevResources.filter(resource => resource.id !== resourceId)
      );
      
      toast.success('Resource rejected');
      setReviewNotes('');
    } catch (error) {
      console.error('Error rejecting resource:', error);
      toast.error('Failed to reject resource');
    } finally {
      setReviewingId(null);
    }
  };

  // Preview a resource
  const handlePreview = (resource) => {
    setPreviewResource(resource);
    window.open(resourceService.getDownloadUrl(resource.id), '_blank');
  };

  // Get icon based on resource type
  const getResourceIcon = (resource) => {
    switch (resource.type) {
      case 'PDF':
        return <FaFilePdf className="text-red-600" />;
      case 'Image':
        return <FaImage className="text-blue-500" />;
      case 'Document':
        return <FaFileWord className="text-blue-600" />;
      case 'Spreadsheet':
        return <FaFileExcel className="text-green-600" />;
      case 'Presentation':
        return <FaFilePowerpoint className="text-orange-600" />;
      case 'Code':
        return <FaFileCode className="text-teal-600" />;
      case 'Link':
        return <FaLink className="text-purple-600" />;
      case 'Archive':
        return <FaFileArchive className="text-yellow-600" />;
      case 'Audio':
        return <FaFileAudio className="text-purple-500" />;
      case 'Video':
        return <FaFileVideo className="text-pink-500" />;
      case 'Text':
        return <FaFileAlt className="text-gray-600" />;
      default:
        return <FaFile className="text-gray-600" />;
    }
  };

  // Format file size
  const formatFileSize = (sizeInBytes) => {
    if (!sizeInBytes) return '';
    
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  if (!hasPermission) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">Resource Approval</h1>
        <p className="text-secondary-600 mt-1">
          Review and approve resources submitted by students
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-primary-600 mr-3" />
          <span className="text-secondary-600">Loading resources...</span>
        </div>
      ) : pendingResources.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-lg text-secondary-600">No pending resources to review!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingResources.map(resource => (
            <div key={resource.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="text-3xl mr-4">
                    {getResourceIcon(resource)}
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-xl font-medium text-secondary-900">{resource.title}</h2>
                    {resource.description && (
                      <p className="text-secondary-600 mt-1">{resource.description}</p>
                    )}
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-secondary-500">
                      <div>
                        <span className="font-medium text-secondary-700">Uploaded by:</span>{' '}
                        {resource.uploader?.firstName} {resource.uploader?.lastName} ({resource.uploader?.role})
                      </div>
                      <div>
                        <span className="font-medium text-secondary-700">Study Room:</span>{' '}
                        {resource.studyRoom?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium text-secondary-700">Date:</span>{' '}
                        {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
                      </div>
                      <div>
                        <span className="font-medium text-secondary-700">File Size:</span>{' '}
                        {formatFileSize(resource.fileSize)}
                      </div>
                      <div>
                        <span className="font-medium text-secondary-700">Type:</span>{' '}
                        {resource.type}
                      </div>
                      <div>
                        <span className="font-medium text-secondary-700">Original Filename:</span>{' '}
                        {resource.originalFilename || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => handlePreview(resource)}
                    className="btn-secondary mr-4"
                  >
                    Preview Resource
                  </button>
                </div>
                
                <div className="mt-6">
                  <label htmlFor={`notes-${resource.id}`} className="block text-sm font-medium text-secondary-700 mb-2">
                    Review Notes (optional)
                  </label>
                  <textarea
                    id={`notes-${resource.id}`}
                    rows="2"
                    className="w-full border border-secondary-300 rounded-md p-2 text-secondary-900"
                    placeholder="Add notes about this resource (will be visible to the uploader)"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="mt-4 flex justify-end space-x-4">
                  <button
                    onClick={() => handleReject(resource.id)}
                    disabled={reviewingId === resource.id}
                    className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {reviewingId === resource.id ? (
                      <><FaSpinner className="animate-spin inline mr-2" /> Rejecting...</>
                    ) : (
                      <><FaTimes className="inline mr-2" /> Reject</>
                    )}
                  </button>
                  <button
                    onClick={() => handleApprove(resource.id)}
                    disabled={reviewingId === resource.id}
                    className="px-4 py-2 bg-green-50 text-green-600 font-medium rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {reviewingId === resource.id ? (
                      <><FaSpinner className="animate-spin inline mr-2" /> Approving...</>
                    ) : (
                      <><FaCheck className="inline mr-2" /> Approve</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceApproval; 