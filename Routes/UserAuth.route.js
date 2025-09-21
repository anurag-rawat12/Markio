import express from "express";
import { verifyOtp, resendOtp } from "../Config/Send_email.js";
import { teacherSignup, teacherLogin, studentSignup, studentLogin } from "../Controllers/UserAuth.controller.js";

const TeacherAuthRouter = express.Router();
const StudentAuthRouter = express.Router();

TeacherAuthRouter.post("/register", teacherSignup);
TeacherAuthRouter.post("/login", teacherLogin);
TeacherAuthRouter.post("/verify-otp", verifyOtp);
TeacherAuthRouter.post("/resend-otp", resendOtp);

StudentAuthRouter.post("/register", studentSignup);
StudentAuthRouter.post("/login", studentLogin);
StudentAuthRouter.post("/verify-otp", verifyOtp);
StudentAuthRouter.post("/resend-otp", resendOtp);

export { TeacherAuthRouter, StudentAuthRouter };
