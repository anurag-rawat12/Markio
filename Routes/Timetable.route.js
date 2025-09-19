import express from "express"
import { CreateTimetable, DeleteTimetable, UpdateTimetable, GetTimetableById } from "../Controllers/Timetable.controller.js";
import authorize, { collegeOnly } from '../Middleware/auth.middleware.js';

const TimetableRouter = express.Router();

TimetableRouter.post("/create", authorize, collegeOnly, CreateTimetable);
TimetableRouter.get("/get/:id", authorize, collegeOnly, authorize, collegeOnly, GetTimetableById);
TimetableRouter.put("/update/:id", authorize, collegeOnly, UpdateTimetable);
TimetableRouter.delete("/delete/:id", authorize, collegeOnly, DeleteTimetable);

export default TimetableRouter;