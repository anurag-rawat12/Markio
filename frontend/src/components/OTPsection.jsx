import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp'


const OTPsection = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [otp, setOtp] = useState('')
  const info = location.state || {}

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

  function handleVerify(e) {
    e.preventDefault()
    if (otp.length !== 6) {
      alert('Please enter the 6-digit code.')
      return
    }

    console.log('Verifying OTP', { otp, info })
    
    // Navigate to appropriate dashboard based on user role after registration
    if (info.context === 'teacher') {
      navigate('/teacher/dashboard', { replace: true })
    } else if (info.context === 'student') {
      // You can create a student dashboard route later
      navigate('/', { replace: true })
    } else if (info.context === 'college') {
      // Navigate to college dashboard when created
      navigate('/', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }

  function handleResend() {
    // TODO: Call resend OTP API.
    alert('If this were connected to a backend, an OTP would be resent now.')
  }

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
                  <InputOTPSlot index={1} className="text-white"/>
                  <InputOTPSlot index={2} className="text-white"/>
                  <InputOTPSlot index={3} className="text-white"/>
                  <InputOTPSlot index={4} className="text-white"/>
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
              onClick={handleResend}
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
