import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUserFriends, FaSearch, FaUserPlus, FaUserMinus, 
  FaCheck, FaTimes, FaSpinner, FaEnvelope, FaSchool, 
  FaGraduationCap, FaEllipsisH, FaUserClock, FaComment
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { friendshipService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useLocation } from 'react-router-dom';

const Friends = () => {
  const { currentUser } = useAuth();
  const { openChat } = useChat();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState({
    friends: true,
    requests: true,
    search: false
  });
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Check URL parameters for tab selection
  useEffect(() => {
    // Check if we should show the requests tab
    if (location.pathname === '/dashboard/friends/requests') {
      setActiveTab('requests');
    } else if (location.search) {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab === 'requests') {
        setActiveTab('requests');
      }
    }
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch friends and requests on component mount
  useEffect(() => {
    const fetchFriendsData = async () => {
      try {
        // Fetch friends list
        const friendsData = await friendshipService.getAllFriends();
        setFriends(friendsData);
        setLoading(prev => ({ ...prev, friends: false }));
        
        // Fetch friend requests
        const requestsData = await friendshipService.getFriendRequests();
        setFriendRequests(requestsData);
        
        // Fetch sent requests
        const sentData = await friendshipService.getSentFriendRequests();
        setSentRequests(sentData);
        
        setLoading(prev => ({ ...prev, requests: false }));
        setError(null);
      } catch (err) {
        console.error('Error fetching friends data:', err);
        setError('Failed to load friends data. Please try again later.');
        setLoading(prev => ({ ...prev, friends: false, requests: false }));
      }
    };
    
    fetchFriendsData();
  }, []);

  // Toggle dropdown menu
  const toggleDropdown = (friendId) => {
    setActiveDropdown(activeDropdown === friendId ? null : friendId);
  };

  // Handle search for new friends
  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      toast.info('Please enter at least 2 characters to search');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, search: true }));
      const results = await friendshipService.searchUsers(searchQuery);
      setSearchResults(results);
      setLoading(prev => ({ ...prev, search: false }));
      
      if (results.length === 0) {
        toast.info('No users found matching your search');
      }
    } catch (err) {
      console.error('Error searching users:', err);
      toast.error('Failed to search users. Please try again.');
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  // Send friend request
  const handleSendRequest = async (userId) => {
    try {
      await friendshipService.sendFriendRequest(userId);
      
      // Update search results to remove the user
      setSearchResults(prev => prev.filter(user => user.id !== userId));
      
      // Add to sent requests
      const user = searchResults.find(u => u.id === userId);
      if (user) {
        setSentRequests(prev => [...prev, {
          id: Date.now().toString(), // Temporary ID until refresh
          receiver: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar
          },
          requestedAt: new Date()
        }]);
      }
      
      toast.success('Friend request sent successfully');
    } catch (err) {
      console.error('Error sending friend request:', err);
      toast.error('Failed to send friend request. Please try again.');
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (requestId) => {
    try {
      const result = await friendshipService.acceptFriendRequest(requestId);
      
      // Find the request that was accepted
      const request = friendRequests.find(req => req.id === requestId);
      
      if (request) {
        // Add the user to friends list
        setFriends(prev => [...prev, {
          id: request.sender.id,
          firstName: request.sender.firstName,
          lastName: request.sender.lastName,
          email: request.sender.email,
          avatar: request.sender.avatar,
          friendshipId: result.id,
          since: new Date()
        }]);
        
        // Remove from requests
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      }
      
      toast.success('Friend request accepted');
    } catch (err) {
      console.error('Error accepting friend request:', err);
      toast.error('Failed to accept friend request. Please try again.');
    }
  };

  // Reject friend request
  const handleRejectRequest = async (requestId) => {
    try {
      await friendshipService.rejectFriendRequest(requestId);
      
      // Remove from requests
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast.success('Friend request rejected');
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      toast.error('Failed to reject friend request. Please try again.');
    }
  };

  // Remove friend
  const handleRemoveFriend = async (friendId) => {
    try {
      await friendshipService.removeFriend(friendId);
      
      // Remove from friends list
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
      
      // Close dropdown
      setActiveDropdown(null);
      
      toast.success('Friend removed successfully');
    } catch (err) {
      console.error('Error removing friend:', err);
      toast.error('Failed to remove friend. Please try again.');
    }
  };

  // Start chat with friend
  const handleStartChat = (friend) => {
    console.log("Starting chat with friend:", friend);
    const friendName = `${friend.firstName} ${friend.lastName}`;
    console.log("Friend name:", friendName);
    
    openChat(
      friend.id, 
      friendName, 
      friend.avatar
    );
    setActiveDropdown(null);
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Generate avatar placeholder if no avatar is available
  const getAvatarPlaceholder = (firstName, lastName) => {
    return `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&color=fff`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">Friends</h1>
        <p className="text-secondary-600 mt-1">
          Connect with other students and share resources
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-secondary-200">
        <div className="flex space-x-8">
          <button
            className={`py-4 px-1 font-medium text-sm focus:outline-none flex items-center ${
              activeTab === 'friends'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
            onClick={() => setActiveTab('friends')}
          >
            <FaUserFriends className="mr-2" /> Friends
            {friends.length > 0 && (
              <span className="ml-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                {friends.length}
              </span>
            )}
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm focus:outline-none flex items-center ${
              activeTab === 'requests'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            <FaUserClock className="mr-2" /> Requests
            {friendRequests.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {friendRequests.length}
              </span>
            )}
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm focus:outline-none flex items-center ${
              activeTab === 'find'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
            onClick={() => setActiveTab('find')}
          >
            <FaUserPlus className="mr-2" /> Find Friends
          </button>
        </div>
      </div>

      {/* Display error if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-red-900 underline hover:no-underline focus:outline-none"
          >
            Try again
          </button>
        </div>
      )}

      {/* Friends List Tab */}
      {activeTab === 'friends' && (
        <div>
          {loading.friends ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-primary-600 text-4xl" />
              <span className="ml-3 text-lg text-secondary-700">Loading friends...</span>
            </div>
          ) : friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map(friend => (
                <div key={friend.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                          <img 
                            src={friend.avatar || getAvatarPlaceholder(friend.firstName, friend.lastName)} 
                            alt={`${friend.firstName} ${friend.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-secondary-900">
                            {friend.firstName} {friend.lastName}
                          </h3>
                          <div className="flex items-center text-secondary-500 text-sm mt-1">
                            <FaEnvelope className="mr-1" /> {friend.email}
                          </div>
                          {friend.institution && (
                            <div className="flex items-center text-secondary-500 text-sm mt-1">
                              <FaSchool className="mr-1" /> {friend.institution}
                            </div>
                          )}
                          {friend.major && (
                            <div className="flex items-center text-secondary-500 text-sm mt-1">
                              <FaGraduationCap className="mr-1" /> {friend.major}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative" ref={activeDropdown === friend.id ? dropdownRef : null}>
                        <button 
                          className="p-2 rounded-full hover:bg-secondary-100"
                          onClick={() => toggleDropdown(friend.id)}
                        >
                          <FaEllipsisH className="text-secondary-500" />
                        </button>
                        {activeDropdown === friend.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <button 
                              onClick={() => handleStartChat(friend)}
                              className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                            >
                              <FaComment className="mr-2" /> Message
                            </button>
                            <button 
                              onClick={() => handleRemoveFriend(friend.id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <FaUserMinus className="mr-2" /> Remove Friend
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {friend.bio && (
                      <p className="text-secondary-600 text-sm mt-4 line-clamp-2">
                        {friend.bio}
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t border-secondary-100 flex justify-between items-center">
                      <div className="text-xs text-secondary-500">
                        Friends since {formatDate(friend.since)}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleStartChat(friend)}
                          className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                        >
                          <FaComment className="mr-1" /> Chat
                        </button>
                        <button 
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center"
                        >
                          <FaUserMinus className="mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                <FaUserFriends className="text-secondary-400 text-xl" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-1">No friends yet</h3>
              <p className="text-secondary-500 mb-6">Start connecting with other students</p>
              <button 
                onClick={() => setActiveTab('find')}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <FaUserPlus className="inline mr-2" /> Find Friends
              </button>
            </div>
          )}
        </div>
      )}

      {/* Friend Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          {loading.requests ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-primary-600 text-4xl" />
              <span className="ml-3 text-lg text-secondary-700">Loading requests...</span>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Received Requests */}
              <div>
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Received Requests</h2>
                {friendRequests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friendRequests.map(request => (
                      <div key={request.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                            <img 
                              src={request.sender.avatar || getAvatarPlaceholder(request.sender.firstName, request.sender.lastName)} 
                              alt={`${request.sender.firstName} ${request.sender.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-secondary-900">
                              {request.sender.firstName} {request.sender.lastName}
                            </h3>
                            <p className="text-xs text-secondary-500">
                              Sent {formatDate(request.requestedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleAcceptRequest(request.id)}
                            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700"
                            title="Accept"
                          >
                            <FaCheck />
                          </button>
                          <button 
                            onClick={() => handleRejectRequest(request.id)}
                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-secondary-500">No pending friend requests</p>
                  </div>
                )}
              </div>
              
              {/* Sent Requests */}
              <div>
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Sent Requests</h2>
                {sentRequests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sentRequests.map(request => (
                      <div key={request.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                            <img 
                              src={request.receiver.avatar || getAvatarPlaceholder(request.receiver.firstName, request.receiver.lastName)} 
                              alt={`${request.receiver.firstName} ${request.receiver.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-secondary-900">
                              {request.receiver.firstName} {request.receiver.lastName}
                            </h3>
                            <p className="text-xs text-secondary-500">
                              Sent {formatDate(request.requestedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-secondary-500 italic">
                          Pending
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-secondary-500">No sent friend requests</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Find Friends Tab */}
      {activeTab === 'find' && (
        <div>
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-secondary-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading.search}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-primary-400 flex items-center justify-center"
              >
                {loading.search ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaSearch className="mr-2" />
                )}
                Search
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Search Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(user => (
                  <div key={user.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                          <img 
                            src={user.avatar || getAvatarPlaceholder(user.firstName, user.lastName)} 
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-secondary-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          {user.institution && (
                            <p className="text-xs text-secondary-500 flex items-center">
                              <FaSchool className="mr-1" /> {user.institution}
                            </p>
                          )}
                          {user.major && (
                            <p className="text-xs text-secondary-500 flex items-center">
                              <FaGraduationCap className="mr-1" /> {user.major}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user.id)}
                        className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 flex items-center justify-center"
                        title="Send Friend Request"
                      >
                        <FaUserPlus />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Instructions */}
          {searchResults.length === 0 && !loading.search && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-secondary-400 text-xl" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-1">Find friends</h3>
              <p className="text-secondary-500 mb-2">Search for other students by name or email</p>
              <p className="text-xs text-secondary-400">
                Connect with friends to easily share resources and study together
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Friends; 