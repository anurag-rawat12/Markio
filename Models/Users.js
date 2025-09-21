import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['TEACHER', 'STUDENT'],
        required: true
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true
    },

    // For students: exactly ONE branch
    // For teachers: multiple branches allowed
    branchIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    }],

    section: {
        type: String
    },

    batch: {
        type: String
    },

    // Attendance statistics (for students)
    totalAttendance: {
        type: Number,
        default: 0
    },

    attendedClasses: {
        type: Number,
        default: 0
    },
    
    // Total classes held (for calculating attendance percentage)
    totalClassesHeld: {
        type: Number,
        default: 0
    },
    
    // Attendance percentage (calculated field)
    attendancePercentage: {
        type: Number,
        default: 0,
        get: function() {
            if (this.totalClassesHeld === 0) return 0;
            return Math.round((this.attendedClasses / this.totalClassesHeld) * 100);
        }
    },
    
    // Detailed attendance history for students
    attendanceRecords: [{
        timetableId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TimeTable'
        },
        subject: String,
        date: Date,
        day: String,
        periodNumber: Number,
        status: {
            type: String,
            enum: ['Present', 'Absent'],
            default: 'Present'
        },
        markedAt: { type: Date, default: Date.now }
    }],

    rollNumber: {
        type: String
    },
    Verified: {
        type: Boolean,
        default: false
    },
    warningsCount: {
        type: Number,
        default: 0
    }
});

// userSchema.pre('save', function (next) {
//     if (this.role === 'STUDENT') {
//         if (!this.branchIds || this.branchIds.length !== 1) {
//             return next(new Error('A student must belong to exactly one branch.'));
//         }
//     }
//     if (this.role === 'TEACHER') {
//         if (!this.branchIds || this.branchIds.length < 1) {
//             return next(new Error('A teacher must belong to at least one branch.'));
//         }
//     }
//     next();
// });

const User = mongoose.model('User', userSchema);
export default User;
