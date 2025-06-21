import React, { useEffect, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatWindow from './ChatWindow';
import MinimizedChat from './MinimizedChat';
import OnlineFriends from './OnlineFriends';

const ChatContainer = () => {
  const { activeChats, minimizedChats, onlineFriends, chatFriendDetails } = useChat();
  const [friendsMap, setFriendsMap] = useState({});
  
  // Store friend details when a chat is opened
  useEffect(() => {
    
    // Update friendsMap with any friend details from context
    if (chatFriendDetails && Object.keys(chatFriendDetails).length > 0) {
      setFriendsMap(prev => ({
        ...prev,
        ...chatFriendDetails
      }));
    }
    
    // Combine active and minimized chats for tracking
    const allChats = [
      ...activeChats.map(id => ({ id })),
      ...minimizedChats
    ];
    
    // Update friendsMap with any new chats
    const newFriendsMap = { ...friendsMap };
    let hasChanges = false;
    
    allChats.forEach(chat => {
      const friendId = chat.id;
      
      // If we already have this friend's info and it's not just an ID
      if (friendsMap[friendId] && friendsMap[friendId].name !== 'Friend') {
        return;
      }
      
      // Check if this friend is in the online friends list
      const onlineFriend = onlineFriends.find(f => f.id === friendId);
      
      if (onlineFriend) {
        newFriendsMap[friendId] = {
          id: friendId,
          name: onlineFriend.name,
          avatar: onlineFriend.avatar
        };
        hasChanges = true;
      } 
      // If we have name from minimized chat
      else if (chat.name) {
        newFriendsMap[friendId] = {
          id: friendId,
          name: chat.name,
          avatar: chat.avatar
        };
        hasChanges = true;
      }
      // Fallback
      else if (!newFriendsMap[friendId]) {
        newFriendsMap[friendId] = {
          id: friendId,
          name: 'Friend',
          avatar: null
        };
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setFriendsMap(newFriendsMap);
    }
  }, [activeChats, minimizedChats, onlineFriends, chatFriendDetails]);
  
  // Get friend details by ID
  const getFriendDetails = (friendId) => {
    // First check if we have details in chatFriendDetails
    if (chatFriendDetails[friendId]) {
      return chatFriendDetails[friendId];
    }
    
    // Then check our local friendsMap
    return friendsMap[friendId] || {
      id: friendId,
      name: 'Friend',
      avatar: null
    };
  };
  
  return (
    <div className="fixed bottom-0 right-0 z-10 flex flex-col items-end">
      <div className="flex flex-row-reverse space-x-reverse space-x-2 mb-0">
        {/* Active chat windows */}
        {activeChats.map((friendId, index) => {
          const friend = getFriendDetails(friendId);
          // Calculate position from right
          const rightPosition = index * 288 + 180; // 288px = window width (272px) + spacing (16px)
          
          return (
            <div 
              key={friendId} 
              className="fixed bottom-0"
              style={{ right: `${rightPosition}px` }}
            >
              <ChatWindow 
                friendId={friendId}
                friendName={friend.name}
                friendAvatar={friend.avatar}
              />
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-row-reverse space-x-reverse space-x-2 mb-0">
        {/* Minimized chats */}
        {minimizedChats.map((chat, index) => {
          // Calculate position from right, after active chats
          const activeChatsWidth = activeChats.length * 288;
          const rightPosition = activeChatsWidth + index * 160 + 180; // 160px = minimized width + spacing
          
          return (
            <div 
              key={chat.id} 
              className="fixed bottom-0"
              style={{ right: `${rightPosition}px` }}
            >
              <MinimizedChat chat={chat} />
            </div>
          );
        })}
      </div>
      
      {/* Online friends list */}
      <OnlineFriends />
    </div>
  );
};

export default ChatContainer; 