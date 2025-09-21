import express from "express";
import authorize from "../Middleware/auth.middleware.js";
import { GetStudentById } from "../Controllers/Student.controller.js";

const StudentRouter = express.Router();

StudentRouter.get("/:id", authorize, GetStudentById);
// StudentRouter.post("/", authorize, CreateStudent);
// StudentRouter.put("/:id", authorize, UpdateStudent);
// StudentRouter.delete("/:id", authorize, DeleteStudent);

export default StudentRouter;