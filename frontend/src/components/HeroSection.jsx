import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const userId = payload.id;
      const role = payload.role;

      if(role=="COLLEGE"){
        navigate(`/College/dashboard/${userId}`)
      }
      else if(role=="STUDENT"){
        navigate(`/student/dashboard/${userId}`)
      }
      else if(role=="TEACHER"){
        navigate(`/teacher/dashboard/${userId}`)
      } else{
        navigate("/error")
      }
    }
  }
  )

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
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
      <div className="absolute inset-0 bg-black/20 z-5"></div>

      {/* Diagonal White Background - exactly like Stripe */}
      <div
        className="absolute inset-0 bg-white z-10"
        style={{
          clipPath: 'polygon(0 65%, 100% 35%, 100% 100%, 0 100%)'
        }}
      />

      <div className="relative z-30 max-w-7xl mx-auto px-12">
        {/* Preview Badge */}
        <div className="pt-28">

        </div>

        {/* Main Content - Now using grid layout */}
        <div className="pt-8 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="max-w-2xl">
            {/* Main Heading - Stripe font styling */}
            <div className="text-7xl lg:text-8xl font-extrabold leading-[0.85] mb-6 tracking-stripe heading-glow mix-blend-difference"
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 800 }}>
              <div className="block text-black heading-word mb-3 intro-reveal intro-delay-0">Smart</div>
              <div className="block text-black heading-word mb-3 intro-reveal intro-delay-1">Attendance</div>
              <div className="block text-black heading-word mb-3 intro-reveal intro-delay-2">to get things</div>
              <div className="block text-black intro-reveal intro-delay-3">done faster.</div>
            </div>

            {/* Description - Exact Stripe size */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed font-normal max-w-lg intro-reveal intro-delay-4">
              Trusted by schools and universities to track attendance seamlessly, prevent proxies, and ensure accurate records.
            </p>

            {/* CTA Button */}
            <Link
              to="/register-selection"
              className="inline-flex items-center px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all duration-200 group transform hover:scale-105 intro-pop intro-delay-5"
            >
              <span>Get Started</span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          {/* Right side - Dashboard preview */}
          <div className="relative intro-reveal intro-delay-6 -mt-16">
            <div className="relative">
              {/* Glassmorphism container for the dashboard video */}
              <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500">
                {/* Dashboard screen recording */}
                {/* <video 
                  src="/dashboard-demo.mov" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-auto rounded-3xl"
                  style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))' }}
                /> */}

                {/* Overlay gradient for better integration */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
