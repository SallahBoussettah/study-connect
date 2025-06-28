import React, { useState, useEffect } from 'react';
import { FaBook, FaFile, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaLink, FaSearch, FaUpload, FaFilter, FaEllipsisH, FaSpinner, FaImage, FaCheck, FaEdit, FaTrash, FaShareAlt, FaTimes, FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resourceService, studyRoomService, friendshipService, directMessageService } from '../../services/api';
import socketService from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';

const Resources = () => {
  const [activeTab, setActiveTab] = useState('myResources');
  const [searchQuery, setSearchQuery] = useState('');
  const [myResources, setMyResources] = useState([]);
  const [sharedResources, setSharedResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { currentUser } = useAuth();
  
  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [resourceToShare, setResourceToShare] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [sharingStatus, setSharingStatus] = useState({});
  
  // Check if user is admin or teacher
  const canReviewResources = currentUser?.role === 'admin' || currentUser?.role === 'teacher';
  
  // Store position for dropdown menu
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // Fetch resources data
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      
      try {
        console.log('Fetching global resources only (not study room resources)');
        
        // Fetch global resources (not associated with study rooms)
        const response = await resourceService.getGlobalResources();
        const globalResources = response.data || [];
        
        console.log(`Total global resources found: ${globalResources.length}`);
        
        // Split resources into "my resources" and "shared resources"
        const myRes = globalResources.filter(resource => 
          resource.uploader?.id === currentUser?.id
        );
        
        const sharedRes = globalResources.filter(resource => 
          resource.uploader?.id !== currentUser?.id
        );
        
        console.log(`My resources: ${myRes.length}, Shared resources: ${sharedRes.length}`);
        
        setMyResources(myRes);
        setSharedResources(sharedRes);
      } catch (error) {
        console.error('Failed to load resources:', error);
        // Set empty arrays as fallback
        setMyResources([]);
        setSharedResources([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, [currentUser?.id]);

  const getFileIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'pdf':
        return <FaFilePdf className="text-red-500" />;
      case 'document':
        return <FaFileWord className="text-blue-500" />;
      case 'image':
        return <FaImage className="text-blue-500" />;
      case 'spreadsheet':
        return <FaFileExcel className="text-green-500" />;
      case 'presentation':
        return <FaFilePowerpoint className="text-orange-500" />;
      case 'text':
      case 'txt':
        return <FaFileAlt className="text-secondary-500" />;
      case 'link':
        return <FaLink className="text-purple-500" />;
      default:
        return <FaFile className="text-secondary-500" />;
    }
  };

  const filteredMyResources = myResources.filter(resource => 
    resource.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSharedResources = sharedResources.filter(resource => 
    resource.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const formatFileSize = (sizeInBytes) => {
    if (!sizeInBytes) return '-';
    
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  const handleDownload = (resource) => {
    if (resource.downloadUrl) {
      window.open(resourceService.getDownloadUrl(resource.id), '_blank');
    } else if (resource.url) {
      window.open(resource.url, '_blank');
    } else {
      toast.error('No download link available for this resource');
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = (e, resourceId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (activeDropdown === resourceId) {
      setActiveDropdown(null);
    } else {
      // Calculate position for the dropdown
      const buttonRect = e.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.right - 200, // Align right edge of dropdown with button
      });
      setActiveDropdown(resourceId);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.resource-dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle resource deletion
  const handleDelete = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      try {
        await resourceService.deleteResource(resourceId);
        
        // Update resources lists
        setMyResources(prevResources => 
          prevResources.filter(resource => resource.id !== resourceId)
        );
        setSharedResources(prevResources => 
          prevResources.filter(resource => resource.id !== resourceId)
        );
        
        toast.success('Resource deleted successfully');
      } catch (error) {
        console.error('Error deleting resource:', error);
        toast.error('Failed to delete resource');
      }
    }
  };

  // Handle resource edit - redirect to edit page
  const handleEdit = (resourceId) => {
    window.location.href = `/dashboard/resources/edit/${resourceId}`;
  };

  // Check if user can modify resource
  const canModifyResource = (resource) => {
    if (!resource || !currentUser) return false;
    
    // Admin can modify any resource
    if (currentUser.role === 'admin') return true;
    
    // User can modify their own resources
    return resource.uploaderId === currentUser.id;
  };

  // Open share modal
  const openShareModal = (resource) => {
    setResourceToShare(resource);
    setShareModalOpen(true);
    setActiveDropdown(null);
    fetchFriends();
  };

  // Close share modal
  const closeShareModal = () => {
    setShareModalOpen(false);
    setResourceToShare(null);
    setSharingStatus({});
  };

  // Fetch friends list
  const fetchFriends = async () => {
    setLoadingFriends(true);
    try {
      const response = await friendshipService.getAllFriends();
      setFriends(response || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends list');
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Share resource with a friend
  const shareWithFriend = async (friendId) => {
    try {
      setSharingStatus(prev => ({ ...prev, [friendId]: 'loading' }));
      
      // Get the proper resource URL based on type
      const resourceId = resourceToShare.id;
      let resourceUrl;
      
      if (resourceToShare.downloadUrl) {
        // If it's a downloadable resource, get the direct download URL
        resourceUrl = resourceService.getDownloadUrl(resourceId);
      } else if (resourceToShare.url) {
        // If it's an external link, use that URL
        resourceUrl = resourceToShare.url;
      } else {
        // Otherwise use the view URL
        resourceUrl = `${window.location.origin}/dashboard/resources/view/${resourceId}`;
      }
      
      // Create a well-formatted message with the resource details and HTML link
      // The link text will be "Download Resource" instead of the full URL
      let messageContent = `Check out this resource:\n\n"${resourceToShare.title}"\n\n<a href="${resourceUrl}">Download Resource</a>`;
      
      // First try to send via socket for real-time updates
      // Join the direct chat first to ensure the connection is established
      socketService.joinDirectChat(friendId);
      
      // Small delay to ensure the join operation completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now send the message via socket
      const sent = socketService.sendDirectMessage(friendId, messageContent);
      
      if (!sent) {
        // Fallback to API if socket is not connected
        await directMessageService.sendDirectMessage(friendId, messageContent);
      }
      
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Global Resources</h1>
          <p className="text-secondary-600 mt-1">
            Manage and share study materials across the platform
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
          {canReviewResources && (
            <Link 
              to="/dashboard/resources/approval" 
              className="btn-secondary flex items-center justify-center"
            >
              <FaCheck className="mr-2" /> Review Resources
            </Link>
          )}
          <Link 
            to="/dashboard/resources/upload" 
            className="btn-primary flex items-center justify-center"
          >
            <FaUpload className="mr-2" /> Upload Resource
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="Search resources..."
              className="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-secondary flex items-center justify-center">
            <FaFilter className="mr-2" /> Filter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-secondary-200">
        <div className="flex space-x-8">
          <button
            className={`py-4 px-1 font-medium text-sm focus:outline-none ${
              activeTab === 'myResources'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
            onClick={() => setActiveTab('myResources')}
          >
            My Resources
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm focus:outline-none ${
              activeTab === 'shared'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
            onClick={() => setActiveTab('shared')}
          >
            Shared With Me
          </button>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-primary-600 mr-3" />
              <span className="text-secondary-600">Loading resources...</span>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {activeTab === 'myResources' && filteredMyResources.length > 0 ? (
                  filteredMyResources.map(resource => (
                    <tr key={resource.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                            {getFileIcon(resource.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900">{resource.title}</div>
                            <div className="text-sm text-secondary-500">{resource.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">
                          {resource.uploader ? `${resource.uploader.firstName} ${resource.uploader.lastName}` : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">{formatDate(resource.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">{formatFileSize(resource.fileSize)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleDownload(resource)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          {resource.url && !resource.downloadUrl ? 'Open Link' : 'Download'}
                        </button>
                        <div className="relative resource-dropdown inline-block">
                          <button 
                            onClick={(e) => toggleDropdown(e, resource.id)}
                            className="text-secondary-500 hover:text-secondary-700"
                          >
                            <FaEllipsisH />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : activeTab === 'shared' && filteredSharedResources.length > 0 ? (
                  filteredSharedResources.map(resource => (
                    <tr key={resource.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                            {getFileIcon(resource.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900">{resource.title}</div>
                            <div className="text-sm text-secondary-500">{resource.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">
                          {resource.uploader ? `${resource.uploader.firstName} ${resource.uploader.lastName}` : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">{formatDate(resource.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">{formatFileSize(resource.fileSize)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleDownload(resource)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          {resource.url && !resource.downloadUrl ? 'Open Link' : 'Download'}
                        </button>
                        <div className="relative resource-dropdown inline-block">
                          <button 
                            onClick={(e) => toggleDropdown(e, resource.id)}
                            className="text-secondary-500 hover:text-secondary-700"
                          >
                            <FaEllipsisH />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                        <FaBook className="text-secondary-400 text-xl" />
                      </div>
                      <h3 className="text-lg font-medium text-secondary-900 mb-1">No resources found</h3>
                      <p className="text-secondary-500">
                        {activeTab === 'myResources' 
                          ? 'Upload your first resource to get started' 
                          : 'No resources have been shared with you yet'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
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
                    <Link to="/dashboard/friends" className="text-primary-600 hover:text-primary-700">
                      Add friends
                    </Link>
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
      
      {/* Global Dropdown Menu */}
      {activeDropdown && (
        <div 
          className="fixed w-48 bg-white rounded-md shadow-lg z-50 border border-secondary-200 dropdown-menu"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="py-1">
            <button
              onClick={() => {
                setActiveDropdown(null);
                const resource = [...myResources, ...sharedResources].find(r => r.id === activeDropdown);
                if (resource) handleDownload(resource);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
            >
              <FaDownload className="inline mr-2" /> Download
            </button>
            
            <button
              onClick={() => {
                const resource = [...myResources, ...sharedResources].find(r => r.id === activeDropdown);
                if (resource) openShareModal(resource);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
            >
              <FaShareAlt className="inline mr-2" /> Share with friends
            </button>
            
            {(() => {
              const resource = [...myResources, ...sharedResources].find(r => r.id === activeDropdown);
              return resource && canModifyResource(resource) ? (
                <>
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      handleEdit(activeDropdown);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    <FaEdit className="inline mr-2" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      handleDelete(activeDropdown);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FaTrash className="inline mr-2" /> Delete
                  </button>
                </>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources; 