import React, { useState } from 'react';
import { FaFile, FaImage, FaFileAlt, FaFilePdf, FaDownload, FaTrash, FaEdit, FaExternalLinkAlt, FaFileWord, FaFileExcel, FaFilePowerpoint, FaLink, FaEye } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { resourceService } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const ResourceList = ({ resources, roomId, onResourceDeleted, onResourceEdit, isOwner }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Get icon based on resource type
  const getResourceIcon = (type) => {
    switch (type) {
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
      case 'Link':
        return <FaLink className="text-purple-600" />;
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
    // Only allow the uploader and admins to edit/delete resources
    return resource.uploader?.id === currentUser?.id || currentUser?.role === 'admin';
  };

  // Format file size for display
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

  // Handle resource access (download or open link)
  const handleResourceAccess = (resource) => {
    if (resource.url && !resource.downloadUrl) {
      // It's an external link
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    } else if (resource.downloadUrl) {
      // It's a downloadable file
      window.open(resourceService.getDownloadUrl(resource.id), '_blank');
    }
  };

  // Handle resource preview
  const handlePreview = (resource) => {
    // Only preview supported file types
    if (resource.type === 'Image' || resource.type === 'PDF') {
      setPreviewUrl(resourceService.getDownloadUrl(resource.id));
      setPreviewOpen(true);
    } else if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Close resource preview
  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl('');
  };

  // Check if resource is previewable
  const isPreviewable = (resource) => {
    return resource.type === 'Image' || resource.type === 'PDF' || resource.url;
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
                  <p className="text-sm text-secondary-600 line-clamp-2">{resource.description}</p>
                )}
                <div className="flex items-center text-xs text-secondary-500 mt-1 flex-wrap gap-2">
                  <span>
                    Added by {resource.uploader?.firstName} {resource.uploader?.lastName} • {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
                  </span>
                  {resource.fileSize && (
                    <span className="flex items-center">
                      <span className="w-1 h-1 bg-secondary-400 rounded-full mx-2"></span>
                      {formatFileSize(resource.fileSize)}
                    </span>
                  )}
                  {resource.type && (
                    <span className="flex items-center">
                      <span className="w-1 h-1 bg-secondary-400 rounded-full mx-2"></span>
                      {resource.type}
                    </span>
                  )}
                  {resource.url && !resource.downloadUrl && (
                    <span className="flex items-center text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      <FaLink className="mr-1" size={10} /> External
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isPreviewable(resource) && (
                <button 
                  onClick={() => handlePreview(resource)}
                  className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                  title="Preview"
                >
                  <FaEye />
                </button>
              )}
              
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

      {/* Preview Modal */}
      {previewOpen && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Resource Preview</h3>
              <button 
                onClick={closePreview}
                className="text-secondary-500 hover:text-secondary-700"
              >
                &times;
              </button>
            </div>
            <div className="flex-grow overflow-auto p-4">
              {previewUrl.endsWith('.pdf') ? (
                <iframe 
                  src={previewUrl} 
                  className="w-full h-[70vh]" 
                  title="PDF Preview" 
                  frameBorder="0"
                ></iframe>
              ) : (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <a 
                href={previewUrl}
                download
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceList; 