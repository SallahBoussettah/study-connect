import React, { createContext, useContext, useState, useEffect } from 'react';
import socketService from '../services/socketService';
import { directMessageService } from '../services/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [minimizedChats, setMinimizedChats] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [chatFriendDetails, setChatFriendDetails] = useState({});
  const [isOnlineFriendsOpen, setIsOnlineFriendsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);

  // Initialize socket listeners
  useEffect(() => {
    if (!currentUser) return;

    // Listen for online friends
    const handleOnlineFriends = (friends) => {
      setOnlineFriends(friends);
      
      // Update online status in conversations
      setConversations(prev => prev.map(conv => ({
        ...conv,
        online: friends.some(f => f.id === conv.friendId)
      })));
    };

    // Listen for friend coming online
    const handleFriendOnline = (friend) => {
      setOnlineFriends(prev => {
        if (!prev.some(f => f.id === friend.friendId)) {
          return [...prev, {
            id: friend.friendId,
            name: friend.name,
            avatar: friend.avatar
          }];
        }
        return prev;
      });
      
      // Update online status in conversations for this friend
      setConversations(prev => prev.map(conv => 
        conv.friendId === friend.friendId 
          ? { ...conv, online: true }
          : conv
      ));
    };

    // Listen for friend going offline
    const handleFriendOffline = ({ friendId }) => {
      setOnlineFriends(prev => prev.filter(f => f.id !== friendId));
      
      // Update online status in conversations for this friend
      setConversations(prev => prev.map(conv => 
        conv.friendId === friendId 
          ? { ...conv, online: false }
          : conv
      ));
    };

    // Listen for new direct messages
    const handleNewDirectMessage = (message) => {
      const friendId = message.sender.id === currentUser.id 
        ? message.receiverId 
        : message.sender.id;
      
      setMessages(prev => ({
        ...prev,
        [friendId]: [...(prev[friendId] || []), message]
      }));

      // If the message is from someone else and the chat is not active, increment unread count
      if (message.sender.id !== currentUser.id && !activeChats.includes(friendId)) {
        setUnreadCounts(prev => ({
          ...prev,
          [friendId]: (prev[friendId] || 0) + 1
        }));
      }
      
      // Update the conversation with the new message
      setConversations(prev => {
        const existingConversation = prev.find(c => c.friendId === friendId);
        
        if (existingConversation) {
          // Update existing conversation
          return prev.map(c => 
            c.friendId === friendId 
              ? { 
                  ...c, 
                  lastMessage: message.content,
                  lastMessageTime: message.timestamp,
                  unreadCount: message.sender.id !== currentUser.id && !activeChats.includes(friendId)
                    ? (c.unreadCount || 0) + 1
                    : c.unreadCount
                }
              : c
          ).sort((a, b) => {
            // Sort by last message time (most recent first)
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
          });
        } else {
          // This is a new conversation, we need to add it
          // First check if we have friend details
          const friendDetails = message.sender.id === currentUser.id
            ? chatFriendDetails[message.receiverId] // We sent the message
            : { // They sent the message
                id: message.sender.id,
                name: message.sender.name,
                avatar: message.sender.avatar
              };
              
          if (friendDetails) {
            const newConversation = {
              friendId: friendId,
              friendName: friendDetails.name,
              avatar: friendDetails.avatar,
              online: onlineFriends.some(f => f.id === friendId),
              lastMessage: message.content,
              lastMessageTime: message.timestamp,
              unreadCount: message.sender.id !== currentUser.id ? 1 : 0
            };
            
            return [newConversation, ...prev].sort((a, b) => {
              if (!a.lastMessageTime) return 1;
              if (!b.lastMessageTime) return -1;
              return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
            });
          }
          
          return prev;
        }
      });
    };

    // Listen for direct message notifications
    const handleDirectMessageNotification = (notification) => {
      // Only update unread counts if the chat is not currently active
      if (!activeChats.includes(notification.senderId)) {
        setUnreadCounts(prev => ({
          ...prev,
          [notification.senderId]: (prev[notification.senderId] || 0) + 1
        }));
        
        // Also update the conversation
        setConversations(prev => prev.map(c => 
          c.friendId === notification.senderId
            ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
            : c
        ));
      }
    };

    // Listen for messages being read
    const handleMessagesRead = ({ readerId, senderId }) => {
      if (senderId === currentUser.id) {
        // Mark messages as read in our state
        setMessages(prev => {
          const friendMessages = prev[readerId] || [];
          return {
            ...prev,
            [readerId]: friendMessages.map(msg => ({
              ...msg,
              isRead: true
            }))
          };
        });
      }
    };

    // Register event listeners
    socketService.on('online-friends', handleOnlineFriends, true);
    socketService.on('friend-online', handleFriendOnline, true);
    socketService.on('friend-offline', handleFriendOffline, true);
    socketService.on('new-direct-message', handleNewDirectMessage);
    socketService.on('direct-message-notification', handleDirectMessageNotification, true);
    socketService.on('messages-read', handleMessagesRead);

    // Fetch initial unread counts
    const fetchUnreadCounts = async () => {
      try {
        const counts = await directMessageService.getUnreadMessageCounts();
        setUnreadCounts(counts);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    // Fetch recent conversations
    const fetchConversations = async () => {
      try {
        const response = await directMessageService.getRecentConversations();
        if (response.data && Array.isArray(response.data)) {
          // Store the conversations from the API
          const apiConversations = response.data.map(conv => {
            // Format the time properly
            let formattedTime = null;
            if (conv.lastMessageTime) {
              try {
                const date = new Date(conv.lastMessageTime);
                if (!isNaN(date.getTime())) {
                  formattedTime = conv.lastMessageTime; // Store the raw timestamp
                }
              } catch (e) {
                console.error('Invalid date format:', conv.lastMessageTime);
              }
            }
            
            return {
              friendId: conv.friendId,
              friendName: conv.friendName,
              avatar: conv.avatar,
              online: onlineFriends.some(f => f.id === conv.friendId),
              lastMessage: conv.lastMessage,
              lastMessageTime: formattedTime,
              unreadCount: unreadCounts[conv.friendId] || 0
            };
          });
          
          // Update the conversations state
          setConversations(apiConversations);
          
          // Also update chatFriendDetails with the friend information
          const newFriendDetails = {};
          apiConversations.forEach(conv => {
            newFriendDetails[conv.friendId] = {
              id: conv.friendId,
              name: conv.friendName,
              avatar: conv.avatar
            };
          });
          
          setChatFriendDetails(prev => ({
            ...prev,
            ...newFriendDetails
          }));
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchUnreadCounts();
    fetchConversations();

    // Clean up event listeners
    return () => {
      socketService.off('online-friends', handleOnlineFriends, true);
      socketService.off('friend-online', handleFriendOnline, true);
      socketService.off('friend-offline', handleFriendOffline, true);
      socketService.off('new-direct-message', handleNewDirectMessage);
      socketService.off('direct-message-notification', handleDirectMessageNotification, true);
      socketService.off('messages-read', handleMessagesRead);
    };
  }, [currentUser, activeChats]);

  // Update conversations when online friends change
  useEffect(() => {
    if (!currentUser || conversations.length === 0) return;
    
    // Update online status in all conversations
    setConversations(prev => prev.map(conv => ({
      ...conv,
      online: onlineFriends.some(f => f.id === conv.friendId)
    })));
  }, [currentUser, onlineFriends]);

  // Open a chat with a friend
  const openChat = async (friendId, friendName, friendAvatar) => {
    console.log("Opening chat with:", friendId, friendName, friendAvatar);
    
    // Close online friends list when opening a chat
    setIsOnlineFriendsOpen(false);
    
    // Store friend details for reference
    setChatFriendDetails(prev => ({
      ...prev,
      [friendId]: {
        id: friendId,
        name: friendName || 'Friend',
        avatar: friendAvatar
      }
    }));
    
    // Join the direct chat room
    socketService.joinDirectChat(friendId);

    // If the chat is already active, do nothing
    if (activeChats.includes(friendId)) {
      return;
    }

    // If the chat is minimized, remove it from minimized and add to active
    if (minimizedChats.some(chat => chat.id === friendId)) {
      setMinimizedChats(prev => prev.filter(chat => chat.id !== friendId));
    } else {
      // Add to minimized chats first with friend details to preserve the name and avatar
      setMinimizedChats(prev => [
        ...prev,
        {
          id: friendId,
          name: friendName || 'Friend',
          avatar: friendAvatar
        }
      ]);
      
      // Then immediately remove from minimized (this ensures the friend details are stored)
      setMinimizedChats(prev => prev.filter(chat => chat.id !== friendId));
    }

    // Add the chat to active chats
    setActiveChats(prev => [...prev, friendId]);

    // Mark messages as read
    if (unreadCounts[friendId]) {
      await markMessagesAsRead(friendId);
    }

    // Load messages if not already loaded
    if (!messages[friendId]) {
      loadMessages(friendId);
    }
  };

  // Close a chat
  const closeChat = (friendId) => {
    // Leave the direct chat room
    socketService.leaveDirectChat(friendId);

    // Remove from active chats
    setActiveChats(prev => prev.filter(id => id !== friendId));

    // Remove from minimized chats if it's there
    setMinimizedChats(prev => prev.filter(chat => chat.id !== friendId));
  };

  // Minimize a chat
  const minimizeChat = (friendId, friendName, friendAvatar) => {
    // Remove from active chats
    setActiveChats(prev => prev.filter(id => id !== friendId));

    // Add to minimized chats if not already there
    if (!minimizedChats.some(chat => chat.id === friendId)) {
      setMinimizedChats(prev => [...prev, {
        id: friendId,
        name: friendName,
        avatar: friendAvatar
      }]);
    }
  };

  // Restore a minimized chat
  const restoreChat = (friendId) => {
    const chat = minimizedChats.find(chat => chat.id === friendId);
    if (chat) {
      openChat(chat.id, chat.name, chat.avatar);
    }
  };

  // Load messages for a chat
  const loadMessages = async (friendId, page = 1) => {
    try {
      setLoading(true);
      const response = await directMessageService.getDirectMessages(friendId, page);
      
      // Update messages - reverse the array to show oldest messages first
      setMessages(prev => ({
        ...prev,
        [friendId]: response.data.reverse()
      }));

      // Mark messages as read
      if (unreadCounts[friendId]) {
        await markMessagesAsRead(friendId);
      }
      
      setLoading(false);
      return response.pagination;
    } catch (error) {
      console.error(`Error loading messages for ${friendId}:`, error);
      setLoading(false);
      return null;
    }
  };

  // Send a message to a friend
  const sendMessage = async (friendId, content) => {
    try {
      // Try to send via socket first
      const sent = socketService.sendDirectMessage(friendId, content);
      
      if (sent) {
        // Manually add message to state for immediate display
        // Create a temporary message object that will be replaced when socket event is received
        const tempMessage = {
          id: `temp-${Date.now()}`,
          content,
          timestamp: new Date(),
          isRead: false,
          sender: {
            id: currentUser.id,
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            avatar: currentUser.avatar
          },
          receiverId: friendId
        };
        
        // Add to messages state
        setMessages(prev => ({
          ...prev,
          [friendId]: [...(prev[friendId] || []), tempMessage]
        }));
      } else {
        // Fallback to API
        const message = await directMessageService.sendDirectMessage(friendId, content);
        
        // Add message to state
        setMessages(prev => ({
          ...prev,
          [friendId]: [...(prev[friendId] || []), message]
        }));
      }
      
      return true;
    } catch (error) {
      console.error(`Error sending message to ${friendId}:`, error);
      return false;
    }
  };

  // Mark messages from a friend as read
  const markMessagesAsRead = async (friendId) => {
    try {
      // Update local state
      setUnreadCounts(prev => ({
        ...prev,
        [friendId]: 0
      }));
      
      // Mark messages as read on the server
      await directMessageService.markMessagesAsRead(friendId);
      
      // Notify via socket
      socketService.markMessagesAsRead(friendId);
      
      return true;
    } catch (error) {
      console.error(`Error marking messages as read from ${friendId}:`, error);
      return false;
    }
  };

  // Toggle online friends list
  const toggleOnlineFriends = (isOpen) => {
    setIsOnlineFriendsOpen(isOpen);
    
    // If opening online friends, close all active chats
    if (isOpen && activeChats.length > 0) {
      // Minimize all active chats instead of closing them
      activeChats.forEach(friendId => {
        const friend = chatFriendDetails[friendId] || { id: friendId, name: 'Friend', avatar: null };
        minimizeChat(friendId, friend.name, friend.avatar);
      });
    }
  };

  // Set active conversation and open chat
  const setActiveConversation = (friendId) => {
    const conversation = conversations.find(c => c.friendId === friendId);
    if (conversation) {
      openChat(conversation.friendId, conversation.friendName, conversation.avatar);
    }
  };

  const value = {
    onlineFriends,
    activeChats,
    minimizedChats,
    unreadCounts,
    messages,
    loading,
    chatFriendDetails,
    isOnlineFriendsOpen,
    conversations,
    openChat,
    closeChat,
    minimizeChat,
    restoreChat,
    loadMessages,
    sendMessage,
    markMessagesAsRead,
    toggleOnlineFriends,
    setActiveConversation
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext; 