import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatWindow from './ChatWindow';
import MinimizedChat from './MinimizedChat';
import OnlineFriends from './OnlineFriends';

const ChatContainer = () => {
  const { activeChats, minimizedChats, onlineFriends } = useChat();
  
  // Find friend details by ID
  const getFriendDetails = (friendId) => {
    const friend = onlineFriends.find(f => f.id === friendId);
    return {
      id: friendId,
      name: friend ? friend.name : 'Friend',
      avatar: friend ? friend.avatar : null
    };
  };
  
  return (
    <div className="fixed bottom-0 right-0 z-10 flex flex-col items-end">
      <div className="flex flex-row-reverse space-x-reverse space-x-2 mr-72">
        {/* Active chat windows */}
        {activeChats.map(friendId => {
          const friend = getFriendDetails(friendId);
          return (
            <ChatWindow 
              key={friendId}
              friendId={friendId}
              friendName={friend.name}
              friendAvatar={friend.avatar}
            />
          );
        })}
      </div>
      
      <div className="flex flex-row-reverse space-x-reverse space-x-2 mt-2 mr-72">
        {/* Minimized chats */}
        {minimizedChats.map(chat => (
          <MinimizedChat key={chat.id} chat={chat} />
        ))}
      </div>
      
      {/* Online friends list */}
      <OnlineFriends />
    </div>
  );
};

export default ChatContainer; 