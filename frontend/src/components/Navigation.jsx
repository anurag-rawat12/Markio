import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 mix-blend-difference">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex justify-between items-center">
          {/* Logo & Navigation - Left Side */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link
              to="/"
              className="text-white text-3xl font-bold tracking-tight hover:scale-105 transition-transform duration-200 cursor-pointer"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                fontWeight: '800',
              }}
            >
              Markio
            </Link>

            {/* Navigation Menu - Close to Logo */}
            <div className="hidden md:flex items-center space-x-6 mix-blend-difference">
              {['Technology', 'About', 'Developers', 'GitHub'].map((item) => (
                <div key={item} className="relative group">
                  <button className="flex items-center space-x-1 text-white font-semibold hover:text-blue-400 transition-all duration-300 text-base relative overflow-hidden px-3 py-2 rounded-lg hover:scale-105 hover:shadow-sm">
                    <span className="relative z-10">{item}</span>
                    <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180 relative z-10" />
                  </button>
                </div>
              ))}
              
            </div>
          </div>

          {/* Actions - Right Side */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login-selection"
              className="text-white font-semibold hover:text-blue-400 transition-all duration-300 flex items-center text-base relative overflow-hidden px-3 py-2 rounded-lg hover:scale-105 hover:shadow-sm group"
            >
              <span className="relative z-10">Sign in</span>
              <svg
                className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/register-selection"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center text-base group relative overflow-hidden isolate mix-blend-normal"
            >
              <span className="relative z-10">Register</span>
              <svg
                className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1 relative z-10 mix-blend-normal"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;