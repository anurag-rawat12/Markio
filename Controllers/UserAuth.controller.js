import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtp } from "../Config/Send_email.js";
import { JWT_SECRET } from "../Config/env.config.js";
import Teacher from "../Models/Teachers.js";
import Student from "../Models/Students.js";

export const teacherSignup = async (req, res) => {
  try {
    const { fullName, email, institutionName, password } = req.body;

    if (!fullName || !email || !institutionName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(409).json({ message: "Teacher already exists" });
    }

    // Send OTP
    const otpResult = await sendOtp({
      email, role: "TEACHER", userData: {
        fullName, email, institutionName, password: await bcrypt.hash(password, 10)
      }
    });

    return res.status(200).json({
      message: "OTP sent successfully. Please verify your email to complete registration.",
      email
    });
  } catch (error) {
    console.error("Teacher Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const teacherLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found, please signup" });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: teacher._id, email: teacher.email, role: "TEACHER" },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      teacher: {
        id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        institutionName: teacher.institutionName,
      },
    });
  } catch (error) {
    console.error("Teacher Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const studentSignup = async (req, res) => {
  try {
    const { fullName, email, enrollmentNumber, institutionName, password } = req.body;

    if (!fullName || !email || !enrollmentNumber || !institutionName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ message: "Student already exists" });
    }

    // Send OTP
    const otpResult = await sendOtp({
      email, role: "STUDENT", userData: {
        fullName, email, enrollmentNumber, institutionName, password: await bcrypt.hash(password, 10)
      }
    });

    res.status(201).json({
      message: "Student registered successfully. Please verify OTP.",
      email
    });
  } catch (error) {
    console.error("Student Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found, please signup" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: student._id, email: student.email, role: "STUDENT" },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        enrollmentNumber: student.enrollmentNumber,
        institutionName: student.institutionName,
      },
    });
  } catch (error) {
    console.error("Student Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};