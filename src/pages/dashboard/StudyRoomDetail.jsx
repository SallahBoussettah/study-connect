import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaBook, FaComments, FaVideo, FaPhone, FaDesktop, 
  FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaPaperPlane,
  FaEllipsisV, FaUserPlus, FaFileUpload, FaDownload, FaCog,
  FaFilePdf, FaFileWord, FaFilePowerpoint, FaLink, FaFile,
  FaArrowLeft, FaSpinner
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { studyRoomService, messageService } from '../../services/api';
import socketService from '../../services/socketService';

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
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center">
                    <FaFileUpload className="mr-2" />
                    Upload
                  </button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                  {roomData.resources && roomData.resources.length > 0 ? (
                    <div className="space-y-4">
                      {roomData.resources.map(resource => (
                        <div key={resource.id} className="bg-white border border-secondary-200 rounded-lg p-4 flex items-center">
                          <div className="mr-4">
                            {getFileIcon(resource.type)}
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-secondary-900">{resource.title}</h3>
                            <div className="flex text-xs text-secondary-500 mt-1">
                              <span>Uploaded by {resource.uploadedBy}</span>
                              <span className="mx-2">•</span>
                              <span>{formatDate(resource.createdAt)}</span>
                            </div>
                          </div>
                          <button className="p-2 text-secondary-600 hover:text-secondary-900 transition-colors">
                            <FaDownload />
                          </button>
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

export default StudyRoomDetail; 