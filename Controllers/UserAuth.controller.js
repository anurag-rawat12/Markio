import User from "../Models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtp } from "../Config/Send_email.js";
import { JWT_SECRET } from "../Config/env.config.js";

export const UserSignup = async (req, res) => {
  try {
    const { name, email, password, role, collegeId } = req.body;

    if (!name || !email || !password || !role || !collegeId) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with Verified flag
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      collegeId,
      branchIds: [],
      Verified: false,
    });

    await newUser.save();

    // Send OTP email
    await sendOtp(newUser);

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        collegeId: newUser.collegeId,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(201).json({
      message: "User registered successfully. Please verify your email with OTP.",
      token: jwtToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        collegeId: newUser.collegeId,
        Verified: newUser.Verified,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "Signup first" });
    }

    // Check if email is verified
    if (!existingUser.Verified) {
      return res.status(403).json({ message: "Please verify your email with OTP before login" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const jwtToken = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
        collegeId: existingUser.collegeId,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        collegeId: existingUser.collegeId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
