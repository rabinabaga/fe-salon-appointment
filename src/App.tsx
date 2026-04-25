import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import VerifyEmailPage from '@/pages/VerifyEmail';
import DashboardPage from './pages/Dashboard';
import NewAppointmentPage from './pages/NewAppointment';
import ServicesPage from './pages/Services';
import AppointmentsPage from './pages/Appointments';
import { LogsPage, SettingsPage, TemplatesPage } from './pages/StaffPages';
import BulkUploadPage from './pages/BulkUpload';
import BulkJobDetailPage from './pages/BulkJobDetail';


function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function StaffRoute({ children }: { children: React.ReactNode }) {
  const { isStaff } = useAuth();
  return isStaff ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                {/* Authenticated */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/appointments" element={<PrivateRoute><AppointmentsPage /></PrivateRoute>} />
      <Route path="/bulk-jobs/upload" element={<PrivateRoute><BulkUploadPage /></PrivateRoute>} />
        <Route path="/bulk-jobs/:id" element={<PrivateRoute><BulkJobDetailPage /></PrivateRoute>} />
       
                <Route path="/templates" element={<PrivateRoute><StaffRoute><TemplatesPage /></StaffRoute></PrivateRoute>} />
        <Route path="/settigs" element={<PrivateRoute><StaffRoute><SettingsPage /></StaffRoute></PrivateRoute>} />
   <Route path="/logs" element={<PrivateRoute><StaffRoute><LogsPage /></StaffRoute></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><StaffRoute><SettingsPage /></StaffRoute></PrivateRoute>} />
  
        <Route path="/appointments/new" element={<PrivateRoute><NewAppointmentPage /></PrivateRoute>} />
        <Route path="/services" element={<PrivateRoute><ServicesPage /></PrivateRoute>} />

    
      </Routes>
    </AuthProvider>
  );
}