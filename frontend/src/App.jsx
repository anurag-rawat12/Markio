import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import HeroSection from './components/HeroSection'
import LoginSelection from './components/LoginSelection'
import RegisterSelection from './components/RegisterSelection'
import CollegeLogin from './components/CollegeLogin'
import CollegeRegister from './components/CollegeRegister'
import StudentTeacherLogin from './components/StudentTeacherLogin'
import StudentTeacherRegister from './components/StudentTeacherRegister'
import './App.css'
import OTPsection from './components/OTPsection'
import TeacherDashboardLatest from './components/TeacherDashboardLatest'
import StudentDashboard from './components/StudentDashboard'
import CollegeDashboard from './components/CollegeDashboard'

// Homepage component
const Homepage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        
        {/* Selection Pages */}
        <Route path="/login-selection" element={<LoginSelection />} />
        <Route path="/register-selection" element={<RegisterSelection />} />
        
        {/* College Routes */}
        <Route path="/college/login" element={<CollegeLogin />} />
        <Route path="/college/register" element={<CollegeRegister />} />
        
        {/* Student/Teacher Routes */}
        <Route path="/student-teacher/login" element={<StudentTeacherLogin />} />
        <Route path="/student-teacher/register" element={<StudentTeacherRegister />} />

        {/* Teacher Dashboard */}
        <Route path="/teacher/dashboard/:id" element={<TeacherDashboardLatest />} />
        {/* Student Dashboard */}
        <Route path="/student/dashboard/:id" element={<StudentDashboard />} />

        <Route path="/college/dashboard/:id" element={<CollegeDashboard />} />


        {/* Legacy Routes (redirect to selection pages) */}
        <Route path="/login" element={<LoginSelection />} />
        <Route path="/register" element={<RegisterSelection />} />

        <Route path="/verify-otp" element={<OTPsection />} />
      </Routes>
    </Router>
  )
}

export default App
