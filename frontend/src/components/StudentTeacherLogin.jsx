import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Users, UserCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StudentTeacherLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    role: 'TEACHER',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Choose correct API based on role
      let url =
        formData.role === "TEACHER"
          ? "http://localhost:8000/api/teacher-auth/login"
          : "http://localhost:8000/api/student-auth/login";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // ✅ Save token
      localStorage.setItem("token", data.token);

      // ✅ Decode token to get userId
      const token = data.token;
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));
      const Id = payload.id;

      if (formData.role === "TEACHER" && Id) {
        localStorage.setItem(
          "signupInfo",
          JSON.stringify({
            email: formData.email,
            role: "TEACHER",
            userData: formData,
            context: "teacher",
          })
        );
        navigate(`/teacher/dashboard/${Id}`);
      } else if (formData.role === "STUDENT" && Id) {
        localStorage.setItem(
          "signupInfo",
          JSON.stringify({
            email: formData.email,
            role: "STUDENT",
            userData: formData,
            context: "student",
          })
        );
        navigate(`/student/dashboard/${Id}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Login failed");
    }
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
          to="/login-selection"
          className="inline-flex items-center mb-8 text-white/90 hover:text-white transition-colors duration-200 group bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 hover:bg-black/30"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Login Options
        </Link>

        {/* Login Card with Enhanced Glassmorphism */}
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
              Student/Teacher Portal
            </h1>
            {/* <p className="text-white/80 text-lg">Access your attendance records and academic tools</p> */}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                  className={`group relative p-4 border-2 rounded-2xl transition-all ${formData.role === 'STUDENT' ? 'border-emerald-400/60 bg-white/20 text-white' : 'border-white/30 text-white/80 hover:text-white hover:bg-white/10'}`}
                >
                  <Users className="w-5 h-5 mb-2" /> Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'TEACHER' })}
                  className={`group relative p-4 border-2 rounded-2xl transition-all ${formData.role === 'TEACHER' ? 'border-emerald-400/60 bg-white/20 text-white' : 'border-white/30 text-white/80 hover:text-white hover:bg-white/10'}`}
                >
                  <UserCheck className="w-5 h-5 mb-2" /> Teacher
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email Address
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

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Password
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
                  placeholder="Enter your password"
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



            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white py-3 px-4 rounded-lg font-medium hover:bg-white/30 hover:border-white/40 focus:ring-2 focus:ring-white/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>


          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <span className="text-white/80">Don't have an account? </span>
            <Link to="/student-teacher/register" className="text-emerald-300 hover:text-emerald-200 font-medium transition-colors duration-200">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTeacherLogin;
