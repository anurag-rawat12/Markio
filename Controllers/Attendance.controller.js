import Attendance from "../Models/Attendance.js";
import TimeTable from "../Models/TimeTable.js";
import Period from "../Models/Period.js";
import Student from "../Models/Students.js";
import Teacher from "../Models/Teachers.js";

// Function for teacher to initialize attendance session (creates temporary Period document)
export const initializeAttendance = async (req, res) => {
  try {
    const { timetableId, day, periodNumber, totalStudents, teacherId } = req.body;

    console.log("📥 Received attendance initialization request:", req.body);
    
    if (!timetableId || !day || !periodNumber || !totalStudents || !teacherId || totalStudents <= 0) {
      return res.status(400).json({ 
        message: "Timetable ID, day, period number, teacher ID, and valid total students count are required" 
      });
    }

    // Find the timetable and the specific period
    const timetable = await TimeTable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    // Find the specific day and period
    const daySlot = timetable.slots.find(slot => slot.day === day);
    if (!daySlot) {
      return res.status(404).json({ message: "Day not found in timetable" });
    }

    const timetablePeriod = daySlot.periods.find(p => p.periodNumber === periodNumber);
    if (!timetablePeriod) {
      return res.status(404).json({ message: "Period not found" });
    }

    // Check if there's already an active session for this period today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingSession = await Period.findOne({
      timetableId,
      day,
      periodNumber,
      classDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      sessionStatus: 'active'
    });

    if (existingSession) {
      // Return existing session details instead of error
      return res.status(200).json({
        message: "Active attendance session found",
        sessionId: existingSession._id,
        attendanceCode: existingSession.activeCode.code,
        totalStudents: existingSession.TotalStudent,
        attendanceMarked: existingSession.TotalAttendanceMarked,
        expiresAt: existingSession.activeCode.expiresAt,
        timetableId: existingSession.timetableId,
        day: existingSession.day,
        periodNumber: existingSession.periodNumber,
        subject: existingSession.subject,
        isExistingSession: true
      });
    }

    // Generate a random 6-digit attendance code
    const attendanceCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (1 hour from now)
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1);

    // Create temporary attendance session in Period collection
    const attendanceSession = new Period({
      timetableId,
      day,
      periodNumber,
      subject: timetablePeriod.subject,
      teacherId,
      startTime: timetablePeriod.startTime,
      endTime: timetablePeriod.endTime,
      TotalStudent: totalStudents,
      TotalAttendanceMarked: 0,
      activeCode: {
        code: attendanceCode,
        expiresAt: expiryTime
      },
      attendedStudents: [],
      sessionStatus: 'active',
      classDate: new Date()
    });

    await attendanceSession.save();

    res.status(200).json({
      message: "Attendance session initialized successfully",
      sessionId: attendanceSession._id,
      attendanceCode,
      totalStudents,
      expiresAt: expiryTime,
      timetableId,
      day,
      periodNumber,
      subject: timetablePeriod.subject
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error while initializing attendance", 
      error: error.message 
    });
  }
};

// Function for students to mark their attendance (uses temporary Period session)
export const markAttendance = async (req, res) => {
  try {
    const { attendanceCode, studentId } = req.body;
    
    if (!attendanceCode || !studentId) {
      return res.status(400).json({ 
        message: "Attendance code and student ID are required" 
      });
    }

    // Find the active attendance session by code
    const attendanceSession = await Period.findOne({
      'activeCode.code': attendanceCode,
      sessionStatus: 'active'
    });

    if (!attendanceSession) {
      return res.status(404).json({ message: "Invalid or expired attendance code" });
    }

    // Check if code has expired
    if (new Date() > attendanceSession.activeCode.expiresAt) {
      attendanceSession.sessionStatus = 'expired';
      await attendanceSession.save();
      return res.status(400).json({ message: "Attendance code has expired" });
    }

    // Check if attendance limit has been reached
    if (attendanceSession.TotalAttendanceMarked >= attendanceSession.TotalStudent) {
      attendanceSession.sessionStatus = 'completed';
      await attendanceSession.save();
      return res.status(400).json({ 
        message: "Attendance limit reached. No more attendance can be marked for this session." 
      });
    }

    // Check if student has already marked attendance in this session
    const alreadyAttended = attendanceSession.attendedStudents.some(
      student => student.studentId.toString() === studentId
    );

    if (alreadyAttended) {
      return res.status(400).json({ 
        message: "Attendance already marked for this session" 
      });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Add student to attended list
    attendanceSession.attendedStudents.push({
      studentId: studentId,
      markedAt: new Date()
    });

    // Increment attendance count
    attendanceSession.TotalAttendanceMarked += 1;

    // Check if we've reached the limit
    if (attendanceSession.TotalAttendanceMarked >= attendanceSession.TotalStudent) {
      attendanceSession.sessionStatus = 'completed';
    }

    // Save the updated session
    await attendanceSession.save();

    // Add attendance record to student's profile
    await Student.findByIdAndUpdate(
      studentId,
      {
        $push: {
          attendanceRecords: {
            timetableId: attendanceSession.timetableId,
            subject: attendanceSession.subject,
            date: attendanceSession.classDate,
            day: attendanceSession.day,
            periodNumber: attendanceSession.periodNumber,
            status: 'Present',
            markedAt: new Date()
          }
        },
        $inc: {
          totalAttendance: 1,
          attendedClasses: 1
        }
      }
    );

    res.status(200).json({
      success: true,
      message: "🎉 Attendance marked successfully!",
      details: {
        subject: attendanceSession.subject,
        day: attendanceSession.day,
        periodNumber: attendanceSession.periodNumber,
        markedAt: new Date().toLocaleString(),
        status: "Present"
      },
      sessionInfo: {
        sessionId: attendanceSession._id,
        attendanceMarked: attendanceSession.TotalAttendanceMarked,
        totalStudents: attendanceSession.TotalStudent,
        sessionStatus: attendanceSession.sessionStatus,
        attendancePercentage: Math.round((attendanceSession.TotalAttendanceMarked / attendanceSession.TotalStudent) * 100)
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error while marking attendance", 
      error: error.message 
    });
  }
};

// Function to check attendance session status (checks temporary Period session)
export const getAttendanceStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ 
        message: "Session ID is required" 
      });
    }

    // Find the attendance session
    const attendanceSession = await Period.findById(sessionId)
      .populate('teacherId', 'name email')
      .populate('attendedStudents.studentId', 'name rollNumber');

    if (!attendanceSession) {
      return res.status(404).json({ message: "Attendance session not found" });
    }

    // Check if session is still active
    const now = new Date();
    const isExpired = now > attendanceSession.activeCode.expiresAt;
    const isCompleted = attendanceSession.TotalAttendanceMarked >= attendanceSession.TotalStudent;
    
    let sessionStatus = attendanceSession.sessionStatus;
    
    // Update status if needed
    if (sessionStatus === 'active' && (isExpired || isCompleted)) {
      sessionStatus = isExpired ? 'expired' : 'completed';
      attendanceSession.sessionStatus = sessionStatus;
      await attendanceSession.save();
    }

    const isActive = sessionStatus === 'active';

    res.status(200).json({
      sessionId: attendanceSession._id,
      timetableId: attendanceSession.timetableId,
      day: attendanceSession.day,
      periodNumber: attendanceSession.periodNumber,
      subject: attendanceSession.subject,
      teacher: attendanceSession.teacherId,
      startTime: attendanceSession.startTime,
      endTime: attendanceSession.endTime,
      classDate: attendanceSession.classDate,
      totalStudents: attendanceSession.TotalStudent,
      attendanceMarked: attendanceSession.TotalAttendanceMarked,
      sessionStatus,
      isActive,
      expiresAt: attendanceSession.activeCode.expiresAt,
      attendanceCode: isActive ? attendanceSession.activeCode.code : null,
      attendedStudents: attendanceSession.attendedStudents,
      attendancePercentage: Math.round((attendanceSession.TotalAttendanceMarked / attendanceSession.TotalStudent) * 100),
      createdAt: attendanceSession.createdAt
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error while fetching attendance status", 
      error: error.message 
    });
  }
};

// Function to get attendance status by code (for students)
export const getAttendanceStatusByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({ 
        message: "Attendance code is required" 
      });
    }

    // Find the attendance session by code
    const attendanceSession = await Period.findOne({ 'activeCode.code': code })
      .populate('teacherId', 'name email');

    if (!attendanceSession) {
      return res.status(404).json({ message: "Invalid attendance code" });
    }

    // Check session status
    const now = new Date();
    const isExpired = now > attendanceSession.activeCode.expiresAt;
    const isCompleted = attendanceSession.TotalAttendanceMarked >= attendanceSession.TotalStudent;
    
    let sessionStatus = attendanceSession.sessionStatus;
    if (sessionStatus === 'active' && (isExpired || isCompleted)) {
      sessionStatus = isExpired ? 'expired' : 'completed';
    }

    res.status(200).json({
      sessionId: attendanceSession._id,
      subject: attendanceSession.subject,
      teacher: attendanceSession.teacherId.name,
      day: attendanceSession.day,
      periodNumber: attendanceSession.periodNumber,
      startTime: attendanceSession.startTime,
      endTime: attendanceSession.endTime,
      totalStudents: attendanceSession.TotalStudent,
      attendanceMarked: attendanceSession.TotalAttendanceMarked,
      sessionStatus,
      isActive: sessionStatus === 'active',
      expiresAt: attendanceSession.activeCode.expiresAt,
      timeRemaining: sessionStatus === 'active' ? 
        Math.max(0, Math.floor((attendanceSession.activeCode.expiresAt - now) / 1000)) : 0
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error while fetching attendance status", 
      error: error.message 
    });
  }
};

// Function to check if there's an existing active session
export const checkExistingSession = async (req, res) => {
  try {
    const { timetableId, day, periodNumber, teacherId } = req.body;
    
    if (!timetableId || !day || !periodNumber || !teacherId) {
      return res.status(400).json({ 
        message: "Timetable ID, day, period number, and teacher ID are required" 
      });
    }

    // Check if there's already an active session for this period today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingSession = await Period.findOne({
      timetableId,
      day,
      periodNumber,
      teacherId,
      classDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      sessionStatus: 'active',
      'activeCode.expiresAt': { $gt: new Date() }
    });

    if (existingSession) {
      return res.status(200).json({
        hasActiveSession: true,
        sessionId: existingSession._id,
        attendanceCode: existingSession.activeCode.code,
        totalStudents: existingSession.TotalStudent,
        attendanceMarked: existingSession.TotalAttendanceMarked,
        expiresAt: existingSession.activeCode.expiresAt
      });
    }

    res.status(200).json({
      hasActiveSession: false
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error while checking existing session", 
      error: error.message 
    });
  }
};

// Function to get present students list
export const getPresentStudents = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ 
        message: "Session ID is required" 
      });
    }

    // Find the attendance session
    const attendanceSession = await Period.findById(sessionId)
      .populate('attendedStudents.studentId', 'name rollNumber enrollmentNumber email');

    if (!attendanceSession) {
      return res.status(404).json({ message: "Attendance session not found" });
    }

    // Format present students data
    const presentStudents = attendanceSession.attendedStudents.map(attendance => ({
      studentId: attendance.studentId._id,
      name: attendance.studentId.name,
      enrollmentNumber: attendance.studentId.enrollmentNumber || attendance.studentId.rollNumber,
      email: attendance.studentId.email,
      markedAt: attendance.markedAt
    }));

    res.status(200).json({
      sessionId: attendanceSession._id,
      subject: attendanceSession.subject,
      day: attendanceSession.day,
      periodNumber: attendanceSession.periodNumber,
      totalStudents: attendanceSession.TotalStudent,
      attendanceMarked: attendanceSession.TotalAttendanceMarked,
      sessionStatus: attendanceSession.sessionStatus,
      presentStudents
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error while fetching present students", 
      error: error.message 
    });
  }
};

// Function to complete attendance session
export const completeAttendanceSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ 
        message: "Session ID is required" 
      });
    }

    // Find and update the attendance session
    const attendanceSession = await Period.findById(sessionId);

    if (!attendanceSession) {
      return res.status(404).json({ message: "Attendance session not found" });
    }

    if (attendanceSession.sessionStatus !== 'active') {
      return res.status(400).json({ 
        message: "Session is not active",
        currentStatus: attendanceSession.sessionStatus
      });
    }

    // Mark session as completed
    attendanceSession.sessionStatus = 'completed';
    await attendanceSession.save();

    res.status(200).json({
      message: "Attendance session completed successfully",
      sessionId: attendanceSession._id,
      totalStudents: attendanceSession.TotalStudent,
      attendanceMarked: attendanceSession.TotalAttendanceMarked,
      sessionStatus: attendanceSession.sessionStatus
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error while completing attendance session", 
      error: error.message 
    });
  }
};

// Function to end attendance session (teacher manually ending)
export const endAttendanceSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ 
        message: "Session ID is required" 
      });
    }

    // Find and update the attendance session
    const attendanceSession = await Period.findById(sessionId);

    if (!attendanceSession) {
      return res.status(404).json({ message: "Attendance session not found" });
    }

    if (attendanceSession.sessionStatus !== 'active') {
      return res.status(400).json({ 
        message: "Session is not active",
        currentStatus: attendanceSession.sessionStatus
      });
    }

    // Mark session as ended by teacher
    attendanceSession.sessionStatus = 'ended';
    await attendanceSession.save();

    res.status(200).json({
      message: "Attendance session ended successfully",
      sessionId: attendanceSession._id,
      totalStudents: attendanceSession.TotalStudent,
      attendanceMarked: attendanceSession.TotalAttendanceMarked,
      sessionStatus: attendanceSession.sessionStatus
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error while ending attendance session", 
      error: error.message 
    });
  }
};

// Function to get real-time attendance count (for teacher dashboard polling)
export const getRealTimeAttendanceCount = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ 
        message: "Session ID is required" 
      });
    }

    // Find the attendance session with fresh data from database
    const attendanceSession = await Period.findById(sessionId).lean();

    if (!attendanceSession) {
      return res.status(404).json({ message: "Attendance session not found" });
    }

    // Check if session is still active
    const now = new Date();
    const isExpired = now > new Date(attendanceSession.activeCode.expiresAt);
    const isCompleted = attendanceSession.TotalAttendanceMarked >= attendanceSession.TotalStudent;
    
    let sessionStatus = attendanceSession.sessionStatus;
    let needsUpdate = false;
    
    // Update status if needed
    if (sessionStatus === 'active' && (isExpired || isCompleted)) {
      sessionStatus = isExpired ? 'expired' : 'completed';
      needsUpdate = true;
    }

    // Update the session status in database if needed
    if (needsUpdate) {
      await Period.findByIdAndUpdate(sessionId, { sessionStatus });
    }

    // Calculate attendance percentage
    const attendancePercentage = attendanceSession.TotalStudent > 0 
      ? Math.round((attendanceSession.TotalAttendanceMarked / attendanceSession.TotalStudent) * 100)
      : 0;

    // Calculate time remaining
    const timeRemaining = sessionStatus === 'active' 
      ? Math.max(0, Math.floor((new Date(attendanceSession.activeCode.expiresAt) - now) / 1000))
      : 0;

    console.log(`📊 Real-time update: ${attendanceSession.TotalAttendanceMarked}/${attendanceSession.TotalStudent} students (${attendancePercentage}%)`);

    res.status(200).json({
      sessionId: attendanceSession._id,
      attendanceMarked: attendanceSession.TotalAttendanceMarked,
      totalStudents: attendanceSession.TotalStudent,
      attendancePercentage,
      sessionStatus,
      isActive: sessionStatus === 'active',
      timeRemaining,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching real-time attendance:', error);
    res.status(500).json({ 
      message: "Error while fetching real-time attendance count", 
      error: error.message 
    });
  }
};

// Function to check if student has already marked attendance for current active sessions
export const checkStudentAttendanceStatus = async (req, res) => {
  try {
    const { studentId, timetableId, day, periodNumber } = req.query;
    
    if (!studentId) {
      return res.status(400).json({ 
        message: "Student ID is required" 
      });
    }

    // Find active sessions for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let query = {
      classDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      sessionStatus: 'active',
      'activeCode.expiresAt': { $gt: new Date() }
    };

    // If specific period info is provided, filter by it
    if (timetableId && day && periodNumber) {
      query.timetableId = timetableId;
      query.day = day;
      query.periodNumber = parseInt(periodNumber);
    }

    const activeSessions = await Period.find(query);
    
    const attendanceStatus = [];

    for (const session of activeSessions) {
      const hasMarkedAttendance = session.attendedStudents.some(
        student => student.studentId.toString() === studentId
      );
      
      attendanceStatus.push({
        sessionId: session._id,
        timetableId: session.timetableId,
        subject: session.subject,
        day: session.day,
        periodNumber: session.periodNumber,
        attendanceCode: session.activeCode.code,
        hasMarkedAttendance,
        markedAt: hasMarkedAttendance ? 
          session.attendedStudents.find(s => s.studentId.toString() === studentId)?.markedAt : null,
        expiresAt: session.activeCode.expiresAt,
        totalStudents: session.TotalStudent,
        attendanceMarked: session.TotalAttendanceMarked,
        attendancePercentage: Math.round((session.TotalAttendanceMarked / session.TotalStudent) * 100)
      });
    }

    res.status(200).json({
      studentId,
      activeSessions: attendanceStatus,
      hasActiveAttendance: attendanceStatus.length > 0,
      markedSessions: attendanceStatus.filter(s => s.hasMarkedAttendance),
      pendingSessions: attendanceStatus.filter(s => !s.hasMarkedAttendance)
    });

  } catch (error) {
    console.error('Error checking student attendance status:', error);
    res.status(500).json({ 
      message: "Error while checking attendance status", 
      error: error.message 
    });
  }
};
