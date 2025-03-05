import React, { useState } from 'react';
import { FaBook, FaFile, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaLink, FaSearch, FaUpload, FaFilter, FaEllipsisH } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Resources = () => {
  const [activeTab, setActiveTab] = useState('myResources');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for resources
  const myResources = [
    { 
      id: 1, 
      title: 'Calculus Cheat Sheet', 
      type: 'pdf', 
      size: '2.4 MB',
      uploadedBy: 'You',
      uploadDate: '2023-06-10',
      group: 'Advanced Calculus',
      downloads: 15
    },
    { 
      id: 2, 
      title: 'Physics Formulas', 
      type: 'doc', 
      size: '1.8 MB',
      uploadedBy: 'You',
      uploadDate: '2023-06-09',
      group: 'Physics 101',
      downloads: 8
    },
    { 
      id: 3, 
      title: 'Programming Basics', 
      type: 'link', 
      url: 'https://example.com/programming-basics',
      uploadedBy: 'You',
      uploadDate: '2023-06-08',
      group: 'Computer Science',
      clicks: 23
    },
    { 
      id: 4, 
      title: 'Literature Analysis Notes', 
      type: 'txt', 
      size: '0.5 MB',
      uploadedBy: 'You',
      uploadDate: '2023-06-07',
      group: 'Literature Circle',
      downloads: 6
    },
    { 
      id: 5, 
      title: 'Biology Diagrams', 
      type: 'ppt', 
      size: '5.2 MB',
      uploadedBy: 'You',
      uploadDate: '2023-06-06',
      group: 'Biology Study Group',
      downloads: 12
    }
  ];
  
  const sharedResources = [
    { 
      id: 6, 
      title: 'Advanced Calculus Problems', 
      type: 'pdf', 
      size: '3.1 MB',
      uploadedBy: 'Alex Johnson',
      uploadDate: '2023-06-05',
      group: 'Advanced Calculus',
      downloads: 18
    },
    { 
      id: 7, 
      title: 'Physics Lab Report Template', 
      type: 'doc', 
      size: '1.2 MB',
      uploadedBy: 'Maria Garcia',
      uploadDate: '2023-06-04',
      group: 'Physics 101',
      downloads: 14
    },
    { 
      id: 8, 
      title: 'Coding Resources', 
      type: 'link', 
      url: 'https://example.com/coding-resources',
      uploadedBy: 'John Smith',
      uploadDate: '2023-06-03',
      group: 'Computer Science',
      clicks: 31
    },
    { 
      id: 9, 
      title: 'Shakespeare Analysis', 
      type: 'pdf', 
      size: '4.5 MB',
      uploadedBy: 'Emma Wilson',
      uploadDate: '2023-06-02',
      group: 'Literature Circle',
      downloads: 9
    }
  ];

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf':
        return <FaFilePdf className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="text-orange-500" />;
      case 'txt':
        return <FaFileAlt className="text-secondary-500" />;
      case 'link':
        return <FaLink className="text-purple-500" />;
      default:
        return <FaFile className="text-secondary-500" />;
    }
  };

  const filteredMyResources = myResources.filter(resource => 
    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSharedResources = sharedResources.filter(resource => 
    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Group
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
                          <div className="text-sm text-secondary-500">{resource.type.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{resource.group}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{resource.uploadedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">{resource.uploadDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">{resource.size || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">Download</button>
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
                          <div className="text-sm text-secondary-500">{resource.type.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{resource.group}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{resource.uploadedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">{resource.uploadDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">{resource.size || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">Download</button>
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
        </div>
      </div>
    </div>
  );
};

export default Resources; 