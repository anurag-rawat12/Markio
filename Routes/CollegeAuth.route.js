import express from "express";
import { CollegeLogin, CollegeSignup} from "../Controllers/CollegeAuth.controller.js";
import { verifyOtp, resendOtp } from "../Config/Send_email.js";

const CollegeAuthRouter = express.Router();

CollegeAuthRouter.post("/register", CollegeSignup);
CollegeAuthRouter.post("/login", CollegeLogin);
CollegeAuthRouter.post("/verify-otp", verifyOtp);
CollegeAuthRouter.post("/resend-otp", resendOtp);

export default CollegeAuthRouter;
