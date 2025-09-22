import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Building2, Sparkles, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CollegeLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    institutionEmail: '',
    password: ''
  });

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:8000/api/college-auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);


    localStorage.setItem('token', data.token);
    const token = localStorage.getItem('token');
    let Id = null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    Id = payload.id;
    console.log("User ID:", Id);

    localStorage.setItem('signupInfo', JSON.stringify({
      email: formData.adminEmail,
      role: 'COLLEGE',
      userData: formData,
      context: 'college'
    }));

    navigate(`/college/dashboard/${Id}`)
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Subtle floating particles for enhanced effect */}
      <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-white/50 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white/60 rounded-full animate-pulse delay-1500"></div>

        {/* Floating academic icons */}
        <div className="absolute top-1/3 left-1/5 animate-pulse delay-500">
          <Building2 className="w-6 h-6 text-white/20" />
        </div>
        <div className="absolute top-2/3 right-1/4 animate-pulse delay-1200">
          <Shield className="w-4 h-4 text-white/20" />
        </div>
        <div className="absolute top-1/5 right-1/3 animate-pulse delay-1800">
          <Sparkles className="w-4 h-4 text-white/20" />
        </div>
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
          <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/10 via-transparent to-purple-500/10 rounded-3xl"></div>

          {/* Header with Institution Icon */}
          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-all duration-300">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
              Institution Portal
            </h1>
            {/* <p className="text-white/80 text-lg">Secure access to your institution's dashboard</p> */}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Institution Email Field */}
            <div>
              <label htmlFor="institutionEmail" className="block text-sm font-medium text-white/90 mb-2">
                Institution Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="email"
                  id="institutionEmail"
                  name="institutionEmail"
                  value={formData.institutionEmail}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                  placeholder="admin@university.edu"
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
              Sign In to Institution
            </button>
          </form>




          {/* Register Link */}
          <div className="text-center mt-6">
            <span className="text-white/80">Don't have an account? </span>
            <Link to="/college/register" className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-200">
              Register your institution
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeLogin;