import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'

const HeaderDock = ({ 
  collegeData, 
  currentTime, 
  stats, 
  navItems, 
  activeSection, 
  setActiveSection, 
  className 
}) => {
  const [showStats, setShowStats] = useState(false)

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50 p-4", className)}>
      {/* Main Header Bar */}
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-6 py-3">
        
        {/* Left: College Info */}
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 backdrop-blur-sm">
            <AvatarFallback className="bg-white/90 text-black font-bold text-lg">
              {collegeData.institutionName
                ? collegeData.institutionName
                  .split(' ')
                  .map(word => word[0])
                  .join('')
                  .toUpperCase()
                : ''
              }
            </AvatarFallback>
          </Avatar>
          
          <div className="hidden md:block">
            <h2 className="font-bold text-white text-lg">{collegeData.institutionName || ''}</h2>
            <p className="text-white/70 text-sm">{collegeData.email || ''}</p>
          </div>
        </div>

        {/* Center: Navigation */}
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "relative flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 group",
                  activeSection === item.id
                    ? "bg-white/20 text-white shadow-lg border border-white/30"
                    : "text-white/70 hover:bg-white/15 hover:text-white border border-transparent"
                )}
                title={item.label}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline text-sm font-medium">{item.label}</span>
                
                {/* Active Indicator */}
                {activeSection === item.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Right: Stats & Controls */}
        <div className="flex items-center gap-4">
          
          {/* Time Display */}
          <div className="hidden lg:block text-right">
            <div className="font-mono text-white text-sm">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </div>
            <div className="text-white/70 text-xs">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Stats Toggle */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-200"
            title="View Statistics"
          >
            <div className="grid grid-cols-2 gap-1 w-4 h-4">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
            </div>
            <span className="hidden sm:inline text-white/80 text-sm">Stats</span>
          </button>

          {/* Sign Out */}
          <Link
            to="/college/login"
            className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-red-500/20 rounded-lg border border-white/20 hover:border-red-500/40 transition-all duration-200 group"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 text-white/70 group-hover:text-red-300" />
          </Link>
        </div>
      </div>

      {/* Stats Dropdown */}
      {showStats && (
        <div className="mt-2 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-xl p-4 ml-auto max-w-md">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/40 rounded-lg p-3">
              <div className="text-xs text-blue-300 font-medium">Students</div>
              <div className="font-bold text-blue-200 text-lg">{stats.totalStudents}</div>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/40 rounded-lg p-3">
              <div className="text-xs text-green-300 font-medium">Teachers</div>
              <div className="font-bold text-green-200 text-lg">{stats.totalTeachers}</div>
            </div>
            <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/40 rounded-lg p-3">
              <div className="text-xs text-purple-300 font-medium">Branches</div>
              <div className="font-bold text-purple-200 text-lg">{stats.totalBranches}</div>
            </div>
            <div className="bg-orange-500/20 backdrop-blur-sm border border-orange-500/40 rounded-lg p-3">
              <div className="text-xs text-orange-300 font-medium">Attendance</div>
              <div className="font-bold text-orange-200 text-lg">{stats.averageAttendance}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { HeaderDock }