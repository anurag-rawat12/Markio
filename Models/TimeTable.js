import mongoose from 'mongoose';
import User from '../Models/Users.js';

const TimeTableSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    section: {
      type: String, // e.g., "A", "B"
      required: true,
    },
    batch: {
      type: String, // e.g., "2022-2026"
      required: true,
    },
    slots: [
      {
        day: {
          type: String,
          enum: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ],
          required: true,
        },
        periods: [
          {
            periodNumber: { type: Number, required: true }, // 1, 2, 3...
            subject: { type: String, required: true },      // e.g., "DBMS"
            teacherId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              required: true,
              validate: {
                validator: async function (userId) {
                  const user = await User.findById(userId);
                  return user && user.role === 'TEACHER';
                },
                message: 'Assigned user must be a TEACHER',
              },
            },
            TotalStudent: { type: Number, default: 0 },
            TotalAttendanceMarked: { type: Number, default: 0 },
            startTime: { type: String, required: true }, // e.g., "09:30"
            endTime: { type: String, required: true },   // e.g., "10:20"
            duration: { type: Number },                  // optional
            activeCode: {
              code: { type: String },     // OTP/code
              expiresAt: { type: Date },  // expiry time
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const TimeTable = mongoose.model('TimeTable', TimeTableSchema);
export default TimeTable;
