import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import { getAvatarUrl, getAvatarPlaceholder } from '../../utils/avatarUtils.jsx';

const MinimizedChat = ({ chat }) => {
  const { restoreChat, closeChat, unreadCounts } = useChat();
  const unreadCount = unreadCounts[chat.id] || 0;
  
  return (
    <div 
      className="bg-primary-600 text-white px-3 py-2 rounded-t flex items-center justify-between cursor-pointer"
      onClick={() => restoreChat(chat.id)}
    >
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
          <img 
            src={chat.avatar ? getAvatarUrl(chat.avatar) : getAvatarPlaceholder(chat.name, '')} 
            alt={chat.name}
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
                initialsDiv.className = "flex items-center justify-center h-full w-full bg-blue-500 rounded-full text-white text-sm font-bold";
                
                // Get initials from name
                const nameParts = chat.name.split(' ');
                const initials = nameParts.length > 1 
                  ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`
                  : nameParts[0].charAt(0);
                
                initialsDiv.textContent = initials;
                
                // Append to parent
                parent.appendChild(initialsDiv);
              }
            }}
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