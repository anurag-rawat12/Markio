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
    const branch = await Branch.findOne({ _id: branchId, collegeId: collegeId });
    if (!branch) return res.status(404).json({ message: "Branch not found or does not belong to this college" });

    // 🔹 Check if timetable already exists for this college+branch+section+batch
    const existing = await TimeTable.findOne({ collegeId: collegeId, branchId: branchId, section, batch });
    if (existing) return res.status(409).json({ message: "Timetable already exists for this section & batch" });

    // 🔹 Validate teacher IDs in slots
    for (const daySlot of slots) {
      if (!daySlot.day || !Array.isArray(daySlot.periods)) {
        return res.status(400).json({ message: "Each slot must have a day and periods array" });
      }

      for (const period of daySlot.periods) {
        if (!period.teacherId) {
          return res.status(400).json({ message: "Each period must have a teacher ID" });
        }

        const teacher = await User.findById(period.teacherId);
        if (!teacher || teacher.role !== "TEACHER") {
          return res.status(400).json({ message: `Invalid teacher assigned for period ${period.periodNumber} on ${daySlot.day}` });
        }
      }
    }

    // 🔹 Create timetable
    const newTimetable = new TimeTable({
      collegeId: collegeId,
      branchId: branchId,
      section,
      batch: batch,
      slots,
    });

    await newTimetable.save();

    // 🔹 Populate for readable response
    await newTimetable.populate('collegeId branchId slots.periods.teacherId');

    res.status(201).json({
      message: "Timetable created successfully",
      timetable: newTimetable,
    });

  } catch (error) {
    console.error("Timetable creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const DeleteTimetable = async (req, res) => {
  try {

    const { Id } = req.params;

    if (!Id) {
      return res.status(400).json({ message: "Timetable ID is required" });
    }

    const timetable = await TimeTable.findById(Id);
    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    await TimeTable.findByIdAndDelete(Id);
    res.status(200).json({ message: "Timetable deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "error while deleting timetable", error: error.message });

  }
}

export const UpdateTimetable = async (req, res) => {
  try {
    const { Id } = req.params;
    const { collegeId, branchId, section, batch, slots } = req.body;

    // 🔹 Check required fields
    if (!collegeId || !branchId || !section || !slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: "Missing required fields or invalid slots format" });
    }

    // 🔹 Validate teacher IDs in slots
    for (const daySlot of slots) {
      if (!daySlot.day || !Array.isArray(daySlot.periods)) {
        return res.status(400).json({ message: "Each slot must have a day and periods array" });
      }

      for (const period of daySlot.periods) {
        if (!period.teacherId) {
          return res.status(400).json({ message: "Each period must have a teacher ID" });
        }

        const teacher = await User.findById(period.teacherId);
        if (!teacher || teacher.role !== "TEACHER") {
          return res.status(400).json({
            message: `Invalid teacher assigned for period ${period.periodNumber} on ${daySlot.day}`
          });
        }
      }
    }

    // 🔹 Update timetable
    const updatedTimetable = await TimeTable.findByIdAndUpdate(
      Id,
      {
        collegeId,
        branchId,
        section,
        batch,
        slots,
      },
      { new: true } // returns updated document
    ).populate("collegeId branchId slots.periods.teacherId");

    if (!updatedTimetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    res.status(200).json({
      message: "Timetable updated successfully",
      timetable: updatedTimetable,
    });

  } catch (error) {
    console.error("Timetable update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const GetTimetableById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Timetable ID is required" });
    }
    const timetable = await TimeTable.findById(id).populate('collegeId branchId slots.periods.teacherId');
    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }
    res.status(200).json({ timetable });
  } catch (error) {
    console.error("Get timetable error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}