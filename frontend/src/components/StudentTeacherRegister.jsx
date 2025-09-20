import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Users, GraduationCap, UserCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StudentTeacherRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    fullName: '',
    email: '',
    studentId: '',
    institutionCode: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add registration logic here
    if (!formData.role) {
      alert('Please select Student or Teacher.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Registration attempt:', formData);
    // Navigate to OTP section with context data
    navigate('/verify-otp', {
      state: {
        context: formData.role, // 'student' or 'teacher'
        email: formData.email,
        studentId: formData.studentId || undefined,
        institutionCode: formData.institutionCode,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Video Background */}
      {/* <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video> */}
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      
      {/* Subtle floating particles */}
      <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-white/50 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white/60 rounded-full animate-pulse delay-1500"></div>
      </div>

      <div className="relative w-full max-w-md z-30">
        {/* Back Button */}
        <Link 
          to="/register-selection" 
          className="inline-flex items-center mb-8 text-white/90 hover:text-white transition-colors duration-200 group bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 hover:bg-black/30"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Registration Options
        </Link>

        {/* Register Card with Enhanced Glassmorphism */}
        <div className="bg-white/10 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/20 p-10 relative overflow-hidden">
          {/* Glassmorphism enhancement layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-white/5 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-emerald-500/10 via-transparent to-teal-500/10 rounded-3xl"></div>
         
          
          
          {/* Header */}
          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-all duration-300">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
              Join as Student/Teacher
            </h1>
           
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-4">
                I am a *
              </label>
              <div className="grid grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'student'})}
                  className={`group relative p-6 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    formData.role === 'student' 
                      ? 'border-emerald-400/60 bg-white/20 text-white shadow-lg shadow-emerald-400/30 backdrop-blur-sm' 
                      : 'border-white/30 hover:border-emerald-400/50 hover:bg-white/15 text-white/80 hover:text-white backdrop-blur-sm'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      formData.role === 'student'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/20 text-white/70 group-hover:bg-emerald-500/80 group-hover:text-white backdrop-blur-sm'
                    }`}>
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-lg">Student</span>
                    <span className="text-xs text-center opacity-75">Join classes and track attendance</span>
                  </div>
                  {formData.role === 'student' && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'teacher'})}
                  className={`group relative p-6 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    formData.role === 'teacher' 
                      ? 'border-emerald-400/60 bg-white/20 text-white shadow-lg shadow-emerald-400/30 backdrop-blur-sm' 
                      : 'border-white/30 hover:border-emerald-400/50 hover:bg-white/15 text-white/80 hover:text-white backdrop-blur-sm'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      formData.role === 'teacher'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/20 text-white/70 group-hover:bg-emerald-500/80 group-hover:text-white backdrop-blur-sm'
                    }`}>
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-lg">Teacher</span>
                    <span className="text-xs text-center opacity-75">Manage classes and students</span>
                  </div>
                  {formData.role === 'teacher' && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-white/90 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Student ID Field (only for students) */}
            {formData.role === 'student' && (
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-white/90 mb-2">
                  Student Enrollment Number *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                    placeholder="Enter your enrollment number "
                    required={formData.role === 'student'}
                  />
                </div>
              </div>
            )}

            {/* Institution Code Field */}
            <div>
              <label htmlFor="institutionCode" className="block text-sm font-medium text-white/90 mb-2">
                Institution Code *
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  id="institutionCode"
                  name="institutionCode"
                  value={formData.institutionCode}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                  placeholder="Enter your institution's code"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

           

            {/* Create Account Button */}
            <button
              type="submit"
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white py-3 px-4 rounded-lg font-medium hover:bg-white/30 hover:border-white/40 focus:ring-2 focus:ring-white/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Account
            </button>
          </form>

          
         
          {/* Sign In Link */}
          <div className="text-center mt-6">
            <span className="text-white/80">Already have an account? </span>
            <Link to="/student-teacher/login" className="text-emerald-300 hover:text-emerald-200 font-medium transition-colors duration-200">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTeacherRegister;
