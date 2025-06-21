import React from 'react';
import { FaUserFriends, FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';

const OnlineFriends = () => {
  const { onlineFriends, openChat, unreadCounts, isOnlineFriendsOpen, toggleOnlineFriends } = useChat();
  
  // Generate avatar placeholder
  const getAvatarPlaceholder = (name) => {
    return `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, '+')}&background=random&color=fff`;
  };
  
  // Calculate total unread messages
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="fixed bottom-0 right-4 z-10">
      {/* Online friends list - positioned above the button */}
      {isOnlineFriendsOpen && (
        <div className="absolute bottom-12 right-0 bg-white rounded-lg shadow-lg w-64 max-h-80 overflow-hidden flex flex-col">
          <div className="bg-primary-600 text-white p-3 flex justify-between items-center">
            <div className="font-medium">Online Friends</div>
            <button 
              onClick={() => toggleOnlineFriends(false)}
              className="p-1 hover:bg-primary-700 rounded"
            >
              <FaTimes size={14} />
            </button>
          </div>
          
          <div className="overflow-y-auto p-2 flex-grow">
            {onlineFriends.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No friends online at the moment
              </div>
            ) : (
              <div className="space-y-2">
                {onlineFriends.map((friend) => {
                  const unreadCount = unreadCounts[friend.id] || 0;
                  return (
                    <div 
                      key={friend.id}
                      className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={() => openChat(friend.id, friend.name, friend.avatar)}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img 
                            src={friend.avatar || getAvatarPlaceholder(friend.name)} 
                            alt={friend.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="ml-3 flex-grow">
                        <div className="font-medium text-gray-800">{friend.name}</div>
                      </div>
                      {unreadCount > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Toggle button - fixed width and position */}
      <div className="fixed bottom-0 right-4 w-32">
        <button
          onClick={() => toggleOnlineFriends(!isOnlineFriendsOpen)}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-t-lg px-4 py-2 w-full relative shadow-lg"
        >
          <div className="flex items-center justify-center">
            <FaUserFriends className="mr-2" />
            <span className="font-medium">Friends</span>
          </div>
          
          {/* Absolutely positioned elements that won't affect layout */}
          {totalUnread > 0 && (
            <div className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalUnread > 9 ? '9+' : totalUnread}
            </div>
          )}
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            {isOnlineFriendsOpen ? <FaChevronDown size={12} /> : <FaChevronUp size={12} />}
          </div>
        </button>
      </div>
    </div>
  );
};

export default OnlineFriends; 