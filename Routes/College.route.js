import express from "express";

const CollegeRouter = express.Router();

CollegeRouter.get("/allColleges", getColleges);
CollegeRouter.get("/:id", getCollegeById);

CollegeRouter.get("/createTimeTable", createTimeTable);
CollegeRouter.get("/deleteTimeTable", deleteTimeTable);
CollegeRouter.get("/getTimeTable", getTimeTable);


export default CollegeRouter;