import crypto from "crypto";
import { transporter } from "./mailConfig.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // Gmail address
    pass: process.env.EMAIL_PASS    // App password (NOT your normal Gmail password)
  }
});

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

export const sendOTP = async (email) => {
  const otp = generateOTP();

  const mailOptions = {
    from: `"Colloq" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<h3>Your OTP is <b>${otp}</b></h3><p>This OTP is valid for 10 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP ${otp} sent to ${email}`);
    return otp;
  } catch (err) {
    console.error("Error sending OTP:", err);
    throw err;
  }
};
