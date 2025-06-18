import React, { useState } from 'react';
import { FaFile, FaImage, FaFileAlt, FaFilePdf, FaDownload, FaTrash, FaEdit, FaExternalLinkAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { resourceService } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const ResourceList = ({ resources, roomId, onResourceDeleted, onResourceEdit, isOwner }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get icon based on resource type
  const getResourceIcon = (type) => {
    switch (type) {
      case 'PDF':
        return <FaFilePdf className="text-red-600" />;
      case 'Image':
        return <FaImage className="text-blue-500" />;
      case 'Document':
        return <FaFileAlt className="text-green-600" />;
      default:
        return <FaFile className="text-gray-600" />;
    }
  };

  // Handle resource deletion
  const handleDelete = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      try {
        setLoading(true);
        await resourceService.deleteResource(resourceId);
        if (onResourceDeleted) onResourceDeleted(resourceId);
      } catch (err) {
        console.error('Error deleting resource:', err);
        setError('Failed to delete resource. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Check if user can edit/delete a resource
  const canModifyResource = (resource) => {
    return isOwner || resource.uploader?.id === currentUser?.id || currentUser?.role === 'admin';
  };

  if (resources.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-600">
        <p>No resources have been added to this study room yet.</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-3">
        {resources.map(resource => (
          <div 
            key={resource.id}
            className="flex items-center justify-between bg-white p-4 rounded-lg border border-secondary-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3 flex-grow">
              <div className="text-xl">
                {getResourceIcon(resource.type)}
              </div>
              
              <div className="flex-grow">
                <h4 className="font-medium text-secondary-900">{resource.title}</h4>
                {resource.description && (
                  <p className="text-sm text-secondary-600 line-clamp-1">{resource.description}</p>
                )}
                <div className="flex items-center text-xs text-secondary-500 mt-1">
                  <span>
                    Added by {resource.uploader?.firstName} {resource.uploader?.lastName} • {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
                  </span>
                  {resource.fileSize && (
                    <span className="ml-3">
                      {Math.round(resource.fileSize / 1024)} KB
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {resource.url && !resource.downloadUrl && (
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                  title="Open link"
                >
                  <FaExternalLinkAlt />
                </a>
              )}
              
              {resource.downloadUrl && (
                <a 
                  href={resourceService.getDownloadUrl(resource.id)}
                  download
                  className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                  title="Download file"
                >
                  <FaDownload />
                </a>
              )}
              
              {canModifyResource(resource) && (
                <>
                  <button 
                    onClick={() => onResourceEdit(resource)}
                    className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                    title="Edit resource"
                  >
                    <FaEdit />
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(resource.id)}
                    className="p-2 text-secondary-600 hover:text-red-600 transition-colors"
                    disabled={loading}
                    title="Delete resource"
                  >
                    <FaTrash />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceList; 