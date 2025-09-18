import TimeTable from "../Models/TimeTable.js";
import College from "../Models/Colleges.js";
import Branch from "../Models/Branches.js";
import User from "../Models/Users.js";

export const CreateTimetable = async (req, res) => {
  try {
    const { collegeId, branchId, section, batch, slots } = req.body;

    // 🔹 Check required fields
    if (!collegeId || !branchId || !section || !slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: "Missing required fields or invalid slots format" });
    }

    // 🔹 Verify college exists
    const college = await College.findById(collegeId);
    if (!college) return res.status(404).json({ message: "College not found" });

    // 🔹 Verify branch belongs to the same college
    const branch = await Branch.findOne({ _id: branchId, college: collegeId });
    if (!branch) return res.status(404).json({ message: "Branch not found or does not belong to this college" });

    // 🔹 Check if timetable already exists for this college+branch+section+batch
    const existing = await TimeTable.findOne({ college: collegeId, branch: branchId, section, batch });
    if (existing) return res.status(409).json({ message: "Timetable already exists for this section & batch" });

    // 🔹 Validate teacher IDs in slots
    for (const daySlot of slots) {
      if (!daySlot.day || !Array.isArray(daySlot.periods)) {
        return res.status(400).json({ message: "Each slot must have a day and periods array" });
      }

      for (const period of daySlot.periods) {
        if (!period.teacher) {
          return res.status(400).json({ message: "Each period must have a teacher ID" });
        }

        const teacher = await User.findById(period.teacher);
        if (!teacher || teacher.role !== "TEACHER") {
          return res.status(400).json({ message: `Invalid teacher assigned for period ${period.periodNumber} on ${daySlot.day}` });
        }
      }
    }

    // 🔹 Create timetable
    const newTimetable = new TimeTable({
      college: collegeId,
      branch: branchId,
      section,
      batch: batch || null, // batch optional
      slots,
    });

    await newTimetable.save();

    // 🔹 Populate for readable response
    await newTimetable.populate('college branch slots.periods.teacher');

    res.status(201).json({
      message: "Timetable created successfully",
      timetable: newTimetable,
    });

  } catch (error) {
    console.error("Timetable creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
