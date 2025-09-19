import Attendance from "../Models/Attendance.js";
import TimeTable from "../Models/TimeTable.js";

export const markAttendance = async (req, res) => {
  try {
    
    

  } catch (error) {
    res.status(500).json({ message: "Error while marking attendance", error: error.message });
  }
};
