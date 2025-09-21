import mongoose from "mongoose";
import College from "../Models/Colleges.js";
import Branch from "../Models/Branches.js";
import Teachers from "../Models/Teachers.js";
import TimeTable from "../Models/TimeTable.js";

export const CreateTimetable = async (req, res) => {
  try {
    const { collegeId, branchId, slots } = req.body;

    console.log("📥 Received timetable creation request:", req.body);

    // ✅ Validate required fields
    if (!collegeId || !branchId || !slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: "Missing required fields or invalid slots format" });
    }

    // ✅ Verify college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    // ✅ Verify branch belongs to same college
    const branch = await Branch.findOne({ _id: branchId, collegeId: collegeId });
    if (!branch) {
      return res.status(404).json({ message: "Branch not found or does not belong to this college" });
    }

    // ✅ Validate teacher IDs in slots
    for (const daySlot of slots) {
      if (!daySlot.day || !Array.isArray(daySlot.periods)) {
        return res.status(400).json({ message: "Each slot must have a day and periods array" });
      }

      for (const period of daySlot.periods) {
        if (!period.teacherId) {
          return res.status(400).json({ message: "Each period must have a teacherId" });
        }

        const teacher = await Teachers.findById(period.teacherId);
        if (!teacher) {
          return res.status(400).json({ message: `Invalid teacher for period ${period.periodNumber} on ${daySlot.day}` });
        }
      }
    }

    // ✅ Create timetable
    const newTimetable = new TimeTable({
      collegeId,
      branchId,
      slots,
    });

    await newTimetable.save();

    // ✅ Populate references for readability
    await newTimetable.populate([
      { path: "collegeId", select: "institutionName adminEmail" },
      { path: "branchId", select: "branchName branchCode section year" },
      { path: "slots.periods.teacherId", select: "fullName email" },
    ]);

    return res.status(201).json({
      message: "Timetable created successfully",
      timetable: newTimetable,
    });

  } catch (error) {
    console.error("❌ Timetable creation error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const GetTimetableById = async (req, res) => {
  try {
    const { id } = req.params; 

    // 🔹 Fetch timetable(s) for a branch
    const timetables = await TimeTable.find({ collegeId: id })
      .populate([
        { path: "collegeId", select: "institutionName adminEmail" },
        { path: "branchId", select: "branchName branchCode section year" },
        { path: "slots.periods.teacherId", select: "fullName email" },
      ]);

    if (!timetables || timetables.length === 0) {
      return res.status(404).json({ message: "No timetable found for this branch" });
    }

    return res.status(200).json({
      message: "Timetable(s) fetched successfully",
      timetables,
    });
  } catch (error) {
    console.error("❌ Error fetching timetable:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const GetTeacherTimetable = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { day } = req.query;

    if (!teacherId) return res.status(400).json({ message: "Teacher ID is required" });

    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);

    const pipeline = [
      {
        $match: { "slots.periods.teacherId": teacherObjectId }
      },
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch"
        }
      },
      {
        $unwind: "$branch"
      },
      {
        $lookup: {
          from: "colleges",
          localField: "collegeId",
          foreignField: "_id",
          as: "college"
        }
      },
      {
        $unwind: "$college"
      },
      {
        $project: {
          college: { institutionName: "$college.institutionName", adminEmail: "$college.adminEmail" },
          branch: { branchName: "$branch.branchName", branchCode: "$branch.branchCode", section: "$branch.section", year: "$branch.year" },
          slots: {
            $map: {
              input: "$slots",
              as: "slot",
              in: {
                day: "$$slot.day",
                periods: {
                  $filter: {
                    input: "$$slot.periods",
                    as: "period",
                    cond: { $eq: ["$$period.teacherId", teacherObjectId] }
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          college: 1,
          branch: 1,
          slots: {
            $filter: {
              input: "$slots",
              as: "slot",
              cond: day ? { $eq: ["$$slot.day", day] } : { $ne: ["$$slot.day", null] }
            }
          }
        }
      }
    ];

    const timetables = await TimeTable.aggregate(pipeline);

    // Flatten periods for frontend
    const teacherSchedule = timetables.flatMap(tt =>
      tt.slots.flatMap(slot =>
        slot.periods.map(period => ({
          id: `${tt._id}_${slot.day}_${period.periodNumber}`,
          timetableId: tt._id,
          college: tt.college,
          branch: tt.branch,
          section: tt.branch.section,
          day: slot.day,
          periodNumber: period.periodNumber,
          subject: period.subject,
          startTime: period.startTime,
          endTime: period.endTime,
          duration: period.duration,
          room: `Room ${period.periodNumber}`,
          totalClassesConducted: period.totalClassesConducted || 0,
          totalStudentsAttended: period.totalStudentsAttended || 0,
          attendanceHistory: period.attendanceHistory || [],
          attendancePercentage:
            period.totalClassesConducted > 0
              ? Math.round((period.totalStudentsAttended / (period.totalClassesConducted * 30)) * 100)
              : 0
        }))
      )
    );

    return res.status(200).json({
      message: "Teacher timetable fetched successfully",
      teacherId,
      day: day || "all",
      totalClasses: teacherSchedule.length,
      schedule: teacherSchedule
    });
  } catch (error) {
    console.error("❌ Error fetching teacher timetable:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const GetStudentTimetable = async (req, res) => {
  try {
    const { branchId } = req.params; // fetch timetable for this branch/class
    const { day } = req.query; // optional day filter

    if (!branchId) {
      return res.status(400).json({ message: "Branch ID is required" });
    }

    const branchObjectId = new mongoose.Types.ObjectId(branchId);

    const pipeline = [
      {
        $match: { branchId: branchObjectId }
      },
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch"
        }
      },
      { $unwind: "$branch" },
      {
        $lookup: {
          from: "colleges",
          localField: "collegeId",
          foreignField: "_id",
          as: "college"
        }
      },
      { $unwind: "$college" },
      {
        $project: {
          college: { institutionName: "$college.institutionName", adminEmail: "$college.adminEmail" },
          branch: { branchName: "$branch.branchName", branchCode: "$branch.branchCode", section: "$branch.section", year: "$branch.year" },
          slots: {
            $map: {
              input: "$slots",
              as: "slot",
              in: {
                day: "$$slot.day",
                periods: "$$slot.periods" // include all periods
              }
            }
          }
        }
      },
      {
        $project: {
          college: 1,
          branch: 1,
          slots: {
            $filter: {
              input: "$slots",
              as: "slot",
              cond: day ? { $eq: ["$$slot.day", day] } : { $ne: ["$$slot.day", null] }
            }
          }
        }
      }
    ];

    const timetables = await TimeTable.aggregate(pipeline);

    // Flatten periods for frontend
    const studentSchedule = timetables.flatMap(tt =>
      tt.slots.flatMap(slot =>
        slot.periods.map(period => ({
          id: `${tt._id}_${slot.day}_${period.periodNumber}`,
          timetableId: tt._id,
          college: tt.college,
          branch: tt.branch,
          section: tt.branch.section,
          day: slot.day,
          periodNumber: period.periodNumber,
          subject: period.subject,
          startTime: period.startTime,
          endTime: period.endTime,
          duration: period.duration,
          room: `Room ${period.periodNumber}`,
          totalClassesConducted: period.totalClassesConducted || 0,
          totalStudentsAttended: period.totalStudentsAttended || 0,
          attendanceHistory: period.attendanceHistory || [],
          attendancePercentage:
            period.totalClassesConducted > 0
              ? Math.round((period.totalStudentsAttended / (period.totalClassesConducted * 30)) * 100) // assuming 30 students per class
              : 0
        }))
      )
    );

    return res.status(200).json({
      message: "Student timetable fetched successfully",
      branchId,
      day: day || "all",
      totalClasses: studentSchedule.length,
      schedule: studentSchedule
    });
  } catch (error) {
    console.error("❌ Error fetching student timetable:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
