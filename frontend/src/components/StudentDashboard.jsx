import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    User,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Timer,
    Bell,
    BookOpen,
    Award,
    TrendingUp,
    TrendingDown,
    Users,
    LogOut,
    Shield,
    Activity,
    Hash,
    Edit,
    Save,
    X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { Alert, AlertDescription } from '@/components/ui/alert'

// Mock student data - replace with API calls later
const studentData = {
    id: 'STU001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu',
    rollNumber: '21IT001',
    branch: 'Information Technology',
    year: '3rd Year',
    section: 'IT-A',
    avatar: '🧑🏻‍🎓',
    phone: '+91 9876543210',
    address: '123 Student Lane, Mumbai, Maharashtra',
    attendance: {
        totalDays: 45,
        presentDays: 38,
        absentDays: 7,
        percentage: 84.4
    },
    subjects: [
        { name: 'Data Structures', teacher: 'Dr. Smith', attendancePercent: 90 },
        { name: 'Web Development', teacher: 'Prof. Johnson', attendancePercent: 85 },
        { name: 'Database Management', teacher: 'Dr. Brown', attendancePercent: 68 },
        { name: 'Software Engineering', teacher: 'Prof. Wilson', attendancePercent: 82 }
    ],
    recentAttendance: [
        { date: '2024-09-18', subject: 'Data Structures', status: 'present', markedBy: 'student' },
        { date: '2024-09-17', subject: 'Web Development', status: 'present', markedBy: 'teacher' },
        { date: '2024-09-16', subject: 'Database Management', status: 'absent', markedBy: 'teacher' },
        { date: '2024-09-15', subject: 'Software Engineering', status: 'present', markedBy: 'student' },
        { date: '2024-09-14', subject: 'Data Structures', status: 'absent', markedBy: 'teacher' },
        { date: '2024-09-13', subject: 'Web Development', status: 'present', markedBy: 'student' },
        { date: '2024-09-12', subject: 'Database Management', status: 'absent', markedBy: 'teacher' }
    ],
    teacherNotifications: [
        {
            id: 'notif-001',
            from: 'Dr. Brown',
            subject: 'Database Management',
            type: 'warning',
            title: 'Attendance Warning',
            message: 'Your attendance in Database Management has dropped to 68%. Please attend classes regularly or you may face academic consequences.',
            timestamp: '2024-09-18T10:30:00Z',
            isRead: false,
            severity: 'high'
        },
        {
            id: 'notif-002',
            from: 'Prof. Wilson',
            subject: 'Software Engineering',
            type: 'reminder',
            title: 'Assignment Reminder',
            message: 'Please submit your Software Engineering project by Friday. Late submissions will result in grade deduction.',
            timestamp: '2024-09-17T14:15:00Z',
            isRead: true,
            severity: 'medium'
        },
        {
            id: 'notif-003',
            from: 'Dr. Smith',
            subject: 'Data Structures',
            type: 'info',
            title: 'Class Schedule Change',
            message: 'Tomorrow\'s Data Structures class has been moved to Room A-203 due to maintenance work.',
            timestamp: '2024-09-16T16:45:00Z',
            isRead: true,
            severity: 'low'
        },
        {
            id: 'notif-004',
            from: 'Academic Office',
            subject: 'General',
            type: 'warning',
            title: 'Overall Attendance Alert',
            message: 'Student disciplinary committee has noted irregular attendance. Immediate improvement required to avoid academic probation.',
            timestamp: '2024-09-15T09:00:00Z',
            isRead: false,
            severity: 'high'
        }
    ]
}

// Mock timetable data
const timetableData = [
    { id: 1, day: 'Monday', subject: 'Data Structures', teacher: 'Dr. Smith', time: '09:00-10:00', room: 'A-101' },
    { id: 2, day: 'Monday', subject: 'Web Development', teacher: 'Prof. Johnson', time: '11:00-12:00', room: 'B-205' },
    { id: 3, day: 'Tuesday', subject: 'Database Management', teacher: 'Dr. Brown', time: '10:00-11:00', room: 'C-301' },
    { id: 4, day: 'Tuesday', subject: 'Software Engineering', teacher: 'Prof. Wilson', time: '14:00-15:00', room: 'A-102' },
    { id: 5, day: 'Wednesday', subject: 'Data Structures', teacher: 'Dr. Smith', time: '09:00-10:00', room: 'A-101' },
    { id: 6, day: 'Thursday', subject: 'Web Development', teacher: 'Prof. Johnson', time: '11:00-12:00', room: 'B-205' },
    { id: 7, day: 'Friday', subject: 'Database Management', teacher: 'Dr. Brown', time: '13:00-14:00', room: 'C-301' }
]

const StudentDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [activeSection, setActiveSection] = useState('overview')
    const [sidebarHovered, setSidebarHovered] = useState(false)
    const [attendanceCode, setAttendanceCode] = useState('')
    const [attendanceMessage, setAttendanceMessage] = useState('')
    const [notifications, setNotifications] = useState([])
    const [studentInfo, setStudentInfo] = useState(studentData)
    const [teacherNotifications, setTeacherNotifications] = useState(studentData.teacherNotifications)
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [profileSaveMessage, setProfileSaveMessage] = useState('')
    const [editableProfile, setEditableProfile] = useState({
        phone: studentInfo.phone,
        address: studentInfo.address,
        email: studentInfo.email
    })

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Check for warnings and notifications
    useEffect(() => {
        const warningNotifications = []

        // Low attendance warning
        if (studentInfo.attendance.percentage < 75) {
            warningNotifications.push({
                id: 'low-attendance',
                type: 'warning',
                title: 'Low Attendance Warning',
                message: `Your attendance is ${studentInfo.attendance.percentage}%. Minimum required is 75%.`,
                icon: AlertTriangle
            })
        }

        // Subject-wise low attendance
        studentInfo.subjects.forEach(subject => {
            if (subject.attendancePercent < 75) {
                warningNotifications.push({
                    id: `subject-${subject.name}`,
                    type: 'warning',
                    title: `Low Attendance in ${subject.name}`,
                    message: `${subject.attendancePercent}% attendance in ${subject.name}. Contact ${subject.teacher}.`,
                    icon: BookOpen
                })
            }
        })

        setNotifications(warningNotifications)
    }, [studentInfo.attendance.percentage, studentInfo.subjects])

    // Get current/ongoing class
    const getCurrentClass = () => {
        const now = new Date()
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' })
        const currentTime = now.toTimeString().slice(0, 5) // HH:MM format

        const todayClasses = timetableData.filter(item => item.day === currentDay)

        for (const classItem of todayClasses) {
            const [startTime, endTime] = classItem.time.split('-')
            if (currentTime >= startTime && currentTime <= endTime) {
                return { ...classItem, status: 'ongoing' }
            }
        }

        // Find next class
        const nextClass = todayClasses.find(classItem => {
            const [startTime] = classItem.time.split('-')
            return currentTime < startTime
        })

        if (nextClass) {
            return { ...nextClass, status: 'upcoming' }
        }

        return null
    }

    const currentClass = getCurrentClass()

    // Handle attendance code submission
    const handleAttendanceSubmit = () => {
        if (!attendanceCode.trim()) {
            setAttendanceMessage('Please enter an attendance code')
            return
        }

        // Mock validation - replace with API call
        if (attendanceCode.length === 6) {
            // Update attendance using state
            setStudentInfo(prev => {
                const newPresentDays = prev.attendance.presentDays + 1
                const newTotalDays = prev.attendance.totalDays + 1
                const newPercentage = Math.round((newPresentDays / newTotalDays) * 100 * 10) / 10

                // Add new attendance record
                const today = new Date().toISOString().split('T')[0]
                const currentClass = getCurrentClass()
                const newRecord = {
                    date: today,
                    subject: currentClass ? currentClass.subject : 'General',
                    status: 'present',
                    markedBy: 'student'
                }

                // Create updated recent attendance array
                const updatedRecentAttendance = [newRecord, ...prev.recentAttendance].slice(0, 10)

                return {
                    ...prev,
                    attendance: {
                        ...prev.attendance,
                        presentDays: newPresentDays,
                        totalDays: newTotalDays,
                        absentDays: newTotalDays - newPresentDays,
                        percentage: newPercentage
                    },
                    recentAttendance: updatedRecentAttendance
                }
            })

            setAttendanceMessage(`✅ Attendance marked successfully! Your attendance is now being updated...`)
            setAttendanceCode('')

            // Show updated percentage after state update
            setTimeout(() => {
                setStudentInfo(current => {
                    setAttendanceMessage(`✅ Attendance marked successfully! Your attendance is now ${current.attendance.percentage}%`)
                    return current
                })
            }, 100)

            setTimeout(() => setAttendanceMessage(''), 5000)
        } else {
            setAttendanceMessage('❌ Invalid attendance code. Please try again.')
            setTimeout(() => setAttendanceMessage(''), 3000)
        }
    }

    // Handle profile editing
    const handleProfileEdit = () => {
        setIsEditingProfile(true)
    }

    const handleProfileSave = () => {
        // Update student info state
        setStudentInfo(prev => ({
            ...prev,
            phone: editableProfile.phone,
            address: editableProfile.address,
            email: editableProfile.email
        }))

        setIsEditingProfile(false)
        setProfileSaveMessage('✅ Profile updated successfully!')
        setTimeout(() => setProfileSaveMessage(''), 3000)
    }

    const handleProfileCancel = () => {
        // Reset to original values
        setEditableProfile({
            phone: studentInfo.phone,
            address: studentInfo.address,
            email: studentInfo.email
        })
        setIsEditingProfile(false)
    }

    const handleProfileChange = (field, value) => {
        setEditableProfile(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // Get unread notifications count
    const unreadCount = teacherNotifications.filter(notif => !notif.isRead).length

    const navItems = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
        { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'timetable', label: 'Timetable', icon: Calendar }
    ]

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Video Background */}
            {/* <div className="fixed inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/latest-bg.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div> */}

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
                        {/* Student Profile Section */}
                        <div className="p-6 border-b border-white/20">
                            <div className={`transition-all duration-300 ${sidebarHovered ? 'flex items-center gap-3 mb-4' : 'flex justify-center items-center mb-6 w-full'
                                }`}>
                                <Avatar className={`transition-all duration-300 flex-shrink-0 backdrop-blur-sm ${sidebarHovered ? 'w-12 h-12' : 'w-8 h-8'
                                    }`}>
                                    <AvatarFallback className={`bg-white/90 text-black font-bold backdrop-blur-sm ${sidebarHovered ? 'text-xl' : 'text-sm'
                                        }`}>
                                        {studentInfo.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={`transition-all duration-300 overflow-hidden ${sidebarHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                                    }`}>
                                    <h2 className="font-bold text-white whitespace-nowrap">{studentInfo.name}</h2>
                                    <p className="text-white/70 text-sm whitespace-nowrap">{studentInfo.rollNumber}</p>
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
                                    <div className="bg-green-500/20 backdrop-blur-2xl border border-green-500/40 rounded-xl p-2">
                                        <div className="text-xs text-green-300 font-medium">Attendance</div>
                                        <div className="font-bold text-green-200">{studentInfo.attendance.percentage}%</div>
                                    </div>
                                    <div className="bg-blue-500/20 backdrop-blur-2xl border border-blue-500/40 rounded-xl p-2">
                                        <div className="text-xs text-blue-300 font-medium">Present</div>
                                        <div className="font-bold text-blue-200">{studentInfo.attendance.presentDays}</div>
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
                                            <div className={`flex items-center justify-center relative ${sidebarHovered ? 'w-auto' : 'w-full'}`}>
                                                <Icon className="w-5 h-5 flex-shrink-0" />
                                                {item.badge && item.badge > 0 && (
                                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${sidebarHovered ? 'opacity-100 w-auto ml-0' : 'opacity-0 w-0 absolute'
                                                }`}>
                                                {item.label}
                                                {item.badge && item.badge > 0 && sidebarHovered && (
                                                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                                        {item.badge}
                                                    </span>
                                                )}
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
                                <Link to="/student/login" className={`flex items-center w-full ${sidebarHovered ? 'gap-2' : 'justify-center'
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
                                    <h1 className="text-5xl font-extrabold text-white mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}>Student Dashboard</h1>
                                    <p className="text-white/80 text-lg">Welcome back, {studentInfo.name}!</p>
                                </div>


                                {/* Quick Actions Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
                                    {/* Attendance Code Entry */}
                                    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-400">
                                        <CardHeader>
                                            <CardTitle className="text-white flex items-center gap-2">
                                                <Hash className="w-5 h-5 text-blue-400" />
                                                Mark Attendance
                                            </CardTitle>
                                            <CardDescription className="text-white/70">Enter the attendance code provided by your teacher</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex gap-3">
                                                <Input
                                                    placeholder="Enter 6-digit code"
                                                    value={attendanceCode}
                                                    onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
                                                    className="bg-white/10 border-white/20 text-white placeholder-white/60"
                                                    maxLength={6}
                                                />
                                                <Button
                                                    onClick={handleAttendanceSubmit}
                                                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                                                >
                                                    Submit
                                                </Button>
                                            </div>
                                            {attendanceMessage && (
                                                <p className="text-sm text-white/90">{attendanceMessage}</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Current Class */}
                                    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-500">
                                        <CardHeader>
                                            <CardTitle className="text-white flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-orange-400" />
                                                {currentClass ? (currentClass.status === 'ongoing' ? 'Ongoing Class' : 'Next Class') : 'No Classes Today'}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {currentClass ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-white/60" />
                                                        <span className="text-white font-medium">{currentClass.subject}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-white/60" />
                                                        <span className="text-white/80">{currentClass.teacher}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Timer className="w-4 h-4 text-white/60" />
                                                        <span className="text-white/80">{currentClass.time}</span>
                                                    </div>
                                                    <Badge className={`${currentClass.status === 'ongoing' ? 'bg-green-500/20 text-green-200' : 'bg-blue-500/20 text-blue-200'}`}>
                                                        {currentClass.status === 'ongoing' ? 'Live Now' : 'Upcoming'}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <p className="text-white/70">No classes scheduled for today</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Statistics Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-600">
                                    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-700">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-white flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-green-400" />
                                                Overall Attendance
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-white">{studentInfo.attendance.percentage}%</div>
                                            <p className="text-white/60 text-sm">{studentInfo.attendance.presentDays}/{studentInfo.attendance.totalDays} days</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-800">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-white flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                                Present Days
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-white">{studentInfo.attendance.presentDays}</div>
                                            <p className="text-white/60 text-sm">Total present</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-900">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-white flex items-center gap-2">
                                                <XCircle className="w-5 h-5 text-red-400" />
                                                Absent Days
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-white">{studentInfo.attendance.absentDays}</div>
                                            <p className="text-white/60 text-sm">Total absent</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-1000">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-white flex items-center gap-2">
                                                <Bell className="w-5 h-5 text-orange-400" />
                                                New Notifications
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-white">{unreadCount}</div>
                                            <p className="text-white/60 text-sm">Unread messages</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recent Attendance */}
                                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-1100">
                                    <CardHeader>
                                        <CardTitle className="text-white">Recent Attendance</CardTitle>
                                        <CardDescription className="text-white/70">Your latest attendance records</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {studentInfo.recentAttendance.map((record, index) => (
                                                <div key={index} className={`flex items-center gap-3 p-3 bg-white/5 rounded-lg animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-${1200 + index * 100}`}>
                                                    {record.status === 'present' ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-400" />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-white text-sm font-medium">{record.subject}</p>
                                                        <p className="text-white/60 text-xs">{new Date(record.date).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Badge className={record.status === 'present' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}>
                                                            {record.status}
                                                        </Badge>
                                                        <Badge className={record.markedBy === 'student' ? 'bg-blue-500/20 text-blue-200' : 'bg-purple-500/20 text-purple-200'}>
                                                            {record.markedBy}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                        <div className="h-full overflow-y-auto p-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
                            <div className="space-y-8 max-w-7xl mx-auto">
                                {/* Header */}
                                <div className="mb-8 animate-in fade-in-0 slide-in-from-top-2 duration-700 delay-100">
                                    <h1 className="text-5xl font-extrabold text-white mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}>Notifications</h1>
                                    <p className="text-white/80 text-lg">Messages and alerts from your teachers</p>
                                </div>

                                {/* Mark All as Read Button */}
                                <div className="flex justify-between items-center animate-in fade-in-0 slide-in-from-top-4 duration-700 delay-200">
                                    <div className="flex items-center gap-4">
                                        <Badge className="bg-red-500/20 text-red-200">
                                            {unreadCount} Unread
                                        </Badge>
                                        {unreadCount > 0 && (
                                            <Button
                                                onClick={() => {
                                                    setTeacherNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
                                                }}
                                                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 text-sm"
                                            >
                                                Mark All as Read
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Notifications List */}
                                <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
                                    {teacherNotifications.map((notification, index) => {
                                        const isHighPriority = notification.severity === 'high'
                                        const timeAgo = new Date(notification.timestamp).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })

                                        return (
                                            <Card
                                                key={notification.id}
                                                className={`bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all hover:bg-white/15 cursor-pointer animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-${400 + index * 100} ${!notification.isRead ? 'ring-2 ring-blue-400/50' : ''
                                                    } ${isHighPriority ? 'border-red-400/50' : ''
                                                    }`}
                                                onClick={() => {
                                                    if (!notification.isRead) {
                                                        setTeacherNotifications(prev =>
                                                            prev.map(notif =>
                                                                notif.id === notification.id
                                                                    ? { ...notif, isRead: true }
                                                                    : notif
                                                            )
                                                        )
                                                    }
                                                }}
                                            >
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded-full ${isHighPriority ? 'bg-red-400' : notification.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                                                                }`}></div>
                                                            <div>
                                                                <CardTitle className={`text-white text-lg ${!notification.isRead ? 'font-bold' : 'font-medium'
                                                                    }`}>
                                                                    {notification.title}
                                                                </CardTitle>
                                                                <CardDescription className="text-white/70 mt-1">
                                                                    From: {notification.from} • {notification.subject}
                                                                </CardDescription>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white/60 text-xs">{timeAgo}</span>
                                                            {!notification.isRead && (
                                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-white/90 leading-relaxed">{notification.message}</p>
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <Badge className={`${notification.type === 'warning' ? 'bg-red-500/20 text-red-200' :
                                                            notification.type === 'reminder' ? 'bg-yellow-500/20 text-yellow-200' :
                                                                'bg-blue-500/20 text-blue-200'
                                                            }`}>
                                                            {notification.type}
                                                        </Badge>
                                                        <Badge className={`${isHighPriority ? 'bg-red-500/20 text-red-200' :
                                                            notification.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-200' :
                                                                'bg-green-500/20 text-green-200'
                                                            }`}>
                                                            {notification.severity} priority
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>

                                {teacherNotifications.length === 0 && (
                                    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                                        <CardContent className="p-12 text-center">
                                            <Bell className="w-16 h-16 text-white/60 mx-auto mb-4" />
                                            <h3 className="text-white text-xl font-medium mb-2">No notifications yet</h3>
                                            <p className="text-white/70">You'll see messages and alerts from your teachers here</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Attendance Section */}
                    {activeSection === 'attendance' && (
                        <div className="h-full overflow-y-auto p-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
                            <div className="space-y-8 max-w-7xl mx-auto">
                                <div>
                                    <h1 className="text-5xl font-extrabold text-white mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}>Attendance Details</h1>
                                    <p className="text-white/80 text-lg">Detailed view of your attendance records</p>
                                </div>

                                {/* Subject-wise Attendance */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {studentInfo.subjects.map((subject, index) => (
                                        <Card key={subject.name} className={`bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-${200 + index * 100}`}>
                                            <CardHeader>
                                                <CardTitle className="text-white flex items-center gap-2">
                                                    <BookOpen className="w-5 h-5 text-blue-400" />
                                                    {subject.name}
                                                </CardTitle>
                                                <CardDescription className="text-white/70">{subject.teacher}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-3xl font-bold text-white mb-2">{subject.attendancePercent}%</div>
                                                <div className="flex items-center gap-2">
                                                    {subject.attendancePercent >= 75 ? (
                                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4 text-red-400" />
                                                    )}
                                                    <span className={`text-sm ${subject.attendancePercent >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {subject.attendancePercent >= 75 ? 'Good' : 'Needs Improvement'}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Attendance History */}
                                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                                    <CardHeader>
                                        <CardTitle className="text-white">Complete Attendance History</CardTitle>
                                        <CardDescription className="text-white/70">All your attendance records</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {studentInfo.recentAttendance.map((record, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        {record.status === 'present' ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-400" />
                                                        )}
                                                        <div>
                                                            <p className="text-white font-medium">{record.subject}</p>
                                                            <p className="text-white/60 text-sm">{new Date(record.date).toLocaleDateString('en-US', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Badge className={record.status === 'present' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}>
                                                            {record.status}
                                                        </Badge>
                                                        <Badge className={record.markedBy === 'student' ? 'bg-blue-500/20 text-blue-200' : 'bg-purple-500/20 text-purple-200'}>
                                                            {record.markedBy}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <div className="h-full overflow-y-auto p-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
                            <div className="space-y-8 max-w-4xl mx-auto">
                                <div>
                                    <h1 className="text-5xl font-extrabold text-white mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}>Student Profile</h1>
                                    <p className="text-white/80 text-lg">Your personal and academic information</p>
                                </div>

                                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-20 h-20">
                                                    <AvatarFallback className="bg-white/90 text-black text-2xl font-bold">
                                                        {studentInfo.avatar}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-white text-2xl">{studentInfo.name}</CardTitle>
                                                    <CardDescription className="text-white/70 text-lg">{studentInfo.rollNumber}</CardDescription>
                                                </div>
                                            </div>
                                            {!isEditingProfile ? (
                                                <Button
                                                    onClick={handleProfileEdit}
                                                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 flex items-center gap-2"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit Profile
                                                </Button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={handleProfileSave}
                                                        className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-200 hover:bg-green-500/30 flex items-center gap-2"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        Save
                                                    </Button>
                                                    <Button
                                                        onClick={handleProfileCancel}
                                                        className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 hover:bg-red-500/30 flex items-center gap-2"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Cancel
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-white/70 text-sm">Email</label>
                                                    {isEditingProfile ? (
                                                        <Input
                                                            value={editableProfile.email}
                                                            onChange={(e) => handleProfileChange('email', e.target.value)}
                                                            className="bg-white/10 border-white/20 text-white placeholder-white/60 mt-1"
                                                            type="email"
                                                        />
                                                    ) : (
                                                        <p className="text-white font-medium">{studentInfo.email}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-white/70 text-sm">Branch</label>
                                                    <p className="text-white font-medium">{studentInfo.branch}</p>
                                                </div>
                                                <div>
                                                    <label className="text-white/70 text-sm">Year</label>
                                                    <p className="text-white font-medium">{studentInfo.year}</p>
                                                </div>
                                                <div>
                                                    <label className="text-white/70 text-sm">Section</label>
                                                    <p className="text-white font-medium">{studentInfo.section}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-white/70 text-sm">Phone</label>
                                                    {isEditingProfile ? (
                                                        <Input
                                                            value={editableProfile.phone}
                                                            onChange={(e) => handleProfileChange('phone', e.target.value)}
                                                            className="bg-white/10 border-white/20 text-white placeholder-white/60 mt-1"
                                                            type="tel"
                                                        />
                                                    ) : (
                                                        <p className="text-white font-medium">{studentInfo.phone}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-white/70 text-sm">Address</label>
                                                    {isEditingProfile ? (
                                                        <Input
                                                            value={editableProfile.address}
                                                            onChange={(e) => handleProfileChange('address', e.target.value)}
                                                            className="bg-white/10 border-white/20 text-white placeholder-white/60 mt-1"
                                                        />
                                                    ) : (
                                                        <p className="text-white font-medium">{studentInfo.address}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-white/70 text-sm">Overall Attendance</label>
                                                    <p className="text-white font-medium">{studentInfo.attendance.percentage}%</p>
                                                </div>
                                            </div>
                                        </div>
                                        {isEditingProfile && (
                                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                                <p className="text-white/70 text-sm">
                                                    <strong>Note:</strong> Only email, phone, and address can be edited. Academic information like branch, year, and section cannot be changed.
                                                </p>
                                            </div>
                                        )}
                                        {profileSaveMessage && (
                                            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                                <p className="text-green-200 text-sm font-medium">{profileSaveMessage}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Timetable Section */}
                    {activeSection === "timetable" && (
                        <div className="h-full overflow-y-auto p-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
                            <div className="space-y-8 max-w-7xl mx-auto">

                                {/* Header */}
                                <div>
                                    <h1
                                        className="text-5xl font-extrabold text-white mb-2"
                                        style={{
                                            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                                            fontWeight: 900,
                                            letterSpacing: "-0.02em",
                                        }}
                                    >
                                        Class Timetable
                                    </h1>
                                    <p className="text-white/80 text-lg">Your weekly class schedule</p>
                                </div>

                                {/* Timetable Card */}
                                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                                    <CardContent className="p-6">
                                        <div className="overflow-x-auto">
                                            <div className="space-y-4">
                                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                                                    (day, dayIndex) => {
                                                        const dayClasses = timetableData.filter(
                                                            (item) => item.day === day
                                                        );

                                                        return (
                                                            <div
                                                                key={day}
                                                                className={`animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-${200 + dayIndex * 100
                                                                    }`}
                                                            >
                                                                {/* Day Title */}
                                                                <h3 className="text-white font-bold text-lg mb-3">
                                                                    {day}
                                                                </h3>

                                                                {/* Classes */}
                                                                <div className="grid gap-3">
                                                                    {dayClasses.length > 0 ? (
                                                                        dayClasses.map((classItem) => (
                                                                            <div
                                                                                key={classItem.id}
                                                                                className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
                                                                            >
                                                                                {/* Time */}
                                                                                <div className="text-white font-mono text-sm bg-white/10 px-3 py-1 rounded">
                                                                                    {classItem.time}
                                                                                </div>

                                                                                {/* Subject + Teacher */}
                                                                                <div className="flex-1">
                                                                                    <p className="text-white font-medium">
                                                                                        {classItem.subject}
                                                                                    </p>
                                                                                    <p className="text-white/70 text-sm">
                                                                                        {classItem.teacher}
                                                                                    </p>
                                                                                </div>

                                                                                {/* Room */}
                                                                                <div className="text-white/70 text-sm">
                                                                                    Room: {classItem.room}
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="text-white/60 text-center py-4">
                                                                            No classes scheduled
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

export default StudentDashboard
