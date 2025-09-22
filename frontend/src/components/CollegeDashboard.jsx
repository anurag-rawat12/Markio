import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Calendar, Clock, Users, Timer, Copy, RefreshCcw, X, CheckCircle2, XCircle,
  Edit3, Trash2, PlusCircle, ShieldAlert, User, MoreHorizontal,
  Search, Filter, Bell, LogOut, Book, TrendingUp,
  Activity, BookOpen, GraduationCap, Building2, UserPlus, Settings,
  FileText, BarChart3, MapPin, Phone, Mail
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import TimeTableSection from './TimeTableSection'
import { HeaderDock } from '@/components/ui/header-dock'

const CollegeDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showAddBranch, setShowAddBranch] = useState(false)
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [showAddTimetable, setShowAddTimetable] = useState(false)
  const [showEditBranch, setShowEditBranch] = useState(false)
  const [showEditTeacher, setShowEditTeacher] = useState(false)
  const [showEditTimetable, setShowEditTimetable] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const params = useParams();

  // Branches data
  const [branches, setBranches] = useState([])

  // Teachers data
  const [teachers, setTeachers] = useState([])
  const [collegeData, setCollegeData] = useState({})


  useEffect(() => {
    const getTeachers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8000/api/teachers/college/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTeachers(data.teachers || []);
        } else {
          console.error("Failed to fetch teachers:", response.status);
          setTeachers([]);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setTeachers([]);
      }
    }

    const getStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8000/api/students/college/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students || []);
        } else {
          console.error("Failed to fetch students:", response.status);
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      }
    }

    const getCollege = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/colleges/${params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })
      const data = await response.json();
      if (response.ok) {
        setCollegeData(data);
      } else {
        console.error("Failed to fetch college:", data);
      }
    }

    getCollege();
    getTeachers();
    getStudents();
  }, [params.id]);

  // Students data
  const [students, setStudents] = useState([])

  // Timetable data

  const [newTeacher, setNewTeacher] = useState({
    name: '', email: '', subject: '', experience: '', phone: ''
  })

  const [newTimetable, setNewTimetable] = useState({
    branch: '', day: '', subject: '', teacher: '', startTime: '', endTime: '', room: ''
  })

  const [newBranch, setNewBranch] = useState({
    branchCode: '', branchName: '', year: 1, coordinator: '', section: ''
  })
  // Action handlers
  const handleAddBranch = async () => {
    if (newBranch.branchCode && newBranch.branchName && newBranch.section && newBranch.year && newBranch.coordinator) {

      const collegeId = params.id;

      const newBranchItem = {
        collegeId: collegeId,
        branchCode: newBranch.branchCode,
        branchName: newBranch.branchName,
        year: newBranch.year,
        coordinator: newBranch.coordinator,
        students: 0,
        section: newBranch.section
      }
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/branches/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newBranchItem)
      })

      console.log("response ", response)

      if (response.ok) {
        const createdBranch = await response.json()
        setBranches([...branches, createdBranch])
        setNewBranch({ branchCode: '', branchName: '', year: 1, coordinator: '', section: '' })
        setShowAddBranch(false)
        alert('Branch created successfully!')
      } else {
        alert('Failed to create branch')
      }

    } else {
      alert('Please fill all required fields')
    }
  }

  useEffect(() => {
    const fetchBranches = async () => {

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/branches/get/${params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔑 Include JWT here
        },
      })
      if (response.ok) {
        const data = await response.json()
        setBranches(data.branches || [])
      } else {
        console.error("Failed to fetch branches")
      }
    }
    fetchBranches()
  }, [])


  const handleEditBranch = (branch) => {
    setSelectedItem(branch)
    setNewBranch(branch)
    setShowEditBranch(true)
  }

  const handleUpdateBranch = () => {
    setBranches(branches.map(branch =>
      branch.id === selectedItem.id ? { ...branch, ...newBranch } : branch
    ))
    setShowEditBranch(false)
    setSelectedItem(null)
    setNewBranch({ name: '', fullName: '', year: 1, coordinator: '' })
    alert('Branch updated successfully!')
  }

  const handleDeleteBranch = (branchId) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      setBranches(branches.filter(branch => branch.id !== branchId))
      alert('Branch deleted successfully!')
    }
  }


  const handleViewBranchStudents = (branch) => {
    setSelectedBranch(branch.name)
    setActiveSection('students')
    alert(`Viewing students for ${branch.name}`)
  }

  // Utility functions
  const getAttendancePercentage = (student) => {
    if (!student.attendance) return 0;
    const { present = 0, total = 1 } = student.attendance;
    return Math.round((present / total) * 100);
  };

  // Filtered data
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'all' || student.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  const filteredTeachers = teachers.filter(teacher => {
    return teacher.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           teacher.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Get statistics
  const getStatistics = () => {
    const totalStudents = students.length
    const totalTeachers = teachers.length
    const totalBranches = branches.length
    const averageAttendance = students.length > 0 ? Math.round(
      students.reduce((acc, student) => {
        const percentage = getAttendancePercentage(student);
        return acc + percentage;
      }, 0) / students.length
    ) : 0

    return { totalStudents, totalTeachers, totalBranches, averageAttendance }
  }

  const stats = getStatistics()

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'branches', label: 'Branches', icon: Building2 },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'timetable', label: 'Timetable', icon: Calendar }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 bg-black z-0">
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
          className={`fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-in-out flex flex-col ${sidebarHovered ? 'w-80' : 'w-16'
            }`}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <div className="h-full bg-white/8 backdrop-blur-3xl border-r border-white/20 shadow-2xl">
            {/* College Profile Section */}
            <div className="p-6 border-b border-white/20">
              <div className={`transition-all duration-300 ${sidebarHovered ? 'flex items-center gap-3 mb-4' : 'flex justify-center items-center mb-6 w-full'}`}>
                <Avatar className={`transition-all duration-300 flex-shrink-0 backdrop-blur-sm ${sidebarHovered ? 'w-12 h-12' : 'w-8 h-8'}`}>
                  <AvatarFallback className={`bg-white/90 text-black font-bold backdrop-blur-sm ${sidebarHovered ? 'text-xl' : 'text-sm'}`}>
                    {collegeData.institutionName
                      ? collegeData.institutionName
                        .split(' ')
                        .map(word => word[0])
                        .join('')
                        .toUpperCase()
                      : ''}
                  </AvatarFallback>
                </Avatar>
                <div className={`transition-all duration-300 overflow-hidden ${sidebarHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                  <h2 className="font-bold text-white whitespace-nowrap">{collegeData.institutionName || ''}</h2>
                  <p className="text-white/70 text-sm whitespace-nowrap">{collegeData.email || ''}</p>
                </div>
              </div>
              {/* Current Time & Stats */}
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

              {/* Quick Stats */}
              <div className={`transition-all duration-300 overflow-hidden ${sidebarHovered ? 'opacity-100 max-h-48' : 'opacity-0 max-h-0'
                }`}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-500/20 backdrop-blur-2xl border border-blue-500/40 rounded-xl p-2">
                    <div className="text-xs text-blue-300 font-medium">Students</div>
                    <div className="font-bold text-blue-200">{stats.totalStudents}</div>
                  </div>
                  <div className="bg-green-500/20 backdrop-blur-2xl border border-green-500/40 rounded-xl p-2">
                    <div className="text-xs text-green-300 font-medium">Teachers</div>
                    <div className="font-bold text-green-200">{stats.totalTeachers}</div>
                  </div>
                </div>
              </div>
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
                <Link to="/college/login" className={`flex items-center w-full ${sidebarHovered ? 'gap-2' : 'justify-center'
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
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="h-full overflow-y-auto p-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
              <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 animate-in fade-in-0 slide-in-from-top-2 duration-700 delay-100">
                  <h1 className="text-5xl font-extrabold text-white mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}>College Dashboard</h1>
                  <p className="text-white/80 text-lg">Welcome to {collegeData.institutionName} management portal</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-400" />
                        Total Students
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{stats.totalStudents}</div>
                      <p className="text-white/60 text-sm">Across all branches</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-400">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-400" />
                        Total Teachers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{stats.totalTeachers}</div>
                      <p className="text-white/60 text-sm">Faculty members</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-400" />
                        Branches
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{stats.totalBranches}</div>
                      <p className="text-white/60 text-sm">Active branches</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-orange-400" />
                        Avg Attendance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{stats.averageAttendance}%</div>
                      <p className="text-white/60 text-sm">Overall performance</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                    <CardDescription className="text-white/70">Latest updates from your institution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-800">
                        <UserPlus className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-white text-sm">New student enrolled in IT-A</p>
                          <p className="text-white/60 text-xs">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-900">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white text-sm">Timetable updated for CS-A</p>
                          <p className="text-white/60 text-xs">5 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-1000">
                        <Users className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-white text-sm">New teacher assigned to ME-A</p>
                          <p className="text-white/60 text-xs">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Branches Section */}
          {activeSection === 'branches' && (
            <div className="h-full overflow-y-auto p-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
              <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header with Add Button */}
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-5xl font-extrabold text-white mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}>Branches Management</h1>
                    <p className="text-white/80 text-lg">Manage all academic branches and sections</p>
                  </div>
                  <Dialog open={showAddBranch} onOpenChange={setShowAddBranch}>
                    <DialogTrigger asChild>
                      <Button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Branch
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/80 backdrop-blur-2xl border border-white/20 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add New Branch</DialogTitle>
                        <DialogDescription className="text-white/70">
                          Create a new academic branch or section
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">Branch Code</Label>
                          <Input
                            placeholder="IT"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newBranch.branchCode}
                            onChange={(e) => setNewBranch({ ...newBranch, branchCode: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Section</Label>
                          <Input
                            placeholder="C"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newBranch.section}
                            onChange={(e) => setNewBranch({ ...newBranch, section: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Branch Name</Label>
                          <Input
                            placeholder="e.g., Information Technology - Section C"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newBranch.branchName}
                            onChange={(e) => setNewBranch({ ...newBranch, branchName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Year</Label>
                          <Select value={newBranch.year.toString()} onValueChange={(value) => setNewBranch({ ...newBranch, year: parseInt(value) })}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1st Year</SelectItem>
                              <SelectItem value="2">2nd Year</SelectItem>
                              <SelectItem value="3">3rd Year</SelectItem>
                              <SelectItem value="4">4th Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-white">Coordinator</Label>
                          <select
                            value={newBranch.coordinator}
                            onChange={(e) => setNewBranch({ ...newBranch, coordinator: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-lg px-3 py-2"
                            required
                          >
                            <option value="">Select Coordinator</option>
                            {teachers.map((teacher) => (
                              <option key={teacher._id} value={teacher._id}>
                                {teacher.fullName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          onClick={handleAddBranch}
                          className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                        >
                          Create Branch
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Branch Dialog */}
                  <Dialog open={showEditBranch} onOpenChange={setShowEditBranch}>
                    <DialogContent className="bg-black/80 backdrop-blur-2xl border border-white/20 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-white">Edit Branch</DialogTitle>
                        <DialogDescription className="text-white/70">
                          Update branch information
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">Branch Code</Label>
                          <Input
                            placeholder="e.g., IT-C"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newBranch.name}
                            onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Full Name</Label>
                          <Input
                            placeholder="e.g., Information Technology - Section C"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newBranch.fullName}
                            onChange={(e) => setNewBranch({ ...newBranch, fullName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Year</Label>
                          <Select value={newBranch.year.toString()} onValueChange={(value) => setNewBranch({ ...newBranch, year: parseInt(value) })}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1st Year</SelectItem>
                              <SelectItem value="2">2nd Year</SelectItem>
                              <SelectItem value="3">3rd Year</SelectItem>
                              <SelectItem value="4">4th Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-white">Coordinator</Label>
                          <select
                            value={newBranch.coordinator}
                            onChange={(e) => setNewBranch({ ...newBranch, coordinator: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-lg px-3 py-2"
                            required
                          >
                            <option value="">Select Coordinator</option>
                            {teachers.map((teacher) => (
                              <option key={teacher._id} value={teacher._id}>
                                {teacher.fullName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Button
                          onClick={handleUpdateBranch}
                          className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                        >
                          Update Branch
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Branches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {branches.map((branch, index) => (
                    <Card
                      key={index}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-white text-xl">{branch.branchName}</CardTitle>
                            <CardDescription className="text-white/70 text-sm mt-1">
                              {branch.section}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-black/80 backdrop-blur-2xl border border-white/20">
                              <DropdownMenuItem
                                className="text-white hover:bg-white/10"
                                onClick={() => handleEditBranch(branch)}
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Branch
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-white hover:bg-white/10"
                                onClick={() => handleViewBranchStudents(branch)}
                              >
                                <Users className="w-4 h-4 mr-2" />
                                View Students
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-400 hover:bg-red-500/10"
                                onClick={() => handleDeleteBranch(branch._id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Branch
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-white/70 text-sm">Year:</span>
                            <Badge variant="outline" className="border-white/30 text-white">
                              {branch.year}
                              {branch.year === 1
                                ? "st"
                                : branch.year === 2
                                  ? "nd"
                                  : branch.year === 3
                                    ? "rd"
                                    : "th"}{" "}
                              Year
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/70 text-sm">Students:</span>
                            <span className="text-white font-medium">{branch.students.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/70 text-sm">Coordinator:</span>
                            <span className="text-white font-medium text-sm">
                              {branch.coordinator?.fullName || "N/A"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

              </div>
            </div>
          )}
          {/* Teachers Section */}
          {activeSection === 'teachers' && (
            <div className="h-full overflow-y-auto p-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
              <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header with Add Button */}
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-5xl font-extrabold text-white mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}>Teachers Management</h1>
                    <p className="text-white/80 text-lg">Manage faculty members and their assignments</p>
                  </div>
                  <Dialog open={showAddTeacher} onOpenChange={setShowAddTeacher}>
                    <DialogTrigger asChild>
                      <Button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Teacher
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/80 backdrop-blur-2xl border border-white/20 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add New Teacher</DialogTitle>
                        <DialogDescription className="text-white/70">
                          Add a new faculty member to your institution
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">Full Name</Label>
                          <Input
                            placeholder="Teacher's full name"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newTeacher.name}
                            onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Email</Label>
                          <Input
                            type="email"
                            placeholder="teacher@techverse.edu"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newTeacher.email}
                            onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Subject Specialization</Label>
                          <Input
                            placeholder="e.g., Database Management"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newTeacher.subject}
                            onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Experience</Label>
                          <Input
                            placeholder="e.g., 5 years"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newTeacher.experience}
                            onChange={(e) => setNewTeacher({ ...newTeacher, experience: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Phone</Label>
                          <Input
                            placeholder="+1 234-567-8900"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newTeacher.phone}
                            onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                          />
                        </div>
                        <Button
                          onClick={handleAddTeacher}
                          className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                        >
                          Add Teacher
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Teacher Dialog */}
                  <Dialog open={showEditTeacher} onOpenChange={setShowEditTeacher}>
                    <DialogContent className="bg-black/80 backdrop-blur-2xl border border-white/20 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-white">Edit Teacher</DialogTitle>
                        <DialogDescription className="text-white/70">
                          Update teacher information
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">Full Name</Label>
                          <Input
                            placeholder="Teacher's full name"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newTeacher.name}
                            onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Email</Label>
                          <Input
                            type="email"
                            placeholder="teacher@techverse.edu"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newTeacher.email}
                            onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Subject Specialization</Label>
                          <Input
                            placeholder="e.g., Database Management"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newTeacher.subject}
                            onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Experience</Label>
                          <Input
                            placeholder="e.g., 5 years"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newTeacher.experience}
                            onChange={(e) => setNewTeacher({ ...newTeacher, experience: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Phone</Label>
                          <Input
                            placeholder="+1 234-567-8900"
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            value={newTeacher.phone}
                            onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                          />
                        </div>
                        <Button
                          onClick={handleUpdateTeacher}
                          className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                        >
                          Update Teacher
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                    <Input
                      placeholder="Search teachers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
                    />
                  </div>
                </div>

                {/* Teachers Table */}
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">Faculty Members</CardTitle>
                    <CardDescription className="text-white/70">
                      Showing {filteredTeachers.length} teachers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-white/80">Teacher</TableHead>
                          <TableHead className="text-white/80">Subject</TableHead>
                          <TableHead className="text-white/80">Branches</TableHead>
                          <TableHead className="text-white/80">Experience</TableHead>
                          <TableHead className="text-white/80">Contact</TableHead>
                          <TableHead className="text-white/80">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
                          <TableRow key={teacher._id} className="border-white/10">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-white/20 text-white">
                                    {teacher.fullName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-white">{teacher.fullName}</div>
                                  <div className="text-sm text-white/60">{teacher.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-white">{teacher.subject || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-white/30 text-white text-xs">
                                {teacher.institutionName?.institutionName || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white">{teacher.experience || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-white/70 text-sm">
                                <Mail className="w-3 h-3" />
                                {teacher.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-black/80 backdrop-blur-2xl border border-white/20">
                                  <DropdownMenuItem className="text-white hover:bg-white/10">
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-white hover:bg-white/10">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    View Schedule
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow className="border-white/10">
                            <TableCell colSpan={6} className="text-center text-white/60 py-8">
                              No teachers found for this college
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Students Section */}
          {activeSection === 'students' && (
            <div className="h-full overflow-y-auto p-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
              <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-5xl font-extrabold text-white mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}>Students Management</h1>
                    <p className="text-white/80 text-lg">Manage all students across branches</p>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
                    />
                  </div>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Filter by branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Students Table */}
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">Students</CardTitle>
                    <CardDescription className="text-white/70">
                      Showing
                      {filteredStudents.length}
                      students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-white/80">Student</TableHead>
                          <TableHead className="text-white/80">Roll Number</TableHead>
                          <TableHead className="text-white/80">Branch</TableHead>
                          <TableHead className="text-white/80">Year</TableHead>
                          <TableHead className="text-white/80">Attendance</TableHead>
                          <TableHead className="text-white/80">Contact</TableHead>
                          <TableHead className="text-white/80">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                          <TableRow key={student._id} className="border-white/10">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-white/20 text-white">
                                    {student.fullName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-white">{student.fullName}</div>
                                  <div className="text-sm text-white/60">{student.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-white font-mono">{student.enrollmentNumber}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-white/30 text-white">
                                {student.institutionName?.institutionName || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white">{student.year || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getAttendancePercentage(student) >= 85 ? 'bg-green-400' :
                                  getAttendancePercentage(student) >= 75 ? 'bg-yellow-400' : 'bg-red-400'
                                  }`} />
                                <span className="text-white">{getAttendancePercentage(student)}%</span>
                                <span className="text-white/60 text-sm">
                                  (N/A)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-white/70 text-sm">
                                <Mail className="w-3 h-3" />
                                {student.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-black/80 backdrop-blur-2xl border border-white/20">
                                  <DropdownMenuItem className="text-white hover:bg-white/10">
                                    <User className="w-4 h-4 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-white hover:bg-white/10">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    View Records
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-white hover:bg-white/10">
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit Info
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow className="border-white/10">
                            <TableCell colSpan={7} className="text-center text-white/60 py-8">
                              No students found for this college
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Timetable Section */}
          {activeSection === 'timetable' && (
            <TimeTableSection />
          )}

        </div>
      </div>
    </div>
  )
}

export default CollegeDashboard
