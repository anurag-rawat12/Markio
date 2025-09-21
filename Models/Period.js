import mongoose from "mongoose";

// Temporary attendance session schema - auto-deletes after 10 minutes
const PeriodSchema = new mongoose.Schema({
    // Reference to the timetable and specific period
    timetableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeTable',
        required: true
    },
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    periodNumber: { type: Number, required: true },
    subject: { type: String, required: true },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teachers',
        required: true
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    
    // Temporary attendance session data
    TotalStudent: { type: Number, required: true },
    TotalAttendanceMarked: { type: Number, default: 0 },
    
    // Active attendance code
    activeCode: {
        code: { type: String, required: true },
        expiresAt: { type: Date, required: true }
    },
    
    // Students who have marked attendance in this session
    attendedStudents: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Students',
            required: true
        },
        markedAt: { type: Date, default: Date.now }
    }],
    
    // Session status
    sessionStatus: {
        type: String,
        enum: ['active', 'completed', 'expired'],
        default: 'active'
    },
    
    // Date of the class
    classDate: { type: Date, required: true },
    
    // Auto-delete after 10 minutes (600 seconds)
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // 10 minutes in seconds
    }
});

// Index for efficient queries
PeriodSchema.index({ timetableId: 1, day: 1, periodNumber: 1, classDate: 1 });
PeriodSchema.index({ activeCode: 1 });
PeriodSchema.index({ teacherId: 1 });

// Pre-save middleware to transfer data to permanent storage before deletion
PeriodSchema.pre('deleteOne', { document: true, query: false }, async function() {
    await this.transferToPermanentStorage();
});

// Method to transfer attendance data to permanent storage
PeriodSchema.methods.transferToPermanentStorage = async function() {
    try {
        const TimeTable = mongoose.model('TimeTable');
        const Student = mongoose.model('Students');

        // Update timetable with attendance statistics
        await TimeTable.findOneAndUpdate(
            {
                _id: this.timetableId,
                "slots.day": this.day,
                "slots.periods.periodNumber": this.periodNumber
            },
            {
                $inc: {
                    "slots.$[daySlot].periods.$[period].totalClassesConducted": 1,
                    "slots.$[daySlot].periods.$[period].totalStudentsAttended": this.TotalAttendanceMarked
                },
                $push: {
                    "slots.$[daySlot].periods.$[period].attendanceHistory": {
                        date: this.classDate,
                        totalStudents: this.TotalStudent,
                        attendedStudents: this.TotalAttendanceMarked,
                        attendancePercentage: Math.round((this.TotalAttendanceMarked / this.TotalStudent) * 100)
                    }
                }
            },
            {
                arrayFilters: [
                    { "daySlot.day": this.day },
                    { "period.periodNumber": this.periodNumber }
                ]
            }
        );
        
        // Update each student's attendance record
        for (const student of this.attendedStudents) {
            await Student.findByIdAndUpdate(
                student.studentId,
                {
                    $inc: {
                        totalAttendance: 1,
                        attendedClasses: 1
                    }
                }
            );
        }
        
        console.log(`Transferred attendance data for ${this.subject} - ${this.day} Period ${this.periodNumber}`);
    } catch (error) {
        console.error('Error transferring attendance data:', error);
    }
};

const Period = mongoose.model('Period', PeriodSchema);
export default Period;
