import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Consultations from './pages/Consultations';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

import ExpertAvailability from './pages/ExpertAvailability';
import BookAppointment from './pages/BookAppointment';
import VideoCall from './pages/VideoCall';
import ExpertsList from './pages/ExpertsList';
import MyAppointments from './pages/MyAppointments';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard/chat" replace />} />
        <Route path="chat" element={<Chat />} />
        <Route path="consultations" element={<Consultations />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<Admin />} />
        <Route path="expert/availability" element={<ExpertAvailability />} />
        <Route path="book/:expertId" element={<BookAppointment />} />
        <Route path="room/:roomId" element={<VideoCall />} />
        <Route path="experts" element={<ExpertsList />} />
        <Route path="appointments" element={<MyAppointments />} />
        {/* Add more dashboard routes here */}
      </Route>
    </Routes>
  );
}

export default App;
