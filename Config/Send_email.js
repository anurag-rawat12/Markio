import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "./env.config.js";
import bcrypt from "bcryptjs";
import OTPverification from "../Models/OTPverification.js";
import College from "../Models/Colleges.js";
import User from "../Models/Users.js";


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});


export const sendOtp = async ({ _id, email }) => {
    try {
        const otp = Math.floor(1000 + Math.random() * 9000);

        const mailOptions = {
            from: `${EMAIL_USER}`,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
            html: `<h2>OTP Verification</h2>
             <p>Your OTP code is <b>${otp}</b></p>
             <p>This code will expire in 10 minutes.</p>`,
        };

        // Hash OTP
        const hashedOTP = await bcrypt.hash(otp.toString(), 10);

        // Save OTP in DB
        const otpEntry = new OTPverification({
            userId: _id,
            otp: hashedOTP,
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
        });

        await otpEntry.save();

        // Send Email
        await transporter.sendMail(mailOptions);

        return { success: true, otpId: otpEntry._id };
    } catch (err) {
        console.error("sendOtp error:", err);
        throw new Error("Failed to send OTP");
    }
};


export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "userId and OTP are required" });
    }

    // 🔹 Find OTP record
    const record = await OTPverification.findOne({ userId });
    if (!record) return res.status(404).json({ message: "User not found" });
    const recordOTP = record.otp;

    const isvalid = await bcrypt.compare(otp, recordOTP);
    if (!isvalid) return res.status(400).json({ message: "Invalid OTP" });

    if (record.expiresAt < Date.now()) return res.status(400).json({ message: "OTP expired" });

    // 🔹 Try to find in College first
    let updatedUser = await College.findByIdAndUpdate(
      userId,
      { Verified: true },
      { new: true }
    );

    // 🔹 If not found in College, try User model (student/teacher)
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { Verified: true },
        { new: true }
      );
    }


    if (!updatedUser) {
      return res.status(404).json({ message: "User or College not found" });
    }

    // 🔹 Delete OTP record after successful verification
    await OTPverification.deleteMany({ userId });
    // ✅ Success
    return res.status(200).json({
      message: "OTP verified successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const resendOtp = async (req, res) => {
    try {
        let { userId, email } = req.body;
        if (!userId || !email) {
            return res.status(400).json({ status: "FAILED", message: "Empty user details are not allowed" });
        }

        await OTPverification.deleteMany({ userId });

        // ✅ send OTP, but don’t send response inside sendOtp
        await sendOtp({ _id: userId, email }, res);
        return res.status(200).json({ message: "OTP resent successfully" });

    } catch (error) {
        return res.status(500).json({ status: "FAILED", message: error.message });
    }
}
