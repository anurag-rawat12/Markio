import express from "express";
import { resendOTP, verifyOTP } from "../Config/Send_email.js";
import { UserLogin, UserSignup } from "../Controllers/UserAuth.controller.js";

const UserAuthRouter = express.Router();

UserAuthRouter.post("/register", UserSignup);
UserAuthRouter.post("/login", UserLogin);
UserAuthRouter.post("/verify-otp", verifyOTP);
UserAuthRouter.post("/resend-otp", resendOTP);

export default UserAuthRouter;
