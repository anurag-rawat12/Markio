import express from "express"
import { verifyOtp, resendOtp } from "../Config/Send_email.js";

const OTProuter = express.Router()

OTProuter.post("/verify-otp", verifyOtp)
OTProuter.post("/resend-otp", resendOtp)


export default OTProuter