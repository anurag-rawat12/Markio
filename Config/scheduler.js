import cron from 'node-cron';
import Period from '../Models/Period.js';
import TimeTable from '../Models/TimeTable.js';
import User from '../Models/Users.js';

// Function to transfer attendance data from temporary Period to permanent storage
const transferAttendanceData = async (periodSession) => {
  try {
    // Update timetable with attendance statistics
    await TimeTable.findOneAndUpdate(
      {
        _id: periodSession.timetableId,
        "slots.day": periodSession.day,
        "slots.periods.periodNumber": periodSession.periodNumber
      },
      {
        $inc: {
          "slots.$[daySlot].periods.$[period].totalClassesConducted": 1,
          "slots.$[daySlot].periods.$[period].totalStudentsAttended": periodSession.TotalAttendanceMarked
        },
        $push: {
          "slots.$[daySlot].periods.$[period].attendanceHistory": {
            date: periodSession.classDate,
            totalStudents: periodSession.TotalStudent,
            attendedStudents: periodSession.TotalAttendanceMarked,
            attendancePercentage: Math.round((periodSession.TotalAttendanceMarked / periodSession.TotalStudent) * 100)
          }
        }
      },
      {
        arrayFilters: [
          { "daySlot.day": periodSession.day },
          { "period.periodNumber": periodSession.periodNumber }
        ]
      }
    );

    // Update students who attended
    for (const student of periodSession.attendedStudents) {
      await User.findByIdAndUpdate(
        student.studentId,
        {
          $inc: {
            totalAttendance: 1,
            attendedClasses: 1,
            totalClassesHeld: 1
          }
        }
      );
    }

    // Update students who didn't attend (increment only totalClassesHeld)
    // First, get all students in the same timetable
    const timetable = await TimeTable.findById(periodSession.timetableId);
    if (timetable) {
      // Find all students in this timetable's college/branch/section/batch
      const allStudents = await User.find({
        role: 'STUDENT',
        collegeId: timetable.collegeId,
        branchIds: { $in: [timetable.branchId] },
        section: timetable.section,
        batch: timetable.batch
      });

      const attendedStudentIds = periodSession.attendedStudents.map(s => s.studentId.toString());
      const absentStudents = allStudents.filter(student => 
        !attendedStudentIds.includes(student._id.toString())
      );

      // Update absent students - only increment totalClassesHeld
      for (const absentStudent of absentStudents) {
        await User.findByIdAndUpdate(
          absentStudent._id,
          {
            $inc: {
              totalClassesHeld: 1
            },
            $push: {
              attendanceRecords: {
                timetableId: periodSession.timetableId,
                subject: periodSession.subject,
                date: periodSession.classDate,
                day: periodSession.day,
                periodNumber: periodSession.periodNumber,
                status: 'Absent',
                markedAt: new Date()
              }
            }
          }
        );
      }
    }

    console.log(`✅ Transferred attendance data for ${periodSession.subject} - ${periodSession.day} Period ${periodSession.periodNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Error transferring attendance data:', error);
    return false;
  }
};

// Function to process expiring sessions
const processExpiringSessions = async () => {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Find sessions that will expire in the next 5 minutes
    const expiringSessions = await Period.find({
      sessionStatus: { $in: ['active', 'completed'] },
      createdAt: {
        $lte: fiveMinutesFromNow,
        $gte: new Date(now.getTime() - 10 * 60 * 1000) // Created within last 10 minutes
      }
    });

    console.log(`📊 Processing ${expiringSessions.length} expiring attendance sessions...`);

    for (const session of expiringSessions) {
      const success = await transferAttendanceData(session);
      if (success) {
        // Mark as processed to avoid duplicate processing
        session.sessionStatus = 'processed';
        await session.save();
      }
    }

    console.log(`✅ Completed processing expiring sessions at ${now.toISOString()}`);
  } catch (error) {
    console.error('❌ Error processing expiring sessions:', error);
  }
};

// Function to clean up old processed sessions (older than 1 hour)
const cleanupProcessedSessions = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const result = await Period.deleteMany({
      sessionStatus: 'processed',
      createdAt: { $lt: oneHourAgo }
    });

    if (result.deletedCount > 0) {
      console.log(`🗑️ Cleaned up ${result.deletedCount} old processed attendance sessions`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up processed sessions:', error);
  }
};

// Initialize scheduler
export const initializeAttendanceScheduler = () => {
  console.log('🚀 Initializing attendance data transfer scheduler...');

  // Run every 2 minutes to check for expiring sessions
  cron.schedule('*/2 * * * *', () => {
    processExpiringSessions();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Adjust timezone as needed
  });

  // Run every hour to clean up old processed sessions
  cron.schedule('0 * * * *', () => {
    cleanupProcessedSessions();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('✅ Attendance scheduler initialized successfully');
};

// Manual function to transfer specific session (useful for testing)
export const manualTransferSession = async (sessionId) => {
  try {
    const session = await Period.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const success = await transferAttendanceData(session);
    if (success) {
      session.sessionStatus = 'processed';
      await session.save();
    }

    return success;
  } catch (error) {
    console.error('Error in manual transfer:', error);
    return false;
  }
};

export default {
  initializeAttendanceScheduler,
  manualTransferSession,
  transferAttendanceData
};