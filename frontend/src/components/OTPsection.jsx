import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp'


const OTPsection = () => {
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const info = JSON.parse(localStorage.getItem('signupInfo')) || {};

  const heading = useMemo(() => {
    if (info.context === 'college') return 'Verify your institution account'
    if (info.context === 'student') return 'Verify your student account'
    if (info.context === 'teacher') return 'Verify your teacher account'
    return 'Verify your account'
  }, [info.context])

  const destinationLabel = useMemo(() => {
    if (info.email) return info.email
    if (info.phone) return maskPhone(info.phone)
    return null
  }, [info.email, info.phone])

  function maskPhone(p) {
    const digits = String(p).replace(/\D/g, '')
    if (digits.length < 4) return p
    return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`
  }

  const handleVerify = async (e) => {
    try {
      e.preventDefault();
      console.log("info ", info);
      const response = await fetch('http://localhost:8000/api/otp/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: info.email,
          otp,
          role: info.role, // send role: COLLEGE, TEACHER, or STUDENT
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      console.log('OTP verified successfully:', data);

      // ✅ Save JWT after verification
      localStorage.setItem('token', data.token);


      // Redirect based on role
      if (info.role === 'COLLEGE') {
        navigate('/college-dashboard');
      } else {
        navigate('/dashboard'); // for Teacher/Student
      }

    } catch (error) {
      console.error('OTP verification error:', error);
      alert(error.message);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/otp/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: info.email,
          role: info.role,         // pass the role dynamically
          userData: info.userData  // pass all signup data again
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert('OTP resent successfully!');
    } catch (error) {
      console.error('Resend OTP error:', error);
      alert(error.message);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background (optional, keep consistent style) */}
      {/* <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
        <source src="/background-video.mp4" type="video/mp4" />
      </video> */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      <div className="relative z-20 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <h1 className="text-2xl font-bold text-white mb-2">{heading}</h1>
          {destinationLabel && (
            <p className="text-white/80 mb-6">We sent a 6-digit code to {destinationLabel}</p>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                containerClassName="justify-center"
                className="text-white"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="text-white" />
                  <InputOTPSlot index={1} className="text-white" />
                  <InputOTPSlot index={2} className="text-white" />
                  <InputOTPSlot index={3} className="text-white" />
                  <InputOTPSlot index={4} className="text-white" />
                  <InputOTPSlot index={5} className="text-white" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              type="submit"
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white py-3 px-4 rounded-lg font-medium hover:bg-white/30 hover:border-white/40 focus:ring-2 focus:ring-white/50 transition-all duration-200"
            >
              Verify
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              className="w-full text-white/90 hover:text-white underline underline-offset-4"
            >
              Resend code
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OTPsection
