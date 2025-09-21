import React from 'react';
import { ArrowLeft, Building2, Users, GraduationCap, UserCheck, Sparkles, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginSelection = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Beautiful Background Image */}
      {/* Video Background (from HeroSection) */}
      {/* <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        key="homepage-video"
      >
        <source src="/homepage-bg-new.mp4" type="video/mp4" />
      </video> */}
      
      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Additional animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/5 left-1/5 animate-pulse delay-300">
          <Sparkles className="w-4 h-4 text-white/40" />
        </div>
        <div className="absolute top-3/5 right-1/5 animate-pulse delay-1000">
          <Sparkles className="w-3 h-3 text-white/30" />
        </div>
        <div className="absolute bottom-1/5 left-2/5 animate-pulse delay-1500">
          <Sparkles className="w-5 h-5 text-white/50" />
        </div>
      </div>

      <div className="relative z-20 w-full max-w-4xl">
        {/* Enhanced Back Button with Glassmorphism Card */}
        <Link 
          to="/" 
          className="group inline-flex items-center mb-8 bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:bg-white/20 hover:border-white/30 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
        >
          {/* Glass card background */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <ArrowLeft className="relative z-10 w-5 h-5 mr-3 text-white/80 group-hover:text-white group-hover:-translate-x-1 transition-all duration-300" />
          <span className="relative z-10 text-white/80 group-hover:text-white font-medium transition-colors duration-300">Back to Home</span>
        </Link>

        {/* Enhanced Main Glassmorphism Card */}
        <div className="bg-white/5 backdrop-blur-3xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 p-10 relative overflow-hidden">
          {/* Multiple layered glassmorphism backgrounds */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/8 to-white/3 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/10 via-blue-500/5 to-pink-500/8 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-3xl"></div>
          
          {/* Simple Category Text */}
          <div className="text-center mb-8 relative z-10">
            <h1 className="text-3xl font-bold text-white mb-6 intro-reveal intro-delay-0">
              Select your category
            </h1>
          </div>

          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            {/* College/Institution Login */}
            <Link 
              to="/college/login"
              className="group bg-white hover:bg-white/10 hover:backdrop-blur-xl hover:border hover:border-white/20 rounded-xl p-8 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 h-full flex flex-col relative overflow-hidden"
            >
              {/* Glassmorphism hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl backdrop-blur-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
              <div className="text-center flex flex-col h-full justify-between relative z-10">
                <div>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-blue-500/50">
                    <Building2 className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-4 transition-colors duration-300">College/Institution</h3>
                  <p className="text-slate-600 group-hover:text-white/90 mb-8 leading-relaxed flex-grow transition-colors duration-300">
                    Sign in as an educational institution to manage attendance systems and oversee student-teacher activities.
                  </p>
                </div>
                <div className="inline-flex items-center justify-center px-6 py-3 bg-blue-100 group-hover:bg-white/20 group-hover:backdrop-blur-md group-hover:border group-hover:border-white/30 rounded-full text-blue-600 group-hover:text-white font-semibold transition-all duration-300 mt-auto group-hover:scale-105 intro-pop intro-delay-2">
                  <span>Continue as Institution</span>
                  <ArrowLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            {/* Student/Teacher Login */}
            <Link 
              to="/student-teacher/login"
              className="group bg-white hover:bg-white/10 hover:backdrop-blur-xl hover:border hover:border-white/20 rounded-xl p-8 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 h-full flex flex-col relative overflow-hidden"
            >
              {/* Glassmorphism hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl backdrop-blur-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
              <div className="text-center flex flex-col h-full justify-between relative z-10">
                <div>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-emerald-500/50">
                    <Users className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-4 transition-colors duration-300">Student/Teacher</h3>
                  <p className="text-slate-600 group-hover:text-white/90 mb-8 leading-relaxed flex-grow transition-colors duration-300">
                    Sign in as a student or teacher to access your attendance records and manage your academic activities.
                  </p>
                </div>
                <div className="inline-flex items-center justify-center px-6 py-3 bg-emerald-100 group-hover:bg-white/20 group-hover:backdrop-blur-md group-hover:border group-hover:border-white/30 rounded-full text-emerald-600 group-hover:text-white font-semibold transition-all duration-300 mt-auto group-hover:scale-105 intro-pop intro-delay-3">
                  <span>Continue as Student/Teacher</span>
                  <ArrowLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          </div>

          {/* Register Link */}
          <div className="text-center mt-8 pt-6 border-t border-white/20 relative z-10">
            <span className="text-white/80 text-lg">Don't have an account? </span>
            <Link 
              to="/register-selection" 
              className="group inline-flex items-center text-white hover:text-blue-200 font-semibold text-lg transition-all duration-300 hover:scale-105 ml-1"
            >
              <span>Create one here</span>
              <ArrowLeft className="w-4 h-4 ml-1 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;