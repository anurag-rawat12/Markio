import mongoose from "mongoose";

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
    slots: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          required: true,
        },
        periods: [
          {
            periodNumber: { type: Number, required: true },
            subject: { type: String, required: true },
            teacherId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Teachers', // 👈 match your model name exactly
              required: true
            },
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            duration: { type: Number },

            totalClassesConducted: { type: Number, default: 0 },
            totalStudentsAttended: { type: Number, default: 0 },

            attendanceHistory: {
              type: [
                {
                  date: { type: Date, required: true },
                  totalStudents: { type: Number, required: true },
                  attendedStudents: { type: Number, required: true },
                  attendancePercentage: { type: Number, required: true },
                  createdAt: { type: Date, default: Date.now },
                },
              ],
              default: [],
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const TimeTable = mongoose.model("TimeTable", TimeTableSchema);
export default TimeTable;
