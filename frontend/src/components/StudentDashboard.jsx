import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
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
// Mock timetable data (used as a fallback if API is unavailable)
const defaultTimetableData = [
    { id: 1, day: 'Monday', subject: 'Data Structures', teacher: 'Dr. Smith', time: '09:00-10:00', room: 'A-101' },
    { id: 2, day: 'Monday', subject: 'Web Development', teacher: 'Prof. Johnson', time: '11:00-12:00', room: 'B-205' },
    { id: 3, day: 'Tuesday', subject: 'Database Management', teacher: 'Dr. Brown', time: '10:00-11:00', room: 'C-301' },
    { id: 4, day: 'Tuesday', subject: 'Software Engineering', teacher: 'Prof. Wilson', time: '14:00-15:00', room: 'A-102' },
    { id: 5, day: 'Wednesday', subject: 'Data Structures', teacher: 'Dr. Smith', time: '09:00-10:00', room: 'A-101' },
    { id: 6, day: 'Thursday', subject: 'Web Development', teacher: 'Prof. Johnson', time: '11:00-12:00', room: 'B-205' },
    { id: 7, day: 'Friday', subject: 'Database Management', teacher: 'Dr. Brown', time: '13:00-14:00', room: 'C-301' }
]

// Default branches fallback (used if backend list is unavailable)
const defaultBranches = []

const StudentDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeSection, setActiveSection] = useState('timetable');
    const [sidebarHovered, setSidebarHovered] = useState(false);
    const [attendanceCode, setAttendanceCode] = useState('');
    const [attendanceMessage, setAttendanceMessage] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [studentInfo, setStudentInfo] = useState({});
    const [teacherNotifications, setTeacherNotifications] = useState([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileSaveMessage, setProfileSaveMessage] = useState('');
    const [editableProfile, setEditableProfile] = useState({
        phone: studentInfo.phone,
        address: studentInfo.address,
        email: studentInfo.email
    });

    // Timetable state
    const [timetableData, setTimetableData] = useState([]);
    const [timetableLoading, setTimetableLoading] = useState(false);
    const [timetableError, setTimetableError] = useState('');

    // Live period state (teacher-entered present count, current marked count)
    const [livePeriod, setLivePeriod] = useState(null)
    const [liveFetching, setLiveFetching] = useState(false)
    const [liveError, setLiveError] = useState('')
    const [limitCount, setLimitCount] = useState(null)
    const [markedCount, setMarkedCount] = useState(0)
    const [hasMarked, setHasMarked] = useState(false)
    const [hasPeriodsAPI, setHasPeriodsAPI] = useState(true)

    const [branchOptions, setBranchOptions] = useState(defaultBranches)
    const [branchLoading, setBranchLoading] = useState(false)
    const [branchError, setBranchError] = useState('')
    const [selectedBranch, setSelectedBranch] = useState('')

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    const params = useParams()
    // First-time branch selection state
    const branchSetKey = params?.id ? `branchSet:${params.id}` : 'branchSet'
    const [showBranchSetup, setShowBranchSetup] = useState(false)

    // Fetch student to detect if branch already assigned; show overlay only if not set
    useEffect(() => {
        const fetchStudentAndBranch = async () => {
            try {
                const token = localStorage.getItem('token')
                const decoded = token ? JSON.parse(atob(token.split('.')[1])) : null
                const studentId = params?.id || decoded?.id
                if (!studentId) return
                const res = await fetch(`http://localhost:8000/api/students/${studentId}`, {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        'Content-Type': 'application/json'
                    }
                })
                if (res.ok) {
                    const data = await res.json()
                    const student = data?.student || data?.data || data
                    setStudentInfo(prev => ({ ...prev, ...(student || {}) }))
                    const b = student?.branch || student?.branchId || student?.branch_id
                    const hasBranch = !!(b || student?.branchName || student?.branch_name)
                    setShowBranchSetup(!hasBranch)
                } else {
                    setShowBranchSetup(true)
                }
            } catch {
                setShowBranchSetup(true)
            }
        }
        fetchStudentAndBranch()
    }, [params?.id])

    // Fetch branches list on first-time setup
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const decoded = JSON.parse(atob(localStorage.getItem('token').split('.')[1]))

                const studentId = params?.id || decoded.id
                const token = localStorage.getItem('token')
                console.log("fetching branches for student", studentId)

                const getCollege = await fetch(`http://localhost:8000/api/students/${studentId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!getCollege.ok) throw new Error(`HTTP ${getCollege.status}`);

                const data = await getCollege.json();
                console.log("college data", data.student.institutionName);

                const getbranches = await fetch(`http://localhost:8000/api/branches/get/${data.student.institutionName}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data2 = await getbranches.json();
                const branches = data2.branches || []
                console.log("branches", branches);

                setBranchOptions(branches);

                // Determine if student already belongs to a branch by scanning branch.students
                const sid = String(studentId)
                const normalizeId = (x) => {
                    if (!x) return ''
                    if (typeof x === 'string') return x
                    if (typeof x === 'object') return x._id || x.id || ''
                    try { return String(x) } catch { return '' }
                }
                const found = branches.find(b => Array.isArray(b.students) && b.students.some(s => normalizeId(s) === sid))
                if (found) {
                    // Auto-assign and hide dialog
                    setSelectedBranch(found)
                    setStudentInfo(prev => ({ ...prev, branchId: found._id, branchName: found.branchName || found.name }))
                    setShowBranchSetup(false)
                    setActiveSection('timetable')
                } else {
                    setShowBranchSetup(true)
                }
            } catch (error) {
                console.error("Error fetching branches:", error);
            }
        };
        fetchBranches();
    }, [showBranchSetup]);

    const savebranch = async () => {
        if (!selectedBranch) {
            setBranchError("Please select a branch")
            return
        }
        try {
            const token = localStorage.getItem('token')
            const decoded = token ? JSON.parse(atob(token.split('.')[1])) : null
            const studentId = params?.id || decoded?.id
            const res = await fetch(`http://localhost:8000/api/branches/${selectedBranch._id}/add-student`, {
                method: 'PUT',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ studentId })
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            // On success, hide dialog and trigger timetable fetch by branch
            setStudentInfo(prev => ({ ...prev, branchId: selectedBranch._id }))
            setShowBranchSetup(false)
            setActiveSection('timetable')
        } catch (error) {
            console.error("Error setting branch:", error);
            setBranchError('Failed to set branch. Please try again.')
        }
    }

    // Fetch timetable by branch when available, fallback to student timetable
    useEffect(() => {
        const fetchTimetable = async () => {
            setTimetableLoading(true);
            setTimetableError('');
            try {
                const token = localStorage.getItem('token');

                const getcollege = await fetch(`http://localhost:8000/api/students/${params.id}`, {
                    method: 'GET',
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        'Content-Type': 'application/json'
                    }
                });
                const data = await getcollege.json();
                const collegeId = data.student.institutionName

                const getbranch = await fetch(`http://localhost:8000/api/branches/get/${collegeId}`, {
                    method: 'GET',
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        'Content-Type': 'application/json'
                    }
                });
                const branchData = await getbranch.json();

                const studentIdToCheck = params.id; 
                const branches = branchData.branches || [];
                const branchWithStudent = branches.find(branch =>
                    branch.students.some(student => student._id === studentIdToCheck)
                );

                const branchId = branchWithStudent._id

                const getTimetable = await fetch(`http://localhost:8000/api/timetables/student/${branchId}`, {
                    method: 'GET',
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        'Content-Type': 'application/json'
                    }
                });
                const timetableData = await getTimetable.json();
                console.log("Fetched timetable data:", timetableData.schedule);
                setTimetableData(timetableData.schedule || []);

            } catch (error) {
                console.error("Error fetching timetable:", error);
                setTimetableError('Failed to load timetable.');
            } finally {
                setTimetableLoading(false);
            }
        };
        fetchTimetable();
    }, [selectedBranch?._id, studentInfo.branchId, params.id]);

    // Fetch current live period for this branch (to get teacher-entered limit and current marked count)
    useEffect(() => {
        let cancelled = false
        let pollTimer = null

        const studentId = (() => {
            const token = localStorage.getItem('token')
            try { return params?.id || (token ? JSON.parse(atob(token.split('.')[1])).id : null) } catch { return params?.id }
        })()
        const bId = selectedBranch?._id || studentInfo?.branchId
        if (!bId) return

        const resolveLimit = (p) => p?.presentCountTarget ?? p?.expectedPresent ?? p?.expectedCount ?? p?.maxMarks ?? p?.limit ?? null
        const resolveMarked = (p) => p?.markedCount ?? p?.attendanceCount ?? (Array.isArray(p?.markedStudents) ? p.markedStudents.length : null) ?? (Array.isArray(p?.studentsMarked) ? p.studentsMarked.length : null) ?? p?.count ?? 0
        const resolveId = (p) => p?._id || p?.id
        const resolveCode = (p) => p?.code || p?.attendanceCode || p?.otp

        const setFromCurrentClass = () => {
            const cc = getCurrentClass()
            if (cc) {
                setLivePeriod(cc)
            } else {
                setLivePeriod(null)
            }
            setLimitCount(null)
            setMarkedCount(0)
            setHasMarked(false)
        }

        const fetchLive = async () => {
            if (!hasPeriodsAPI) {
                setFromCurrentClass()
                return
            }
            try {
                setLiveFetching(true)
                setLiveError('')
                const token = localStorage.getItem('token')
                const urls = [
                    `http://localhost:8000/api/periods/current?branchId=${encodeURIComponent(bId)}`,
                    `http://localhost:8000/api/periods/live?branchId=${encodeURIComponent(bId)}`,
                    `http://localhost:8000/api/periods/active?branchId=${encodeURIComponent(bId)}`
                ]
                let period = null
                let saw404 = false
                for (const url of urls) {
                    try {
                        const res = await fetch(url, {
                            headers: {
                                'Content-Type': 'application/json',
                                ...(token ? { Authorization: `Bearer ${token}` } : {})
                            }
                        })
                        if (res.status === 404) {
                            saw404 = true
                            continue
                        }
                        if (res.ok) {
                            const json = await res.json()
                            period = Array.isArray(json) ? (json[0] || null) : (json?.data || json?.period || json || null)
                            if (period) break
                        }
                    } catch {}
                }
                if (cancelled) return
                if (period) {
                    const pid = resolveId(period)
                    const limit = resolveLimit(period)
                    const m = resolveMarked(period) ?? 0
                    setLivePeriod({ ...period, id: pid, code: resolveCode(period) })
                    setLimitCount(limit)
                    setMarkedCount(m)
                    // Check if this student already marked (via backend structure or local flag)
                    let already = false
                    if (Array.isArray(period?.markedStudents)) {
                        const norm = (x) => (typeof x === 'object' ? (x?._id || x?.id) : x)
                        already = period.markedStudents.some(s => String(norm(s)) === String(studentId))
                    }
                    if (!already) {
                        const local = localStorage.getItem(`marked:${pid}:${studentId}`)
                        already = local === '1'
                    }
                    setHasMarked(already)
                } else {
                    // If 404s observed for live endpoints, assume API not available and fall back to timetable-derived class
                    if (saw404) setHasPeriodsAPI(false)
                    setFromCurrentClass()
                }
            } catch (e) {
                if (!cancelled) setLiveError(e?.message || 'Failed to fetch live period')
            } finally {
                if (!cancelled) setLiveFetching(false)
            }
        }

        fetchLive()
        // Poll every 15s while not expired and we haven't marked yet
        pollTimer = setInterval(() => {
            const expired = (limitCount != null) && (markedCount >= limitCount)
            if (!expired && !hasMarked) fetchLive()
        }, hasPeriodsAPI ? 15000 : 60000)

        return () => { cancelled = true; if (pollTimer) clearInterval(pollTimer) }
    }, [selectedBranch?._id, studentInfo?.branchId, hasPeriodsAPI, currentTime, timetableData])

    // Notifications based on attendance
    // useEffect(() => {
    //     const warnings = [];

    //     if (studentInfo.attendance?.percentage < 75) {
    //         warnings.push({
    //             id: 'low-attendance',
    //             type: 'warning',
    //             title: 'Low Attendance Warning',
    //             message: `Your attendance is ${studentInfo.attendance.percentage}%. Minimum required is 75%.`,
    //             icon: AlertTriangle
    //         });
    //     }

    //     studentInfo.subjects?.forEach(sub => {
    //         if (sub.attendancePercent < 75) {
    //             warnings.push({
    //                 id: `subject-${sub.name}`,
    //                 type: 'warning',
    //                 title: `Low Attendance in ${sub.name}`,
    //                 message: `${sub.attendancePercent}% attendance in ${sub.name}. Contact ${sub.teacher}.`,
    //                 icon: BookOpen
    //             });
    //         }
    //     });

    //     setNotifications(warnings);
    // }, [studentInfo.attendance?.percentage, studentInfo.subjects]);

    // Get current or next class based on timetable
    const getCurrentClass = () => {
        const now = currentTime;
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let liveClass = null;
        let nextClass = null;
        let minMinutesUntilNext = Infinity;

        timetableData.forEach(slot => {
            if (slot.day !== currentDay) return;

            const [startHour, startMinute] = slot.startTime.split(':').map(Number);
            const [endHour, endMinute] = slot.endTime.split(':').map(Number);
            const startMinutes = startHour * 60 + startMinute;
            const endMinutes = endHour * 60 + endMinute;

            if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
                liveClass = slot;
            } else if (startMinutes > currentMinutes && startMinutes - currentMinutes < minMinutesUntilNext) {
                minMinutesUntilNext = startMinutes - currentMinutes;
                nextClass = slot;
            }
        });

        return liveClass ? { ...liveClass, status: 'ongoing' } : nextClass ? { ...nextClass, status: 'upcoming' } : null;
    };

    const currentClass = getCurrentClass();

    // Attendance submission
    // const handleAttendanceSubmit = () => {
    //     if (!attendanceCode.trim()) {
    //         setAttendanceMessage('Please enter an attendance code');
    //         return;
    //     }

    //     if (attendanceCode.length === 6) {
    //         setStudentInfo(prev => {
    //             const newPresentDays = (prev.attendance?.presentDays || 0) + 1;
    //             const newTotalDays = (prev.attendance?.totalDays || 0) + 1;
    //             const newPercentage = Math.round((newPresentDays / newTotalDays) * 100 * 10) / 10;

    //             const today = new Date().toISOString().split('T')[0];
    //             const newRecord = {
    //                 date: today,
    //                 subject: currentClass?.subject || 'General',
    //                 status: 'present',
    //                 markedBy: 'student'
    //             };

    //             const updatedRecent = [newRecord, ...(prev.recentAttendance || [])].slice(0, 10);

    //             return {
    //                 ...prev,
    //                 attendance: {
    //                     presentDays: newPresentDays,
    //                     totalDays: newTotalDays,
    //                     absentDays: newTotalDays - newPresentDays,
    //                     percentage: newPercentage
    //                 },
    //                 recentAttendance: updatedRecent
    //             };
    //         });

    //         setAttendanceMessage(`✅ Attendance marked successfully!`);
    //         setAttendanceCode('');
    //         setTimeout(() => setAttendanceMessage(''), 5000);
    //     } else {
    //         setAttendanceMessage('❌ Invalid attendance code. Please try again.');
    //         setTimeout(() => setAttendanceMessage(''), 3000);
    //     }
    // };

    // Mark attendance via code (minimal API call)
    const handleAttendanceSubmit = async () => {
        if (!attendanceCode.trim()) {
            setAttendanceMessage('Please enter an attendance code')
            return
        }
        // Guard: need a live period to mark
        const periodId = livePeriod?.id || livePeriod?._id
        const studentId = studentInfo?._id || studentInfo?.id || params?.id
        const expired = (limitCount != null) && (markedCount >= limitCount)
        if (!periodId) {
            setAttendanceMessage('No live period to mark right now')
            setTimeout(() => setAttendanceMessage(''), 3000)
            return
        }
        if (expired) {
            setAttendanceMessage('Attendance code has expired')
            setTimeout(() => setAttendanceMessage(''), 3000)
            return
        }
        if (hasMarked) {
            setAttendanceMessage('You have already marked attendance')
            setTimeout(() => setAttendanceMessage(''), 3000)
            return
        }
        try {
            const token = localStorage.getItem('token')
            const urls = [
                `http://localhost:8000/api/attendance/mark`,
                `http://localhost:8000/api/periods/${encodeURIComponent(periodId)}/mark`
            ]
            let ok = false
            let newMarkedCount = markedCount
            for (const url of urls) {
                try {
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({
                            code: attendanceCode,
                            studentId,
                            periodId,
                        })
                    })
                    if (res.ok) {
                        ok = true
                        try {
                            const json = await res.json()
                            // try resolve updated counts
                            const serverCount = json?.markedCount ?? json?.attendanceCount ?? (Array.isArray(json?.markedStudents) ? json.markedStudents.length : null) ?? json?.count
                            if (typeof serverCount === 'number') newMarkedCount = serverCount
                        } catch {}
                        break
                    }
                } catch { /* try next */ }
            }
            if (ok) {
                // Update local state
                setHasMarked(true)
                localStorage.setItem(`marked:${periodId}:${studentId}`, '1')
                setMarkedCount(prev => {
                    const next = typeof newMarkedCount === 'number' ? newMarkedCount : (prev + 1)
                    return next
                })
                setAttendanceMessage('✅ Attendance marked successfully!')
                setAttendanceCode('')
            } else {
                setAttendanceMessage('❌ Failed to mark attendance. Please try again.')
            }
        } catch {
            setAttendanceMessage('❌ Failed to mark attendance. Please try again.')
        } finally {
            setTimeout(() => setAttendanceMessage(''), 4000)
        }
    }

    // Profile editing handlers
    const handleProfileEdit = () => setIsEditingProfile(true);

    const handleProfileSave = () => {
        setStudentInfo(prev => ({
            ...prev,
            phone: editableProfile.phone,
            address: editableProfile.address,
            email: editableProfile.email
        }));
        setIsEditingProfile(false);
        setProfileSaveMessage('✅ Profile updated successfully!');
        setTimeout(() => setProfileSaveMessage(''), 3000);
    };

    const handleProfileCancel = () => {
        setEditableProfile({
            phone: studentInfo.phone,
            address: studentInfo.address,
            email: studentInfo.email
        });
        setIsEditingProfile(false);
    };

    const handleProfileChange = (field, value) => {
        setEditableProfile(prev => ({ ...prev, [field]: value }));
    };

    // Unread teacher notifications count
    const unreadCount = teacherNotifications.filter(n => !n.isRead).length;
    const navItems = [
        { id: 'timetable', label: 'Timetable', icon: Calendar }
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

            {/* First-time Branch Setup Overlay */}
            {showBranchSetup && (
                <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6">
                        <h2 className="text-white text-2xl font-bold mb-2">Select Your Branch</h2>
                        <p className="text-white/70 mb-4">Please choose your branch to personalize your experience.</p>

                        {branchLoading ? (
                            <p className="text-white/80">Loading branches...</p>
                        ) : (
                            <div className="space-y-3">
                                <label className="text-white/80 text-sm">Branch</label>
                                <select
                                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                                    value={selectedBranch?._id || ""}
                                    onChange={(e) => {
                                        const branchObj = branchOptions.find(b => b._id === e.target.value)
                                        setSelectedBranch(branchObj || null)
                                    }}
                                >
                                    <option value="" className="bg-black text-white">Select a branch</option>
                                    {branchOptions.map((b) => (
                                        <option key={b._id} value={b._id} className="bg-black text-white">
                                            {b.branchName} - {b.section} (Year {b.year})
                                        </option>
                                    ))}
                                </select>
                                {branchError && <p className="text-red-300 text-sm">{branchError}</p>}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                disabled={!selectedBranch}
                                onClick={savebranch}
                                className={`px-4 py-2 rounded-md border ${selectedBranch
                                    ? "bg-white/20 border-white/30 text-white hover:bg-white/30"
                                    : "bg-white/10 border-white/20 text-white/60 cursor-not-allowed"
                                    }`}
                            >
                                Save Branch
                            </button>

                            <button
                                onClick={() => {
                                    setShowBranchSetup(false)
                                }}
                                className="px-4 py-2 rounded-md border border-white/20 text-white/80 hover:text-white hover:bg-white/15"
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                </div>
            )}


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
                            {/* <div className={`transition-all duration-300 overflow-hidden ${sidebarHovered ? 'opacity-100 max-h-48' : 'opacity-0 max-h-0'
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
                            </div> */}
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
                    {activeSection === 'overview' &&
                        (
                            // <div className="h-full overflow-y-auto p-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
                            //     <div className="space-y-8 max-w-7xl mx-auto">
                            //         {/* Header */}
                            //         <div className="mb-8 animate-in fade-in-0 slide-in-from-top-2 duration-700 delay-100">
                            //             <h1 className="text-5xl font-extrabold text-white mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}>Student Dashboard</h1>
                            //             <p className="text-white/80 text-lg">Welcome back, {studentInfo.name}!</p>
                            //         </div>


                            //         {/* Quick Actions Grid */}
                            //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
                            //             {/* Attendance Code Entry */}
                            //             <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-400">
                            //                 <CardHeader>
                            //                     <CardTitle className="text-white flex items-center gap-2">
                            //                         <Hash className="w-5 h-5 text-blue-400" />
                            //                         Mark Attendance
                            //                     </CardTitle>
                            //                     <CardDescription className="text-white/70">Enter the attendance code provided by your teacher</CardDescription>
                            //                 </CardHeader>
                            //                 <CardContent className="space-y-4">
                            //                     <div className="flex gap-3">
                            //                         <Input
                            //                             placeholder="Enter 6-digit code"
                            //                             value={attendanceCode}
                            //                             onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
                            //                             className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            //                             maxLength={6}
                            //                         />
                            //                         <Button
                            //                             // onClick={handleAttendanceSubmit}
                            //                             className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                            //                         >
                            //                             Submit
                            //                         </Button>
                            //                     </div>
                            //                     {attendanceMessage && (
                            //                         <p className="text-sm text-white/90">{attendanceMessage}</p>
                            //                     )}
                            //                 </CardContent>
                            //             </Card>

                            //             {/* Current Class */}
                            //             <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-500">
                            //                 <CardHeader>
                            //                     <CardTitle className="text-white flex items-center gap-2">
                            //                         <Clock className="w-5 h-5 text-orange-400" />
                            //                         {currentClass ? (currentClass.status === 'ongoing' ? 'Ongoing Class' : 'Next Class') : 'No Classes Today'}
                            //                     </CardTitle>
                            //                 </CardHeader>
                            //                 <CardContent>
                            //                     {currentClass ? (
                            //                         <div className="space-y-3">
                            //                             <div className="flex items-center gap-2">
                            //                                 <BookOpen className="w-4 h-4 text-white/60" />
                            //                                 <span className="text-white font-medium">{currentClass.subject}</span>
                            //                             </div>
                            //                             <div className="flex items-center gap-2">
                            //                                 <Users className="w-4 h-4 text-white/60" />
                            //                                 <span className="text-white/80">{currentClass.teacher}</span>
                            //                             </div>
                            //                             <div className="flex items-center gap-2">
                            //                                 <Timer className="w-4 h-4 text-white/60" />
                            //                                 <span className="text-white/80">{currentClass.time}</span>
                            //                             </div>
                            //                             <Badge className={`${currentClass.status === 'ongoing' ? 'bg-green-500/20 text-green-200' : 'bg-blue-500/20 text-blue-200'}`}>
                            //                                 {currentClass.status === 'ongoing' ? 'Live Now' : 'Upcoming'}
                            //                             </Badge>
                            //                         </div>
                            //                     ) : (
                            //                         <p className="text-white/70">No classes scheduled for today</p>
                            //                     )}
                            //                 </CardContent>
                            //             </Card>
                            //         </div>

                            //         {/* Statistics Cards */}
                            //         {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-600">
                            //         <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-700">
                            //             <CardHeader className="pb-2">
                            //                 <CardTitle className="text-white flex items-center gap-2">
                            //                     <TrendingUp className="w-5 h-5 text-green-400" />
                            //                     Overall Attendance
                            //                 </CardTitle>
                            //             </CardHeader>
                            //             <CardContent>
                            //                 <div className="text-3xl font-bold text-white">{studentInfo.attendance.percentage}%</div>
                            //                 <p className="text-white/60 text-sm">{studentInfo.attendance.presentDays}/{studentInfo.attendance.totalDays} days</p>
                            //             </CardContent>
                            //         </Card>

                            //         <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-800">
                            //             <CardHeader className="pb-2">
                            //                 <CardTitle className="text-white flex items-center gap-2">
                            //                     <CheckCircle2 className="w-5 h-5 text-blue-400" />
                            //                     Present Days
                            //                 </CardTitle>
                            //             </CardHeader>
                            //             <CardContent>
                            //                 <div className="text-3xl font-bold text-white">{studentInfo.attendance.presentDays}</div>
                            //                 <p className="text-white/60 text-sm">Total present</p>
                            //             </CardContent>
                            //         </Card>

                            //         <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-900">
                            //             <CardHeader className="pb-2">
                            //                 <CardTitle className="text-white flex items-center gap-2">
                            //                     <XCircle className="w-5 h-5 text-red-400" />
                            //                     Absent Days
                            //                 </CardTitle>
                            //             </CardHeader>
                            //             <CardContent>
                            //                 <div className="text-3xl font-bold text-white">{studentInfo.attendance.absentDays}</div>
                            //                 <p className="text-white/60 text-sm">Total absent</p>
                            //             </CardContent>
                            //         </Card>

                            //         <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-1000">
                            //             <CardHeader className="pb-2">
                            //                 <CardTitle className="text-white flex items-center gap-2">
                            //                     <Bell className="w-5 h-5 text-orange-400" />
                            //                     New Notifications
                            //                 </CardTitle>
                            //             </CardHeader>
                            //             <CardContent>
                            //                 <div className="text-3xl font-bold text-white">{unreadCount}</div>
                            //                 <p className="text-white/60 text-sm">Unread messages</p>
                            //             </CardContent>
                            //         </Card>
                            //     </div> */}

                            //         {/* Recent Attendance */}
                            //         <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-1100">
                            //             <CardHeader>
                            //                 <CardTitle className="text-white">Recent Attendance</CardTitle>
                            //                 <CardDescription className="text-white/70">Your latest attendance records</CardDescription>
                            //             </CardHeader>
                            //             <CardContent>
                            //                 <div className="space-y-4">
                            //                     {studentInfo.recentAttendance.map((record, index) => (
                            //                         <div key={index} className={`flex items-center gap-3 p-3 bg-white/5 rounded-lg animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-${1200 + index * 100}`}>
                            //                             {record.status === 'present' ? (
                            //                                 <CheckCircle2 className="w-5 h-5 text-green-400" />
                            //                             ) : (
                            //                                 <XCircle className="w-5 h-5 text-red-400" />
                            //                             )}
                            //                             <div className="flex-1">
                            //                                 <p className="text-white text-sm font-medium">{record.subject}</p>
                            //                                 <p className="text-white/60 text-xs">{new Date(record.date).toLocaleDateString()}</p>
                            //                             </div>
                            //                             <div className="flex gap-2">
                            //                                 <Badge className={record.status === 'present' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}>
                            //                                     {record.status}
                            //                                 </Badge>
                            //                                 <Badge className={record.markedBy === 'student' ? 'bg-blue-500/20 text-blue-200' : 'bg-purple-500/20 text-purple-200'}>
                            //                                     {record.markedBy}
                            //                                 </Badge>
                            //                             </div>
                            //                         </div>
                            //                     ))}
                            //                 </div>
                            //             </CardContent>
                            //         </Card>
                            //     </div>
                            // </div>
                            <div>

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
                                                    {/* <p className="text-white font-medium">{studentInfo.attendance.percentage}%</p> */}
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

                                    {/* Live class summary and attendance */}
                                    <div className="mt-4 space-y-3">
                                        <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    {currentClass ? (
                                                        <>
                                                            <div className="text-white font-semibold">{currentClass.subject}</div>
                                                            <div className="text-white/70 text-sm">{currentClass.time || (currentClass.startTime && currentClass.endTime ? `${currentClass.startTime}-${currentClass.endTime}` : '')}</div>
                                                            {currentClass.status === 'ongoing' && (
                                                                <div className="text-green-300 text-xs mt-1">Live now</div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="text-white/70">No live class at the moment</div>
                                                    )}
                                                </div>
                                                {(limitCount != null) && (
                                                    <div className="text-white/80 text-sm">Marked {markedCount} of {limitCount}</div>
                                                )}
                                            </div>
                                            {liveError && <div className="text-red-300 text-xs mt-2">{liveError}</div>}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                className="w-64 bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 placeholder-white/60"
                                                placeholder="Enter attendance code"
                                                value={attendanceCode}
                                                onChange={(e) => setAttendanceCode(e.target.value)}
                                                disabled={!currentClass}
                                            />
                                            <button
                                                onClick={handleAttendanceSubmit}
                                                disabled={!currentClass || ((limitCount != null) && (markedCount >= limitCount)) || hasMarked}
                                                className={`px-4 py-2 rounded-md border ${(!currentClass || ((limitCount != null) && (markedCount >= limitCount)) || hasMarked) ? 'bg-white/10 border-white/20 text-white/60 cursor-not-allowed' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'}`}
                                            >
                                                {hasMarked ? 'Already Marked' : ((limitCount != null) && (markedCount >= limitCount)) ? 'Code Expired' : 'Mark Attendance'}
                                            </button>
                                            {attendanceMessage && (
                                                <span className="text-sm text-white/90">{attendanceMessage}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Timetable Card */}
                                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                                    <CardContent className="p-6">
                                        <div className="overflow-x-auto">
                                            {timetableLoading ? (
                                                <div className="text-white/80 p-6">Loading timetable...</div>
                                            ) : timetableError ? (
                                                <div className="text-red-300 p-6">{timetableError}</div>
                                            ) : (
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
                                                                                        {classItem.time || (classItem.startTime && classItem.endTime ? `${classItem.startTime}-${classItem.endTime}` : '')}
                                                                                    </div>

                                                                                    {/* Subject + Teacher */}
                                                                                    <div className="flex-1">
                                                                                        <p className="text-white font-medium">
                                                                                            {classItem.subject}
                                                                                        </p>
                                                                                        {classItem.teacher && (
                                                                                            <p className="text-white/70 text-sm">{classItem.teacher}</p>
                                                                                        )}
                                                                                    </div>

                                                                                    {/* Room */}
                                                                                    {classItem.room && (
                                                                                        <div className="text-white/70 text-sm">Room: {classItem.room}</div>
                                                                                    )}
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
                                            )}
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
