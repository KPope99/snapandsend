import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { Navbar } from './components/common/Navbar';
import { HomePage } from './pages/HomePage';
import { ReportPage } from './pages/ReportPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/report/:id" element={<ReportDetailPage />} />
              <Route path="/my-reports" element={<MyReportsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
            <Navbar />
          </div>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
