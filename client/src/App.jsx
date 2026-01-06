import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Public Pages
import LandingPageB2C from './pages/LandingPageB2C';
import LandingPageB2B from './pages/LandingPageB2B';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';

// Provider Pages
import ProviderDashboard from './pages/provider/Dashboard';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-brand-dark text-brand-cream font-sans selection:bg-brand-mint/30">
          <Navbar />
          <main className="pt-10">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPageB2C />} />
              <Route path="/business" element={<LandingPageB2B />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Patient Routes */}
              <Route
                path="/patient/*"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <PatientDashboard />
                  </PrivateRoute>
                }
              />

              {/* Doctor Routes */}
              <Route
                path="/doctor/*"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </PrivateRoute>
                }
              />

              {/* Provider Routes */}
              <Route
                path="/provider/*"
                element={
                  <PrivateRoute allowedRoles={['provider']}>
                    <ProviderDashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
