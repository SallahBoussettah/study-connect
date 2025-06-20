import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Study Room API services
export const studyRoomService = {
  // Get all study rooms (both user's rooms and discover rooms)
  getAllStudyRooms: async () => {
    try {
      const response = await api.get('/study-rooms');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching study rooms:', error);
      throw error;
    }
  },
  
  // Get a single study room by ID
  getStudyRoomById: async (roomId) => {
    try {
      const response = await api.get(`/study-rooms/${roomId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching study room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Create a new study room
  createStudyRoom: async (roomData) => {
    try {
      const response = await api.post('/study-rooms', roomData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating study room:', error);
      throw error;
    }
  },
  
  // Update a study room
  updateStudyRoom: async (roomId, roomData) => {
    try {
      const response = await api.put(`/study-rooms/${roomId}`, roomData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating study room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Delete a study room
  deleteStudyRoom: async (roomId) => {
    try {
      const response = await api.delete(`/study-rooms/${roomId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting study room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Join a study room
  joinStudyRoom: async (roomId) => {
    try {
      const response = await api.post(`/study-rooms/${roomId}/join`);
      return response.data;
    } catch (error) {
      console.error(`Error joining study room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Leave a study room
  leaveStudyRoom: async (roomId) => {
    try {
      const response = await api.post(`/study-rooms/${roomId}/leave`);
      return response.data;
    } catch (error) {
      console.error(`Error leaving study room ${roomId}:`, error);
      throw error;
    }
  }
};

// Messages API services
export const messageService = {
  // Get all messages for a room
  getRoomMessages: async (roomId, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/study-rooms/${roomId}/messages`, {
        params: { page, limit }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching messages for room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Send a message to a room
  sendMessage: async (roomId, content) => {
    try {
      const response = await api.post(`/study-rooms/${roomId}/messages`, { content });
      return response.data.data;
    } catch (error) {
      console.error(`Error sending message to room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Create a system message (for admins/owners only)
  createSystemMessage: async (roomId, content) => {
    try {
      const response = await api.post(`/study-rooms/${roomId}/messages/system`, { content });
      return response.data.data;
    } catch (error) {
      console.error(`Error creating system message in room ${roomId}:`, error);
      throw error;
    }
  }
};

// Presence API services
export const presenceService = {
  // Get online users in a room
  getRoomPresence: async (roomId) => {
    try {
      const response = await api.get(`/study-rooms/${roomId}/presence`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching presence for room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Update user presence in a room
  updatePresence: async (roomId, status = 'active') => {
    try {
      const response = await api.post(`/study-rooms/${roomId}/presence`, { status });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating presence in room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Set user offline in a room
  setOffline: async (roomId) => {
    try {
      const response = await api.delete(`/study-rooms/${roomId}/presence`);
      return response.data;
    } catch (error) {
      console.error(`Error setting offline in room ${roomId}:`, error);
      throw error;
    }
  }
};

// Subject API services
export const subjectService = {
  // Get all subjects
  getAllSubjects: async () => {
    try {
      const response = await api.get('/subjects');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },
  
  // Get a single subject by ID
  getSubjectById: async (subjectId) => {
    try {
      const response = await api.get(`/subjects/${subjectId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching subject ${subjectId}:`, error);
      throw error;
    }
  }
};

// Resource API services
export const resourceService = {
  // Get all resources for a study room
  getStudyRoomResources: async (roomId) => {
    try {
      const response = await api.get(`/study-rooms/${roomId}/resources`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching resources for room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Get a single resource by ID
  getResourceById: async (resourceId) => {
    try {
      const response = await api.get(`/resources/${resourceId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching resource ${resourceId}:`, error);
      throw error;
    }
  },
  
  // Create a new resource in a study room
  createResource: async (roomId, resourceData) => {
    try {
      // Create a FormData object for file uploads
      const formData = new FormData();
      
      // Add fields to the form data
      Object.keys(resourceData).forEach(key => {
        // Skip null or undefined values
        if (resourceData[key] != null) {
          // Handle file upload separately
          if (key === 'file' && resourceData[key] instanceof File) {
            formData.append('file', resourceData[key]);
          } else {
            formData.append(key, resourceData[key]);
          }
        }
      });
      
      const response = await api.post(`/study-rooms/${roomId}/resources`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Error creating resource in room ${roomId}:`, error);
      throw error;
    }
  },
  
  // Update a resource
  updateResource: async (resourceId, resourceData) => {
    try {
      // Create a FormData object for file uploads
      const formData = new FormData();
      
      // Add fields to the form data
      Object.keys(resourceData).forEach(key => {
        // Skip null or undefined values
        if (resourceData[key] != null) {
          // Handle file upload separately
          if (key === 'file' && resourceData[key] instanceof File) {
            formData.append('file', resourceData[key]);
          } else {
            formData.append(key, resourceData[key]);
          }
        }
      });
      
      const response = await api.put(`/resources/${resourceId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Error updating resource ${resourceId}:`, error);
      throw error;
    }
  },
  
  // Delete a resource
  deleteResource: async (resourceId) => {
    try {
      const response = await api.delete(`/resources/${resourceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting resource ${resourceId}:`, error);
      throw error;
    }
  },
  
  // Get download URL for a resource
  getDownloadUrl: (resourceId) => {
    return `${API_URL}/resources/${resourceId}/download`;
  }
};

// Friendship API services
export const friendshipService = {
  // Get all friends
  getAllFriends: async () => {
    try {
      const response = await api.get('/friends');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  },
  
  // Get all friend requests
  getFriendRequests: async () => {
    try {
      const response = await api.get('/friends/requests');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      throw error;
    }
  },
  
  // Get all sent friend requests
  getSentFriendRequests: async () => {
    try {
      const response = await api.get('/friends/requests/sent');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching sent friend requests:', error);
      throw error;
    }
  },
  
  // Send a friend request
  sendFriendRequest: async (receiverId) => {
    try {
      const response = await api.post('/friends/requests', { receiverId });
      return response.data.data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },
  
  // Accept a friend request
  acceptFriendRequest: async (requestId) => {
    try {
      const response = await api.put(`/friends/requests/${requestId}/accept`);
      return response.data.data;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  },
  
  // Reject a friend request
  rejectFriendRequest: async (requestId) => {
    try {
      const response = await api.put(`/friends/requests/${requestId}/reject`);
      return response.data.data;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  },
  
  // Remove a friend
  removeFriend: async (friendId) => {
    try {
      const response = await api.delete(`/friends/${friendId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  },
  
  // Search for users to add as friends
  searchUsers: async (query) => {
    try {
      const response = await api.get('/friends/search', {
        params: { query }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
};

// Additional service exports can be added here

// Direct Message API services
export const directMessageService = {
  // Get direct messages with a friend
  getDirectMessages: async (friendId, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/messages/direct/${friendId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching direct messages with ${friendId}:`, error);
      throw error;
    }
  },
  
  // Send a direct message to a friend
  sendDirectMessage: async (friendId, content) => {
    try {
      const response = await api.post(`/messages/direct/${friendId}`, { content });
      return response.data.data;
    } catch (error) {
      console.error(`Error sending direct message to ${friendId}:`, error);
      throw error;
    }
  },
  
  // Get unread message counts from all friends
  getUnreadMessageCounts: async () => {
    try {
      const response = await api.get('/messages/direct/unread');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching unread message counts:', error);
      throw error;
    }
  },
  
  // Mark messages from a friend as read
  markMessagesAsRead: async (friendId) => {
    try {
      const response = await api.put(`/messages/direct/${friendId}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error marking messages as read from ${friendId}:`, error);
      throw error;
    }
  }
};

export default api; 