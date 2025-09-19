import express from "express";
import { verifyOtp ,resendOtp } from "../Config/Send_email.js";
import { UserLogin, UserSignup } from "../Controllers/UserAuth.controller.js";

const UserAuthRouter = express.Router();

UserAuthRouter.post("/register", UserSignup);
UserAuthRouter.post("/login", UserLogin);
UserAuthRouter.post("/verify-otp", verifyOtp);
UserAuthRouter.post("/resend-otp", resendOtp);

export default UserAuthRouter;
