import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["COLLEGE", "STUDENT", "TEACHER"],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  userData: {
    type: Object, // store flexible attributes
    required: true,
  }
}, { timestamps: true });

export default mongoose.model("OTPverification", otpVerificationSchema);
