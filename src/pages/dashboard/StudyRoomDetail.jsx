import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaUsers, FaBook, FaComments, FaVideo, FaPhone, FaDesktop, 
  FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaPaperPlane,
  FaEllipsisV, FaUserPlus, FaFileUpload, FaDownload, FaCog
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const StudyRoomDetail = () => {
  const { roomId } = useParams();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Mock room data
  const roomData = {
    id: roomId,
    name: 'Advanced Calculus Study Group',
    description: 'Collaborative study for multivariable calculus and differential equations',
    subject: 'Mathematics',
    owner: 'Alex Johnson',
    isPrivate: false,
    createdAt: '2023-05-10T14:30:00',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
  };
  
  // Mock participants data
  const participantsData = [
    { id: 101, name: 'Alex Johnson', isOnline: true, isSpeaking: false, hasCamera: true, hasMic: true },
    { id: 102, name: 'Maria Garcia', isOnline: true, isSpeaking: false, hasCamera: true, hasMic: true },
    { id: 103, name: 'John Smith', isOnline: true, isSpeaking: false, hasCamera: false, hasMic: true },
    { id: 104, name: 'Emma Wilson', isOnline: false, isSpeaking: false, hasCamera: true, hasMic: true },
    { id: 105, name: 'David Lee', isOnline: true, isSpeaking: false, hasCamera: true, hasMic: true }
  ];
  
  // Mock resources data
  const resourcesData = [
    { id: 1, title: 'Calculus Cheat Sheet', type: 'pdf', size: '2.4 MB', uploadedBy: 'Alex Johnson', uploadDate: '2023-06-10' },
    { id: 2, title: 'Partial Derivatives Notes', type: 'doc', size: '1.8 MB', uploadedBy: 'Maria Garcia', uploadDate: '2023-06-12' },
    { id: 3, title: 'Khan Academy Multivariable Calculus', type: 'link', url: 'https://www.khanacademy.org/math/multivariable-calculus', uploadedBy: 'John Smith', uploadDate: '2023-06-14' },
    { id: 4, title: 'Practice Problems Set 1', type: 'pdf', size: '3.1 MB', uploadedBy: 'Emma Wilson', uploadDate: '2023-06-15' }
  ];
  
  // Mock messages data
  useEffect(() => {
    // In a real app, this would be a WebSocket connection
    const mockMessages = [
      {
        id: 1,
        sender: { id: 101, name: 'Alex Johnson', avatar: null },
        content: 'Hey everyone! Welcome to our calculus study group.',
        timestamp: '2023-06-15T10:00:00',
        isSystem: false
      },
      {
        id: 2,
        sender: { id: 102, name: 'Maria Garcia', avatar: null },
        content: 'Thanks for creating this group! Ive been struggling with partial derivatives.',
        timestamp: '2023-06-15T10:05:00',
        isSystem: false
      },
      {
        id: 3,
        sender: { id: 103, name: 'John Smith', avatar: null },
        content: 'I found a great resource on Khan Academy for this topic. Let me share the link.',
        timestamp: '2023-06-15T10:08:00',
        isSystem: false
      },
      {
        id: 4,
        sender: { id: 103, name: 'John Smith', avatar: null },
        content: 'https://www.khanacademy.org/math/multivariable-calculus',
        timestamp: '2023-06-15T10:09:00',
        isSystem: false
      },
      {
        id: 5,
        sender: null,
        content: 'Maria Garcia shared a file: Calculus_Cheat_Sheet.pdf',
        timestamp: '2023-06-15T10:15:00',
        isSystem: true
      },
      {
        id: 6,
        sender: { id: 104, name: 'Emma Wilson', avatar: null },
        content: 'Thanks for the cheat sheet! Could we schedule a study session for tomorrow?',
        timestamp: '2023-06-15T10:20:00',
        isSystem: false
      }
    ];
    
    setMessages(mockMessages);
  }, []);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // In a real app, this would send the message via WebSocket
    const newMsg = {
      id: messages.length + 1,
      sender: { id: currentUser?.id || 999, name: `${currentUser?.firstName || 'You'} ${currentUser?.lastName || ''}`, avatar: null },
      content: newMessage,
      timestamp: new Date().toISOString(),
      isSystem: false
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
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

  return (
    <div className="h-full flex flex-col">
      {/* Room Header */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
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
          <button className="p-2 rounded-full bg-secondary-100 text-secondary-600 hover:bg-secondary-200 transition-colors">
            <FaCog title="Room settings" />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left Sidebar - Participants */}
        <div className="w-64 bg-white border-r border-secondary-200 flex flex-col">
          <div className="p-4 border-b border-secondary-200">
            <h2 className="font-medium text-secondary-900">Participants ({participantsData.length})</h2>
          </div>
          <div className="flex-grow overflow-y-auto p-2">
            <ul className="space-y-1">
              {participantsData.map(participant => (
                <li 
                  key={participant.id} 
                  className="flex items-center p-2 rounded-md hover:bg-secondary-50"
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${participant.isOnline ? 'bg-green-500' : 'bg-secondary-300'}`}></div>
                  <span className="text-secondary-900">{participant.name}</span>
                  {participant.isSpeaking && (
                    <div className="ml-auto">
                      <FaMicrophone className="text-green-500" />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-grow flex flex-col">
          {/* Tabs */}
          <div className="bg-white border-b border-secondary-200">
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
                  <div className="space-y-4">
                    {messages.map(message => (
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
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
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
                  <div className="space-y-4">
                    {resourcesData.map(resource => (
                      <div key={resource.id} className="bg-white border border-secondary-200 rounded-lg p-4 flex items-center">
                        <div className="mr-4">
                          {getFileIcon(resource.type)}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-secondary-900">{resource.title}</h3>
                          <div className="flex text-xs text-secondary-500 mt-1">
                            <span>Uploaded by {resource.uploadedBy}</span>
                            <span className="mx-2">•</span>
                            <span>{resource.uploadDate}</span>
                            {resource.size && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{resource.size}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button className="p-2 text-secondary-600 hover:text-secondary-900 transition-colors">
                          <FaDownload />
                        </button>
                      </div>
                    ))}
                  </div>
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
              {participantsData.filter(p => p.isOnline).map(participant => (
                <div key={participant.id} className="w-64 h-48 bg-secondary-800 rounded-lg overflow-hidden relative">
                  {!isVideoOff && participant.hasCamera ? (
                    <div className="w-full h-full bg-secondary-700 flex items-center justify-center">
                      {/* This would be a video element in a real implementation */}
                      <span className="text-white">Camera Feed</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">{participant.name.charAt(0)}</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    {participant.name}
                    {participant.isSpeaking && <FaMicrophone className="inline ml-2 text-green-500" />}
                  </div>
                </div>
              ))}
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