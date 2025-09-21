import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Calendar, Clock, Users, Timer, Copy, RefreshCcw, X, CheckCircle2, XCircle,
  Edit3, Trash2, PlusCircle, ShieldAlert, User, MoreHorizontal,
  Search, Filter, Bell, LogOut, Book, TrendingUp,
  Activity, BookOpen, GraduationCap, Plus
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
import useCurrentClass from './useCurrentClass'
import { getInitials } from '@/utils/util'

const TeacherDashboard = () => {
  const [activeSection, setActiveSection] = useState('timetable');
  const [selectedClass, setSelectedClass] = useState('IT-A');
  const [attendanceCode, setAttendanceCode] = useState(null)
  const navigate = useNavigate();
  const [remaining, setRemaining] = useState(0)
  const [copied, setCopied] = useState(false)
  const [studentCount, setStudentCount] = useState(30) // Default to 30 students
  const [showStudentInput, setShowStudentInput] = useState(false)
  const [attendanceSessionId, setAttendanceSessionId] = useState(null)
  const [attendanceStats, setAttendanceStats] = useState({
    totalStudents: 0,
    attendanceMarked: 0,
    sessionStatus: null,
    expirationTime: null
  })
  const [teacherData, setTeacherData] = useState({});
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [newStudent, setNewStudent] = useState({
    id: '',
    name: '',
    email: '',
    avatar: 'S',
    class: selectedClass
  });

  const params = useParams();

  // -----------------------------------
  // Fetch timetable data for the teacher
  // -----------------------------------
  const fetchTimetableData = async (teacherId) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const API_BASE_URL = 'http://localhost:8000/api';

      console.log('Fetching timetable for teacher ID:', teacherId);

      const response = await fetch(`${API_BASE_URL}/timetables/teacher/${teacherId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Timetable data received:', data);


      if (data.schedule && Array.isArray(data.schedule)) {
        const transformedSchedule = data.schedule.map(item => ({
          id: item.id,
          day: item.day,
          subject: item.subject,
          class: `${item.branch?.branchName || 'Unknown'}-${item.section || 'A'}`,
          startTime: item.startTime,
          endTime: item.endTime,
          room: item.room || `Room ${item.periodNumber}`,
          periodNumber: item.periodNumber,
          timetableId: item.timetableId,
          totalClassesConducted: item.totalClassesConducted || 0,
          totalStudentsAttended: item.totalStudentsAttended || 0,
          attendancePercentage: item.attendancePercentage || 0,
          attendanceHistory: item.attendanceHistory || []
        }));

        setTimetable(transformedSchedule);

        const uniqueClasses = [...new Set(transformedSchedule.map(item => item.class))];
        setTeacherData(prev => ({ ...prev, classes: uniqueClasses }));

        console.log('Transformed timetable:', transformedSchedule);
      } else {
        console.log('No schedule data found');
        setTimetable([]);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError(`Failed to load timetable: ${error.message}`);
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  };

  const getTeacher = async (teacherId) => {
    try {
      const token = localStorage.getItem('token');
      const id = teacherId || params.id;
      const response = await fetch(`http://localhost:8000/api/teachers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("teacher",data)
        setTeacherData(data.teacher);
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    }
  };



  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    getTeacher(params.id);
    fetchTimetableData(params.id);
  }, [params.id, navigate]);

  // -----------------------------------
  // Attendance timer
  // -----------------------------------
  useEffect(() => {
    let interval;
    if (attendanceCode && remaining > 0) {
      interval = setInterval(() => {
        setRemaining(r => r - 1);
      }, 1000);
    } else if (remaining === 0 && attendanceCode) {
      setAttendanceCode(null);
    }
    return () => {
      clearInterval(interval);
      // Also cleanup attendance polling on unmount
      if (window.attendancePollingInterval) {
        clearInterval(window.attendancePollingInterval);
        window.attendancePollingInterval = null;
      }
    };
  }, [attendanceCode, remaining]);

  // -----------------------------------
  // Current and next class using hook
  // -----------------------------------
  const { currentClassData, currentTime } = useCurrentClass(timetable);

  // -----------------------------------
  // Get today's classes
  // -----------------------------------
  const getTodayClasses = () => {
    const today = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    return timetable
      .filter(slot => slot.day === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Function to initialize attendance session with API
  const generateCode = async () => {
    if (!currentClass) {
      setError('No active class found. Please select a class with a current time slot.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = 'http://localhost:8000/api';
      console.log('Sending request to initialize attendance session...', currentClass);


      const response = await fetch(`${API_BASE_URL}/attendance/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timetableId: currentClass.timetableId,
          day: currentClass.day,
          periodNumber: currentClass.periodNumber,
          totalStudents: studentCount,
          teacherId: params.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initialize attendance');
      }

      const data = await response.json();
      console.log('Attendance session initialized:', data);

      setAttendanceCode(data.attendanceCode);
      setAttendanceSessionId(data.sessionId);
      setAttendanceStats({
        totalStudents: data.totalStudents,
        attendanceMarked: 0,
        sessionStatus: 'active',
        expirationTime: data.expiresAt
      });

      // Calculate remaining time from server expiry
      const expiryTime = new Date(data.expiresAt);
      const now = new Date();
      const remainingSeconds = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setRemaining(remainingSeconds);
      setCopied(false);

      // Start polling for attendance updates
      startAttendancePolling(data.sessionId);

    } catch (error) {
      console.error('Error initializing attendance:', error);
      setError(`Failed to start attendance: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to poll attendance status
  const startAttendancePolling = (sessionId) => {
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = 'http://localhost:8000/api';

        const response = await fetch(`${API_BASE_URL}/attendance/status/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAttendanceStats({
            totalStudents: data.totalStudents,
            attendanceMarked: data.attendanceMarked,
            sessionStatus: data.sessionStatus
          });

          // Auto-expire if session is completed or expired
          if (data.sessionStatus === 'completed' || data.sessionStatus === 'expired') {
            clearInterval(pollInterval);
            if (data.sessionStatus === 'completed') {
              setAttendanceCode(null);
              setRemaining(0);
              alert(`Attendance session completed! ${data.attendanceMarked}/${data.totalStudents} students marked attendance.`);
            }
          }
        }
      } catch (error) {
        console.error('Error polling attendance status:', error);
        // Don't clear interval on error, keep trying
      }
    }, 2000); // Poll every 2 seconds

    // Store interval ID to clear it later
    setAttendanceSessionId(prev => {
      if (prev && window.attendancePollingInterval) {
        clearInterval(window.attendancePollingInterval);
      }
      window.attendancePollingInterval = pollInterval;
      return sessionId;
    });
  };

  const copyCode = () => {
    if (attendanceCode) {
      navigator.clipboard.writeText(attendanceCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const endCode = () => {
    // Clear polling interval
    if (window.attendancePollingInterval) {
      clearInterval(window.attendancePollingInterval);
      window.attendancePollingInterval = null;
    }

    setAttendanceCode(null)
    setRemaining(0)
    setCopied(false)
    setAttendanceSessionId(null)
    setAttendanceStats({
      totalStudents: 0,
      attendanceMarked: 0,
      sessionStatus: null,
      expirationTime: null
    })
  }

  // Function to show/hide student count input
  const toggleStudentInput = () => {
    setShowStudentInput(!showStudentInput);
  }

  // Get current class based on real-time and day
  const getCurrentClass = () => {
    const now = currentTime
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' })
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTotalMinutes = currentHour * 60 + currentMinute

    // console.log('Current day:', currentDay, 'Current time:', `${currentHour}:${currentMinute.toString().padStart(2, '0')}`, 'Total minutes:', currentTotalMinutes)

    const foundClass = timetable.find(slot => {
      if (slot.day !== currentDay) return false

      // Parse start time
      const [startHour, startMinute] = slot.startTime.split(':').map(Number)
      const startTotalMinutes = startHour * 60 + startMinute

      // Parse end time
      const [endHour, endMinute] = slot.endTime.split(':').map(Number)
      const endTotalMinutes = endHour * 60 + endMinute

      // console.log(`Checking ${slot.subject}: ${slot.startTime}-${slot.endTime} (${startTotalMinutes}-${endTotalMinutes} minutes)`)

      return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes
    })

    // If no class found, return null (don't show demo class when loading real data)
    if (!foundClass && !loading && !error && timetable.length > 0) {
      console.log('No live class found')
      return null
    }

    return foundClass
  }

  const currentClass = getCurrentClass()



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
        {/* <video 
          autoPlay 
          loop 
          muted 
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/latest-bg.mp4" type="video/mp4" />
        </video> */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen text-white flex">
        {/* Left Sidebar */}
        <div
          className={`fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-in-out flex flex-col ${sidebarHovered ? 'w-64' : 'w-16'
            }`}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <div className="h-full bg-white/8 backdrop-blur-3xl border-r border-white/20 shadow-2xl">
            {/* Profile Section */}
            <div className="p-6 border-b border-white/20">
              <div className={`transition-all duration-300 ${sidebarHovered ? 'flex items-center gap-3 mb-4' : 'flex justify-center items-center mb-6 w-full'
                }`}>
                <Avatar className={`transition-all duration-300 flex-shrink-0 backdrop-blur-sm ${sidebarHovered ? 'w-12 h-12' : 'w-8 h-8'
                  }`}>
                  <AvatarFallback className={`bg-white/90 text-black font-bold backdrop-blur-sm ${sidebarHovered ? 'text-xl' : 'text-sm'
                    }`}>
                    {getInitials(teacherData.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className={`transition-all duration-300 overflow-hidden ${sidebarHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                  }`}>
                  <h2 className="font-bold text-white whitespace-nowrap">{teacherData.fullName}</h2>
                  <p className="text-white/70 text-sm whitespace-nowrap">{teacherData.email}</p>
                </div>
              </div>

              {/* Current Time & Class */}
              <div className={`transition-all duration-300 overflow-hidden ${sidebarHovered ? 'opacity-100 max-h-96 mb-4' : 'opacity-0 max-h-0 mb-0'
                }`}>
                <div className="bg-white/10 backdrop-blur-2xl rounded-xl p-3 border border-white/20 shadow-lg">
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
                <div className={`transition-all duration-300 overflow-hidden ${sidebarHovered ? 'opacity-100 max-h-48' : 'opacity-0 max-h-0'
                  }`}>
                  <div className="bg-green-500/20 backdrop-blur-2xl border border-green-500/40 rounded-xl p-3 shadow-lg">
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
              <div className="space-y-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center rounded-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-2xl ${sidebarHovered ? 'gap-3 px-4 py-4' : 'justify-center py-4 px-0'
                        } ${activeSection === item.id
                          ? 'bg-white/20 text-white shadow-2xl border border-white/30'
                          : 'text-white/70 hover:bg-white/15 hover:text-white border border-transparent hover:border-white/20 hover:shadow-lg'
                        }`}
                      title={!sidebarHovered ? item.label : ''}
                    >
                      <div className={`flex items-center justify-center ${sidebarHovered ? 'w-auto' : 'w-full'}`}>
                        <Icon className="w-5 h-5 flex-shrink-0" />
                      </div>
                      <span className={`font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${sidebarHovered ? 'opacity-100 w-auto ml-0' : 'opacity-0 w-0 absolute'
                        }`}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </nav>

            {/* Bottom Sign Out */}
            <div className="p-6 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full text-white/70 hover:text-white hover:bg-white/15 transition-all duration-300 hover:scale-105 transform rounded-2xl py-3 backdrop-blur-2xl border border-transparent hover:border-white/20 hover:shadow-lg ${sidebarHovered ? 'justify-start px-4' : 'justify-center px-0'
                  }`}
                asChild
                title={!sidebarHovered ? 'Sign Out' : ''}
              >
                <Link to="/student-teacher/login" className={`flex items-center w-full ${sidebarHovered ? 'gap-2' : 'justify-center'
                  }`}>
                  <div className={`flex items-center justify-center ${sidebarHovered ? 'w-auto' : 'w-full'}`}>
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <span className={`font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${sidebarHovered ? 'opacity-100 w-auto ml-0' : 'opacity-0 w-0 absolute'
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
            <div className="h-full overflow-y-auto p-8">
              <div className="space-y-8 max-w-7xl mx-auto">
                {/* Loading State */}
                {loading && (
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
                      <h3 className="text-xl font-semibold text-white/90 mb-2">Loading Timetable...</h3>
                      <p className="text-white/70">Fetching your schedule data</p>
                    </CardContent>
                  </Card>
                )}

                {/* Error State */}
                {error && !loading && (
                  <Card className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 shadow-2xl">
                    <CardContent className="p-8 text-center">
                      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-6 h-6 text-red-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-red-200 mb-2">Error Loading Timetable</h3>
                      <p className="text-red-300/70 mb-4">{error}</p>
                      <Button
                        onClick={() => {
                          if (teacherData.id) {
                            fetchTimetableData(teacherData.id);
                          }
                        }}
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200"
                      >
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {/* Timetable Content - Only show when loaded and no error */}
                {!loading && !error && (
                  <>
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
                                  <Timer className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Take Attendance</h3>
                              </div>
                              {/* Student Count Input */}
                              <div className="flex items-center gap-3">
                                <Label htmlFor="student-count" className="text-white text-sm font-medium">Students:</Label>
                                <Input
                                  id="student-count"
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={studentCount}
                                  onChange={(e) => setStudentCount(parseInt(e.target.value) || 30)}
                                  className="w-20 h-8 bg-white/10 backdrop-blur-md border-white/30 text-white text-center"
                                  disabled={!!attendanceCode}
                                />
                              </div>
                            </div>

                            {/* Real-time Attendance Stats */}
                            {attendanceCode && attendanceStats.sessionStatus === 'active' && (
                              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-white/70 text-sm font-medium">Attendance Progress</span>
                                  <span className="text-white font-bold">
                                    {attendanceStats.attendanceMarked}/{attendanceStats.totalStudents}
                                  </span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                  <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${attendanceStats.totalStudents > 0 ? (attendanceStats.attendanceMarked / attendanceStats.totalStudents) * 100 : 0}%`
                                    }}
                                  ></div>
                                </div>
                                <div className="text-xs text-white/60 text-center">
                                  {attendanceStats.totalStudents > 0
                                    ? Math.round((attendanceStats.attendanceMarked / attendanceStats.totalStudents) * 100)
                                    : 0}% Complete
                                </div>
                              </div>
                            )}
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
                                    <div className="w-full bg-white/10 backdrop-blur-md rounded-full h-3 mb-2 border border-white/20">
                                      <div
                                        className="bg-gradient-to-r from-white/60 via-white/80 to-white/60 h-3 rounded-full transition-all duration-1000 shadow-lg"
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
                                  className={`p-4 rounded-lg border backdrop-blur-md transition-colors ${isCurrentClass
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
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === 'students' && (
            <div className="h-full overflow-y-auto p-8">
              <div className="space-y-8 max-w-7xl mx-auto">
                {/* Add Student Button */}
                <div className="flex justify-end">
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