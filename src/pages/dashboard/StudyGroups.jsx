import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaSearch, FaPlus, FaFilter, FaEllipsisH, FaLock, FaGlobe } from 'react-icons/fa';

const StudyGroups = () => {
  const [activeTab, setActiveTab] = useState('myGroups');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for study groups/rooms
  const myGroups = [
    { 
      id: 1, 
      name: 'Advanced Calculus', 
      members: 12, 
      description: 'Study group for advanced calculus topics including multivariable calculus and differential equations.',
      nextSession: '2023-06-15T14:00:00',
      isPrivate: false,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    },
    { 
      id: 2, 
      name: 'Physics 101', 
      members: 8, 
      description: 'Introductory physics concepts, problem-solving, and lab preparation.',
      nextSession: '2023-06-16T10:30:00',
      isPrivate: true,
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    },
    { 
      id: 3, 
      name: 'Computer Science', 
      members: 15, 
      description: 'Programming, algorithms, and computer science theory discussions.',
      nextSession: '2023-06-17T15:00:00',
      isPrivate: false,
      image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    },
    { 
      id: 4, 
      name: 'Literature Circle', 
      members: 7, 
      description: 'Discussion of classic and contemporary literature, analysis and interpretation.',
      nextSession: '2023-06-18T18:00:00',
      isPrivate: false,
      image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    },
    { 
      id: 5, 
      name: 'Biology Study Group', 
      members: 10, 
      description: 'Covering cellular biology, genetics, ecology, and preparation for exams.',
      nextSession: '2023-06-19T13:00:00',
      isPrivate: true,
      image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    }
  ];
  
  const discoverGroups = [
    { 
      id: 6, 
      name: 'Organic Chemistry', 
      members: 14, 
      description: 'Deep dive into organic chemistry concepts, reactions, and lab techniques.',
      isPrivate: false,
      image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    },
    { 
      id: 7, 
      name: 'World History', 
      members: 9, 
      description: 'Exploring major historical events, civilizations, and their impact on the modern world.',
      isPrivate: false,
      image: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    },
    { 
      id: 8, 
      name: 'Machine Learning', 
      members: 18, 
      description: 'Study group focused on machine learning algorithms, neural networks, and practical applications.',
      isPrivate: false,
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
    }
  ];

  const filteredMyGroups = myGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDiscoverGroups = discoverGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Study Rooms</h1>
          <p className="text-secondary-600 mt-1">
            Join or create virtual study rooms to collaborate with peers
          </p>
        </div>
        <Link 
          to="/dashboard/groups/create" 
          className="mt-4 md:mt-0 btn-primary flex items-center justify-center"
        >
          <FaPlus className="mr-2" /> Create New Room
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="Search study rooms..."
              className="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-secondary flex items-center justify-center">
            <FaFilter className="mr-2" /> Filter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-secondary-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'myGroups'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
              onClick={() => setActiveTab('myGroups')}
            >
              My Study Rooms
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'discover'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
              onClick={() => setActiveTab('discover')}
            >
              Discover
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'myGroups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMyGroups.length > 0 ? (
            filteredMyGroups.map(group => (
              <div key={group.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-32 bg-secondary-200 relative">
                  {group.image && (
                    <img 
                      src={group.image} 
                      alt={group.name} 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    {group.isPrivate ? (
                      <span className="bg-secondary-800 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <FaLock className="mr-1" /> Private
                      </span>
                    ) : (
                      <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <FaGlobe className="mr-1" /> Public
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-secondary-900">{group.name}</h3>
                  <p className="text-secondary-500 text-sm mb-3">
                    <FaUsers className="inline mr-1" /> {group.members} members
                  </p>
                  <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                    {group.description}
                  </p>
                  {group.nextSession && (
                    <div className="mb-4 p-2 bg-primary-50 rounded text-sm">
                      <p className="text-primary-700">
                        Next session: {new Date(group.nextSession).toLocaleDateString()} at {new Date(group.nextSession).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                  <Link 
                    to={`/dashboard/groups/${group.id}`}
                    className="block w-full py-2 text-center bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Enter Room
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="text-secondary-400 text-xl" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-1">No study rooms found</h3>
              <p className="text-secondary-500">Try adjusting your search or create a new room</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiscoverGroups.length > 0 ? (
            filteredDiscoverGroups.map(group => (
              <div key={group.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-32 bg-secondary-200 relative">
                  {group.image && (
                    <img 
                      src={group.image} 
                      alt={group.name} 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    {group.isPrivate ? (
                      <span className="bg-secondary-800 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <FaLock className="mr-1" /> Private
                      </span>
                    ) : (
                      <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <FaGlobe className="mr-1" /> Public
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-secondary-900">{group.name}</h3>
                  <p className="text-secondary-500 text-sm mb-3">
                    <FaUsers className="inline mr-1" /> {group.members} members
                  </p>
                  <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                    {group.description}
                  </p>
                  <button 
                    className="block w-full py-2 text-center bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Join Room
                  </button>
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

export default StudyGroups; 