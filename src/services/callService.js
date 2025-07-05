import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

class CallService {
  constructor() {
    this.socket = null;
    this.localStream = null;
    this.peerConnections = new Map(); // Map of userId -> RTCPeerConnection
    this.roomId = null;
    this.userId = null;
    this.listeners = {};
    this.mediaConstraints = {
      audio: true,
      video: true
    };
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    };
    
    // Base URL for the Socket.IO server
    this.baseURL = 'http://localhost:5000';
  }
  
  /**
   * Initialize Socket.IO connection for calls
   * @param {string} token - JWT auth token
   * @param {string} userId - Current user ID
   */
  init(token, userId) {
    if (this.socket) return;
    
    this.userId = userId;
    
    try {
      // Create call namespace connection
      this.socket = io(`${this.baseURL}/call`, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling']
      });
      
      // Set up connection event handlers
      this.socket.on('connect', () => {
        console.log('Call socket connected');
        this._setupSocketListeners();
      });
      
      // Handle errors
      this.socket.on('connect_error', (error) => {
        console.error('Call socket connection error:', error.message);
        toast.error('Failed to connect to call service. Please try again.');
      });
      
      // Handle disconnection
      this.socket.on('disconnect', (reason) => {
        console.log(`Call socket disconnected: ${reason}`);
        
        // Clean up peer connections
        this._cleanupPeerConnections();
        
        // If we were in a call, notify listeners
        if (this.roomId) {
          this._emitEvent('call-disconnected', { reason });
        }
      });
      
    } catch (error) {
      console.error('Error initializing call socket:', error);
      toast.error('Failed to initialize call service');
    }
  }
  
  /**
   * Set up socket event listeners
   * @private
   */
  _setupSocketListeners() {
    // When we successfully join a call
    this.socket.on('call-joined', ({ roomId, participants }) => {
      console.log(`Joined call in room ${roomId} with ${participants.length} participants`);
      
      // Store room ID
      this.roomId = roomId;
      
      // For each existing participant, create a peer connection
      participants.forEach(participant => {
        if (participant.id !== this.userId) {
          this._createPeerConnection(participant.id);
          this._sendOffer(participant.id);
        }
      });
      
      // Emit event to listeners
      this._emitEvent('call-joined', { roomId, participants });
    });
    
    // When a new user joins the call
    this.socket.on('user-joined-call', ({ roomId, user }) => {
      console.log(`User ${user.id} joined call in room ${roomId}`);
      
      // Create a peer connection for the new user
      this._createPeerConnection(user.id);
      
      // Emit event to listeners
      this._emitEvent('user-joined-call', { user });
    });
    
    // When a user leaves the call
    this.socket.on('user-left-call', ({ roomId, userId }) => {
      console.log(`User ${userId} left call in room ${roomId}`);
      
      // Clean up peer connection for this user
      this._cleanupPeerConnection(userId);
      
      // Emit event to listeners
      this._emitEvent('user-left-call', { userId });
    });
    
    // When a user changes their media state
    this.socket.on('user-media-changed', ({ userId, audioEnabled, videoEnabled, screenSharing }) => {
      console.log(`User ${userId} changed media state: audio=${audioEnabled}, video=${videoEnabled}, screen=${screenSharing}`);
      
      // Emit event to listeners
      this._emitEvent('user-media-changed', { userId, audioEnabled, videoEnabled, screenSharing });
    });
    
    // When a user's speaking status changes
    this.socket.on('user-speaking-status', ({ userId, isSpeaking }) => {
      console.log(`User ${userId} speaking status: ${isSpeaking ? 'speaking' : 'not speaking'}`);
      
      // Emit event to listeners
      this._emitEvent('user-speaking-status', { userId, isSpeaking });
    });
    
    // When we receive a WebRTC signaling message
    this.socket.on('signal', async ({ from, signal, type }) => {
      try {
        if (type === 'offer') {
          await this._handleOffer(from, signal);
        } else if (type === 'answer') {
          await this._handleAnswer(from, signal);
        } else if (type === 'ice-candidate') {
          await this._handleIceCandidate(from, signal);
        }
      } catch (error) {
        console.error('Error handling signal:', error);
      }
    });
    
    // When there's an error with the call
    this.socket.on('call-error', ({ message }) => {
      console.error('Call error:', message);
      toast.error(message || 'An error occurred with the call');
      
      // Emit event to listeners
      this._emitEvent('call-error', { message });
    });
  }
  
  /**
   * Join a voice call in a study room
   * @param {string} roomId - ID of the study room
   * @returns {Promise<boolean>} - Whether joining was successful
   */
  async joinCall(roomId) {
    try {
      if (!this.socket) {
        throw new Error('Call service not initialized');
      }
      
      if (this.roomId) {
        throw new Error('Already in a call');
      }
      
      // Try to get user media with both audio and video
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints);
        
        // Initially disable video but keep audio enabled
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = false;
        });
      } catch (mediaError) {
        console.warn('Error accessing camera, falling back to audio only:', mediaError);
        
        // Try audio only as fallback
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({ 
            audio: true, 
            video: false 
          });
          
          // Show warning to user
          toast.warning('Camera access failed. Joining with audio only.');
        } catch (audioError) {
          console.error('Error accessing microphone:', audioError);
          throw new Error('Could not access microphone. Please check your permissions.');
        }
      }
      
      // Join the call
      this.socket.emit('join-call', { roomId });
      
      return true;
    } catch (error) {
      console.error('Error joining call:', error);
      
      // Clean up if we got a stream but failed to join
      if (this.localStream) {
        this._stopLocalStream();
      }
      
      toast.error(error.message || 'Failed to join call. Please check your microphone and camera permissions.');
      return false;
    }
  }
  
  /**
   * Leave the current call
   */
  leaveCall() {
    if (!this.socket || !this.roomId) return;
    
    try {
      // Emit leave call event
      this.socket.emit('leave-call', { roomId: this.roomId });
      
      // Clean up
      this._cleanupPeerConnections();
      this._stopLocalStream();
      
      // Reset state
      this.roomId = null;
      
      console.log('Left call');
    } catch (error) {
      console.error('Error leaving call:', error);
    }
  }
  
  /**
   * Toggle microphone mute state
   * @param {boolean} enabled - Whether the microphone should be enabled
   */
  toggleMicrophone(enabled) {
    if (!this.localStream) return;
    
    try {
      // Toggle audio tracks
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      
      // Notify server of state change
      if (this.socket && this.roomId) {
        this.socket.emit('media-state-change', {
          roomId: this.roomId,
          audioEnabled: enabled
        });
      }
      
      console.log(`Microphone ${enabled ? 'unmuted' : 'muted'}`);
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  }
  
  /**
   * Check if the microphone is currently muted
   * @returns {boolean} - Whether the microphone is muted
   */
  isMicrophoneMuted() {
    if (!this.localStream) return true;
    
    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length === 0) return true;
    
    return !audioTracks[0].enabled;
  }
  
  /**
   * Ensure video tracks are available, requesting camera access if needed
   * @returns {Promise<boolean>} - Whether video tracks are available
   */
  async ensureVideoTracks() {
    if (!this.localStream) return false;
    
    // Check if we already have video tracks
    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length > 0) return true;
    
    try {
      // Request camera access
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Add video tracks to our existing stream
      videoStream.getVideoTracks().forEach(track => {
        this.localStream.addTrack(track);
      });
      
      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      return false;
    }
  }
  
  /**
   * Toggle video on/off
   * @param {boolean} enabled - Whether the video should be enabled
   */
  toggleVideo(enabled) {
    if (!this.localStream) return;
    
    try {
      // Toggle video tracks
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      
      // Notify server of state change
      if (this.socket && this.roomId) {
        this.socket.emit('media-state-change', {
          roomId: this.roomId,
          videoEnabled: enabled
        });
      }
      
      console.log(`Video ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  }
  
  /**
   * Check if the video is currently disabled
   * @returns {boolean} - Whether the video is disabled
   */
  isVideoDisabled() {
    if (!this.localStream) return true;
    
    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length === 0) return true;
    
    return !videoTracks[0].enabled;
  }
  
  /**
   * Create a new WebRTC peer connection for a user
   * @param {string} userId - ID of the user to connect with
   * @private
   */
  _createPeerConnection(userId) {
    try {
      // Create a new RTCPeerConnection
      const peerConnection = new RTCPeerConnection(this.rtcConfig);
      
      // Add local stream tracks to the connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream);
        });
      }
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this._sendIceCandidate(userId, event.candidate);
        }
      };
      
      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state with ${userId}: ${peerConnection.connectionState}`);
        
        if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'closed') {
          this._cleanupPeerConnection(userId);
        }
      };
      
      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        console.log(`Received track from ${userId}`);
        
        // Create an audio element for this user if needed
        this._createRemoteAudio(userId, event.streams[0]);
        
        // Emit event to listeners
        this._emitEvent('track-added', { userId, stream: event.streams[0] });
      };
      
      // Store the peer connection
      this.peerConnections.set(userId, peerConnection);
      
      console.log(`Created peer connection for ${userId}`);
      return peerConnection;
    } catch (error) {
      console.error(`Error creating peer connection for ${userId}:`, error);
      return null;
    }
  }
  
  /**
   * Create and send an offer to a peer
   * @param {string} userId - ID of the user to send the offer to
   * @private
   */
  async _sendOffer(userId) {
    try {
      const peerConnection = this.peerConnections.get(userId);
      if (!peerConnection) return;
      
      // Create offer
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      // Set local description
      await peerConnection.setLocalDescription(offer);
      
      // Send offer to peer
      this.socket.emit('signal', {
        roomId: this.roomId,
        to: userId,
        signal: offer,
        type: 'offer'
      });
      
      console.log(`Sent offer to ${userId}`);
    } catch (error) {
      console.error(`Error sending offer to ${userId}:`, error);
    }
  }
  
  /**
   * Handle an incoming offer from a peer
   * @param {string} userId - ID of the user who sent the offer
   * @param {RTCSessionDescription} offer - The offer
   * @private
   */
  async _handleOffer(userId, offer) {
    try {
      // Create peer connection if it doesn't exist
      let peerConnection = this.peerConnections.get(userId);
      if (!peerConnection) {
        peerConnection = this._createPeerConnection(userId);
      }
      
      // Set remote description
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create answer
      const answer = await peerConnection.createAnswer();
      
      // Set local description
      await peerConnection.setLocalDescription(answer);
      
      // Send answer to peer
      this.socket.emit('signal', {
        roomId: this.roomId,
        to: userId,
        signal: answer,
        type: 'answer'
      });
      
      console.log(`Handled offer from ${userId} and sent answer`);
    } catch (error) {
      console.error(`Error handling offer from ${userId}:`, error);
    }
  }
  
  /**
   * Handle an incoming answer from a peer
   * @param {string} userId - ID of the user who sent the answer
   * @param {RTCSessionDescription} answer - The answer
   * @private
   */
  async _handleAnswer(userId, answer) {
    try {
      const peerConnection = this.peerConnections.get(userId);
      if (!peerConnection) return;
      
      // Set remote description
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      
      console.log(`Handled answer from ${userId}`);
    } catch (error) {
      console.error(`Error handling answer from ${userId}:`, error);
    }
  }
  
  /**
   * Send an ICE candidate to a peer
   * @param {string} userId - ID of the user to send the candidate to
   * @param {RTCIceCandidate} candidate - The ICE candidate
   * @private
   */
  _sendIceCandidate(userId, candidate) {
    if (!this.socket || !this.roomId) return;
    
    this.socket.emit('signal', {
      roomId: this.roomId,
      to: userId,
      signal: candidate,
      type: 'ice-candidate'
    });
  }
  
  /**
   * Handle an incoming ICE candidate from a peer
   * @param {string} userId - ID of the user who sent the candidate
   * @param {RTCIceCandidate} candidate - The ICE candidate
   * @private
   */
  async _handleIceCandidate(userId, candidate) {
    try {
      const peerConnection = this.peerConnections.get(userId);
      if (!peerConnection) return;
      
      // Add the ICE candidate
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      
      console.log(`Added ICE candidate from ${userId}`);
    } catch (error) {
      console.error(`Error handling ICE candidate from ${userId}:`, error);
    }
  }
  
  /**
   * Create an audio element for a remote user
   * @param {string} userId - ID of the remote user
   * @param {MediaStream} stream - The media stream
   * @private
   */
  _createRemoteAudio(userId, stream) {
    // Check if an audio element already exists for this user
    let audioElement = document.getElementById(`remote-audio-${userId}`);
    
    if (!audioElement) {
      // Create a new audio element
      audioElement = document.createElement('audio');
      audioElement.id = `remote-audio-${userId}`;
      audioElement.autoplay = true;
      audioElement.controls = false;
      
      // Append to body (hidden)
      document.body.appendChild(audioElement);
    }
    
    // Set the stream as the source
    audioElement.srcObject = stream;
  }
  
  /**
   * Remove the audio element for a remote user
   * @param {string} userId - ID of the remote user
   * @private
   */
  _removeRemoteAudio(userId) {
    const audioElement = document.getElementById(`remote-audio-${userId}`);
    if (audioElement) {
      audioElement.srcObject = null;
      audioElement.remove();
    }
  }
  
  /**
   * Clean up a peer connection for a specific user
   * @param {string} userId - ID of the user
   * @private
   */
  _cleanupPeerConnection(userId) {
    try {
      const peerConnection = this.peerConnections.get(userId);
      if (!peerConnection) return;
      
      // Close the connection
      peerConnection.close();
      
      // Remove from map
      this.peerConnections.delete(userId);
      
      // Remove remote audio element
      this._removeRemoteAudio(userId);
      
      console.log(`Cleaned up peer connection for ${userId}`);
    } catch (error) {
      console.error(`Error cleaning up peer connection for ${userId}:`, error);
    }
  }
  
  /**
   * Clean up all peer connections
   * @private
   */
  _cleanupPeerConnections() {
    try {
      // Close all peer connections
      for (const [userId, peerConnection] of this.peerConnections.entries()) {
        peerConnection.close();
        this._removeRemoteAudio(userId);
      }
      
      // Clear the map
      this.peerConnections.clear();
      
      console.log('Cleaned up all peer connections');
    } catch (error) {
      console.error('Error cleaning up peer connections:', error);
    }
  }
  
  /**
   * Stop the local media stream
   * @private
   */
  _stopLocalStream() {
    if (!this.localStream) return;
    
    try {
      // Stop all tracks
      this.localStream.getTracks().forEach(track => track.stop());
      
      // Clear the stream
      this.localStream = null;
      
      console.log('Stopped local stream');
    } catch (error) {
      console.error('Error stopping local stream:', error);
    }
  }
  
  /**
   * Register an event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
  }
  
  /**
   * Unregister an event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  
  /**
   * Emit an event to all registered listeners
   * @param {string} event - Event name
   * @param {object} data - Event data
   * @private
   */
  _emitEvent(event, data) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }
  
  /**
   * Clean up and disconnect
   */
  disconnect() {
    // Leave any active call
    if (this.roomId) {
      this.leaveCall();
    }
    
    // Clean up peer connections
    this._cleanupPeerConnections();
    
    // Stop local stream
    this._stopLocalStream();
    
    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Clear listeners
    this.listeners = {};
    
    console.log('Call service disconnected');
  }
  
  /**
   * Update and broadcast speaking status to other participants
   * @param {boolean} isSpeaking - Whether the user is currently speaking
   */
  updateSpeakingStatus(isSpeaking) {
    if (!this.socket || !this.roomId) return;
    
    try {
      // Emit speaking status change to server
      this.socket.emit('speaking-status-change', {
        roomId: this.roomId,
        isSpeaking
      });
      
      console.log(`Speaking status updated: ${isSpeaking ? 'speaking' : 'not speaking'}`);
    } catch (error) {
      console.error('Error updating speaking status:', error);
    }
  }
}

// Create a singleton instance
const callService = new CallService();

export default callService; 