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
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-in-out bg-gray-950/95 backdrop-blur-sm border-r border-gray-800 flex flex-col shadow-2xl ${
          sidebarHovered ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-800">
          <div className={`transition-all duration-300 ${
            sidebarHovered ? 'flex items-center gap-3 mb-4' : 'flex justify-center items-center mb-6 w-full'
          }`}>
            <Avatar className={`transition-all duration-300 flex-shrink-0 ${
              sidebarHovered ? 'w-12 h-12' : 'w-8 h-8'
            }`}>
              <AvatarFallback className={`bg-white text-black font-bold ${
                sidebarHovered ? 'text-xl' : 'text-sm'
              }`}>
                {teacherData.avatar}
              </AvatarFallback>
            </Avatar>
            <div className={`transition-all duration-300 overflow-hidden ${
              sidebarHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'
            }`}>
              <h2 className="font-bold text-white whitespace-nowrap">{teacherData.name}</h2>
              <p className="text-gray-400 text-sm whitespace-nowrap">{teacherData.email}</p>
            </div>
          </div>
          
          {/* Current Time & Class */}
          <div className={`transition-all duration-300 overflow-hidden ${
            sidebarHovered ? 'opacity-100 max-h-96 mb-4' : 'opacity-0 max-h-0 mb-0'
          }`}>
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Current Time</div>
              <div className="font-mono text-lg text-white">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>
              <div className="text-sm text-gray-300">
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
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                <div className="text-xs text-green-400 uppercase tracking-wider mb-1">Current Class</div>
                <div className="font-semibold text-green-300">{currentClass.subject}</div>
              <div className="text-sm text-green-400">{currentClass.class} - {currentClass.room}</div>
                <div className="text-xs text-gray-400 mt-1">
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
                      ? 'bg-white text-black shadow-lg'
                      : 'text-gray-300 hover:bg-gray-900 hover:text-white hover:shadow-md'
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
        <div className="p-6 border-t border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full text-gray-300 hover:text-white hover:bg-gray-900 transition-all duration-300 hover:scale-105 transform rounded-xl py-3 ${
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

      {/* Main Content */}
      <div className="flex-1 overflow-hidden ml-16">
        {activeSection === 'timetable' && (
          <div className="h-full overflow-y-auto bg-gradient-to-br from-black via-gray-950 to-black">
            {/* Header */}
            <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-gray-700/50 z-10">
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-300 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                          Timetable
                        </h1>
                        <p className="text-gray-400 text-lg">Manage your class schedule and attendance</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-full border border-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-300">Live Dashboard</span>
                    </div>
                    <Button className="bg-white text-black hover:bg-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
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
                <Card className="relative overflow-hidden bg-gradient-to-br from-green-900/20 via-emerald-900/10 to-green-800/20 border border-green-700/50 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent animate-pulse"></div>
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-4 h-4 bg-green-500 rounded-full animate-ping absolute"></div>
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                            Current Class
                          </CardTitle>
                          <CardDescription className="text-green-400 text-base">
                            Class in progress - Live now
                          </CardDescription>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30">
                        <span className="text-green-300 font-semibold text-sm">LIVE</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-700/30">
                        <div className="text-xs text-green-400 uppercase tracking-wider mb-2 font-medium">Subject</div>
                        <div className="font-bold text-white text-lg">{currentClass.subject}</div>
                      </div>
                      <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-700/30">
                        <div className="text-xs text-green-400 uppercase tracking-wider mb-2 font-medium">Class</div>
                        <div className="font-bold text-white text-lg">{currentClass.class}</div>
                      </div>
                      <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-700/30">
                        <div className="text-xs text-green-400 uppercase tracking-wider mb-2 font-medium">Room</div>
                        <div className="font-bold text-white text-lg">{currentClass.room}</div>
                      </div>
                      <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-700/30">
                        <div className="text-xs text-green-400 uppercase tracking-wider mb-2 font-medium">Time</div>
                        <div className="font-bold text-white text-lg font-mono">{currentClass.startTime} - {currentClass.endTime}</div>
                      </div>
                    </div>
                    
                    <Separator className="bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Timer className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Take Attendance</h3>
                      </div>
                      {attendanceCode ? (
                        <div className="space-y-6">
                          <div className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl p-8 text-center shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl"></div>
                            <div className="relative">
                              <div className="text-black font-mono text-5xl tracking-[0.3em] select-all mb-4 font-bold">
                                {attendanceCode}
                              </div>
                              <div className="text-gray-700 text-lg mb-4 font-medium">
                                Expires in {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                                  style={{ width: `${(remaining / 300) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <Button 
                              onClick={copyCode} 
                              variant="outline" 
                              className="border-green-500/50 text-green-300 hover:bg-green-500/20 hover:border-green-400 transition-all duration-300 shadow-lg"
                              size="lg"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              {copied ? 'Copied!' : 'Copy'}
                            </Button>
                            <Button 
                              onClick={generateCode} 
                              variant="outline" 
                              className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 shadow-lg"
                              size="lg"
                            >
                              <RefreshCcw className="w-4 h-4 mr-2" />
                              Refresh
                            </Button>
                            <Button 
                              onClick={endCode} 
                              className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300"
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
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" 
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
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Active Class</h3>
                    <p className="text-gray-500">You don't have any classes scheduled right now</p>
                  </CardContent>
                </Card>
              )}

              {/* Today's Schedule */}
              <Card className="border-white bg-black">
                <CardHeader>
                  <CardTitle className="text-white">Today's Schedule</CardTitle>
                  <CardDescription className="text-gray-400">
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
                            className={`p-4 rounded-lg border transition-colors ${
                              isCurrentClass
                                ? 'bg-green-900/20 border-green-800 ring-1 ring-green-500'
                                : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-semibold text-white">{classItem.subject}</h4>
                                  <Badge className={isCurrentClass ? 'bg-green-600 text-white' : 'bg-white text-black'}>
                                    {classItem.class}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span>{classItem.startTime} - {classItem.endTime}</span>
                                  <span>|</span>
                                  <span>{classItem.room}</span>
                                </div>
                              </div>
                              {isCurrentClass && (
                                <div className="flex items-center gap-2 text-green-400">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium">Live</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No classes scheduled for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Overview */}
              <Card className="border-white bg-black">
                <CardHeader>
                  <CardTitle className="text-white">Weekly Overview</CardTitle>
                  <CardDescription className="text-gray-400">All your classes for this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800">
                          <TableHead className="text-white">Day</TableHead>
                          <TableHead className="text-white">Subject</TableHead>
                          <TableHead className="text-white">Class</TableHead>
                          <TableHead className="text-white">Time</TableHead>
                          <TableHead className="text-white">Room</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timetable.map((slot) => (
                          <TableRow key={slot.id} className="border-gray-800 hover:bg-gray-900">
                            <TableCell className="text-gray-300">{slot.day}</TableCell>
                            <TableCell className="font-medium text-white">{slot.subject}</TableCell>
                            <TableCell>
                              <Badge className="bg-white text-black">{slot.class}</Badge>
                            </TableCell>
                            <TableCell className="font-mono text-gray-300">{slot.startTime} - {slot.endTime}</TableCell>
                            <TableCell className="text-gray-300">{slot.room}</TableCell>
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
          <div className="h-full overflow-y-auto bg-gradient-to-br from-black via-gray-950 to-black">
            {/* Header */}
            <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-gray-700/50 z-10">
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                          Student Records
                        </h1>
                        <p className="text-gray-400 text-lg">Manage student information and attendance</p>
                      </div>
                    </div>
                  </div>
                  <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Student
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="bg-black border-white text-white">
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription className="text-gray-400">
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
                            className="bg-black border-white text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="student-name" className="text-white">Name</Label>
                          <Input
                            id="student-name"
                            placeholder="Enter student name"
                            value={newStudent.name}
                            onChange={(e) => setNewStudent(s => ({ ...s, name: e.target.value }))}
                            className="bg-black border-white text-white"
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
                          className="bg-black border-white text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="student-class" className="text-white">Class</Label>
                        <Select value={newStudent.class} onValueChange={(value) => setNewStudent(s => ({ ...s, class: value }))}>
                          <SelectTrigger className="bg-black border-white text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-white text-white">
                            {teacherData.classes.map(cls => (
                              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowAddStudent(false)} className="border-white text-white hover:bg-white hover:text-black">
                        Cancel
                      </Button>
                      <Button onClick={addStudent} className="bg-white text-black hover:bg-gray-200">
                        Add Student
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="p-8 space-y-8 max-w-7xl mx-auto">
              {/* Filters */}
              <Card className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/50 shadow-2xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Filter className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Search & Filter</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          placeholder="Search students by name or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 h-12 bg-gray-900/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl"
                        />
                      </div>
                    </div>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-[180px] h-12 bg-gray-900/50 border border-gray-600/50 text-white rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border border-gray-600 text-white rounded-xl">
                        <SelectItem value="all" className="hover:bg-gray-800">All Classes</SelectItem>
                        {teacherData.classes.map(cls => (
                          <SelectItem key={cls} value={cls} className="hover:bg-gray-800">{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[170px] h-12 bg-gray-900/50 border border-gray-600/50 text-white rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border border-gray-600 text-white rounded-xl">
                        <SelectItem value="all" className="hover:bg-gray-800">All Students</SelectItem>
                        <SelectItem value="present" className="hover:bg-gray-800">Present</SelectItem>
                        <SelectItem value="absent" className="hover:bg-gray-800">Absent</SelectItem>
                        <SelectItem value="proxy" className="hover:bg-gray-800">Proxy Flagged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Students Table */}
              <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 shadow-2xl backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                          Students ({filteredStudents.length})
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-base">
                          Manage student records and attendance data
                        </CardDescription>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30">
                      <span className="text-green-300 font-semibold text-sm">{filteredStudents.length} Found</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800">
                          <TableHead className="text-white">Student</TableHead>
                          <TableHead className="text-white">Class</TableHead>
                          <TableHead className="text-white">Attendance</TableHead>
                          <TableHead className="text-white">Average Marks</TableHead>
                          <TableHead className="text-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                          <TableRow key={student.id} className="border-gray-800 hover:bg-gray-900">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-white text-black font-bold">
                                    {student.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-white">{student.name}</div>
                                  <div className="text-sm text-gray-400">{student.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-white text-black">{student.class}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">Attendance</span>
                                  <span className="text-white">{getAttendancePercentage(student)}%</span>
                                </div>
                                <Progress value={getAttendancePercentage(student)} className="h-1" />
                                <div className="text-xs text-gray-500">
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
                                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-black border-white text-white">
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
                            <TableCell colSpan={5} className="text-center py-8 text-gray-400">
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
        <DialogContent className="bg-black border-white text-white max-w-2xl">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-white text-black font-bold text-xl">
                      {selectedStudent.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xl text-white">{selectedStudent.name}</div>
                    <div className="text-sm text-gray-400">
                      {selectedStudent.id} · {selectedStudent.email}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <Card className="border-white bg-gray-950">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Class:</span>
                      <span className="text-white font-medium">{selectedStudent.class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Attendance:</span>
                      <span className="text-white font-medium">
                        {selectedStudent.attendance.present}/{selectedStudent.attendance.total} 
                        ({getAttendancePercentage(selectedStudent)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Attendance:</span>
                      <span className="text-white font-medium">{selectedStudent.lastAttendance.date}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white bg-gray-950">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Academic Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Mathematics</span>
                        <Badge className="bg-white text-black font-bold">{selectedStudent.marks.maths}/100</Badge>
                      </div>
                      <Progress value={selectedStudent.marks.maths} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Science</span>
                        <Badge className="bg-white text-black font-bold">{selectedStudent.marks.science}/100</Badge>
                      </div>
                      <Progress value={selectedStudent.marks.science} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">English</span>
                        <Badge className="bg-white text-black font-bold">{selectedStudent.marks.english}/100</Badge>
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
  )
}

export default TeacherDashboard