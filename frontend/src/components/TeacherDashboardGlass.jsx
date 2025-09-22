import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar, Clock, Users, Timer, Copy, RefreshCcw, X, CheckCircle2, XCircle,
  Edit3, Trash2, PlusCircle, ShieldAlert, User, MoreHorizontal,
  Search, Filter, Bell, LogOut, Book, TrendingUp,
  Activity, BookOpen, GraduationCap
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const TeacherDashboard = () => {
  const [activeSection, setActiveSection] = useState('timetable')
  const [selectedClass, setSelectedClass] = useState('IT-A')
  const [attendanceCode, setAttendanceCode] = useState(null)
  const [remaining, setRemaining] = useState(0)
  const [copied, setCopied] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sidebarHovered, setSidebarHovered] = useState(false)

  // Sample data
  const [teacherData] = useState({
    name: 'Dr. Sarah Wilson',
    email: 'sarah.wilson@college.edu',
    avatar: 'T',
    classes: ['IT-A', 'IT-B', 'CSE-DS']
  })

  const [timetable] = useState([
    { 
      id: 1, 
      day: 'Monday', 
      subject: 'Data Structures', 
      class: 'IT-A',
      startTime: '09:00', 
      endTime: '10:30',
      room: 'Lab 1'
    },
    { 
      id: 2, 
      day: 'Monday', 
      subject: 'Database Management', 
      class: 'IT-B',
      startTime: '11:00', 
      endTime: '12:30',
      room: 'Room 201'
    },
    { 
      id: 3, 
      day: 'Tuesday', 
      subject: 'Web Development', 
      class: 'IT-A',
      startTime: '14:00', 
      endTime: '15:30',
      room: 'Lab 2'
    },
    { 
      id: 4, 
      day: 'Wednesday', 
      subject: 'Machine Learning', 
      class: 'CSE-DS',
      startTime: '10:00', 
      endTime: '11:30',
      room: 'Room 301'
    },
    { 
      id: 5, 
      day: 'Thursday', 
      subject: 'Software Engineering', 
      class: 'IT-B',
      startTime: '09:00', 
      endTime: '10:30',
      room: 'Room 202'
    },
    { 
      id: 6, 
      day: 'Friday', 
      subject: 'Statistics', 
      class: 'CSE-DS',
      startTime: '11:00', 
      endTime: '12:30',
      room: 'Room 301'
    }
  ])

  const [students] = useState([
    {
      id: 'IT001',
      name: 'Alice Johnson',
      email: 'alice@college.edu',
      avatar: 'A',
      class: 'IT-A',
      marks: { maths: 85, science: 92, english: 88 },
      attendance: { present: 28, total: 30 },
      lastAttendance: { date: '2024-01-15', status: 'present', proxy: false }
    },
    {
      id: 'IT002',
      name: 'Bob Smith',
      email: 'bob@college.edu',
      avatar: 'B',
      class: 'IT-A',
      marks: { maths: 78, science: 84, english: 82 },
      attendance: { present: 25, total: 30 },
      lastAttendance: { date: '2024-01-15', status: 'present', proxy: true }
    },
    {
      id: 'IT003',
      name: 'Carol Davis',
      email: 'carol@college.edu',
      avatar: 'C',
      class: 'IT-B',
      marks: { maths: 91, science: 89, english: 94 },
      attendance: { present: 29, total: 30 },
      lastAttendance: { date: '2024-01-15', status: 'absent', proxy: false }
    },
    {
      id: 'CSE001',
      name: 'Emma Brown',
      email: 'emma@college.edu',
      avatar: 'E',
      class: 'CSE-DS',
      marks: { maths: 95, science: 93, english: 87 },
      attendance: { present: 30, total: 30 },
      lastAttendance: { date: '2024-01-15', status: 'present', proxy: false }
    }
  ])

  const [newStudent, setNewStudent] = useState({
    id: '', name: '', email: '', avatar: 'S', class: selectedClass
  })

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Timer effect for attendance code
  useEffect(() => {
    let interval
    if (attendanceCode && remaining > 0) {
      interval = setInterval(() => {
        setRemaining(r => r - 1)
      }, 1000)
    } else if (remaining === 0 && attendanceCode) {
      setAttendanceCode(null)
    }
    return () => clearInterval(interval)
  }, [attendanceCode, remaining])

  // Get current class based on time and day
  const getCurrentClass = () => {
    const now = currentTime
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' })
    const currentTimeStr = now.toTimeString().slice(0, 5)
    
    return timetable.find(slot => {
      if (slot.day !== currentDay) return false
      const startTime = slot.startTime
      const endTime = slot.endTime
      return currentTimeStr >= startTime && currentTimeStr <= endTime
    })
  }

  const currentClass = getCurrentClass()

  // Get upcoming classes for today
  const getTodayClasses = () => {
    const today = currentTime.toLocaleDateString('en-US', { weekday: 'long' })
    return timetable.filter(slot => slot.day === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  // Attendance code functions
  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setAttendanceCode(code)
    setRemaining(300) // 5 minutes
    setCopied(false)
  }

  const copyCode = () => {
    if (attendanceCode) {
      navigator.clipboard.writeText(attendanceCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const endCode = () => {
    setAttendanceCode(null)
    setRemaining(0)
    setCopied(false)
  }

  // Filter students based on search and selected class
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === 'all' || student.class === selectedClass
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'present' && student.lastAttendance.status === 'present') ||
                         (filterType === 'absent' && student.lastAttendance.status === 'absent') ||
                         (filterType === 'proxy' && student.lastAttendance.proxy)
    
    return matchesSearch && matchesClass && matchesFilter
  })

  const addStudent = () => {
    // In a real app, this would save to backend
    setShowAddStudent(false)
    setNewStudent({ id: '', name: '', email: '', avatar: 'S', class: selectedClass })
  }

  const getAttendancePercentage = (student) => {
    return Math.round((student.attendance.present / student.attendance.total) * 100)
  }

  const navItems = [
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'students', label: 'Student Records', icon: Users }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/dashboard-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen text-white flex">
        {/* Left Sidebar */}
        <div 
          className={`fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-in-out flex flex-col ${
            sidebarHovered ? 'w-64' : 'w-16'
          }`}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <div className="h-full bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-2xl">
            {/* Profile Section */}
            <div className="p-6 border-b border-white/20">
              <div className={`transition-all duration-300 ${
                sidebarHovered ? 'flex items-center gap-3 mb-4' : 'flex justify-center items-center mb-6 w-full'
              }`}>
                <Avatar className={`transition-all duration-300 flex-shrink-0 ${
                  sidebarHovered ? 'w-12 h-12' : 'w-8 h-8'
                }`}>
                  <AvatarFallback className={`bg-white/90 text-black font-bold ${
                    sidebarHovered ? 'text-xl' : 'text-sm'
                  }`}>
                    {teacherData.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className={`transition-all duration-300 overflow-hidden ${
                  sidebarHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                }`}>
                  <h2 className="font-bold text-white whitespace-nowrap">{teacherData.name}</h2>
                  <p className="text-white/70 text-sm whitespace-nowrap">{teacherData.email}</p>
                </div>
              </div>
              
              {/* Current Time & Class */}
              <div className={`transition-all duration-300 overflow-hidden ${
                sidebarHovered ? 'opacity-100 max-h-96 mb-4' : 'opacity-0 max-h-0 mb-0'
              }`}>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <div className="text-xs text-white/70 uppercase tracking-wider mb-1">Current Time</div>
                  <div className="font-mono text-lg text-white">
                    {currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                  <div className="text-sm text-white/80">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {currentClass && (
                <div className={`transition-all duration-300 overflow-hidden ${
                  sidebarHovered ? 'opacity-100 max-h-48' : 'opacity-0 max-h-0'
                }`}>
                  <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 rounded-xl p-3">
                    <div className="text-xs text-green-300 uppercase tracking-wider mb-1">Current Class</div>
                    <div className="font-semibold text-green-200">{currentClass.subject}</div>
                    <div className="text-sm text-green-300">{currentClass.class} - {currentClass.room}</div>
                    <div className="text-xs text-white/70 mt-1">
                      {currentClass.startTime} - {currentClass.endTime}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6">
              <div className="space-y-3">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        sidebarHovered ? 'gap-3 px-4 py-4' : 'justify-center py-4'
                      } ${
                        activeSection === item.id
                          ? 'bg-white/20 text-white shadow-lg backdrop-blur-md border border-white/30'
                          : 'text-white/70 hover:bg-white/10 hover:text-white hover:backdrop-blur-md'
                      }`}
                      title={!sidebarHovered ? item.label : ''}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className={`font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${
                        sidebarHovered ? 'opacity-100 w-auto ml-0' : 'opacity-0 w-0 -ml-3'
                      }`}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </nav>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-white/20">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 transform rounded-xl py-3 backdrop-blur-md ${
                  sidebarHovered ? 'justify-start px-4' : 'justify-center'
                }`}
                asChild
                title={!sidebarHovered ? 'Sign Out' : ''}
              >
                <Link to="/student-teacher/login" className={`flex items-center ${
                  sidebarHovered ? 'gap-2' : 'justify-center'
                }`}>
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                    sidebarHovered ? 'opacity-100 w-auto ml-0' : 'opacity-0 w-0 -ml-3'
                  }`}>
                    Sign Out
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden ml-16">
          {activeSection === 'timetable' && (
            <div className="h-full overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white/5 backdrop-blur-xl border-b border-white/20">
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                            Timetable
                          </h1>
                          <p className="text-white/80 text-lg">Manage your class schedule and attendance</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-white/90">Live Dashboard</span>
                      </div>
                      <Button className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8 max-w-7xl mx-auto">
                {/* Current/Next Class Card */}
                {currentClass ? (
                  <Card className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-emerald-500/10"></div>
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-4 h-4 bg-green-400 rounded-full animate-ping absolute"></div>
                            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent">
                              Current Class
                            </CardTitle>
                            <CardDescription className="text-green-300 text-base">
                              Class in progress - Live now
                            </CardDescription>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-green-500/20 backdrop-blur-md rounded-full border border-green-500/30">
                          <span className="text-green-200 font-semibold text-sm">LIVE</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative space-y-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                          <div className="text-xs text-green-300 uppercase tracking-wider mb-2 font-medium">Subject</div>
                          <div className="font-bold text-white text-lg">{currentClass.subject}</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                          <div className="text-xs text-green-300 uppercase tracking-wider mb-2 font-medium">Class</div>
                          <div className="font-bold text-white text-lg">{currentClass.class}</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                          <div className="text-xs text-green-300 uppercase tracking-wider mb-2 font-medium">Room</div>
                          <div className="font-bold text-white text-lg">{currentClass.room}</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                          <div className="text-xs text-green-300 uppercase tracking-wider mb-2 font-medium">Time</div>
                          <div className="font-bold text-white text-lg font-mono">{currentClass.startTime} - {currentClass.endTime}</div>
                        </div>
                      </div>
                      
                      <Separator className="bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
                            <Timer className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-white">Take Attendance</h3>
                        </div>
                        {attendanceCode ? (
                          <div className="space-y-6">
                            <div className="relative bg-white/20 backdrop-blur-xl rounded-2xl p-8 text-center shadow-2xl border border-white/30">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl"></div>
                              <div className="relative">
                                <div className="text-white font-mono text-5xl tracking-[0.3em] select-all mb-4 font-bold">
                                  {attendanceCode}
                                </div>
                                <div className="text-white/90 text-lg mb-4 font-medium">
                                  Expires in {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}
                                </div>
                                <div className="w-full bg-white/20 backdrop-blur-md rounded-full h-3 mb-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full transition-all duration-1000"
                                    style={{ width: `${(remaining / 300) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <Button 
                                onClick={copyCode} 
                                variant="outline" 
                                className="bg-white/10 backdrop-blur-md border-green-500/50 text-green-200 hover:bg-green-500/20 hover:border-green-400 transition-all duration-300 shadow-lg"
                                size="lg"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                {copied ? 'Copied!' : 'Copy'}
                              </Button>
                              <Button 
                                onClick={generateCode} 
                                variant="outline" 
                                className="bg-white/10 backdrop-blur-md border-blue-500/50 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 shadow-lg"
                                size="lg"
                              >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Refresh
                              </Button>
                              <Button 
                                onClick={endCode} 
                                className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 hover:bg-red-500/30 shadow-lg hover:shadow-xl transition-all duration-300"
                                size="lg"
                              >
                                <X className="w-4 h-4 mr-2" />
                                End
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            onClick={generateCode} 
                            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/30 text-white hover:from-blue-500/30 hover:to-purple-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" 
                            size="lg"
                          >
                            <Timer className="w-5 h-5 mr-2" />
                            Generate Attendance Code
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <CardContent className="p-8 text-center">
                      <Clock className="w-12 h-12 text-white/50 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white/90 mb-2">No Active Class</h3>
                      <p className="text-white/70">You don't have any classes scheduled right now</p>
                    </CardContent>
                  </Card>
                )}

                {/* Today's Schedule */}
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">Today's Schedule</CardTitle>
                    <CardDescription className="text-white/70">
                      {currentTime.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getTodayClasses().length > 0 ? (
                        getTodayClasses().map((classItem) => {
                          const isCurrentClass = currentClass && currentClass.id === classItem.id
                          return (
                            <div
                              key={classItem.id}
                              className={`p-4 rounded-lg border backdrop-blur-md transition-colors ${
                                isCurrentClass
                                  ? 'bg-green-500/20 border-green-500/50 ring-1 ring-green-400/50'
                                  : 'bg-white/5 border-white/20 hover:border-white/40'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-semibold text-white">{classItem.subject}</h4>
                                    <Badge className={`${isCurrentClass ? 'bg-green-500/20 text-green-200 border-green-500/30' : 'bg-white/20 text-white border-white/30'} backdrop-blur-md`}>
                                      {classItem.class}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-white/70">
                                    <span>{classItem.startTime} - {classItem.endTime}</span>
                                    <span>|</span>
                                    <span>{classItem.room}</span>
                                  </div>
                                </div>
                                {isCurrentClass && (
                                  <div className="flex items-center gap-2 text-green-300">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium">Live</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="w-12 h-12 text-white/50 mx-auto mb-3" />
                          <p className="text-white/70">No classes scheduled for today</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Overview */}
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">Weekly Overview</CardTitle>
                    <CardDescription className="text-white/70">All your classes for this week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/20">
                            <TableHead className="text-white">Day</TableHead>
                            <TableHead className="text-white">Subject</TableHead>
                            <TableHead className="text-white">Class</TableHead>
                            <TableHead className="text-white">Time</TableHead>
                            <TableHead className="text-white">Room</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {timetable.map((slot) => (
                            <TableRow key={slot.id} className="border-white/20 hover:bg-white/5 backdrop-blur-sm">
                              <TableCell className="text-white/80">{slot.day}</TableCell>
                              <TableCell className="font-medium text-white">{slot.subject}</TableCell>
                              <TableCell>
                                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">{slot.class}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-white/80">{slot.startTime} - {slot.endTime}</TableCell>
                              <TableCell className="text-white/80">{slot.room}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'students' && (
            <div className="h-full overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white/5 backdrop-blur-xl border-b border-white/20">
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-purple-200 bg-clip-text text-transparent">
                            Student Records
                          </h1>
                          <p className="text-white/80 text-lg">Manage student information and attendance</p>
                        </div>
                      </div>
                    </div>
                    <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/30 text-white hover:from-blue-500/30 hover:to-purple-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Add Student
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-black/80 backdrop-blur-xl border-white/30 text-white">
                        <DialogHeader>
                          <DialogTitle>Add New Student</DialogTitle>
                          <DialogDescription className="text-white/70">
                            Enter the details for the new student
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="student-id" className="text-white">Student ID</Label>
                              <Input
                                id="student-id"
                                placeholder="Enter student ID"
                                value={newStudent.id}
                                onChange={(e) => setNewStudent(s => ({ ...s, id: e.target.value }))}
                                className="bg-white/10 backdrop-blur-md border-white/30 text-white placeholder-white/50"
                              />
                            </div>
                            <div>
                              <Label htmlFor="student-name" className="text-white">Name</Label>
                              <Input
                                id="student-name"
                                placeholder="Enter student name"
                                value={newStudent.name}
                                onChange={(e) => setNewStudent(s => ({ ...s, name: e.target.value }))}
                                className="bg-white/10 backdrop-blur-md border-white/30 text-white placeholder-white/50"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="student-email" className="text-white">Email</Label>
                            <Input
                              id="student-email"
                              type="email"
                              placeholder="Enter email address"
                              value={newStudent.email}
                              onChange={(e) => setNewStudent(s => ({ ...s, email: e.target.value }))}
                              className="bg-white/10 backdrop-blur-md border-white/30 text-white placeholder-white/50"
                            />
                          </div>
                          <div>
                            <Label htmlFor="student-class" className="text-white">Class</Label>
                            <Select value={newStudent.class} onValueChange={(value) => setNewStudent(s => ({ ...s, class: value }))}>
                              <SelectTrigger className="bg-white/10 backdrop-blur-md border-white/30 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black/80 backdrop-blur-xl border-white/30 text-white">
                                {teacherData.classes.map(cls => (
                                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setShowAddStudent(false)} className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20">
                            Cancel
                          </Button>
                          <Button onClick={addStudent} className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30">
                            Add Student
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8 max-w-7xl mx-auto">
                {/* Filters */}
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
                        <Filter className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Search & Filter</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                          <Input
                            placeholder="Search students by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder-white/50 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl"
                          />
                        </div>
                      </div>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="w-[180px] h-12 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/80 backdrop-blur-xl border border-white/30 text-white rounded-xl">
                          <SelectItem value="all" className="hover:bg-white/10">All Classes</SelectItem>
                          {teacherData.classes.map(cls => (
                            <SelectItem key={cls} value={cls} className="hover:bg-white/10">{cls}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[170px] h-12 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/80 backdrop-blur-xl border border-white/30 text-white rounded-xl">
                          <SelectItem value="all" className="hover:bg-white/10">All Students</SelectItem>
                          <SelectItem value="present" className="hover:bg-white/10">Present</SelectItem>
                          <SelectItem value="absent" className="hover:bg-white/10">Absent</SelectItem>
                          <SelectItem value="proxy" className="hover:bg-white/10">Proxy Flagged</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Students Table */}
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent">
                            Students ({filteredStudents.length})
                          </CardTitle>
                          <CardDescription className="text-white/70 text-base">
                            Manage student records and attendance data
                          </CardDescription>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-green-500/20 backdrop-blur-md rounded-full border border-green-500/30">
                        <span className="text-green-200 font-semibold text-sm">{filteredStudents.length} Found</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/20">
                            <TableHead className="text-white">Student</TableHead>
                            <TableHead className="text-white">Class</TableHead>
                            <TableHead className="text-white">Attendance</TableHead>
                            <TableHead className="text-white">Average Marks</TableHead>
                            <TableHead className="text-white">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                            <TableRow key={student.id} className="border-white/20 hover:bg-white/5 backdrop-blur-sm">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-white/90 text-black font-bold">
                                      {student.avatar}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-white">{student.name}</div>
                                    <div className="text-sm text-white/70">{student.id}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">{student.class}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/70">Attendance</span>
                                    <span className="text-white">{getAttendancePercentage(student)}%</span>
                                  </div>
                                  <Progress value={getAttendancePercentage(student)} className="h-1" />
                                  <div className="text-xs text-white/60">
                                    {student.attendance.present}/{student.attendance.total} classes
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-white font-medium">
                                  {Math.round((student.marks.maths + student.marks.science + student.marks.english) / 3)}%
                                </div>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 backdrop-blur-sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-black/80 backdrop-blur-xl border-white/30 text-white">
                                    <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                                      <User className="w-4 h-4 mr-2" />
                                      View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit3 className="w-4 h-4 mr-2" />
                                      Edit Details
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-white/70">
                                No students found matching your criteria
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Student Profile Dialog */}
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="bg-black/80 backdrop-blur-xl border-white/30 text-white max-w-2xl">
            {selectedStudent && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-white/90 text-black font-bold text-xl">
                        {selectedStudent.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xl text-white">{selectedStudent.name}</div>
                      <div className="text-sm text-white/70">
                        {selectedStudent.id} · {selectedStudent.email}
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/30">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Class:</span>
                        <span className="text-white font-medium">{selectedStudent.class}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Total Attendance:</span>
                        <span className="text-white font-medium">
                          {selectedStudent.attendance.present}/{selectedStudent.attendance.total} 
                          ({getAttendancePercentage(selectedStudent)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Last Attendance:</span>
                        <span className="text-white font-medium">{selectedStudent.lastAttendance.date}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-xl border-white/30">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Academic Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/70">Mathematics</span>
                          <Badge className="bg-white/20 text-white font-bold backdrop-blur-md border-white/30">{selectedStudent.marks.maths}/100</Badge>
                        </div>
                        <Progress value={selectedStudent.marks.maths} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/70">Science</span>
                          <Badge className="bg-white/20 text-white font-bold backdrop-blur-md border-white/30">{selectedStudent.marks.science}/100</Badge>
                        </div>
                        <Progress value={selectedStudent.marks.science} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/70">English</span>
                          <Badge className="bg-white/20 text-white font-bold backdrop-blur-md border-white/30">{selectedStudent.marks.english}/100</Badge>
                        </div>
                        <Progress value={selectedStudent.marks.english} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default TeacherDashboard