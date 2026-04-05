import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { StaffAuthProvider, useStaffAuth } from './context/StaffAuthContext';
import { HomePage } from './pages/HomePage';
import { ReportPage } from './pages/ReportPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { IncidentPage } from './pages/admin/IncidentPage';
import { LoginPage } from './pages/admin/LoginPage';
import { ForgotPasswordPage } from './pages/admin/ForgotPasswordPage';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStaffAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <StaffAuthProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/report/:id" element={<ReportDetailPage />} />
                <Route path="/my-reports" element={<MyReportsPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Admin routes */}
                <Route path="/admin/login" element={<LoginPage />} />
                <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/admin" element={<ProtectedAdminRoute><DashboardPage /></ProtectedAdminRoute>} />
                <Route path="/admin/incident/:id" element={<ProtectedAdminRoute><IncidentPage /></ProtectedAdminRoute>} />
              </Routes>
            </div>
          </StaffAuthProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
