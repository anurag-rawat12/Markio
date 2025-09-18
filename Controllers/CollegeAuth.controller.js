import College from "../Models/Colleges.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtp } from "../Config/Send_email.js";
import { JWT_SECRET } from "../Config/env.config.js";

export const CollegeSignup = async (req, res) => {
    try {
        const { CollegeName, email, password } = req.body;

        if (!CollegeName || !email || !password) {
            return res.status(400).json({ message: "All required fields missing" });
        }

        const existingCollege = await College.findOne({ email });
        if (existingCollege) {
            return res.status(409).json({ message: "College already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCollege = new College({
            CollegeName,
            email,
            password: hashedPassword,
            Verified: false,
        });
        await newCollege.save();

        // Send OTP mail
        await sendOtp(newCollege);

        // Generate JWT token
        const jwtToken = jwt.sign(
            {
                id: newCollege._id,
                email: newCollege.email,
                role: "COLLEGE",
                CollegeName: newCollege.CollegeName,
            },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        return res.status(201).json({
            message: "College registered successfully. Please verify your email with OTP.",
            token: jwtToken,
            College: {
                id: newCollege._id,
                CollegeName: newCollege.CollegeName,
                email: newCollege.email,
                role: "COLLEGE",
                Verified: newCollege.Verified,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const CollegeLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email & password required" });
        }

        const existingCollege = await College.findOne({ email });
        if (!existingCollege) {
            return res.status(404).json({ message: "Signup first" });
        }

        const isMatch = await bcrypt.compare(password, existingCollege.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const jwtToken = jwt.sign(
            {
                id: existingCollege._id,
                email: existingCollege.email,
                role: "COLLEGE",
                CollegeName: existingCollege.CollegeName,
            },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token: jwtToken,
            College: {
                id: existingCollege._id,
                CollegeName: existingCollege.CollegeName,
                email: existingCollege.email,
                role: "COLLEGE",
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
