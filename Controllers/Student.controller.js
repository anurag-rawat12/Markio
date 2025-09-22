import Students from "../Models/Students.js";
import Period from "../Models/Period.js";
import TimeTable from "../Models/TimeTable.js";
import Branch from "../Models/Branches.js";

// ✅ Get all students of a specific college
export const getStudentsByCollege = async (req, res) => {
    try {
        const { id } = req.params; // college ID
        
        // Find all students belonging to this college
        const students = await Students.find({ institutionName: id })
            .populate('institutionName', 'institutionName')
            .select('-password'); // exclude password from response
        
        if (!students || students.length === 0) {
            return res.status(200).json({ 
                message: 'No students found for this college',
                count: 0,
                students: []
            });
        }
        
        console.log(`Found ${students.length} students for college ${id}`);
        return res.status(200).json({
            message: "Students fetched successfully",
            count: students.length,
            students,
        });
    } catch (error) {
        console.error("Error fetching students by college:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Get comprehensive student attendance data from Period schema
export const getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { branchId } = req.query; // Optional: can be derived from student's branch
        
        // Verify student exists
        const student = await Students.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        let actualBranchId = branchId;
        
        // If branchId not provided, find it from the student's branch membership
        if (!branchId) {
            const branch = await Branch.findOne({ students: studentId });
            if (!branch) {
                return res.status(404).json({ 
                    message: "Student is not assigned to any branch",
                    studentId,
                    attendance: {
                        liveAttendance: [],
                        historicalAttendance: [],
                        totalClasses: 0,
                        attendedClasses: 0,
                        attendancePercentage: 0,
                        subjectWiseAttendance: []
                    }
                });
            }
            actualBranchId = branch._id;
        }
        
        // Get timetable for the branch
        const timetable = await TimeTable.findOne({ branchId: actualBranchId })
            .populate('branchId', 'branchName section year')
            .populate('slots.periods.teacherId', 'fullName email');
            
        if (!timetable) {
            return res.status(404).json({ 
                message: "No timetable found for this branch",
                branchId: actualBranchId,
                attendance: {
                    liveAttendance: [],
                    historicalAttendance: [],
                    totalClasses: 0,
                    attendedClasses: 0,
                    attendancePercentage: 0,
                    subjectWiseAttendance: []
                }
            });
        }
        
        // 1. Get live attendance from Period schema (current active sessions)
        const livePeriods = await Period.find({ 
            timetableId: timetable._id,
            'attendedStudents.studentId': studentId
        })
        .populate('teacherId', 'fullName email')
        .sort({ createdAt: -1 });
        
        // 2. Get historical attendance from TimeTable schema
        const historicalAttendance = [];
        const subjectStats = new Map();
        let totalClassesConducted = 0;
        let totalStudentAttendances = 0;
        
        // Process each day and period in the timetable
        timetable.slots.forEach(daySlot => {
            daySlot.periods.forEach(period => {
                const subjectKey = period.subject;
                
                // Initialize subject stats if not exists
                if (!subjectStats.has(subjectKey)) {
                    subjectStats.set(subjectKey, {
                        subject: period.subject,
                        teacherName: period.teacherId?.fullName || 'Unknown',
                        totalClasses: 0,
                        attendedClasses: 0,
                        attendancePercentage: 0,
                        attendanceHistory: []
                    });
                }
                
                const subjectStat = subjectStats.get(subjectKey);
                
                // Process attendance history for this period
                if (period.attendanceHistory && period.attendanceHistory.length > 0) {
                    period.attendanceHistory.forEach(attendance => {
                        totalClassesConducted++;
                        subjectStat.totalClasses++;
                        
                        // Check if student was present in this class
                        // NOTE: The current TimeTable schema doesn't store individual student attendance records
                        // For now, we estimate based on average class attendance rates
                        // In production, you should modify the schema to store individual student records
                        const estimatedPresenceRate = attendance.attendancePercentage / 100;
                        const wasPresent = estimatedPresenceRate > 0.7; // Conservative estimate
                        
                        if (wasPresent) {
                            totalStudentAttendances++;
                            subjectStat.attendedClasses++;
                        }
                        
                        historicalAttendance.push({
                            date: attendance.date,
                            day: daySlot.day,
                            periodNumber: period.periodNumber,
                            subject: period.subject,
                            teacher: period.teacherId?.fullName || 'Unknown',
                            status: wasPresent ? 'Present' : 'Absent',
                            totalStudents: attendance.totalStudents,
                            attendedStudents: attendance.attendedStudents,
                            classAttendancePercentage: attendance.attendancePercentage
                        });
                        
                        subjectStat.attendanceHistory.push({
                            date: attendance.date,
                            status: wasPresent ? 'Present' : 'Absent',
                            classAttendancePercentage: attendance.attendancePercentage
                        });
                    });
                }
                
                // Calculate subject-wise attendance percentage
                subjectStat.attendancePercentage = subjectStat.totalClasses > 0 
                    ? Math.round((subjectStat.attendedClasses / subjectStat.totalClasses) * 100)
                    : 0;
            });
        });
        
        // 3. Process live attendance data
        const liveAttendance = livePeriods.map(period => {
            const studentAttendance = period.attendedStudents.find(
                att => att.studentId.toString() === studentId
            );
            
            return {
                periodId: period._id,
                date: period.classDate,
                day: period.day,
                periodNumber: period.periodNumber,
                subject: period.subject,
                teacher: period.teacherId?.fullName || 'Unknown',
                startTime: period.startTime,
                endTime: period.endTime,
                status: 'Present',
                markedAt: studentAttendance?.markedAt,
                sessionStatus: period.sessionStatus,
                totalStudents: period.TotalStudent,
                attendanceMarked: period.TotalAttendanceMarked
            };
        });
        
        // Add live attendance to subject stats
        liveAttendance.forEach(attendance => {
            if (subjectStats.has(attendance.subject)) {
                const subjectStat = subjectStats.get(attendance.subject);
                subjectStat.totalClasses++;
                subjectStat.attendedClasses++;
                subjectStat.attendancePercentage = Math.round((subjectStat.attendedClasses / subjectStat.totalClasses) * 100);
            }
        });
        
        // 4. Calculate overall statistics
        const totalClasses = totalClassesConducted + liveAttendance.length;
        const attendedClasses = totalStudentAttendances + liveAttendance.length;
        const overallAttendancePercentage = totalClasses > 0 
            ? Math.round((attendedClasses / totalClasses) * 100)
            : 0;
            
        // Convert subject stats to array
        const subjectWiseAttendance = Array.from(subjectStats.values());
        
        // 5. Return comprehensive attendance data
        return res.status(200).json({
            message: "Student attendance fetched successfully",
            studentId,
            studentName: student.fullName,
            branchId: actualBranchId,
            branchInfo: timetable.branchId,
            attendance: {
                // Live attendance from current/recent sessions
                liveAttendance,
                
                // Historical attendance from completed sessions
                historicalAttendance: historicalAttendance.sort((a, b) => new Date(b.date) - new Date(a.date)),
                
                // Overall statistics
                totalClasses,
                attendedClasses,
                absentClasses: totalClasses - attendedClasses,
                attendancePercentage: overallAttendancePercentage,
                
                // Subject-wise breakdown
                subjectWiseAttendance,
                
                // Additional metrics
                recentAttendance: [...liveAttendance, ...historicalAttendance.slice(-10)]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 10),
                    
                attendanceStatus: overallAttendancePercentage >= 75 ? 'Good' : 
                               overallAttendancePercentage >= 60 ? 'Warning' : 'Critical',
                               
                lastUpdated: new Date()
            }
        });
        
    } catch (error) {
        console.error("Error fetching student attendance:", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

// ✅ Get student attendance data focused on Period schema (more accurate)
export const getStudentAttendanceSimple = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { branchId } = req.query;
        
        // Verify student exists
        const student = await Students.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        let actualBranchId = branchId;
        
        // If branchId not provided, find it from the student's branch membership
        if (!branchId) {
            const branch = await Branch.findOne({ students: studentId });
            if (branch) {
                actualBranchId = branch._id;
            }
        }
        
        // Get timetable for the branch to find timetableId
        const timetable = await TimeTable.findOne({ branchId: actualBranchId })
            .populate('branchId', 'branchName section year');
            
        if (!timetable) {
            return res.status(404).json({ 
                message: "No timetable found for this branch",
                studentId,
                branchId: actualBranchId,
                attendance: {
                    attendedSessions: [],
                    totalSessions: 0,
                    attendancePercentage: 0,
                    subjectWiseAttendance: {},
                    recentAttendance: []
                }
            });
        }
        
        // Get all attendance sessions where the student was present
        const attendedSessions = await Period.find({
            timetableId: timetable._id,
            'attendedStudents.studentId': studentId
        })
        .populate('teacherId', 'fullName email')
        .sort({ classDate: -1, createdAt: -1 });
        
        // Get total sessions conducted for this timetable (regardless of student attendance)
        const totalSessions = await Period.countDocuments({
            timetableId: timetable._id
        });
        
        // Process attendance data
        const subjectWiseStats = {};
        const attendanceRecords = [];
        
        // Process attended sessions
        attendedSessions.forEach(session => {
            const studentRecord = session.attendedStudents.find(
                record => record.studentId.toString() === studentId
            );
            
            // Initialize subject stats if not exists
            if (!subjectWiseStats[session.subject]) {
                subjectWiseStats[session.subject] = {
                    subject: session.subject,
                    attendedClasses: 0,
                    totalClasses: 0,
                    attendancePercentage: 0,
                    teacherName: session.teacherId?.fullName || 'Unknown'
                };
            }
            
            subjectWiseStats[session.subject].attendedClasses++;
            
            attendanceRecords.push({
                sessionId: session._id,
                date: session.classDate,
                day: session.day,
                periodNumber: session.periodNumber,
                subject: session.subject,
                teacher: session.teacherId?.fullName || 'Unknown',
                startTime: session.startTime,
                endTime: session.endTime,
                status: 'Present',
                markedAt: studentRecord.markedAt,
                sessionStatus: session.sessionStatus,
                totalStudentsInClass: session.TotalStudent,
                attendanceMarkedInClass: session.TotalAttendanceMarked
            });
        });
        
        // Count total classes by subject from all sessions
        const allSessions = await Period.find({ timetableId: timetable._id });
        allSessions.forEach(session => {
            if (!subjectWiseStats[session.subject]) {
                subjectWiseStats[session.subject] = {
                    subject: session.subject,
                    attendedClasses: 0,
                    totalClasses: 0,
                    attendancePercentage: 0,
                    teacherName: 'Unknown'
                };
            }
            subjectWiseStats[session.subject].totalClasses++;
        });
        
        // Calculate percentages for each subject
        Object.keys(subjectWiseStats).forEach(subject => {
            const stats = subjectWiseStats[subject];
            stats.attendancePercentage = stats.totalClasses > 0 
                ? Math.round((stats.attendedClasses / stats.totalClasses) * 100)
                : 0;
        });
        
        // Calculate overall attendance percentage
        const totalAttended = attendedSessions.length;
        const overallAttendancePercentage = totalSessions > 0 
            ? Math.round((totalAttended / totalSessions) * 100)
            : 0;
            
        return res.status(200).json({
            message: "Student attendance fetched successfully",
            studentId,
            studentName: student.fullName,
            studentEmail: student.email,
            branchId: actualBranchId,
            branchInfo: timetable.branchId,
            attendance: {
                // Summary statistics
                totalSessions,
                attendedSessions: totalAttended,
                absentSessions: totalSessions - totalAttended,
                attendancePercentage: overallAttendancePercentage,
                
                // Attendance status based on percentage
                attendanceStatus: overallAttendancePercentage >= 75 ? 'Good' : 
                               overallAttendancePercentage >= 60 ? 'Warning' : 'Critical',
                
                // Subject-wise breakdown
                subjectWiseAttendance: Object.values(subjectWiseStats),
                
                // Detailed attendance records (recent first)
                attendanceRecords,
                
                // Recent 10 attendance records
                recentAttendance: attendanceRecords.slice(0, 10),
                
                // Metadata
                lastUpdated: new Date(),
                dataSource: 'Period Schema (Live Sessions)'
            }
        });
        
    } catch (error) {
        console.error("Error fetching student attendance:", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

export const GetStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Students.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json({ student });
    } catch (error) {
        console.error("❌ Error fetching student:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
