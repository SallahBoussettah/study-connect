import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaSearch, FaPlus, FaFilter, FaEllipsisH, FaLock, FaGlobe, FaBook } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const StudyRooms = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('myRooms');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  
  // Mock data for study rooms
  const myRooms = [
    {
      id: 1,
      name: 'Advanced Calculus Study Group',
      description: 'Collaborative study for multivariable calculus and differential equations',
      subject: 'Mathematics',
      members: 12,
      owner: 'Alex Johnson',
      isPrivate: false,
      lastActive: '2023-06-14T18:30:00',
      resources: 8,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
      id: 2,
      name: 'Physics 101 Lab Prep',
      description: 'Preparation for physics lab experiments and problem-solving sessions',
      subject: 'Physics',
      members: 8,
      owner: 'You',
      isPrivate: true,
      lastActive: '2023-06-15T10:15:00',
      resources: 15,
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
      id: 3,
      name: 'Programming Fundamentals',
      description: 'Learning the basics of programming with practical exercises',
      subject: 'Computer Science',
      members: 15,
      owner: 'Maria Garcia',
      isPrivate: false,
      lastActive: '2023-06-15T14:45:00',
      resources: 23,
      image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    }
  ];
  
  const discoverRooms = [
    {
      id: 4,
      name: 'Organic Chemistry Group',
      description: 'Study group focusing on organic chemistry reactions and mechanisms',
      subject: 'Chemistry',
      members: 14,
      owner: 'David Wilson',
      isPrivate: false,
      lastActive: '2023-06-14T16:20:00',
      resources: 19,
      image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
      id: 5,
      name: 'World Literature Discussion',
      description: 'Analysis and discussion of classic and contemporary world literature',
      subject: 'Literature',
      members: 10,
      owner: 'Sophia Lee',
      isPrivate: false,
      lastActive: '2023-06-15T09:30:00',
      resources: 12,
      image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
      id: 6,
      name: 'Data Structures & Algorithms',
      description: 'Advanced programming concepts and algorithm optimization',
      subject: 'Computer Science',
      members: 18,
      owner: 'Sarah Smith',
      isPrivate: true,
      lastActive: '2023-06-15T11:45:00',
      resources: 31,
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    }
  ];

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

  // Get unique subjects for filter dropdown
  const allSubjects = [...new Set([...myRooms, ...discoverRooms].map(room => room.subject))];

  const handleCreateRoom = () => {
    navigate('/dashboard/rooms/create');
  };

  const handleJoinRoom = (roomId) => {
    // In a real app, this would send a request to join the room
    console.log(`Requesting to join room ${roomId}`);
    alert(`Request to join room sent!`);
  };

  const handleEnterRoom = (roomId) => {
    navigate(`/dashboard/rooms/${roomId}`);
  };

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
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1">
                    {room.isPrivate ? (
                      <FaLock className="text-secondary-700" />
                    ) : (
                      <FaGlobe className="text-secondary-700" />
                    )}
                  </div>
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
                <FaUsers className="text-secondary-400 text-xl" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-1">No study rooms found</h3>
              <p className="text-secondary-500">Create your first study room to get started</p>
              <button
                onClick={handleCreateRoom}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Create Study Room
              </button>
            </div>
          )}
        </div>
      )}

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
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1">
                    {room.isPrivate ? (
                      <FaLock className="text-secondary-700" />
                    ) : (
                      <FaGlobe className="text-secondary-700" />
                    )}
                  </div>
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
                      className={`px-4 py-2 ${
                        room.isPrivate 
                          ? 'bg-secondary-100 text-secondary-800' 
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      } rounded-md transition-colors`}
                    >
                      {room.isPrivate ? 'Request to Join' : 'Join Room'}
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