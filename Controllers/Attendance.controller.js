import Attendance from "../Models/Attendance.js";
import TimeTable from "../Models/TimeTable.js";

export const markAttendance = async (req, res) => {
  try {
    const { timetableId, day, slot, code } = req.body;

    const timetable = await TimeTable.findById(timetableId);
    if (!timetable) return res.status(404).json({ message: "Timetable not found" });

    const todaySlot = timetable.slots.find(s => s.day === day);
    if (!todaySlot) return res.status(404).json({ message: "Day not found" });

    const period = todaySlot.periods.find(p => p.slot === slot);
    if (!period) return res.status(404).json({ message: "Period not found" });

    // validate code
    if (!period.activeCode || period.activeCode.code !== code) {
      return res.status(400).json({ message: "Invalid code" });
    }
    if (new Date() > period.activeCode.expiresAt) {
      return res.status(400).json({ message: "Code expired" });
    }

    // find or create attendance doc for student
    let attendance = await Attendance.findOne({
      student: req.user._id,
      timetable: timetable._id
    });

    if (!attendance) {
      attendance = new Attendance({
        student: req.user._id,
        timetable: timetable._id,
        records: []
      });
    }

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // normalize

    // check if already marked
    const alreadyMarked = attendance.records.find(
      r =>
        r.date.getTime() === todayDate.getTime() &&
        r.slot === slot
    );

    if (alreadyMarked) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    // add record
    attendance.records.push({
      date: todayDate,
      slot,
      status: "Present"
    });

    await attendance.save();

    return res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
