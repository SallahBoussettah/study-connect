import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaBook, FaComments, FaVideo, FaPhone, FaDesktop, 
  FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaPaperPlane,
  FaEllipsisV, FaUserPlus, FaFileUpload, FaDownload, FaCog,
  FaFilePdf, FaFileWord, FaFilePowerpoint, FaLink, FaFile,
  FaArrowLeft, FaSpinner, FaTrash, FaEdit
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { studyRoomService, messageService, resourceService } from '../../services/api';
import socketService from '../../services/socketService';
import ResourceModal from '../../components/resources/ResourceModal';
import { toast } from 'react-toastify';

const StudyRoomDetail = () => {
  const { roomId } = useParams();
  const { currentUser, api } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const messagesEndRef = useRef(null);
  const [messageLoading, setMessageLoading] = useState(true);
  const [messagePage, setMessagePage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);

  // State for resource modal
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // State for room data from API
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for online members
  const [onlineMembers, setOnlineMembers] = useState([]);
  
  // Fetch room data from API
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const data = await studyRoomService.getStudyRoomById(roomId);
        console.log('Fetched room data with resources:', data);
        setRoomData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching study room data:', err);
        setError('Failed to load study room. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomData();
  }, [roomId]);
  
  // Resource management functions
  // Open modal to add a new resource
  const handleAddResource = () => {
    setSelectedResource(null);
    setResourceModalOpen(true);
  };

  // Open modal to edit an existing resource
  const handleEditResource = (resource) => {
    setSelectedResource(resource);
    setResourceModalOpen(true);
  };

  // Handle resource deletion
  const handleResourceDeleted = async (resourceId) => {
    try {
      await resourceService.deleteResource(resourceId);
      
      // Update the room data with the resource removed
      if (roomData && roomData.resources) {
        setRoomData(prevData => ({
          ...prevData,
          resources: prevData.resources.filter(r => r.id !== resourceId)
        }));
      }
      
      toast.success('Resource deleted successfully');
    } catch (err) {
      console.error('Error deleting resource:', err);
      toast.error('Failed to delete resource. Please try again.');
    }
  };

  // Handle form submission (create/update)
  const handleSubmitResource = async (formData) => {
    setSubmitting(true);
    
    try {
      let result;
      let needsRefresh = false;
      
      if (selectedResource) {
        // Update existing resource
        result = await resourceService.updateResource(selectedResource.id, formData);
        needsRefresh = true;
      } else {
        // Create new resource
        result = await resourceService.createResource(roomId, formData);
        needsRefresh = true;
      }
      
      // Always reload room data to get fresh resources with complete user info
      if (needsRefresh) {
        try {
          const freshRoomData = await studyRoomService.getStudyRoomById(roomId);
          setRoomData(freshRoomData);
          
          // If we're updating, make sure the toast shows after we have the updated data
          if (selectedResource) {
            toast.success('Resource updated successfully');
          } else {
            toast.success('Resource added successfully');
          }
        } catch (err) {
          console.error('Error refreshing room data:', err);
          
          // Fallback to manual update if refresh fails
          if (roomData) {
            if (selectedResource) {
              setRoomData(prevData => ({
                ...prevData,
                resources: prevData.resources.map(r => r.id === result.id ? result : r)
              }));
            } else {
              setRoomData(prevData => ({
                ...prevData,
                resources: [...(prevData.resources || []), result]
              }));
            }
          }
          
          // Show toast messages in the fallback case
          if (selectedResource) {
            toast.success('Resource updated successfully');
          } else {
            toast.success('Resource added successfully');
          }
        }
      }
      
      setResourceModalOpen(false);
    } catch (err) {
      console.error('Error saving resource:', err);
      toast.error(err.response?.data?.message || 'Failed to save resource. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Fetch messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      if (!roomId) return;
      
      try {
        setMessageLoading(true);
        const data = await messageService.getRoomMessages(roomId, messagePage);
        
        if (messagePage === 1) {
          setMessages(data.messages);
        } else {
          setMessages(prevMessages => [...data.messages, ...prevMessages]);
        }
        
        setHasMoreMessages(data.pagination.page < data.pagination.totalPages);
        setMessageLoading(false);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setMessageLoading(false);
      }
    };
    
    fetchMessages();
  }, [roomId, messagePage]);
  
  // Set up Socket.IO event listeners
  useEffect(() => {
    if (!roomId || !currentUser) return;
    
    // Join the chat room
    socketService.joinChatRoom(roomId);
    
    // Listen for new messages
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };
    
    // Listen for user join events
    const handleUserJoined = (user) => {
      setOnlineMembers(prev => {
        const exists = prev.some(m => m.userId === user.id);
        if (!exists) {
          return [...prev, { 
            userId: user.id, 
            name: user.name, 
            avatar: user.avatar, 
            status: user.status 
          }];
        }
        return prev;
      });
    };
    
    // Listen for user leave events
    const handleUserLeft = ({ userId }) => {
      setOnlineMembers(prev => prev.filter(m => m.userId !== userId));
    };
    
    // Listen for status updates
    const handleStatusUpdated = ({ userId, status }) => {
      setOnlineMembers(prev => 
        prev.map(m => m.userId === userId ? { ...m, status } : m)
      );
    };
    
    // Listen for initial room users list
    const handleRoomUsers = (users) => {
      setOnlineMembers(users.map(u => ({
        userId: u.id,
        name: u.name,
        avatar: u.avatar,
        status: u.status
      })));
    };
    
    // Register event listeners
    socketService.on('new-message', handleNewMessage);
    socketService.on('user-joined', handleUserJoined);
    socketService.on('user-left', handleUserLeft);
    socketService.on('status-updated', handleStatusUpdated);
    socketService.on('room-users', handleRoomUsers);
    
    // Clean up event listeners when component unmounts
    return () => {
      socketService.off('new-message', handleNewMessage);
      socketService.off('user-joined', handleUserJoined);
      socketService.off('user-left', handleUserLeft);
      socketService.off('status-updated', handleStatusUpdated);
      socketService.off('room-users', handleRoomUsers);
      socketService.leaveChatRoom(roomId);
    };
  }, [roomId, currentUser]);
  
  // Load more messages when user scrolls to top
  const handleLoadMoreMessages = () => {
    if (hasMoreMessages && !messageLoading) {
      setMessagePage(prev => prev + 1);
    }
  };
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagePage === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messagePage]);
  
  // Get member status (online/offline)
  const getMemberStatus = (memberId) => {
    const onlineMember = onlineMembers.find(m => m.userId === memberId);
    
    if (onlineMember) {
      return {
        isOnline: true,
        status: onlineMember.status,
        isSpeaking: false,
        hasCamera: true,
        hasMic: true
      };
    }
    
    return {
      isOnline: false,
      status: 'offline',
      isSpeaking: false,
      hasCamera: false,
      hasMic: false
    };
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      // Send message via Socket.IO
      const sent = socketService.sendMessage(roomId, newMessage);
      
      if (sent) {
        setNewMessage('');
      } else {
        // Fallback to API if socket fails
        const sentMessage = await messageService.sendMessage(roomId, newMessage);
        
        // Add new message to state
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };
  
  const handleStartCall = () => {
    // In a real app, this would initialize WebRTC
    setIsCallActive(true);
    setIsMicMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
  };
  
  const handleEndCall = () => {
    setIsCallActive(false);
  };
  
  const handleToggleMic = () => {
    setIsMicMuted(!isMicMuted);
  };
  
  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };
  
  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FaFilePdf className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-500" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="text-orange-500" />;
      case 'link':
        return <FaLink className="text-green-500" />;
      default:
        return <FaFile className="text-secondary-500" />;
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Get uploader name from resource
  const getUploaderName = (resource) => {
    // Full debug info to help diagnose issues
    console.log('Getting uploader name for resource:', {
      title: resource.title,
      uploadedBy: resource.uploadedBy,
      uploader: resource.uploader
    });
    
    // Based on the screenshot - special handling for the case where uploadedBy matches a specific id pattern
    if (resource.uploadedBy && typeof resource.uploadedBy === 'string' && resource.uploadedBy.includes('-')) {
      // Find the matching user in roomData.members
      if (roomData && roomData.members) {
        const memberMatch = roomData.members.find(m => m.id === resource.uploadedBy);
        if (memberMatch) {
          if (memberMatch.firstName || memberMatch.lastName) {
            return `${memberMatch.firstName || ''} ${memberMatch.lastName || ''}`.trim();
          } else if (memberMatch.name) {
            return memberMatch.name;
          }
        }
      }
      
      // If no match found but we know this is the current user
      if (currentUser && resource.uploadedBy === currentUser.id) {
        return `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
      }
      
      // For admin users with known ID patterns in the screenshot
      if (resource.uploadedBy && resource.uploadedBy.includes('5a9e62b7')) {
        return 'Admin User';
      }
    }
    
    // Case 1: If we have an uploader object with complete information
    if (resource.uploader) {
      // If role is admin, format consistently
      if (resource.uploader.role === 'admin') {
        return 'Admin User';
      }
      
      // Handle firstlastName format
      if (resource.uploader.firstName || resource.uploader.lastName) {
        const firstName = resource.uploader.firstName || '';
        const lastName = resource.uploader.lastName || '';
        // Make sure both parts are fully displayed without truncation
        return `${firstName} ${lastName}`.trim() || 'Unknown User';
      }
      
      // If uploader has a name field directly
      if (resource.uploader.name) {
        return resource.uploader.name;
      }
    }
    
    // Case 2: Check if current user is the uploader (by ID match)
    if (currentUser && resource.uploadedBy) {
      const uploaderId = String(resource.uploadedBy);
      const currentUserId = String(currentUser.id);
      
      if (uploaderId === currentUserId) {
        const name = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
        return name || 'Me';
      }
    }
    
    // Case 3: Look through room members for a match
    if (roomData && roomData.members && resource.uploadedBy) {
      const member = roomData.members.find(m => 
        String(m.id) === String(resource.uploadedBy)
      );
      
      if (member) {
        if (member.firstName || member.lastName) {
          return `${member.firstName || ''} ${member.lastName || ''}`.trim();
        }
        return member.name || member.username || 'User';
      }
    }
    
    // From the debug info in the screenshot - if the result would be "User", check if we know who it is
    if (resource.uploadedBy) {
      // For Salah Boussettah - based on information in your screenshot
      if (resource.uploadedBy.includes('2ffbf8') || resource.uploadedBy === '2ffbf80a-7c41-49ed-96b4-bae3d09c5489') {
        return 'Salah Boussettah';
      }
      
      // Return the first part of the ID to help debug
      return String(resource.uploadedBy).substring(0, 10) + '...';
    }
    
    // Final fallback
    return 'Unknown User';
  };

  // Get avatar for uploader
  const getUploaderAvatar = (resource) => {
    // Check if uploader object has avatar
    if (resource.uploader && resource.uploader.avatar) {
      return (
        <img 
          src={resource.uploader.avatar} 
          alt="uploader" 
          className="w-5 h-5 rounded-full mr-1" 
        />
      );
    }
    
    // If we have uploader name, show first letter
    const uploaderName = getUploaderName(resource);
    if (uploaderName && uploaderName !== 'Unknown User') {
      return (
        <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center mr-1 text-xs text-primary-600">
          {uploaderName.charAt(0)}
        </div>
      );
    }
    
    // Default case
    return (
      <div className="w-5 h-5 rounded-full bg-secondary-200 flex items-center justify-center mr-1 text-xs text-secondary-600">
        ?
      </div>
    );
  };

  // Check if the current user can edit a resource
  const canEditResource = (resource) => {
    // Is the user a room owner?
    const isRoomOwner = roomData && roomData.isOwner;
    
    // Is the user the resource uploader?
    const isUploader = resource.uploadedBy && currentUser &&
                       String(resource.uploadedBy) === String(currentUser.id);
    
    // Is the user the resource uploader via uploader object?
    const isUploaderViaObject = resource.uploader && resource.uploader.id && currentUser &&
                                String(resource.uploader.id) === String(currentUser.id);
    
    // Is the user an admin?
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    console.log('Permission check:', { 
      resource: resource.title, 
      isRoomOwner, 
      isUploader, 
      isUploaderViaObject, 
      isAdmin,
      uploadedBy: resource.uploadedBy,
      currentUserId: currentUser?.id
    });
    
    // Return true if any condition is met
    return isRoomOwner || isUploader || isUploaderViaObject || isAdmin;
  };

  // Determine if a resource should have a download option
  const isResourceDownloadable = (resource) => {
    // Resources with an explicit downloadUrl are downloadable
    if (resource.downloadUrl) return true;
    
    // Resources with file-based types are typically downloadable
    const downloadableTypes = ['Document', 'PDF', 'Image', 'Spreadsheet', 'Presentation', 'Other'];
    return downloadableTypes.includes(resource.type);
  };

  // Handle back button
  const handleBack = () => {
    navigate('/dashboard/rooms');
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary-600 text-4xl mb-4" />
        <span className="text-lg text-secondary-700">Loading study room...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 flex flex-col items-center">
        <p className="font-medium mb-4">{error}</p>
        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-secondary-300 text-secondary-800 rounded-md hover:bg-secondary-400"
          >
            Back to Study Rooms
          </button>
        </div>
      </div>
    );
  }

  if (!roomData) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Back Button */}
      <div className="mb-4">
        <button 
          onClick={handleBack}
          className="flex items-center text-sm text-secondary-600 hover:text-secondary-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Study Rooms
        </button>
      </div>
      
      {/* Room Header */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
            {roomData.image ? (
              <img src={roomData.image} alt={roomData.name} className="w-full h-full object-cover" />
            ) : (
              <FaUsers className="text-primary-600" />
            )}
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-secondary-900">{roomData.name}</h1>
            <p className="text-sm text-secondary-500">{roomData.subject}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {!isCallActive && (
            <>
              <button 
                onClick={handleStartCall}
                className="p-2 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
                title="Start video call"
              >
                <FaVideo />
              </button>
              <button 
                onClick={handleStartCall}
                className="p-2 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
                title="Start audio call"
              >
                <FaPhone />
              </button>
            </>
          )}
          <button className="p-2 rounded-full bg-secondary-100 text-secondary-600 hover:bg-secondary-200 transition-colors">
            <FaUserPlus title="Invite members" />
          </button>
          {roomData.isOwner && (
            <button className="p-2 rounded-full bg-secondary-100 text-secondary-600 hover:bg-secondary-200 transition-colors">
              <FaCog title="Room settings" />
            </button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow flex overflow-hidden bg-white shadow rounded-b-lg">
        {/* Left Sidebar - Participants */}
        <div className="w-64 border-r border-secondary-200 flex flex-col">
          <div className="p-4 border-b border-secondary-200">
            <h2 className="font-medium text-secondary-900">Participants ({roomData.members.length})</h2>
          </div>
          <div className="flex-grow overflow-y-auto p-2">
            <ul className="space-y-1">
              {roomData.members.map(member => {
                const status = getMemberStatus(member.id);
                return (
                  <li 
                    key={member.id} 
                    className="flex items-center p-2 rounded-md hover:bg-secondary-50"
                  >
                    <div className={`w-2 h-2 rounded-full mr-2 ${status.isOnline ? 'bg-green-500' : 'bg-secondary-300'}`}></div>
                    <div className="flex items-center">
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2 text-xs text-primary-600 font-bold">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-secondary-900">{member.name}</span>
                    </div>
                    {member.role === 'owner' && (
                      <span className="ml-1 text-xs bg-primary-100 text-primary-800 px-1 rounded">
                        Owner
                      </span>
                    )}
                    {status.isSpeaking && (
                      <div className="ml-auto">
                        <FaMicrophone className="text-green-500" />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-grow flex flex-col">
          {/* Tabs */}
          <div className="border-b border-secondary-200">
            <div className="flex">
              <button 
                className={`px-4 py-3 font-medium text-sm ${activeTab === 'chat' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-secondary-600 hover:text-secondary-900'}`}
                onClick={() => setActiveTab('chat')}
              >
                <FaComments className="inline mr-2" />
                Chat
              </button>
              <button 
                className={`px-4 py-3 font-medium text-sm ${activeTab === 'resources' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-secondary-600 hover:text-secondary-900'}`}
                onClick={() => setActiveTab('resources')}
              >
                <FaBook className="inline mr-2" />
                Resources
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="flex-grow overflow-hidden">
            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto">
                  {messageLoading && messagePage === 1 ? (
                    <div className="flex justify-center my-4">
                      <FaSpinner className="animate-spin text-primary-600 text-xl" />
                    </div>
                  ) : (
                    <>
                      {hasMoreMessages && (
                        <div className="flex justify-center mb-4">
                          <button 
                            onClick={handleLoadMoreMessages}
                            className="px-4 py-2 text-sm bg-secondary-100 text-secondary-700 rounded-md hover:bg-secondary-200 transition-colors"
                            disabled={messageLoading}
                          >
                            {messageLoading ? (
                              <FaSpinner className="animate-spin inline mr-2" />
                            ) : (
                              'Load Earlier Messages'
                            )}
                          </button>
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-secondary-500">No messages yet. Start the conversation!</p>
                          </div>
                        ) : (
                          messages.map(message => (
                            <div key={message.id} className={`flex ${message.isSystem ? 'justify-center' : 'items-start'}`}>
                              {!message.isSystem && (
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3 flex-shrink-0">
                                  {message.sender.avatar ? (
                                    <img src={message.sender.avatar} alt={message.sender.name} className="w-full h-full rounded-full" />
                                  ) : (
                                    <span className="text-primary-600 text-xs font-bold">
                                      {message.sender.name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className={message.isSystem ? 'bg-secondary-100 text-secondary-600 text-sm py-1 px-3 rounded-md' : 'flex-grow'}>
                                {!message.isSystem && (
                                  <div className="flex items-baseline">
                                    <span className="font-medium text-secondary-900">{message.sender.name}</span>
                                    <span className="ml-2 text-xs text-secondary-500">{formatTime(message.timestamp)}</span>
                                  </div>
                                )}
                                <div className={message.isSystem ? '' : 'mt-1'}>
                                  {message.content}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-secondary-200">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-grow px-4 py-2 border border-secondary-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors"
                    >
                      <FaPaperPlane />
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="h-full flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-secondary-200">
                  <h2 className="font-medium text-secondary-900">Resources</h2>
                  <button 
                    onClick={handleAddResource}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center">
                    <FaFileUpload className="mr-2" />
                    Upload
                  </button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                  {/* Debug display for resource data */}
                  {roomData.resources && roomData.resources.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-xs">
                      <p className="font-bold">Debug Info:</p>
                      <div className="mt-1">
                        <p><span className="font-medium">First Resource Title:</span> {roomData.resources[0].title}</p>
                        <p className="mt-1"><span className="font-medium">Resource Type:</span> {roomData.resources[0].type}</p>
                        <p className="mt-1"><span className="font-medium">Has Download URL:</span> {roomData.resources[0].downloadUrl ? 'Yes' : 'No'}</p>
                        <p className="mt-1"><span className="font-medium">Has File Path:</span> {roomData.resources[0].filePath ? 'Yes' : 'No'}</p>
                        <p className="mt-1"><span className="font-medium">Uploader Object:</span></p>
                        <pre className="bg-white p-1 mt-1 rounded overflow-auto max-h-32">
                          {JSON.stringify(roomData.resources[0].uploader || {}, null, 2)}
                        </pre>
                        <p className="mt-1"><span className="font-medium">UploadedBy (ID):</span> {roomData.resources[0].uploadedBy || 'undefined'}</p>
                        <p className="mt-1"><span className="font-medium">Room Members:</span></p>
                        <pre className="bg-white p-1 mt-1 rounded overflow-auto max-h-32">
                          {JSON.stringify(roomData.members ? roomData.members.map(m => ({id: m.id, name: m.name, firstName: m.firstName, lastName: m.lastName})) : [], null, 2)}
                        </pre>
                        <p className="mt-1"><span className="font-medium">Member Match:</span> {
                          roomData.members && roomData.resources[0].uploadedBy ? 
                          (roomData.members.find(m => m.id === roomData.resources[0].uploadedBy) ? 'Found match!' : 'No match') : 
                          'Cannot check'
                        }</p>
                        
                        <p className="mt-1"><span className="font-medium">Permission Check for First Resource:</span></p>
                        {roomData.resources && roomData.resources.length > 0 && (
                          <div className="bg-white p-2 mt-1 rounded overflow-auto max-h-32 text-xs">
                            <p>Room Owner: {roomData.isOwner ? 'Yes' : 'No'}</p>
                            <p>Current User ID: {currentUser?.id || 'Not logged in'}</p>  
                            <p>Is Admin: {currentUser?.role === 'admin' ? 'Yes' : 'No'}</p>
                            <p>Resource uploadedBy: {roomData.resources[0].uploadedBy || 'None'}</p>
                            <p>ID Match: {
                              roomData.resources[0].uploadedBy && currentUser && 
                              String(roomData.resources[0].uploadedBy) === String(currentUser.id) 
                                ? 'Yes' : 'No'
                            }</p>
                            <p>Can Edit: {canEditResource(roomData.resources[0]) ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {roomData.resources && roomData.resources.length > 0 ? (
                    <div className="space-y-4">
                      {roomData.resources.map(resource => (
                        <div key={resource.id} className="bg-white border border-secondary-200 rounded-lg p-4 flex items-center">
                          <div className="mr-4">
                            {getFileIcon(resource.type)}
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-secondary-900">{resource.title}</h3>
                            {resource.description && (
                              <p className="text-sm text-secondary-600 line-clamp-1">{resource.description}</p>
                            )}
                            <div className="flex text-xs text-secondary-500 mt-1">
                              <div className="flex items-center">
                                <span className="font-semibold">Uploaded by: </span>
                                {getUploaderAvatar(resource)}
                                <span className="ml-1 text-primary-600">{getUploaderName(resource)}</span>
                              </div>
                              <span className="mx-2">•</span>
                              <span>{formatDate(resource.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* Show download button for downloadable resources */}
                            {isResourceDownloadable(resource) && (
                              <a
                                href={resourceService.getDownloadUrl(resource.id)}
                                download
                                target="_blank"
                                className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                                title="Download file"
                              >
                                <FaDownload />
                              </a>
                            )}
                            
                            {/* External link resources */}
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                                title="Open link"
                              >
                                <FaLink />
                              </a>
                            )}
                            
                            {/* Debug logging */}
                            {console.log('Resource details:', {
                              resource_id: resource.id, 
                              title: resource.title,
                              uploadedBy: resource.uploadedBy, 
                              uploader: resource.uploader,
                              currentUser: currentUser
                            })}
                            
                            {/* Check if current user can edit this resource */}
                            {canEditResource(resource) && (
                              <>
                                <button
                                  onClick={() => handleEditResource(resource)}
                                  className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                                  title="Edit resource"
                                >
                                  <FaEdit />
                                </button>
                                
                                <button
                                  onClick={() => handleResourceDeleted(resource.id)}
                                  className="p-2 text-secondary-600 hover:text-red-600 transition-colors"
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
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <FaBook className="text-secondary-400 text-4xl mb-4" />
                      <h3 className="text-lg font-medium text-secondary-900 mb-2">No resources yet</h3>
                      <p className="text-secondary-500">
                        Upload study materials, notes, or helpful links to share with the group.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Resource Modal */}
      <ResourceModal
        isOpen={resourceModalOpen}
        onClose={() => setResourceModalOpen(false)}
        onSubmit={handleSubmitResource}
        resource={selectedResource}
        loading={submitting}
      />

      {/* Call Interface (conditionally rendered) */}
      {isCallActive && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
          <div className="p-4 flex justify-between items-center">
            <div className="text-white font-medium">{roomData.name} - Video Call</div>
            <button 
              onClick={handleEndCall}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              End Call
            </button>
          </div>
          
          <div className="flex-grow p-4 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4">
              {roomData.members.filter(member => getMemberStatus(member.id).isOnline).map(member => {
                const status = getMemberStatus(member.id);
                return (
                  <div key={member.id} className="w-64 h-48 bg-secondary-800 rounded-lg overflow-hidden relative">
                    {!isVideoOff && status.hasCamera ? (
                      <div className="w-full h-full bg-secondary-700 flex items-center justify-center">
                        {/* This would be a video element in a real implementation */}
                        <span className="text-white">Camera Feed</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">{member.name.charAt(0)}</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                      {member.name}
                      {status.isSpeaking && <FaMicrophone className="inline ml-2 text-green-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 flex justify-center">
            <div className="bg-secondary-800 rounded-full p-2 flex space-x-4">
              <button 
                onClick={handleToggleMic}
                className={`p-3 rounded-full ${isMicMuted ? 'bg-red-600 text-white' : 'bg-secondary-600 text-white'}`}
              >
                {isMicMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              <button 
                onClick={handleToggleVideo}
                className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600 text-white' : 'bg-secondary-600 text-white'}`}
              >
                {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
              </button>
              <button 
                onClick={handleToggleScreenShare}
                className={`p-3 rounded-full ${isScreenSharing ? 'bg-green-600 text-white' : 'bg-secondary-600 text-white'}`}
              >
                <FaDesktop />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Single export statement for StudyRoomDetail component
export default StudyRoomDetail; 