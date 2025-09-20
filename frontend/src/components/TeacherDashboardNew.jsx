import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Calendar, Timer, Copy, RefreshCcw, X, CheckCircle2, XCircle,
  Clock, Edit3, Trash2, PlusCircle, ShieldAlert, User, ChevronDown,
  GraduationCap, BookOpen, TrendingUp, Activity, MoreHorizontal,
  Search, Filter, Download, Upload, Bell, Settings
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const TeacherDashboard = () => {
  // Sample data with multi-class support
  const [classData] = useState({
    'IT-A': {
      students: [
        {
          id: 'IT001',
          name: 'Alice Johnson',
          email: 'alice@college.edu',
          avatar: '🎓',
          marks: { maths: 85, science: 92, english: 88 },
          profile: { year: '2nd Year', dept: 'Information Technology' },
          lastAttendance: { date: '2024-01-15', status: 'present', proxy: false, markedBy: 'student' },
          attendanceSummary: { present: 28, total: 30 }
        },
        {
          id: 'IT002',
          name: 'Bob Smith',
          email: 'bob@college.edu',
          avatar: '👨‍💻',
          marks: { maths: 78, science: 84, english: 82 },
          profile: { year: '2nd Year', dept: 'Information Technology' },
          lastAttendance: { date: '2024-01-15', status: 'present', proxy: true, markedBy: 'student' },
          attendanceSummary: { present: 25, total: 30 }
        },
        {
          id: 'IT003',
          name: 'Carol Davis',
          email: 'carol@college.edu',
          avatar: '👩‍🔬',
          marks: { maths: 91, science: 89, english: 94 },
          profile: { year: '2nd Year', dept: 'Information Technology' },
          lastAttendance: { date: '2024-01-15', status: 'absent', proxy: false, markedBy: 'teacher' },
          attendanceSummary: { present: 29, total: 30 }
        }
      ],
      timetable: [
        { id: 1, day: 'Mon', subject: 'Data Structures', start: '09:00', end: '10:30' },
        { id: 2, day: 'Tue', subject: 'Database Management', start: '11:00', end: '12:30' },
        { id: 3, day: 'Wed', subject: 'Web Development', start: '14:00', end: '15:30' }
      ]
    },
    'IT-B': {
      students: [
        {
          id: 'ITB001',
          name: 'David Wilson',
          email: 'david@college.edu',
          avatar: '🖥️',
          marks: { maths: 82, science: 87, english: 85 },
          profile: { year: '2nd Year', dept: 'Information Technology' },
          lastAttendance: { date: '2024-01-15', status: 'present', proxy: false, markedBy: 'teacher' },
          attendanceSummary: { present: 27, total: 30 }
        }
      ],
      timetable: [
        { id: 4, day: 'Mon', subject: 'Algorithms', start: '10:30', end: '12:00' },
        { id: 5, day: 'Thu', subject: 'Software Engineering', start: '09:00', end: '10:30' }
      ]
    },
    'CSE-DS': {
      students: [
        {
          id: 'CSE001',
          name: 'Emma Brown',
          email: 'emma@college.edu',
          avatar: '🔬',
          marks: { maths: 95, science: 93, english: 87 },
          profile: { year: '3rd Year', dept: 'Computer Science - Data Science' },
          lastAttendance: { date: '2024-01-15', status: 'present', proxy: false, markedBy: 'student' },
          attendanceSummary: { present: 30, total: 30 }
        }
      ],
      timetable: [
        { id: 6, day: 'Fri', subject: 'Machine Learning', start: '14:00', end: '16:00' },
        { id: 7, day: 'Wed', subject: 'Statistics', start: '11:00', end: '12:30' }
      ]
    }
  })

  const [selectedClass, setSelectedClass] = useState('IT-A')
  const [students, setStudents] = useState(classData[selectedClass].students)
  const [timetable, setTimetable] = useState(classData[selectedClass].timetable)
  const [showClassDropdown, setShowClassDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Attendance code functionality
  const [attendanceCode, setAttendanceCode] = useState(null)
  const [remaining, setRemaining] = useState(0)
  const [copied, setCopied] = useState(false)

  // Modal states
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)

  // Form states
  const [newStudent, setNewStudent] = useState({
    id: '', name: '', email: '', avatar: '🎓',
    marks: { maths: 0, science: 0, english: 0 },
    profile: { year: '2nd Year', dept: 'Information Technology' },
    attendanceSummary: { present: 0, total: 0 }
  })

  const [newSlot, setNewSlot] = useState({
    day: 'Mon', subject: '', start: '09:00', end: '10:00'
  })

  // Switch class function
  const switchClass = (className) => {
    setSelectedClass(className)
    setStudents(classData[className].students)
    setTimetable(classData[className].timetable)
    setShowClassDropdown(false)
  }

  // Calculate stats
  const totals = React.useMemo(() => {
    return {
      present: students.filter(s => s.lastAttendance.status === 'present').length,
      absent: students.filter(s => s.lastAttendance.status === 'absent').length,
      proxy: students.filter(s => s.lastAttendance.proxy).length,
      studentMarked: students.filter(s => s.lastAttendance.markedBy === 'student').length
    }
  }, [students])

  // Filter students based on search and filter
  const filteredStudents = React.useMemo(() => {
    let filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filterType === 'present') {
      filtered = filtered.filter(s => s.lastAttendance.status === 'present')
    } else if (filterType === 'absent') {
      filtered = filtered.filter(s => s.lastAttendance.status === 'absent')
    } else if (filterType === 'proxy') {
      filtered = filtered.filter(s => s.lastAttendance.proxy)
    }

    return filtered
  }, [students, searchTerm, filterType])

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

  // Timer effect
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

  // Student management functions
  const toggleAttendance = (studentId) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId 
        ? { ...s, lastAttendance: { ...s.lastAttendance, status: s.lastAttendance.status === 'present' ? 'absent' : 'present' } }
        : s
    ))
  }

  const toggleProxy = (studentId) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId 
        ? { ...s, lastAttendance: { ...s.lastAttendance, proxy: !s.lastAttendance.proxy } }
        : s
    ))
  }

  const removeStudent = (studentId) => {
    setStudents(prev => prev.filter(s => s.id !== studentId))
  }

  const addStudent = () => {
    const student = {
      ...newStudent,
      id: newStudent.id || `AUTO${Date.now()}`,
      lastAttendance: { date: '2024-01-15', status: 'absent', proxy: false, markedBy: 'teacher' }
    }
    setStudents(prev => [...prev, student])
    setNewStudent({
      id: '', name: '', email: '', avatar: '🎓',
      marks: { maths: 0, science: 0, english: 0 },
      profile: { year: '2nd Year', dept: 'Information Technology' },
      attendanceSummary: { present: 0, total: 0 }
    })
    setShowAddStudent(false)
  }

  // Timetable functions
  const addSlot = () => {
    if (newSlot.subject) {
      const slot = { ...newSlot, id: Date.now() }
      setTimetable(prev => [...prev, slot])
      setNewSlot({ day: 'Mon', subject: '', start: '09:00', end: '10:00' })
    }
  }

  const removeSlot = (slotId) => {
    setTimetable(prev => prev.filter(s => s.id !== slotId))
  }

  // Close dropdown on outside click
  const dropdownRef = useRef(null)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowClassDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getAttendancePercentage = (student) => {
    return Math.round((student.attendanceSummary.present / student.attendanceSummary.total) * 100)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <Badge variant="secondary" className="mb-2 bg-white text-black hover:bg-gray-200 transition-colors">
                    Dashboard Overview
                  </Badge>
                  <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                    Teacher Dashboard
                  </h1>
                  <p className="text-lg text-gray-300">
                    Manage attendance, marks, and class schedules with ease
                  </p>
                </div>

                {/* Class Selector */}
                <div className="relative" ref={dropdownRef}>
                  <Label className="text-sm font-medium text-gray-300 mb-2 block">Active Class</Label>
                  <Button
                    variant="outline"
                    onClick={() => setShowClassDropdown(!showClassDropdown)}
                    className="min-w-[280px] justify-start bg-black hover:bg-gray-900 border-2 border-white hover:border-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl group text-white"
                  >
                    <Users className="w-5 h-5 mr-3 text-white" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">{selectedClass}</div>
                      <div className="text-sm text-gray-300">{students.length} students enrolled</div>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-white ${showClassDropdown ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {showClassDropdown && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-black border-2 border-white rounded-lg shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      {Object.keys(classData).map((className) => (
                        <button
                          key={className}
                          onClick={() => switchClass(className)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-900 transition-colors duration-150 border-b border-gray-800 last:border-b-0 group ${
                            className === selectedClass ? 'bg-white text-black' : 'text-white'
                          }`}
                        >
                          <Users className={`w-4 h-4 ${className === selectedClass ? 'text-black' : 'text-white'}`} />
                          <div className="flex-1">
                            <div className="font-medium">{className}</div>
                            <div className={`text-sm ${className === selectedClass ? 'text-gray-600' : 'text-gray-300'}`}>{classData[className].students.length} students</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="border-2 border-white hover:bg-white hover:text-black transition-colors text-white">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="border-2 border-white hover:bg-white hover:text-black transition-colors text-white">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
                
                <Button asChild variant="outline" className="border-2 border-white hover:bg-white hover:text-black transition-all duration-200 text-white">
                  <Link to="/student-teacher/login">Sign out</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 border-white bg-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Present Today</p>
                    <p className="text-3xl font-bold text-white">{totals.present}</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-black" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 border-white bg-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Absent Today</p>
                    <p className="text-3xl font-bold text-white">{totals.absent}</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-black" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 border-white bg-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Proxy Flags</p>
                    <p className="text-3xl font-bold text-white">{totals.proxy}</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-black" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 border-white bg-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Self-Marked</p>
                    <p className="text-3xl font-bold text-white">{totals.studentMarked}</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-black" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Attendance Code Card */}
            <Card className="xl:col-span-2 hover:shadow-xl transition-all duration-300 border-2 border-white bg-black">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Timer className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">Attendance Code</CardTitle>
                    <CardDescription className="text-gray-300">Generate a one-time code for students to mark attendance</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {attendanceCode ? (
                  <div className="space-y-4">
                    <Card className="bg-white border-2 border-gray-200">
                      <CardContent className="p-6 text-center">
                        <div className="text-black font-mono text-3xl tracking-widest select-all mb-3">
                          {attendanceCode}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-mono text-sm">
                            Expires in {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}
                          </span>
                        </div>
                        <Progress value={(remaining / 300) * 100} className="mt-3 bg-gray-300" />
                      </CardContent>
                    </Card>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={copyCode} variant="outline" className="flex-1 min-w-fit border-2 border-white hover:bg-white hover:text-black transition-all text-white">
                        <Copy className="w-4 h-4 mr-2" />
                        {copied ? 'Copied!' : 'Copy Code'}
                      </Button>
                      <Button onClick={generateCode} variant="outline" className="flex-1 min-w-fit border-2 border-white hover:bg-white hover:text-black transition-all text-white">
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                      <Button onClick={endCode} className="flex-1 min-w-fit bg-white text-black hover:bg-gray-200 transition-all">
                        <X className="w-4 h-4 mr-2" />
                        End Code
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={generateCode} size="lg" className="w-full bg-white hover:bg-gray-200 transition-all duration-200 text-black shadow-lg hover:shadow-xl">
                    <Timer className="w-5 h-5 mr-2" />
                    Generate Attendance Code
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-white bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-white" />
                  <span className="text-white">Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
                  <DialogTrigger asChild>
                    <Button className="w-full justify-start bg-white hover:bg-gray-200 transition-all duration-200 text-black shadow-lg hover:shadow-xl">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-black border-2 border-white">
                    <DialogHeader className="border-b border-gray-800 pb-4">
                      <DialogTitle className="text-white text-xl">Add New Student</DialogTitle>
                      <DialogDescription className="text-gray-300">Enter the details for the new student</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
                      <div className="space-y-2">
                        <Label htmlFor="student-id" className="text-white font-medium">Student ID</Label>
                        <Input
                          id="student-id"
                          placeholder="Enter student ID"
                          value={newStudent.id}
                          onChange={(e) => setNewStudent(s => ({ ...s, id: e.target.value }))}
                          className="border-2 border-white focus:border-gray-200 bg-black text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-name" className="text-white font-medium">Name</Label>
                        <Input
                          id="student-name"
                          placeholder="Enter student name"
                          value={newStudent.name}
                          onChange={(e) => setNewStudent(s => ({ ...s, name: e.target.value }))}
                          className="border-2 border-white focus:border-gray-200 bg-black text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-email" className="text-white font-medium">Email</Label>
                        <Input
                          id="student-email"
                          type="email"
                          placeholder="Enter email address"
                          value={newStudent.email}
                          onChange={(e) => setNewStudent(s => ({ ...s, email: e.target.value }))}
                          className="border-2 border-white focus:border-gray-200 bg-black text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-avatar" className="text-white font-medium">Avatar (Emoji)</Label>
                        <Input
                          id="student-avatar"
                          placeholder="🎓"
                          value={newStudent.avatar}
                          onChange={(e) => setNewStudent(s => ({ ...s, avatar: e.target.value }))}
                          className="border-2 border-white focus:border-gray-200 bg-black text-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                      <Button variant="outline" onClick={() => setShowAddStudent(false)} className="border-2 border-white hover:bg-white hover:text-black text-white">
                        Cancel
                      </Button>
                      <Button onClick={addStudent} className="bg-white hover:bg-gray-200 text-black">
                        Add Student
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  className="w-full justify-start border-2 border-white hover:bg-white hover:text-black transition-all duration-200 shadow-lg hover:shadow-xl text-white"
                  onClick={() => setStudents([])}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove All Students
                </Button>

                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium text-white">Class Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Students:</span>
                      <Badge className="bg-white text-black">{students.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Attendance:</span>
                      <Badge className="bg-white text-black">
                        {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + getAttendancePercentage(s), 0) / students.length) : 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <div className="mt-8">
            <Tabs defaultValue="students" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-2 border-white">
                <TabsTrigger value="students" className="data-[state=active]:bg-white data-[state=active]:text-black text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Students ({filteredStudents.length})
                </TabsTrigger>
                <TabsTrigger value="schedule" className="data-[state=active]:bg-white data-[state=active]:text-black text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule ({timetable.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="mt-6">
                <Card className="border-2 border-white shadow-xl bg-black">
                  <CardHeader className="bg-gray-900 border-b-2 border-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Users className="w-5 h-5 text-white" />
                          Students Management
                        </CardTitle>
                        <CardDescription className="text-gray-300">View and manage student attendance, marks, and profiles</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
                          <Input
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 min-w-[200px] border-2 border-white focus:border-gray-200 bg-black text-white placeholder:text-gray-400"
                          />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="w-[150px] border-2 border-white bg-black text-white">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-2 border-white bg-black text-white">
                            <SelectItem value="all">All Students</SelectItem>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="proxy">Proxy Flagged</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-white hover:bg-white border-b-2 border-white">
                            <TableHead className="text-black font-bold">Student</TableHead>
                            <TableHead className="text-black font-bold">Attendance</TableHead>
                            <TableHead className="text-black font-bold">Progress</TableHead>
                            <TableHead className="text-black font-bold">Marks</TableHead>
                            <TableHead className="text-black font-bold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-12 text-gray-300">
                                {searchTerm || filterType !== 'all' ? 'No students match your criteria' : 'No students enrolled yet'}
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredStudents.map((student) => {
                              const isPresent = student.lastAttendance.status === 'present'
                              const isProxy = student.lastAttendance.proxy
                              const attendancePercentage = getAttendancePercentage(student)
                              
                              return (
                                <TableRow key={student.id} className="hover:bg-gray-900 transition-colors group border-b border-gray-700">
                                  <TableCell>
                                    <HoverCard>
                                      <HoverCardTrigger asChild>
                                        <div className="flex items-center gap-3 cursor-pointer">
                                          <Avatar className="w-10 h-10 ring-2 ring-gray-700 group-hover:ring-white transition-all">
                                            <AvatarFallback className="bg-white text-black text-lg font-bold">
                                              {student.avatar}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p className="font-medium text-white group-hover:text-gray-300 transition-colors">{student.name}</p>
                                            <p className="text-sm text-gray-400">{student.id}</p>
                                          </div>
                                          {isProxy && (
                                            <Badge className="ml-2 bg-white text-black">
                                              <ShieldAlert className="w-3 h-3 mr-1" />
                                              Proxy
                                            </Badge>
                                          )}
                                        </div>
                                      </HoverCardTrigger>
                                      <HoverCardContent className="w-80">
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12">
                                              <AvatarFallback className="text-lg">{student.avatar}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <h4 className="font-semibold">{student.name}</h4>
                                              <p className="text-sm text-slate-500">{student.email}</p>
                                            </div>
                                          </div>
                                          <Separator />
                                          <div className="space-y-2 text-sm">
                                            <div><span className="font-medium text-white">Department:</span> <span className="text-gray-300">{student.profile.dept}</span></div>
                                            <div><span className="font-medium text-white">Year:</span> <span className="text-gray-300">{student.profile.year}</span></div>
                                            <div><span className="font-medium text-white">Attendance:</span> <span className="text-gray-300">{student.attendanceSummary.present}/{student.attendanceSummary.total} ({attendancePercentage}%)</span></div>
                                          </div>
                                        </div>
                                      </HoverCardContent>
                                    </HoverCard>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-2">
                                      <Badge className={
                                        isPresent 
                                          ? isProxy 
                                            ? 'bg-gray-400 text-black' 
                                            : 'bg-white text-black'
                                          : 'bg-gray-800 text-white'
                                      }>
                                        {isPresent ? (
                                          <>
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Present
                                          </>
                                        ) : (
                                          <>
                                            <XCircle className="w-3 h-3 mr-1" />
                                            Absent
                                          </>
                                        )}
                                      </Badge>
                                      <div className="text-xs text-gray-400">
                                        By {student.lastAttendance.markedBy}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Attendance</span>
                                        <span className="font-medium text-white">{attendancePercentage}%</span>
                                      </div>
                                      <Progress value={attendancePercentage} className="h-2 bg-gray-800" />
                                      <div className="text-xs text-gray-400">
                                        {student.attendanceSummary.present}/{student.attendanceSummary.total} classes
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      <Badge className="text-xs bg-white text-black">
                                        M: {student.marks.maths}
                                      </Badge>
                                      <Badge className="text-xs bg-gray-800 text-white">
                                        S: {student.marks.science}
                                      </Badge>
                                      <Badge className="text-xs bg-white text-black">
                                        E: {student.marks.english}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleAttendance(student.id)}
                                            className="border-2 border-white hover:bg-white hover:text-black transition-all text-white"
                                          >
                                            {isPresent ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {isPresent ? 'Mark Absent' : 'Mark Present'}
                                        </TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleProxy(student.id)}
                                            className={`border-2 transition-all ${
                                              isProxy 
                                                ? 'bg-white text-black border-white hover:bg-gray-200' 
                                                : 'border-white hover:bg-white hover:text-black text-white'
                                            }`}
                                          >
                                            <ShieldAlert className="w-4 h-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {isProxy ? 'Clear Proxy Flag' : 'Flag as Proxy'}
                                        </TooltipContent>
                                      </Tooltip>

                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="outline" size="sm" className="border-2 border-white hover:bg-white hover:text-black transition-all text-white">
                                            <MoreHorizontal className="w-4 h-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                          <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                                            <User className="w-4 h-4 mr-2" />
                                            View Profile
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Edit Details
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() => removeStudent(student.id)}
                                            className="text-white hover:text-black hover:bg-white"
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Remove Student
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="mt-6">
                <Card className="border-2 border-white shadow-xl bg-black">
                  <CardHeader className="bg-gray-900 border-b-2 border-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Calendar className="w-5 h-5 text-white" />
                          Class Schedule
                        </CardTitle>
                        <CardDescription className="text-gray-300">Manage your weekly timetable</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Add Schedule Form */}
                    <Card className="mb-6 bg-gray-950 border-2 border-white">
                      <CardContent className="p-6">
                        <h4 className="font-medium text-white mb-4">Add New Time Slot</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                          <div className="space-y-2">
                            <Label htmlFor="day" className="text-white font-medium">Day</Label>
                            <Select value={newSlot.day} onValueChange={(value) => setNewSlot(s => ({ ...s, day: value }))}>
                              <SelectTrigger className="border-2 border-white bg-black text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-2 border-white bg-black text-white">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                  <SelectItem key={day} value={day}>{day}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                            <Label htmlFor="subject" className="text-white font-medium">Subject</Label>
                            <Input
                              id="subject"
                              placeholder="Subject name"
                              value={newSlot.subject}
                              onChange={(e) => setNewSlot(s => ({ ...s, subject: e.target.value }))}
                              className="border-2 border-white focus:border-gray-200 bg-black text-white placeholder:text-gray-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="start-time" className="text-white font-medium">Start Time</Label>
                            <Input
                              id="start-time"
                              type="time"
                              value={newSlot.start}
                              onChange={(e) => setNewSlot(s => ({ ...s, start: e.target.value }))}
                              className="border-2 border-white focus:border-gray-200 bg-black text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="end-time" className="text-white font-medium">End Time</Label>
                            <Input
                              id="end-time"
                              type="time"
                              value={newSlot.end}
                              onChange={(e) => setNewSlot(s => ({ ...s, end: e.target.value }))}
                              className="border-2 border-white focus:border-gray-200 bg-black text-white"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button onClick={addSlot} className="bg-white hover:bg-gray-200 text-black transition-colors">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add Time Slot
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Schedule Table */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-white hover:bg-white border-b-2 border-white">
                            <TableHead className="text-black font-bold">Day</TableHead>
                            <TableHead className="text-black font-bold">Subject</TableHead>
                            <TableHead className="text-black font-bold">Time</TableHead>
                            <TableHead className="text-black font-bold">Duration</TableHead>
                            <TableHead className="text-black font-bold text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {timetable.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-12 text-gray-300">
                                No schedule slots added yet. Create your first slot above.
                              </TableCell>
                            </TableRow>
                          ) : (
                            timetable.map((slot) => {
                              const startTime = new Date(`2000-01-01T${slot.start}:00`)
                              const endTime = new Date(`2000-01-01T${slot.end}:00`)
                              const duration = Math.round((endTime - startTime) / (1000 * 60))

                              return (
                                <TableRow key={slot.id} className="hover:bg-gray-900 transition-colors group border-b border-gray-700">
                                  <TableCell>
                                    <Badge className="font-medium bg-white text-black">
                                      {slot.day}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-medium text-white group-hover:text-gray-300 transition-colors">
                                    {slot.subject}
                                  </TableCell>
                                  <TableCell className="font-mono text-sm text-gray-400">
                                    {slot.start} - {slot.end}
                                  </TableCell>
                                  <TableCell className="text-gray-400">
                                    {Math.floor(duration / 60)}h {duration % 60}m
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => removeSlot(slot.id)}
                                          className="border-2 border-white hover:bg-white hover:text-black transition-all text-white"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Remove time slot
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Student Profile Dialog */}
          <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-2 border-white bg-black">
              {selectedStudent && (
                <>
                  <DialogHeader className="border-b border-gray-800 pb-4">
                    <DialogTitle className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="text-2xl bg-white text-black font-bold">
                          {selectedStudent.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-xl text-white">{selectedStudent.name}</div>
                        <div className="text-sm text-gray-300 font-normal">
                          {selectedStudent.id} • {selectedStudent.email}
                        </div>
                      </div>
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                    <Card className="border-2 border-white bg-black">
                      <CardHeader className="pb-3 bg-gray-950 border-b border-white">
                        <CardTitle className="text-lg text-white">Profile Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm p-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Year:</span>
                          <span className="font-medium text-white">{selectedStudent.profile.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Department:</span>
                          <span className="font-medium text-white">{selectedStudent.profile.dept}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Attendance:</span>
                          <span className="font-medium text-white">{selectedStudent.lastAttendance.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Attendance:</span>
                          <span className="font-medium text-white">
                            {selectedStudent.attendanceSummary.present}/{selectedStudent.attendanceSummary.total} 
                            ({getAttendancePercentage(selectedStudent)}%)
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-white bg-black">
                      <CardHeader className="pb-3 bg-gray-950 border-b border-white">
                        <CardTitle className="text-lg text-white">Academic Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Mathematics</span>
                            <Badge className="font-bold bg-white text-black">{selectedStudent.marks.maths}/100</Badge>
                          </div>
                          <Progress value={selectedStudent.marks.maths} className="h-2 bg-gray-800" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Science</span>
                            <Badge className="font-bold bg-white text-black">{selectedStudent.marks.science}/100</Badge>
                          </div>
                          <Progress value={selectedStudent.marks.science} className="h-2 bg-gray-800" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">English</span>
                            <Badge className="font-bold bg-white text-black">{selectedStudent.marks.english}/100</Badge>
                          </div>
                          <Progress value={selectedStudent.marks.english} className="h-2 bg-gray-800" />
                        </div>
                        <Separator className="bg-white" />
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-medium text-white">Average:</span>
                          <Badge className="bg-white text-black">
                            {Math.round((selectedStudent.marks.maths + selectedStudent.marks.science + selectedStudent.marks.english) / 3)}/100
                          </Badge>
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
    </TooltipProvider>
  )
}

export default TeacherDashboard