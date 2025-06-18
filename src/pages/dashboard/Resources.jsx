import React, { useState, useEffect } from 'react';
import { FaBook, FaFile, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaLink, FaSearch, FaUpload, FaFilter, FaEllipsisH, FaSpinner, FaImage } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resourceService, studyRoomService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const Resources = () => {
  const [activeTab, setActiveTab] = useState('myResources');
  const [searchQuery, setSearchQuery] = useState('');
  const [myResources, setMyResources] = useState([]);
  const [sharedResources, setSharedResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState({});
  const { currentUser } = useAuth();
  
  // Fetch resources data
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        // First fetch user's study rooms
        const roomsData = await studyRoomService.getStudyRooms();
        
        // Create a room lookup object
        const roomLookup = {};
        [...roomsData.userRooms, ...roomsData.discoverRooms].forEach(room => {
          roomLookup[room.id] = room;
        });
        setRooms(roomLookup);
        
        // Fetch resources for each study room the user is a member of
        const userRoomIds = roomsData.userRooms.map(room => room.id);
        
        let allResources = [];
        
        for (const roomId of userRoomIds) {
          try {
            const roomResources = await resourceService.getStudyRoomResources(roomId);
            roomResources.forEach(resource => {
              resource.roomName = roomLookup[roomId]?.name || 'Unknown Room';
            });
            allResources = [...allResources, ...roomResources];
          } catch (err) {
            console.error(`Error fetching resources for room ${roomId}:`, err);
          }
        }
        
        // Split resources into "my resources" and "shared resources"
        const myRes = allResources.filter(resource => 
          resource.uploader?.id === currentUser?.id
        );
        
        const sharedRes = allResources.filter(resource => 
          resource.uploader?.id !== currentUser?.id
        );
        
        setMyResources(myRes);
        setSharedResources(sharedRes);
      } catch (error) {
        console.error('Failed to load resources:', error);
        toast.error('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, [currentUser?.id]);

  const getFileIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'pdf':
        return <FaFilePdf className="text-red-500" />;
      case 'document':
        return <FaFileWord className="text-blue-500" />;
      case 'image':
        return <FaImage className="text-blue-500" />;
      case 'spreadsheet':
        return <FaFileExcel className="text-green-500" />;
      case 'presentation':
        return <FaFilePowerpoint className="text-orange-500" />;
      case 'text':
      case 'txt':
        return <FaFileAlt className="text-secondary-500" />;
      case 'link':
        return <FaLink className="text-purple-500" />;
      default:
        return <FaFile className="text-secondary-500" />;
    }
  };

  const filteredMyResources = myResources.filter(resource => 
    resource.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSharedResources = sharedResources.filter(resource => 
    resource.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const formatFileSize = (sizeInBytes) => {
    if (!sizeInBytes) return '-';
    
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  const handleDownload = (resource) => {
    if (resource.downloadUrl) {
      window.open(resourceService.getDownloadUrl(resource.id), '_blank');
    } else if (resource.url) {
      window.open(resource.url, '_blank');
    } else {
      toast.error('No download link available for this resource');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Resources</h1>
          <p className="text-secondary-600 mt-1">
            Manage and share study materials with your groups
          </p>
        </div>
        <Link 
          to="/dashboard/resources/upload" 
          className="mt-4 md:mt-0 btn-primary flex items-center justify-center"
        >
          <FaUpload className="mr-2" /> Upload Resource
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
              placeholder="Search resources..."
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
      <div className="mb-6 border-b border-secondary-200">
        <div className="flex space-x-8">
          <button
            className={`py-4 px-1 font-medium text-sm focus:outline-none ${
              activeTab === 'myResources'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
            onClick={() => setActiveTab('myResources')}
          >
            My Resources
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm focus:outline-none ${
              activeTab === 'shared'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
            onClick={() => setActiveTab('shared')}
          >
            Shared With Me
          </button>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-primary-600 mr-3" />
              <span className="text-secondary-600">Loading resources...</span>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Study Room
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {activeTab === 'myResources' && filteredMyResources.length > 0 ? (
                  filteredMyResources.map(resource => (
                    <tr key={resource.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                            {getFileIcon(resource.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900">{resource.title}</div>
                            <div className="text-sm text-secondary-500">{resource.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">{resource.roomName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">
                          {resource.uploader ? `${resource.uploader.firstName} ${resource.uploader.lastName}` : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">{formatDate(resource.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">{formatFileSize(resource.fileSize)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleDownload(resource)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          {resource.url && !resource.downloadUrl ? 'Open Link' : 'Download'}
                        </button>
                        <button className="text-secondary-500 hover:text-secondary-700">
                          <FaEllipsisH />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : activeTab === 'shared' && filteredSharedResources.length > 0 ? (
                  filteredSharedResources.map(resource => (
                    <tr key={resource.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                            {getFileIcon(resource.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900">{resource.title}</div>
                            <div className="text-sm text-secondary-500">{resource.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">{resource.roomName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">
                          {resource.uploader ? `${resource.uploader.firstName} ${resource.uploader.lastName}` : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">{formatDate(resource.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">{formatFileSize(resource.fileSize)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleDownload(resource)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          {resource.url && !resource.downloadUrl ? 'Open Link' : 'Download'}
                        </button>
                        <button className="text-secondary-500 hover:text-secondary-700">
                          <FaEllipsisH />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                        <FaBook className="text-secondary-400 text-xl" />
                      </div>
                      <h3 className="text-lg font-medium text-secondary-900 mb-1">No resources found</h3>
                      <p className="text-secondary-500">
                        {activeTab === 'myResources' 
                          ? 'Upload your first resource to get started' 
                          : 'No resources have been shared with you yet'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resources; 