import express from "express";
import { CollegeLogin, CollegeSignup} from "../Controllers/CollegeAuth.controller.js";


const CollegeAuthRouter = express.Router();

CollegeAuthRouter.post("/register", CollegeSignup);
CollegeAuthRouter.post("/login", CollegeLogin);


export default CollegeAuthRouter;
