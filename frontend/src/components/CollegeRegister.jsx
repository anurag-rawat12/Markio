import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Building2, MapPin, Phone, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CollegeRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    institutionName: 'BPIT',
    institutionType: 'College',
    adminName: 'anurag',
    adminEmail: 'anuragrawat2825@gmail.com',
    phoneNumber: '8860732533',
    address: 'rohini',
    city: 'new delhi',
    state: 'DEL',
    zipCode: '110085',
    password: '12345678'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const createCollege = async (e) => {
    e.preventDefault();

    try {
      console.log('Submitting college data:', formData);

      const response = await fetch("http://localhost:8000/api/college-auth/register", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData
        })
      });


      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      

      localStorage.setItem('signupInfo', JSON.stringify({
        email: formData.adminEmail,
        role: 'COLLEGE',
        userData: formData,
        context: 'college'
      }));

      navigate('/verify-otp');

    } catch (error) {
      console.error('Error creating college:', error);
      alert(error.message);
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

      <div className="relative w-full max-w-2xl z-30">
        {/* Back Button */}
        <Link
          to="/register-selection"
          className="inline-flex items-center mb-8 text-white/90 hover:text-white transition-colors duration-200 group bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 hover:bg-black/30"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Registration Options
        </Link>

        {/* Register Card with Enhanced Glassmorphism */}
        <div className="bg-white/10 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          {/* Glassmorphism enhancement layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-white/5 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/10 via-transparent to-purple-500/10 rounded-3xl"></div>

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Register Institution</h1>
            <p className="text-white/80">Create your institution's markio account</p>
          </div>

          {/* Register Form */}
          <form onSubmit={createCollege} className="space-y-6 relative z-10">
            {/* Institution Information */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Institution Name */}
              <div className="md:col-span-2">
                <label htmlFor="institutionName" className="block text-sm font-medium text-white/90 mb-2">
                  Institution Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    id="institutionName"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                    placeholder="University of California, Berkeley"
                    required
                  />
                </div>
              </div>

              {/* Institution Type */}
              <div>
                <label htmlFor="institutionType" className="block text-sm font-medium text-white/90 mb-2">
                  Institution Type *
                </label>
                <select
                  id="institutionType"
                  name="institutionType"
                  value={formData.institutionType}
                  onChange={handleChange}
                  className="w-full pl-4 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="University">University</option>
                  <option value="College">College</option>
                  <option value="high-school">High School</option>
                  <option value="middle-school">Middle School</option>
                  <option value="elementary">Elementary School</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-white/90 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Administrator Information */}
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Administrator Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Admin Name */}
                <div>
                  <label htmlFor="adminName" className="block text-sm font-medium text-white/90 mb-2">
                    Administrator Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      id="adminName"
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                      placeholder="John Smith"
                      required
                    />
                  </div>
                </div>

                {/* Admin Email */}
                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-white/90 mb-2">
                    Administrator Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="email"
                      id="adminEmail"
                      name="adminEmail"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                      placeholder="admin@university.edu"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Institution Address</h3>
              <div className="space-y-4">
                {/* Street Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-white/90 mb-2">
                    Street Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                      placeholder="123 University Ave"
                      required
                    />
                  </div>
                </div>

                {/* City, State, ZIP */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-white/90 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                      placeholder="Berkeley"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-white/90 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                      placeholder="CA"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-white/90 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                      placeholder="94720"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Password */}
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


              </div>
            </div>


            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white py-3 px-4 rounded-lg font-medium hover:bg-white/30 hover:border-white/40 focus:ring-2 focus:ring-white/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Register Institution
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <span className="text-white/80">Already have an account? </span>
            <Link to="/college/login" className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-200">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CollegeRegister;