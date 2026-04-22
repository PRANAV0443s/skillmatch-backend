import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import Navbar           from './components/Navbar'
import ProtectedRoute   from './components/ProtectedRoute'

import Landing          from './pages/Landing'
import Login            from './pages/Login'
import Register         from './pages/Register'
import VerifyEmail      from './pages/VerifyEmail'
import StudentDashboard from './pages/StudentDashboard'
import Jobs             from './pages/Jobs'
import JobDetail        from './pages/JobDetail'
import MyApplications   from './pages/MyApplications'
import RecruiterDashboard from './pages/RecruiterDashboard'
import PostJob          from './pages/PostJob'
import AdminDashboard   from './pages/AdminDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/"             element={<Landing />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Student */}
          <Route path="/dashboard"        element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/jobs"             element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/jobs/:id"         element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute role="STUDENT"><MyApplications /></ProtectedRoute>} />

          {/* Recruiter */}
          <Route path="/recruiter"          element={<ProtectedRoute role="RECRUITER"><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/recruiter/post-job" element={<ProtectedRoute role="RECRUITER"><PostJob /></ProtectedRoute>} />
          <Route path="/recruiter/edit-job/:id" element={<ProtectedRoute role="RECRUITER"><PostJob /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
