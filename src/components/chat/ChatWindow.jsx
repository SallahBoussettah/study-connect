import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaMinus, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

const ChatWindow = ({ friendId, friendName: propFriendName, friendAvatar: propFriendAvatar }) => {
  const { messages, loading, sendMessage, closeChat, minimizeChat, chatFriendDetails } = useChat();
  const { currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Get friend details from context if available
  const friendDetails = chatFriendDetails[friendId];
  const friendName = friendDetails?.name || propFriendName;
  const friendAvatar = friendDetails?.avatar || propFriendAvatar;
  
  // Sort messages by timestamp to ensure chronological order
  const chatMessages = messages[friendId] ? 
    [...messages[friendId]].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) : 
    [];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Generate avatar placeholder
  const getAvatarPlaceholder = (name) => {
    return `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, '+')}&background=random&color=fff`;
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || submitting) return;
    
    try {
      setSubmitting(true);
      const success = await sendMessage(friendId, newMessage);
      
      if (success) {
        setNewMessage('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Function to render message content with clickable links
  const renderMessageWithLinks = (content) => {
    if (!content) return '';
    
    // Check if the message already contains HTML link tags
    if (content.includes('<a href="') && content.includes('</a>')) {
      // Extract the URL and link text from the HTML
      const linkMatch = content.match(/<a href="([^"]+)">([^<]+)<\/a>/);
      
      if (linkMatch) {
        const [fullMatch, url, linkText] = linkMatch;
        
        // Replace the HTML link with a React link component
        const parts = content.split(fullMatch);
        return (
          <>
            {parts[0]}
            <a 
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {linkText}
            </a>
            {parts[1]}
          </>
        );
      }
    }
    
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Split the content by URLs
    const parts = content.split(urlRegex);
    
    // Find all URLs in the content
    const urls = content.match(urlRegex) || [];
    
    // Combine parts and URLs
    return parts.map((part, i) => {
      // If this part is a URL (it will be at odd indices in our parts array)
      if (urls.includes(part)) {
        return (
          <a 
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      // Otherwise it's just text
      return part;
    });
  };

  return (
    <div className="w-72 bg-white rounded-t-lg shadow-lg flex flex-col overflow-hidden">
      {/* Chat header */}
      <div className="bg-primary-600 text-white p-2 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
            <img 
              src={friendAvatar || getAvatarPlaceholder(friendName)} 
              alt={friendName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="font-medium truncate">{friendName}</div>
        </div>
        <div className="flex items-center">
          <button 
            onClick={() => minimizeChat(friendId, friendName, friendAvatar)}
            className="p-1 hover:bg-primary-700 rounded"
          >
            <FaMinus size={12} />
          </button>
          <button 
            onClick={() => closeChat(friendId)}
            className="p-1 hover:bg-primary-700 rounded ml-1"
          >
            <FaTimes size={12} />
          </button>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-grow p-3 overflow-y-auto h-64 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <FaSpinner className="animate-spin text-primary-600 text-xl" />
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-2">
            {chatMessages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.sender.id === currentUser.id ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender.id !== currentUser.id && (
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 flex-shrink-0">
                    <img 
                      src={message.sender.avatar || getAvatarPlaceholder(message.sender.name)} 
                      alt={message.sender.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div 
                  className={`rounded-lg px-3 py-2 max-w-[80%] break-words ${
                    message.sender.id === currentUser.id 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="text-sm">
                    {renderMessageWithLinks(message.content)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right flex items-center justify-end">
                    {formatTime(message.timestamp)}
                    {message.sender.id === currentUser.id && (
                      <span className="ml-1">
                        {message.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-2 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow px-3 py-1 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={submitting || !newMessage.trim()}
          className={`px-3 py-1 ${
            submitting || !newMessage.trim()
              ? 'bg-gray-400'
              : 'bg-primary-600 hover:bg-primary-700'
          } text-white rounded-r-md transition-colors`}
        >
          {submitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow; 