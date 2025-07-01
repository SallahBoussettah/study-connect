import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaComments, FaCircle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { getAvatarUrl, getAvatarPlaceholder } from '../../utils/avatarUtils.jsx';

const ConversationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { currentUser } = useAuth();
  const { 
    conversations, 
    unreadCounts, 
    setActiveConversation,
    onlineFriends 
  } = useChat();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle conversation click
  const handleConversationClick = (conversation) => {
    setActiveConversation(conversation.friendId);
    setIsOpen(false);
  };

  // Get unread count for a specific conversation
  const getUnreadCount = (friendId) => {
    return unreadCounts[friendId] || 0;
  };

  // Check if a friend is online
  const isOnline = (friendId) => {
    return onlineFriends.some(friend => friend.id === friendId);
  };

  // Calculate total unread messages
  const totalUnread = Object.values(unreadCounts || {}).reduce((sum, count) => sum + count, 0);

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'Invalid Date';
    
    try {
      const date = new Date(timeString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Conversations Icon */}
      <button
        className="p-2 rounded-full text-secondary-500 hover:bg-secondary-100 relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Conversations"
      >
        <FaComments className="text-xl" />
        {totalUnread > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-primary-600 rounded-full">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3 border-b border-secondary-200">
            <h3 className="text-sm font-semibold text-secondary-700">Conversations</h3>
          </div>

          {/* Loading State */}
          {!conversations && (
            <div className="px-4 py-3 text-center text-secondary-500">
              Loading conversations...
            </div>
          )}

          {/* Empty State */}
          {conversations && conversations.length === 0 && (
            <div className="px-4 py-6 text-center text-secondary-500">
              <p>No conversations yet</p>
            </div>
          )}

          {/* Conversations List */}
          {conversations && conversations.length > 0 && (
            <div>
              {conversations.map((conversation) => (
                <Link
                  key={conversation.friendId}
                  to={`/dashboard/friends?chat=${conversation.friendId}`}
                  className="block px-4 py-3 border-b border-secondary-100 hover:bg-secondary-50 transition-colors duration-150"
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold overflow-hidden">
                          {conversation.avatar ? (
                            <img 
                              src={getAvatarUrl(conversation.avatar)} 
                              alt={conversation.friendName} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // If image fails to load, replace with initials
                                const parent = e.target.parentNode;
                                if (parent) {
                                  // Clear the parent node
                                  while (parent.firstChild) {
                                    parent.removeChild(parent.firstChild);
                                  }
                                  
                                  // Create a div for initials
                                  const initialsDiv = document.createElement('div');
                                  initialsDiv.className = "flex items-center justify-center h-full w-full bg-blue-500 rounded-full text-white text-lg font-bold";
                                  
                                  // Get initials from name
                                  const nameParts = conversation.friendName.split(' ');
                                  const initials = nameParts.length > 1 
                                    ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`
                                    : conversation.friendName.charAt(0);
                                  
                                  initialsDiv.textContent = initials;
                                  
                                  // Append to parent
                                  parent.appendChild(initialsDiv);
                                }
                              }}
                            />
                          ) : (
                            conversation.friendName?.charAt(0)
                          )}
                        </div>
                        {conversation.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-secondary-900 flex items-center">
                          {conversation.friendName}
                          {conversation.online && (
                            <span className="ml-1 text-xs text-green-500 font-normal">• online</span>
                          )}
                        </p>
                        {conversation.lastMessageTime && (
                          <p className="text-xs text-secondary-500">
                            {formatTime(conversation.lastMessageTime)}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-secondary-500 truncate">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {getUnreadCount(conversation.friendId) > 0 && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-primary-600 rounded-full">
                          {getUnreadCount(conversation.friendId)}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2 border-t border-secondary-200">
            <Link
              to="/dashboard/friends"
              className="block text-xs text-center text-secondary-600 hover:text-primary-600"
              onClick={() => setIsOpen(false)}
            >
              View All Messages
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationsDropdown; 