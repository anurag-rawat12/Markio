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
      return res.status(400).json({
        message: "An active attendance session already exists for this period today",
        existingCode: existingSession.activeCode.code,
        expiresAt: existingSession.activeCode.expiresAt
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
      message: "Attendance marked successfully",
      sessionId: attendanceSession._id,
      subject: attendanceSession.subject,
      day: attendanceSession.day,
      periodNumber: attendanceSession.periodNumber,
      attendanceMarked: attendanceSession.TotalAttendanceMarked,
      totalStudents: attendanceSession.TotalStudent,
      sessionStatus: attendanceSession.sessionStatus,
      markedAt: new Date()
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
