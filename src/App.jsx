import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ChatContainer from './components/chat/ChatContainer';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public Pages
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Dashboard Pages
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import StudyGroups from './pages/dashboard/StudyGroups';
import StudyRooms from './pages/dashboard/StudyRooms';
import Resources from './pages/dashboard/Resources';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';
import StudyRoomDetail from './pages/dashboard/StudyRoomDetail';
import CreateStudyRoom from './pages/dashboard/CreateStudyRoom';
import StudyTimer from './pages/dashboard/StudyTimer';
import Flashcards from './pages/dashboard/Flashcards';
import Friends from './pages/dashboard/Friends';

// Study Room Pages
import StudyRoomResources from './pages/studyRoom/StudyRoomResources';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                  <ChatContainer />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardHome />} />
                <Route path="admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="groups" element={<StudyGroups />} />
                <Route path="rooms" element={<StudyRooms />} />
                <Route path="rooms/create" element={<CreateStudyRoom />} />
                <Route path="rooms/:roomId" element={<StudyRoomDetail />} />
                <Route path="groups/create" element={<CreateStudyRoom />} />
                <Route path="groups/:roomId" element={<StudyRoomDetail />} />
                <Route path="resources" element={<Resources />} />
                <Route path="friends" element={<Friends />} />
                <Route path="friends/requests" element={<Friends />} />
                <Route path="timer" element={<StudyTimer />} />
                <Route path="flashcards" element={<Flashcards />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* Study Room Routes */}
              <Route path="/study-rooms/:roomId/resources" element={
                <ProtectedRoute>
                  <StudyRoomResources />
                  <ChatContainer />
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ChatProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
