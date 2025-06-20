import React from 'react';
import { useChat } from '../../contexts/ChatContext';

const MinimizedChat = ({ chat }) => {
  const { restoreChat, closeChat, unreadCounts } = useChat();
  const unreadCount = unreadCounts[chat.id] || 0;
  
  // Generate avatar placeholder
  const getAvatarPlaceholder = (name) => {
    return `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, '+')}&background=random&color=fff`;
  };
  
  return (
    <div 
      className="bg-primary-600 text-white px-3 py-2 rounded-t flex items-center justify-between cursor-pointer"
      onClick={() => restoreChat(chat.id)}
    >
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
          <img 
            src={chat.avatar || getAvatarPlaceholder(chat.name)} 
            alt={chat.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="font-medium truncate max-w-[100px]">{chat.name}</div>
      </div>
      
      {unreadCount > 0 && (
        <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </div>
  );
};

export default MinimizedChat; 