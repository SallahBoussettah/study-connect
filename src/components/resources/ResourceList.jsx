import React, { useState, useEffect } from 'react';
import { FaFile, FaImage, FaFileAlt, FaFilePdf, FaDownload, FaTrash, FaEdit, FaExternalLinkAlt, FaFileWord, FaFileExcel, FaFilePowerpoint, FaLink, FaEye, FaFileCode, FaFileArchive, FaFileAudio, FaFileVideo, FaYoutube, FaShareAlt, FaEllipsisV, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { resourceService, friendshipService, directMessageService } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';

const ResourceList = ({ resources = [], roomId, onResourceDeleted, onResourceEdit, isOwner }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [resourceToShare, setResourceToShare] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [sharingStatus, setSharingStatus] = useState({});

  // Filter out any null or undefined resources
  const validResources = resources.filter(resource => resource);
  
  // Log the context of this resource list
  console.log(`ResourceList: Rendering ${validResources.length} resources${roomId ? ` for room ${roomId}` : ' (global view)'}`);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside of any dropdown
      if (activeDropdown !== null && 
          !event.target.closest('.resource-dropdown') && 
          !event.target.closest('.dropdown-menu')) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Fetch friends when share modal is opened
  useEffect(() => {
    if (shareModalOpen) {
      fetchFriends();
    }
  }, [shareModalOpen]);

  // Fetch friends list
  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const friendsData = await friendshipService.getAllFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends list');
    } finally {
      setLoadingFriends(false);
    }
  };

  // Check if a URL is a YouTube link
  const isYoutubeLink = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Check if a resource is a link type
  const isLinkResource = (resource) => {
    if (!resource) return false;
    return resource.type === 'Link' || (resource.url && resource.url.trim() !== '');
  };

  // Get icon based on resource type and file extension
  const getResourceIcon = (resource) => {
    if (!resource) return <FaFile className="text-gray-600" />;
    
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
    return resource.uploader?.id === currentUser?.id || currentUser?.role === 'admin' || isOwner;
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
      toast.error('This link has no URL. Please edit the resource to add a URL.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle download
  const handleDownload = async (resource) => {
    try {
      setLoading(true);
      
      if (resource.downloadUrl) {
        await resourceService.downloadResource(
          resource.id, 
          resource.originalFilename || `${resource.title}.${getFileExtension(resource) || 'file'}`
        );
        toast.success('Download started');
      } else if (resource.url) {
        handleOpenLink(resource.url);
      } else {
        toast.error('No download link available for this resource');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast.error('Failed to download resource: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
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
      handleDownload(resource);
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

  // Toggle dropdown menu
  const toggleDropdown = (e, resourceId) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(prevActive => prevActive === resourceId ? null : resourceId);
  };

  // Open share modal
  const openShareModal = (resource) => {
    setResourceToShare(resource);
    setShareModalOpen(true);
    setActiveDropdown(null);
  };

  // Close share modal
  const closeShareModal = () => {
    setShareModalOpen(false);
    setResourceToShare(null);
    setSharingStatus({});
  };

  // Share resource with a friend
  const shareWithFriend = async (friendId) => {
    try {
      setSharingStatus(prev => ({ ...prev, [friendId]: 'loading' }));
      
      // Create resource link
      const resourceLink = `${window.location.origin}/dashboard/resources/${resourceToShare.id}`;
      
      // Create message content
      let messageContent = `Check out this resource: "${resourceToShare.title}"\n${resourceLink}`;
      
      // Send direct message to friend
      await directMessageService.sendDirectMessage(friendId, messageContent);
      
      setSharingStatus(prev => ({ ...prev, [friendId]: 'success' }));
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSharingStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[friendId];
          return newStatus;
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error sharing resource:', error);
      setSharingStatus(prev => ({ ...prev, [friendId]: 'error' }));
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSharingStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[friendId];
          return newStatus;
        });
      }, 2000);
    }
  };

  // Get status badge for resource
  const getStatusBadge = (resource) => {
    if (!resource.status || resource.status === 'approved') {
      return null; // No badge for approved resources
    }

    if (resource.status === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending Approval
        </span>
      );
    }

    if (resource.status === 'rejected') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Rejected
        </span>
      );
    }
  };

  if (validResources.length === 0) {
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
        {validResources.map(resource => (
          <div 
            key={resource.id}
            className={`flex items-center justify-between bg-white p-4 rounded-lg border ${
              resource.status === 'rejected' ? 'border-red-200' : 
              resource.status === 'pending' ? 'border-yellow-200' : 
              'border-secondary-200'
            } hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center space-x-3 flex-grow">
              <div className="text-xl">
                {getResourceIcon(resource)}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center">
                  <h4 className="font-medium text-secondary-900">{resource.title}</h4>
                  {getStatusBadge(resource)}
                </div>
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
                  {resource.reviewNotes && (
                    <span className="block w-full mt-1 text-secondary-600 italic">
                      Review notes: {resource.reviewNotes}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 items-center">
              {isLinkResource(resource) ? (
                <button
                  onClick={() => handleOpenLink(resource.url)}
                  className="p-2 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100"
                  title="Open Link"
                  disabled={loading}
                >
                  <FaExternalLinkAlt />
                </button>
              ) : isPreviewable(resource) && resource.status === 'approved' ? (
                <button
                  onClick={() => handlePreview(resource)}
                  className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                  title="Preview"
                  disabled={loading}
                >
                  <FaEye />
                </button>
              ) : resource.downloadUrl && resource.status === 'approved' ? (
                <button
                  onClick={() => handleDownload(resource)}
                  className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100"
                  title="Download"
                  disabled={loading}
                >
                  <FaDownload />
                </button>
              ) : null}
              
              {/* Dropdown menu */}
              <div className="relative resource-dropdown">
                <button
                  onClick={(e) => toggleDropdown(e, resource.id)}
                  className="p-2 rounded-full bg-secondary-50 text-secondary-600 hover:bg-secondary-100"
                  title="More options"
                >
                  <FaEllipsisV />
                </button>
                
                {activeDropdown === resource.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-secondary-200 dropdown-menu">
                    <div className="py-1">
                      {resource.downloadUrl && resource.status === 'approved' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(null);
                            handleDownload(resource);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                        >
                          <FaDownload className="inline mr-2" /> Download
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openShareModal(resource);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      >
                        <FaShareAlt className="inline mr-2" /> Share with friends
                      </button>
                      
                      {canModifyResource(resource) && (
                        <>
                          {onResourceEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(null);
                                onResourceEdit(resource);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                            >
                              <FaEdit className="inline mr-2" /> Edit resource
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(null);
                              handleDelete(resource.id);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <FaTrash className="inline mr-2" /> Delete resource
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
                <div className="w-full h-[70vh]">
                  <iframe 
                    src={previewUrl} 
                    className="w-full h-full" 
                    title="PDF Preview" 
                    frameBorder="0"
                    onError={() => {
                      toast.error('Failed to load PDF preview. Try downloading instead.');
                    }}
                  ></iframe>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[70vh]">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain"
                    onError={() => {
                      toast.error('Failed to load image preview. Try downloading instead.');
                    }}
                  />
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button 
                onClick={() => handleDownload(previewResource)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && resourceToShare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Share Resource</h3>
              <button 
                onClick={closeShareModal}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4">
              <p className="mb-4 text-secondary-600">
                Share "{resourceToShare.title}" with your friends:
              </p>
              
              {loadingFriends ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                  <p className="mt-2 text-secondary-600">Loading friends...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8 text-secondary-600">
                  <p>You don't have any friends yet.</p>
                  <p className="mt-2">
                    <a href="/dashboard/friends" className="text-primary-600 hover:text-primary-700">
                      Add friends
                    </a>
                    {' '}to share resources with them.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-secondary-200 max-h-60 overflow-y-auto">
                  {friends.map(friend => (
                    <li key={friend.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        {friend.avatar ? (
                          <img 
                            src={friend.avatar} 
                            alt={`${friend.firstName} ${friend.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                            {friend.firstName.charAt(0).toUpperCase()}{friend.lastName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-secondary-900">{friend.firstName} {friend.lastName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => shareWithFriend(friend.id)}
                        disabled={sharingStatus[friend.id] === 'loading'}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          sharingStatus[friend.id] === 'success' ? 'bg-green-100 text-green-800' :
                          sharingStatus[friend.id] === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-primary-100 text-primary-600 hover:bg-primary-200'
                        }`}
                      >
                        {sharingStatus[friend.id] === 'loading' ? 'Sharing...' :
                         sharingStatus[friend.id] === 'success' ? 'Shared!' :
                         sharingStatus[friend.id] === 'error' ? 'Failed' : 'Share'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceList; 