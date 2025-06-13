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

// Additional service exports can be added here

export default api; 