import express from "express";
import { getCollegeById, getColleges } from "../Controllers/College.controller.js";

const CollegeRouter = express.Router();

CollegeRouter.get("/allColleges", getColleges);
CollegeRouter.get("/:id", getCollegeById);

// CollegeRouter.get("/createTimeTable", createTimeTable);
// CollegeRouter.get("/deleteTimeTable", deleteTimeTable);
// CollegeRouter.get("/getTimeTable", getTimeTable);


export default CollegeRouter;