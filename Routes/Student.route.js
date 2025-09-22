import express from "express";
import authorize from "../Middleware/auth.middleware.js";
import { GetStudentById, getStudentsByCollege, getStudentAttendance, getStudentAttendanceSimple } from "../Controllers/Student.controller.js";

const StudentRouter = express.Router();

// Get all students by college ID (must be before parametric routes)
StudentRouter.get("/college/:id", authorize, getStudentsByCollege);

// Get comprehensive student attendance by student ID (with optional branchId query parameter)
StudentRouter.get("/attendance/:studentId", authorize, getStudentAttendance);

// Get simple/accurate student attendance by student ID (Period schema based)
StudentRouter.get("/attendance-simple/:studentId", authorize, getStudentAttendanceSimple);

// Get student by student ID (parametric route - must be last)
StudentRouter.get("/:id", authorize, GetStudentById);
// StudentRouter.post("/", authorize, CreateStudent);
// StudentRouter.put("/:id", authorize, UpdateStudent);
// StudentRouter.delete("/:id", authorize, DeleteStudent);

export default StudentRouter;
