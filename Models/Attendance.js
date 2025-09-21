import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Students", required: true },
  timetable: { type: mongoose.Schema.Types.ObjectId, ref: "TimeTable", required: true },
  records: [
    {
      date: { type: Date, required: true },     // store full date (e.g., 2025-09-13)
      slot: { type: Number, required: true },   // period number
      status: { type: String, enum: ["Present", "Absent"], default: "Absent" }
    }
  ]
}, { timestamps: true });

// Prevent duplicate records for same student, same date, same slot
AttendanceSchema.index({ student: 1, timetable: 1 });

const Attendance = mongoose.model("Attendance", AttendanceSchema);
export default Attendance;