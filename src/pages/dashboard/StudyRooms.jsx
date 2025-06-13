import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaSearch, FaPlus, FaFilter, FaEllipsisH, FaLock, FaGlobe, FaBook, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { studyRoomService } from '../../services/api';

const StudyRooms = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('myRooms');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for study rooms data from API
  const [myRooms, setMyRooms] = useState([]);
  const [discoverRooms, setDiscoverRooms] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  
  // Fetch study rooms data from API
  useEffect(() => {
    const fetchStudyRooms = async () => {
      try {
        setLoading(true);
        const data = await studyRoomService.getAllStudyRooms();
        
        // Set the study rooms from API response
        if (data) {
          setMyRooms(data.userRooms || []);
          setDiscoverRooms(data.discoverRooms || []);
          
          // Extract unique subjects for filter dropdown
          const subjects = [...new Set([
            ...data.userRooms.map(room => room.subject),
            ...data.discoverRooms.map(room => room.subject)
          ])].filter(Boolean);
          
          setAllSubjects(subjects);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching study rooms:', err);
        setError('Failed to load study rooms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudyRooms();
  }, []);

  // Filter rooms based on search query and subject filter
  const filteredMyRooms = myRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         room.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || room.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const filteredDiscoverRooms = discoverRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         room.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || room.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const handleCreateRoom = () => {
    navigate('/dashboard/rooms/create');
  };

  const handleJoinRoom = async (roomId) => {
    try {
      await studyRoomService.joinStudyRoom(roomId);
      // Refresh the study rooms data after joining
      const data = await studyRoomService.getAllStudyRooms();
      setMyRooms(data.userRooms || []);
      setDiscoverRooms(data.discoverRooms || []);
      alert('Successfully joined the study room!');
    } catch (err) {
      console.error('Error joining room:', err);
      alert('Failed to join the study room. Please try again.');
    }
  };

  const handleEnterRoom = (roomId) => {
    navigate(`/dashboard/rooms/${roomId}`);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-primary-600 text-4xl" />
        <span className="ml-3 text-lg text-secondary-700">Loading study rooms...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <p className="font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-red-900 underline hover:no-underline focus:outline-none"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Study Rooms</h1>
          <p className="text-secondary-600 mt-1">
            Join virtual study rooms to collaborate with peers
          </p>
        </div>
        <button
          onClick={handleCreateRoom}
          className="btn-primary flex items-center"
        >
          <FaPlus className="mr-2" /> Create Room
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-secondary-200">
        <div className="flex space-x-8">
          <button
            className={`py-4 px-1 font-medium text-sm focus:outline-none ${
              activeTab === 'myRooms'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
            onClick={() => setActiveTab('myRooms')}
          >
            My Study Rooms
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm focus:outline-none ${
              activeTab === 'discover'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
            onClick={() => setActiveTab('discover')}
          >
            Discover Rooms
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-secondary-400" />
          </div>
          <input
            type="text"
            placeholder="Search study rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-secondary-400" />
            </div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="block pl-10 pr-10 py-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Subjects</option>
              {allSubjects.map((subject, index) => (
                <option key={index} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      {activeTab === 'myRooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMyRooms.length > 0 ? (
            filteredMyRooms.map(room => (
              <div key={room.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-32 bg-secondary-200 relative">
                  {room.image && (
                    <img 
                      src={room.image} 
                      alt={room.name} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-secondary-900">{room.name}</h3>
                    <span className="text-xs font-medium bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                      {room.subject}
                    </span>
                  </div>
                  <p className="text-secondary-500 text-sm mt-1">
                    <FaUsers className="inline mr-1" /> {room.members} members
                  </p>
                  <p className="text-secondary-600 text-sm mt-2 mb-4 line-clamp-2">
                    {room.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-secondary-500">
                      {room.resources} resources
                    </div>
                    <button 
                      onClick={() => handleEnterRoom(room.id)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Enter Room
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-secondary-400 text-xl" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-1">No study rooms found</h3>
              <p className="text-secondary-500">Try adjusting your search criteria or create a new room</p>
            </div>
          )}
        </div>
      )}

      {/* Discover Room Grid */}
      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiscoverRooms.length > 0 ? (
            filteredDiscoverRooms.map(room => (
              <div key={room.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-32 bg-secondary-200 relative">
                  {room.image && (
                    <img 
                      src={room.image} 
                      alt={room.name} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-secondary-900">{room.name}</h3>
                    <span className="text-xs font-medium bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                      {room.subject}
                    </span>
                  </div>
                  <p className="text-secondary-500 text-sm mt-1">
                    <FaUsers className="inline mr-1" /> {room.members} members
                  </p>
                  <p className="text-secondary-600 text-sm mt-2 mb-4 line-clamp-2">
                    {room.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-secondary-500">
                      Owner: {room.owner}
                    </div>
                    <button 
                      onClick={() => handleJoinRoom(room.id)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-secondary-400 text-xl" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-1">No study rooms found</h3>
              <p className="text-secondary-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyRooms; 