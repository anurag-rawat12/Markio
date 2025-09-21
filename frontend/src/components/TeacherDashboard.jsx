import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Edit3, User, BookOpen, Award, Clock, ShieldAlert, Copy, RefreshCcw, Timer, X, PlusCircle, Trash2, Calendar, ChevronDown, Users } from 'lucide-react'

// Mock dataset with classes — replace with API data later
const initialClassData = {
  'IT-A': {
    students: [
      {
        id: 'STU001',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.edu',
        avatar: '🧑🏻‍🎓',
        marks: { maths: 88, science: 92, english: 85 },
        profile: { year: '2nd', dept: 'Information Technology' },
        attendanceSummary: { total: 20, present: 17 },
        lastAttendance: {
          date: '2025-09-15',
          status: 'present',
          markedBy: 'student',
          proxy: false,
        },
      },
      {
        id: 'STU002',
        name: 'Isha Patel',
        email: 'isha.patel@example.edu',
        avatar: '👩🏽‍🎓',
        marks: { maths: 76, science: 81, english: 79 },
        profile: { year: '2nd', dept: 'Information Technology' },
        attendanceSummary: { total: 20, present: 14 },
        lastAttendance: {
          date: '2025-09-15',
          status: 'present',
          markedBy: 'student',
          proxy: true,
        },
      },
    ],
    timetable: [
      { id: 't1', day: 'Mon', subject: 'Data Structures', start: '09:00', end: '10:00' },
      { id: 't2', day: 'Wed', subject: 'Web Development', start: '11:00', end: '12:00' },
    ]
  },
  'IT-B': {
    students: [
      {
        id: 'STU003',
        name: 'Rohit Verma',
        email: 'rohit.verma@example.edu',
        avatar: '🧑🏽‍🎓',
        marks: { maths: 91, science: 89, english: 93 },
        profile: { year: '2nd', dept: 'Information Technology' },
        attendanceSummary: { total: 20, present: 19 },
        lastAttendance: {
          date: '2025-09-15',
          status: 'absent',
          markedBy: 'teacher',
          proxy: false,
        },
      },
      {
        id: 'STU004',
        name: 'Priya Singh',
        email: 'priya.singh@example.edu',
        avatar: '👩🏻‍🎓',
        marks: { maths: 84, science: 87, english: 82 },
        profile: { year: '2nd', dept: 'Information Technology' },
        attendanceSummary: { total: 20, present: 16 },
        lastAttendance: {
          date: '2025-09-15',
          status: 'present',
          markedBy: 'teacher',
          proxy: false,
        },
      },
    ],
    timetable: [
      { id: 't3', day: 'Tue', subject: 'Algorithms', start: '10:00', end: '11:00' },
      { id: 't4', day: 'Thu', subject: 'Database Systems', start: '14:00', end: '15:00' },
    ]
  },
  'IT-C': {
    students: [
      {
        id: 'STU005',
        name: 'Arjun Kumar',
        email: 'arjun.kumar@example.edu',
        avatar: '🧑🏽‍🎓',
        marks: { maths: 79, science: 85, english: 88 },
        profile: { year: '2nd', dept: 'Information Technology' },
        attendanceSummary: { total: 20, present: 15 },
        lastAttendance: {
          date: '2025-09-15',
          status: 'present',
          markedBy: 'student',
          proxy: true,
        },
      },
    ],
    timetable: [
      { id: 't5', day: 'Fri', subject: 'Software Engineering', start: '09:00', end: '10:00' },
    ]
  },
  'CSE-DS': {
    students: [
      {
        id: 'STU006',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.edu',
        avatar: '👩🏽‍🎓',
        marks: { maths: 95, science: 92, english: 89 },
        profile: { year: '3rd', dept: 'Data Science' },
        attendanceSummary: { total: 20, present: 18 },
        lastAttendance: {
          date: '2025-09-15',
          status: 'present',
          markedBy: 'teacher',
          proxy: false,
        },
      },
      {
        id: 'STU007',
        name: 'Vikram Joshi',
        email: 'vikram.joshi@example.edu',
        avatar: '🧑🏻‍🎓',
        marks: { maths: 88, science: 91, english: 85 },
        profile: { year: '3rd', dept: 'Data Science' },
        attendanceSummary: { total: 20, present: 17 },
        lastAttendance: {
          date: '2025-09-15',
          status: 'absent',
          markedBy: 'student',
          proxy: false,
        },
      },
    ],
    timetable: [
      { id: 't6', day: 'Mon', subject: 'Machine Learning', start: '11:00', end: '12:00' },
      { id: 't7', day: 'Wed', subject: 'Data Mining', start: '13:00', end: '14:00' },
      { id: 't8', day: 'Fri', subject: 'Big Data Analytics', start: '15:00', end: '16:00' },
    ]
  }
}

const Badge = ({ children, color = 'slate', title }) => (
  <span
    title={title}
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-500/20 text-${color}-200 border border-${color}-400/20`}
  >
    {children}
  </span>
)

const TeacherDashboard = () => {
  // Class selection state
  const [selectedClass, setSelectedClass] = useState('IT-A')
  const [classData, setClassData] = useState(initialClassData)
  const [showClassDropdown, setShowClassDropdown] = useState(false)
  
  // Current class data
  const students = classData[selectedClass]?.students || []
  const timetable = classData[selectedClass]?.timetable || []
  
  const [editingId, setEditingId] = useState(null)

  // Attendance code state
  const [attendanceCode, setAttendanceCode] = useState(null)
  const [codeExpiresAt, setCodeExpiresAt] = useState(null)
  const [remaining, setRemaining] = useState(0)
  const [copied, setCopied] = useState(false)

  // Student profile modal
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Add Student modal
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newStudent, setNewStudent] = useState({
    id: '',
    name: '',
    email: '',
    avatar: '🧑🏻‍🎓',
    marks: { maths: 0, science: 0, english: 0 },
    profile: { year: '', dept: '' },
    attendanceSummary: { total: 0, present: 0 },
  })

  // Edit fields in profile modal
  const [editProfileMode, setEditProfileMode] = useState(false)
  const [editMarks, setEditMarks] = useState({ maths: 0, science: 0, english: 0 })
  const [editAttendance, setEditAttendance] = useState({ total: 0, present: 0 })

  const [newSlot, setNewSlot] = useState({ day: 'Mon', subject: '', start: '09:00', end: '10:00' })

  const totals = useMemo(() => {
    const present = students.filter(s => s.lastAttendance.status === 'present').length
    const absent = students.length - present
    const proxy = students.filter(s => s.lastAttendance.proxy).length
    const studentMarked = students.filter(s => s.lastAttendance.markedBy === 'student').length
    return { present, absent, proxy, studentMarked }
  }, [students])

  function toggleAttendance(id) {
    setClassData(prev => ({
      ...prev,
      [selectedClass]: {
        ...prev[selectedClass],
        students: prev[selectedClass].students.map(s => {
          if (s.id !== id) return s
          const newStatus = s.lastAttendance.status === 'present' ? 'absent' : 'present'
          return {
            ...s,
            lastAttendance: {
              ...s.lastAttendance,
              status: newStatus,
              markedBy: 'teacher',
              proxy: false, // teacher edit clears proxy flag
            },
          }
        })
      }
    }))
    setEditingId(null)
  }

  function markProxy(id, value) {
    setClassData(prev => ({
      ...prev,
      [selectedClass]: {
        ...prev[selectedClass],
        students: prev[selectedClass].students.map(s => s.id === id ? {
          ...s,
          lastAttendance: { ...s.lastAttendance, proxy: value, markedBy: 'teacher' },
        } : s)
      }
    }))
  }

  // Code generation helpers
  function randomCode(len = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let out = ''
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
    return out
  }
  function generateCode(durationSec = 5 * 60) {
    const code = randomCode(6)
    setAttendanceCode(code)
    setCodeExpiresAt(Date.now() + durationSec * 1000)
    setCopied(false)
  }
  function endCode() {
    setAttendanceCode(null)
    setCodeExpiresAt(null)
    setRemaining(0)
    setCopied(false)
  }
  async function copyCode() {
    if (!attendanceCode) return
    try {
      await navigator.clipboard.writeText(attendanceCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      console.warn('Copy failed', e)
    }
  }
  useEffect(() => {
    if (!codeExpiresAt) return
    const tick = () => {
      const secs = Math.max(0, Math.ceil((codeExpiresAt - Date.now()) / 1000))
      setRemaining(secs)
      if (secs <= 0) endCode()
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [codeExpiresAt])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showClassDropdown && !event.target.closest('.class-dropdown')) {
        setShowClassDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showClassDropdown])

  // Student CRUD helpers
  function saveNewStudent() {
    if (!newStudent.id || !newStudent.name) {
      alert('Please fill at least ID and Name')
      return
    }
    const add = {
      ...newStudent,
      lastAttendance: {
        date: new Date().toISOString().slice(0, 10),
        status: 'absent',
        markedBy: 'teacher',
        proxy: false,
      },
    }
    setClassData(prev => ({
      ...prev,
      [selectedClass]: {
        ...prev[selectedClass],
        students: [...prev[selectedClass].students, add]
      }
    }))
    setShowAddStudent(false)
    setNewStudent({
      id: '', name: '', email: '', avatar: '🧑🏻‍🎓',
      marks: { maths: 0, science: 0, english: 0 },
      profile: { year: '', dept: '' },
      attendanceSummary: { total: 0, present: 0 },
    })
  }
  function removeAllStudents() {
    if (window.confirm(`Are you sure you want to remove ALL students from ${selectedClass}?`)) {
      setClassData(prev => ({
        ...prev,
        [selectedClass]: {
          ...prev[selectedClass],
          students: []
        }
      }))
    }
  }
  function startEditSelected(student) {
    setSelectedStudent(student)
    setEditProfileMode(true)
    setEditMarks({ ...student.marks })
    setEditAttendance({ ...student.attendanceSummary })
  }
  function saveEditSelected() {
    setClassData(prev => ({
      ...prev,
      [selectedClass]: {
        ...prev[selectedClass],
        students: prev[selectedClass].students.map(s => s.id === selectedStudent.id ? {
          ...s,
          marks: { ...editMarks },
          attendanceSummary: {
            total: Math.max(0, Number(editAttendance.total) || 0),
            present: Math.max(0, Math.min(Number(editAttendance.present) || 0, Number(editAttendance.total) || 0)),
          },
        } : s)
      }
    }))
    setEditProfileMode(false)
  }
  function cancelEditSelected() {
    setEditProfileMode(false)
  }

  // Timetable helpers
  function addSlot() {
    if (!newSlot.subject) return
    const id = 't' + Math.random().toString(36).slice(2, 7)
    setClassData(prev => ({
      ...prev,
      [selectedClass]: {
        ...prev[selectedClass],
        timetable: [...prev[selectedClass].timetable, { id, ...newSlot }]
      }
    }))
    setNewSlot({ day: newSlot.day, subject: '', start: '09:00', end: '10:00' })
  }
  function removeSlot(id) {
    setClassData(prev => ({
      ...prev,
      [selectedClass]: {
        ...prev[selectedClass],
        timetable: prev[selectedClass].timetable.filter(s => s.id !== id)
      }
    }))
  }

  // Class selection helpers
  function switchClass(className) {
    setSelectedClass(className)
    setShowClassDropdown(false)
    setEditingId(null)
    setSelectedStudent(null)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-3">Dashboard Overview</div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                Teacher Dashboard
              </h1>
              <p className="text-gray-300 text-lg mb-6">Manage attendance, marks, and class schedules</p>
              
              {/* Class Selector */}
              <div className="relative class-dropdown">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Active Class</div>
                <div className="relative">
                  <button
                    onClick={() => setShowClassDropdown(!showClassDropdown)}
                    className="flex items-center gap-3 bg-white border-2 border-gray-800 rounded-lg px-6 py-4 text-black hover:bg-gray-100 transition-all duration-200 min-w-[240px] shadow-lg"
                  >
                    <Users className="w-5 h-5" />
                    <div className="flex-1 text-left">
                      <div className="font-bold text-lg">{selectedClass}</div>
                      <div className="text-gray-600 text-sm">{students.length} students</div>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showClassDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showClassDropdown && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-white border-2 border-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden">
                      {Object.keys(classData).map((className) => (
                        <button
                          key={className}
                          onClick={() => switchClass(className)}
                          className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200 last:border-b-0 ${
                            className === selectedClass ? 'bg-gray-100 font-semibold' : ''
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          <div className="flex-1">
                            <div className="font-medium">{className}</div>
                            <div className="text-gray-600 text-sm">{classData[className].students.length} students</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Link
                to="/student-teacher/login"
                className="bg-white border-2 border-gray-800 text-black px-6 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium shadow-lg"
              >
                Sign out
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Attendance Code */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-gray-800 rounded-xl p-8 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Timer className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Attendance Code</h2>
                  </div>
                  <p className="text-gray-600">Generate a one-time code for students to mark attendance</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {attendanceCode ? (
                  <div className="space-y-4">
                    <div className="bg-black border-2 border-gray-800 rounded-lg p-6 text-center">
                      <div className="text-white font-mono text-3xl tracking-widest select-all mb-2">
                        {attendanceCode}
                      </div>
                      <div className="text-gray-400 font-mono text-sm">
                        Expires in {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={copyCode} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-900 transition-colors">
                        <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button onClick={() => generateCode()} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-900 transition-colors">
                        <RefreshCcw className="w-4 h-4" /> Refresh
                      </button>
                      <button onClick={endCode} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg border-2 border-gray-800 hover:bg-gray-100 transition-colors">
                        <X className="w-4 h-4" /> End
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => generateCode()} className="w-full bg-black text-white py-4 px-6 rounded-lg border border-gray-700 hover:bg-gray-900 transition-colors font-medium text-lg">
                    Generate Code
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowAddStudent(true)}
                  className="w-full flex items-center gap-3 bg-black text-white px-4 py-3 rounded-lg border border-gray-700 hover:bg-gray-900 transition-colors"
                >
                  <PlusCircle className="w-5 h-5" /> Add Student
                </button>
                <button
                  onClick={removeAllStudents}
                  className="w-full flex items-center gap-3 bg-white text-black px-4 py-3 rounded-lg border-2 border-gray-800 hover:bg-gray-100 transition-colors"
                >
                  <Trash2 className="w-5 h-5" /> Remove All
                </button>
              </div>
            </div>
            
            <div className="bg-white border-2 border-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-2">Class Status</h3>
              <p className="text-gray-600 text-sm mb-4">{selectedClass}: {students.length} students enrolled</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Present Today</span>
                  <span className="font-bold">{totals.present}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Absent Today</span>
                  <span className="font-bold">{totals.absent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Proxy Flags</span>
                  <span className="font-bold">{totals.proxy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timetable and Students Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Timetable */}
          <div className="bg-white border-2 border-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Class Schedule</h2>
              </div>
              <p className="text-gray-600">Manage your timetable</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Day</label>
                  <select value={newSlot.day} onChange={e => setNewSlot(s => ({ ...s, day: e.target.value }))} className="block w-full bg-white border border-gray-300 rounded-lg px-3 py-2">
                    {['Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Subject</label>
                  <input value={newSlot.subject} onChange={e => setNewSlot(s => ({ ...s, subject: e.target.value }))} placeholder="Subject name" className="block w-full bg-white border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Start</label>
                  <input type="time" value={newSlot.start} onChange={e => setNewSlot(s => ({ ...s, start: e.target.value }))} className="block w-full bg-white border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">End</label>
                  <input type="time" value={newSlot.end} onChange={e => setNewSlot(s => ({ ...s, end: e.target.value }))} className="block w-full bg-white border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <button onClick={addSlot} className="bg-black text-white px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-900 transition-colors font-medium">
                  Add Slot
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left font-semibold">Day</th>
                      <th className="py-3 px-4 text-left font-semibold">Subject</th>
                      <th className="py-3 px-4 text-left font-semibold">Time</th>
                      <th className="py-3 px-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetable.map(slot => (
                      <tr key={slot.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="bg-black text-white px-2 py-1 rounded text-sm font-medium">{slot.day}</span>
                        </td>
                        <td className="py-3 px-4 font-medium">{slot.subject}</td>
                        <td className="py-3 px-4 font-mono text-sm">{slot.start} - {slot.end}</td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => removeSlot(slot.id)} className="bg-white text-black px-3 py-1 rounded border-2 border-gray-800 hover:bg-gray-100 transition-colors text-sm">
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {timetable.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 px-4 text-center text-gray-500">
                          No schedule slots added yet. Create your first slot above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white border-2 border-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Students</h2>
              </div>
              <p className="text-gray-600">View, edit marks and attendance, and open profiles</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-4 px-6 font-semibold">Student</th>
                    <th className="py-4 px-6 font-semibold">Attendance</th>
                    <th className="py-4 px-6 font-semibold">Marked By</th>
                    <th className="py-4 px-6 font-semibold">Proxy Status</th>
                    <th className="py-4 px-6 font-semibold">Marks</th>
                    <th className="py-4 px-6 font-semibold">Profile</th>
                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const isProxy = s.lastAttendance.proxy
                    const isPresent = s.lastAttendance.status === 'present'
                    const markedByStudent = s.lastAttendance.markedBy === 'student'
                    return (
                      <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <button
                            className="flex items-center gap-3 group w-full text-left"
                            onClick={() => setSelectedStudent(s)}
                            title="View profile"
                          >
                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-lg font-bold">
                              {s.avatar}
                            </div>
                            <div>
                              <div className="font-bold text-black group-hover:underline text-lg">{s.name}</div>
                              <div className="text-sm text-gray-600">{s.id}</div>
                            </div>
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          {isPresent ? (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${
                              isProxy ? 'bg-gray-200 text-gray-800' : 'bg-black text-white'
                            }`}>
                              <CheckCircle2 className="w-4 h-4" /> Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-gray-200 text-gray-800">
                              <XCircle className="w-4 h-4" /> Absent
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {markedByStudent ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
                              <Clock className="w-4 h-4" /> Student
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-black text-white">
                              <User className="w-4 h-4" /> Teacher
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {isProxy ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-200 text-gray-800">Proxy</span>
                          ) : (
                            <span className="text-gray-500 text-sm">Normal</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="px-2 py-1 bg-black text-white rounded text-xs font-medium">Math: {s.marks.maths}</span>
                            <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-medium">Sci: {s.marks.science}</span>
                            <span className="px-2 py-1 bg-black text-white rounded text-xs font-medium">Eng: {s.marks.english}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-medium">{s.profile.year}</span>
                            <span className="px-2 py-1 bg-black text-white rounded text-xs font-medium">{s.profile.dept}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              className="px-4 py-2 rounded-lg bg-white text-black border-2 border-gray-800 hover:bg-gray-100 text-sm inline-flex items-center gap-2 font-medium transition-all duration-200"
                              onClick={() => setEditingId(editingId === s.id ? null : s.id)}
                            >
                              <Edit3 className="w-4 h-4" /> {editingId === s.id ? 'Close' : 'Edit'}
                            </button>
                            {editingId === s.id && (
                              <div className="flex items-center gap-2">
                                <button
                                  className="px-4 py-2 rounded-lg bg-black text-white border border-gray-700 hover:bg-gray-900 text-sm font-medium transition-all duration-200"
                                  onClick={() => toggleAttendance(s.id)}
                                  title="Toggle Present/Absent"
                                >
                                  Toggle
                                </button>
                                <button
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                                    isProxy 
                                      ? 'bg-white text-black border-gray-800 hover:bg-gray-100'
                                      : 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300'
                                  }`}
                                  onClick={() => markProxy(s.id, !isProxy)}
                                  title="Flag/unflag proxy"
                                >
                                  {isProxy ? 'Clear Proxy' : 'Mark Proxy'}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 px-6 text-center text-gray-500">
                        No students enrolled yet. Add students using the quick actions panel.
                      </td>
                    </tr>
                  )}
                </tbody>
          </table>
        </div>
      </div>
      </div>
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedStudent(null)} />
          <div className="relative bg-white border-2 border-gray-800 rounded-xl p-8 w-[min(720px,92vw)] text-black shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                  {selectedStudent.avatar}
                </div>
                <div>
                  <div className="text-2xl font-bold">{selectedStudent.name}</div>
                  <div className="text-gray-600">{selectedStudent.id} • {selectedStudent.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!editProfileMode && (
                  <button onClick={() => startEditSelected(selectedStudent)} className="px-4 py-2 rounded-lg bg-black text-white border border-gray-700 hover:bg-gray-900 transition-colors">Edit</button>
                )}
                {editProfileMode && (
                  <>
                    <button onClick={saveEditSelected} className="px-4 py-2 rounded-lg bg-black text-white border border-gray-700 hover:bg-gray-900 transition-colors">Save</button>
                    <button onClick={cancelEditSelected} className="px-4 py-2 rounded-lg bg-white text-black border-2 border-gray-800 hover:bg-gray-100 transition-colors">Cancel</button>
                  </>
                )}
                <button onClick={() => setSelectedStudent(null)} className="p-2 rounded-lg bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-black font-semibold mb-3">Profile</div>
                <div className="space-y-3 text-sm">
                  <div><span className="text-gray-600">Year:</span> <span className="font-medium ml-2">{selectedStudent.profile.year}</span></div>
                  <div><span className="text-gray-600">Department:</span> <span className="font-medium ml-2">{selectedStudent.profile.dept}</span></div>
                  <div><span className="text-gray-600">Last Attendance:</span> <span className="font-medium ml-2">{selectedStudent.lastAttendance.date} • {selectedStudent.lastAttendance.status}</span></div>
                  <div><span className="text-gray-600">Total Attendance:</span> {editProfileMode ? (
                    <span className="ml-2">
                      <input type="number" min="0" className="bg-white border border-gray-300 rounded px-2 py-1 w-20" value={editAttendance.present} onChange={e => setEditAttendance(a => ({ ...a, present: e.target.value }))} />
                      <span className="mx-1">/</span>
                      <input type="number" min="0" className="bg-white border border-gray-300 rounded px-2 py-1 w-20" value={editAttendance.total} onChange={e => setEditAttendance(a => ({ ...a, total: e.target.value }))} />
                    </span>
                  ) : (
                    <span className="font-medium ml-2">{selectedStudent.attendanceSummary.present} / {selectedStudent.attendanceSummary.total}</span>
                  )}</div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-black font-semibold mb-3">Marks</div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between"><span className="text-gray-600">Maths</span>{editProfileMode ? (
                    <input type="number" className="bg-white border border-gray-300 rounded px-2 py-1 w-24" value={editMarks.maths} onChange={e => setEditMarks(m => ({ ...m, maths: Number(e.target.value) }))} />
                  ) : (<span className="font-bold text-lg">{selectedStudent.marks.maths}</span>)}</div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">Science</span>{editProfileMode ? (
                    <input type="number" className="bg-white border border-gray-300 rounded px-2 py-1 w-24" value={editMarks.science} onChange={e => setEditMarks(m => ({ ...m, science: Number(e.target.value) }))} />
                  ) : (<span className="font-bold text-lg">{selectedStudent.marks.science}</span>)}</div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">English</span>{editProfileMode ? (
                    <input type="number" className="bg-white border border-gray-300 rounded px-2 py-1 w-24" value={editMarks.english} onChange={e => setEditMarks(m => ({ ...m, english: Number(e.target.value) }))} />
                  ) : (<span className="font-bold text-lg">{selectedStudent.marks.english}</span>)}</div>
                </div>
              </div>
            </div>

            {!editProfileMode && (
              <div className="mt-8 flex justify-end">
                <button onClick={() => setSelectedStudent(null)} className="px-6 py-2 rounded-lg bg-white text-black border-2 border-gray-800 hover:bg-gray-100 transition-colors">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowAddStudent(false)} />
          <div className="relative bg-white border-2 border-gray-800 rounded-xl p-8 w-[min(720px,92vw)] text-black shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="text-2xl font-bold">Add New Student</div>
              <button onClick={() => setShowAddStudent(false)} className="p-2 rounded-lg bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Student ID</label>
                <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-black focus:outline-none" value={newStudent.id} onChange={e => setNewStudent(s => ({ ...s, id: e.target.value }))} />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-black focus:outline-none" value={newStudent.name} onChange={e => setNewStudent(s => ({ ...s, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-black focus:outline-none" value={newStudent.email} onChange={e => setNewStudent(s => ({ ...s, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Avatar (emoji)</label>
                <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-black focus:outline-none" value={newStudent.avatar} onChange={e => setNewStudent(s => ({ ...s, avatar: e.target.value }))} />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Year</label>
                <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-black focus:outline-none" value={newStudent.profile.year} onChange={e => setNewStudent(s => ({ ...s, profile: { ...s.profile, year: e.target.value } }))} />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Department</label>
                <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-black focus:outline-none" value={newStudent.profile.dept} onChange={e => setNewStudent(s => ({ ...s, profile: { ...s.profile, dept: e.target.value } }))} />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Maths</label>
                <input type="number" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-black focus:outline-none" value={newStudent.marks.maths} onChange={e => setNewStudent(s => ({ ...s, marks: { ...s.marks, maths: Number(e.target.value) } }))} />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Science</label>
                <input type="number" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-black focus:outline-none" value={newStudent.marks.science} onChange={e => setNewStudent(s => ({ ...s, marks: { ...s.marks, science: Number(e.target.value) } }))} />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">English</label>
                <input type="number" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-black focus:outline-none" value={newStudent.marks.english} onChange={e => setNewStudent(s => ({ ...s, marks: { ...s.marks, english: Number(e.target.value) } }))} />
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Attendance Present</label>
                  <input type="number" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-black focus:outline-none" value={newStudent.attendanceSummary.present} onChange={e => setNewStudent(s => ({ ...s, attendanceSummary: { ...s.attendanceSummary, present: Number(e.target.value) } }))} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Attendance Total</label>
                  <input type="number" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-black focus:outline-none" value={newStudent.attendanceSummary.total} onChange={e => setNewStudent(s => ({ ...s, attendanceSummary: { ...s.attendanceSummary, total: Number(e.target.value) } }))} />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowAddStudent(false)} className="px-6 py-2 rounded-lg bg-white text-black border-2 border-gray-800 hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={saveNewStudent} className="px-6 py-2 rounded-lg bg-black text-white border border-gray-700 hover:bg-gray-900 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard
