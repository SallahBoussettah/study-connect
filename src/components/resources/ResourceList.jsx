import React, { useState } from 'react';
import { FaFile, FaImage, FaFileAlt, FaFilePdf, FaDownload, FaTrash, FaEdit, FaExternalLinkAlt, FaFileWord, FaFileExcel, FaFilePowerpoint, FaLink, FaEye, FaFileCode, FaFileArchive, FaFileAudio, FaFileVideo, FaYoutube } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { resourceService } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const ResourceList = ({ resources, roomId, onResourceDeleted, onResourceEdit, isOwner }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);

  // Log resources for debugging
  console.log('Resources:', resources);

  // Add detailed debugging for each resource
  resources.forEach(resource => {
    console.log(`Resource "${resource.title}" (${resource.id}):`);
    console.log(`  Type: ${resource.type}`);
    console.log(`  URL: ${resource.url || 'null'}`);
    console.log(`  Has URL: ${Boolean(resource.url && resource.url.trim() !== '')}`);
    console.log(`  Has downloadUrl: ${Boolean(resource.downloadUrl)}`);
  });

  // Check if a URL is a YouTube link
  const isYoutubeLink = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Check if a resource is a link type
  const isLinkResource = (resource) => {
    // Debug log to see what's happening with this resource
    console.log('Checking if resource is link:', resource.title, resource.type, resource.url);
    
    // Consider a resource as a link if either:
    // 1. It has type 'Link'
    // 2. It has a non-empty URL
    return resource.type === 'Link' || (resource.url && resource.url.trim() !== '');
  };

  // Get icon based on resource type and file extension
  const getResourceIcon = (resource) => {
    console.log('Resource for icon:', resource.title, resource.type, resource.url);
    
    // If it's an external link or Link type, return appropriate icon
    if (isLinkResource(resource)) {
      // Special case for YouTube links
      if (resource.url && isYoutubeLink(resource.url)) {
        return <FaYoutube className="text-red-600" />;
      }
      return <FaLink className="text-purple-600" />;
    }
    
    // Check file extension if available
    const fileName = resource.originalFilename || '';
    const extension = fileName.split('.').pop().toLowerCase();
    
    // Map extensions to icon types
    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="text-red-600" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-600" />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FaFileExcel className="text-green-600" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="text-orange-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        return <FaImage className="text-blue-500" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FaFileArchive className="text-yellow-600" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <FaFileAudio className="text-purple-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FaFileVideo className="text-pink-500" />;
      case 'txt':
        return <FaFileAlt className="text-gray-600" />;
      case 'js':
      case 'html':
      case 'css':
      case 'py':
      case 'java':
      case 'php':
        return <FaFileCode className="text-teal-600" />;
    }
    
    // If extension doesn't match or resource type is available, use resource type
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

  // Handle opening an external link
  const handleOpenLink = (url) => {
    console.log('Opening link:', url);
    if (!url || url.trim() === '') {
      alert('This link has no URL. Please edit the resource to add a URL.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle download
  const handleDownload = (resource) => {
    if (resource.downloadUrl) {
      window.open(resourceService.getDownloadUrl(resource.id), '_blank');
    } else {
      alert('This resource has no file to download.');
    }
  };

  // Handle resource preview
  const handlePreview = (resource) => {
    // For previewable files
    if (resource.type === 'Image' || resource.type === 'PDF') {
      setPreviewUrl(resourceService.getDownloadUrl(resource.id));
      setPreviewResource(resource);
      setPreviewOpen(true);
    } else {
      // For non-previewable files, download directly
      window.open(resourceService.getDownloadUrl(resource.id), '_blank');
    }
  };

  // Close resource preview
  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl('');
    setPreviewResource(null);
  };

  // Check if resource is previewable
  const isPreviewable = (resource) => {
    // Only certain file types can be previewed in-browser
    return (resource.type === 'Image' || resource.type === 'PDF') && !isLinkResource(resource);
  };

  // Get file extension from original filename
  const getFileExtension = (resource) => {
    if (!resource.originalFilename) return '';
    const parts = resource.originalFilename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  };

  // Get label for external link type
  const getLinkTypeLabel = (url) => {
    if (!url) return 'External';
    
    if (isYoutubeLink(url)) {
      return 'YouTube';
    } else if (url.includes('drive.google.com')) {
      return 'Google Drive';
    } else if (url.includes('docs.google.com')) {
      return 'Google Docs';
    } else if (url.includes('github.com')) {
      return 'GitHub';
    } else {
      return 'External';
    }
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
                {getResourceIcon(resource)}
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
                  {resource.originalFilename && (
                    <span className="flex items-center">
                      <span className="w-1 h-1 bg-secondary-400 rounded-full mx-2"></span>
                      {getFileExtension(resource).toUpperCase()}
                    </span>
                  )}
                  {/* Debug info */}
                  <span className="flex items-center bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    URL: {resource.url ? 'Yes' : 'No'}
                  </span>
                  {isLinkResource(resource) && (
                    <span className={`flex items-center text-xs px-2 py-0.5 rounded ${
                      resource.url && isYoutubeLink(resource.url) ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {resource.url && isYoutubeLink(resource.url) ? <FaYoutube className="mr-1" size={10} /> : <FaLink className="mr-1" size={10} />}
                      {resource.url ? getLinkTypeLabel(resource.url) : 'Link'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Direct action buttons for every resource */}
              <button 
                onClick={() => onResourceEdit(resource)}
                className="p-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors rounded-md flex items-center"
                title="Edit resource"
              >
                <FaEdit className="mr-1" /> Edit
              </button>
              
              <button 
                onClick={() => resource.url ? handleOpenLink(resource.url) : onResourceEdit(resource)}
                className="p-2 bg-green-500 text-white hover:bg-green-600 transition-colors rounded-md flex items-center"
                title={resource.url ? "Open link" : "Add URL"}
              >
                <FaExternalLinkAlt className="mr-1" /> {resource.url ? "Open Link" : "Add URL"}
              </button>
              
              <button 
                onClick={() => handleDownload(resource)}
                className="p-2 bg-purple-500 text-white hover:bg-purple-600 transition-colors rounded-md flex items-center"
                title="Download file"
              >
                <FaDownload className="mr-1" /> Download
              </button>
              
              <button 
                onClick={() => handleDelete(resource.id)}
                className="p-2 bg-red-500 text-white hover:bg-red-600 transition-colors rounded-md"
                disabled={loading}
                title="Delete resource"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewOpen && previewUrl && previewResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">{previewResource.title}</h3>
              <button 
                onClick={closePreview}
                className="text-secondary-500 hover:text-secondary-700"
              >
                &times;
              </button>
            </div>
            <div className="flex-grow overflow-auto p-4">
              {previewResource.type === 'PDF' ? (
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
                download={previewResource.originalFilename || true}
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