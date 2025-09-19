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

    totalAttendance: {
        type: Number,
        default: 0
    },

    attendedClasses: {
        type: Number,
        default: 0
    },

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
