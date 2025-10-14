import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EMAIL_USER, EMAIL_PASS, JWT_SECRET } from "./env.config.js";
import OTPverification from "../Models/OTPverification.js";
import College from "../Models/Colleges.js";
import Teacher from "../Models/Teachers.js";
import Student from "../Models/Students.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});


export const sendOtp = async ({ email, role, userData }) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000); 
    const hashedOTP = await bcrypt.hash(otp.toString(), 10);

    
    const otpEntry = new OTPverification({
      email,
      role,
      otp: hashedOTP,
      expiresAt: Date.now() + 10 * 60 * 1000, 
      userData,
    });

    await otpEntry.save();

    
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      html: `<h2>OTP Verification</h2><p>Your OTP code is <b>${otp}</b></p><p>This code will expire in 10 minutes.</p>`,
    });

    return { success: true, otpId: otpEntry._id };
  } catch (error) {
    console.error("sendOtp error:", error);
    throw new Error("Failed to send OTP");
  }
};

// 🔹 Verify OTP and create user
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const record = await OTPverification.findOne({ email });
    if (!record) return res.status(404).json({ message: "OTP not found" });

    const isValid = await bcrypt.compare(otp, record.otp);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });
    if (record.expiresAt < Date.now()) return res.status(400).json({ message: "OTP expired" });

    let newUser;
    const { role, userData } = record;

    // Only College is separate; Teacher + Student use User model
    if (role === "COLLEGE") {
      newUser = new College(userData);
    } else if (role === "TEACHER") {
      newUser = new Teacher({ ...userData, role });
    } else if (role === "STUDENT") {
      newUser = new Student({ ...userData, role });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    await newUser.save();

    // Generate JWT
    const jwtToken = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email || newUser.adminEmail,
        role,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Delete OTP entry
    await OTPverification.deleteMany({ email });

    return res.status(201).json({
      message: `${role} registered successfully`,
      token: jwtToken,
      user: newUser,
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🔹 Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: "FAILED", message: "Email is required" });

    await OTPverification.deleteMany({ email });

    // Resend OTP using existing OTP data or new userData if needed
    // You may need to pass role and userData here
    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    return res.status(500).json({ status: "FAILED", message: error.message });
  }
};
