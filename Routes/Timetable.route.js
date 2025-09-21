import express from "express"
import { CreateTimetable , GetTimetableById, GetTeacherTimetable, GetStudentTimetable } from "../Controllers/Timetable.controller.js";
import authorize, { collegeOnly } from '../Middleware/auth.middleware.js';

const TimetableRouter = express.Router();

TimetableRouter.post("/create", authorize, collegeOnly, CreateTimetable);
TimetableRouter.get("/get/:id", authorize, collegeOnly, GetTimetableById);
TimetableRouter.get("/teacher/:teacherId", authorize, GetTeacherTimetable);
TimetableRouter.get("/student/:branchId", authorize, GetStudentTimetable);

// TimetableRouter.put("/update/:id", authorize, collegeOnly, UpdateTimetable);
// TimetableRouter.delete("/delete/:id", authorize, collegeOnly, DeleteTimetable);

export default TimetableRouter;