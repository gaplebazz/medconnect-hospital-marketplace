import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RoleRoute } from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { ForgotPassword, ResetPassword } from './pages/PasswordReset';
import HospitalListing from './pages/HospitalListing';
import ClinicListing from './pages/ClinicListing';
import DoctorListing from './pages/DoctorListing';
import HospitalDetail from './pages/HospitalDetail';
import ClinicDetail from './pages/ClinicDetail';
import DoctorDetail from './pages/DoctorDetail';
import PatientDashboard from './pages/PatientDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import ClinicDashboard from './pages/ClinicDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <main style={{ minHeight: '70vh' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route path="/hospitals" element={<HospitalListing />} />
              <Route path="/hospitals/:id" element={<HospitalDetail />} />
              <Route path="/clinics" element={<ClinicListing />} />
              <Route path="/clinics/:id" element={<ClinicDetail />} />
              <Route path="/doctors" element={<DoctorListing />} />
              <Route path="/doctors/:id" element={<DoctorDetail />} />

              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              <Route
                path="/dashboard/patient"
                element={<RoleRoute roles={['patient']}><PatientDashboard /></RoleRoute>}
              />
              <Route
                path="/dashboard/hospital"
                element={<RoleRoute roles={['hospital']}><HospitalDashboard /></RoleRoute>}
              />
              <Route
                path="/dashboard/clinic"
                element={<RoleRoute roles={['clinic']}><ClinicDashboard /></RoleRoute>}
              />
              <Route
                path="/dashboard/doctor"
                element={<RoleRoute roles={['doctor']}><DoctorDashboard /></RoleRoute>}
              />
              <Route
                path="/dashboard/admin"
                element={<RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>}
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
