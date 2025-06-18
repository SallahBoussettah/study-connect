import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUsers, FaCalendarAlt, FaFileAlt, FaComments, FaTasks, FaQuestionCircle } from 'react-icons/fa';
import { studyRoomService } from '../../services/api';
import { toast } from 'react-toastify';

const StudyRoomLayout = ({ children, roomId, activeTab }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadRoomData = async () => {
      try {
        const data = await studyRoomService.getStudyRoomById(roomId);
        setRoom(data);
      } catch (error) {
        console.error('Error loading study room:', error);
        toast.error('Could not load study room details');
        navigate('/dashboard/rooms');
      } finally {
        setLoading(false);
      }
    };

    loadRoomData();
  }, [roomId, navigate]);

  // Define navigation tabs
  const navigationTabs = [
    { id: 'overview', label: 'Overview', icon: <FaUsers />, path: `/dashboard/rooms/${roomId}` },
    { id: 'sessions', label: 'Sessions', icon: <FaCalendarAlt />, path: `/study-rooms/${roomId}/sessions` },
    { id: 'resources', label: 'Resources', icon: <FaFileAlt />, path: `/study-rooms/${roomId}/resources` },
    { id: 'discussions', label: 'Discussions', icon: <FaComments />, path: `/study-rooms/${roomId}/discussions` },
    { id: 'tasks', label: 'Tasks', icon: <FaTasks />, path: `/study-rooms/${roomId}/tasks` },
    { id: 'questions', label: 'Q&A', icon: <FaQuestionCircle />, path: `/study-rooms/${roomId}/questions` },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Room header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="py-4">
            {loading ? (
              <div className="h-8 w-48 bg-secondary-100 rounded animate-pulse"></div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900">{room?.name}</h1>
                    <p className="text-sm text-secondary-600">{room?.subject}</p>
                  </div>
                  {room?.isOwner && (
                    <Link
                      to={`/study-rooms/${roomId}/settings`}
                      className="px-4 py-2 text-sm bg-secondary-100 text-secondary-700 rounded-md hover:bg-secondary-200 transition-colors"
                    >
                      Room Settings
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-secondary-200">
            <nav className={`flex ${isMobile ? 'overflow-x-auto' : ''} -mb-px`}>
              {navigationTabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`whitespace-nowrap py-3 px-4 flex items-center space-x-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-600 hover:text-secondary-800 hover:border-secondary-300'
                  } transition-colors`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="py-6">
        {children}
      </div>
    </div>
  );
};

export default StudyRoomLayout; 