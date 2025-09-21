import College from "../Models/Colleges.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtp } from "../Config/Send_email.js";
import { JWT_SECRET } from "../Config/env.config.js";
import OTPverification from "../Models/OTPverification.js";

export const CollegeSignup = async (req, res) => {
    try {
        const {
            institutionName,
            institutionType,
            adminName,
            adminEmail,
            phoneNumber,
            address,
            city,
            state,
            zipCode,
            password
        } = req.body;

        // Validate required fields
        if (
            !institutionName ||
            !institutionType ||
            !adminName ||
            !adminEmail ||
            !phoneNumber ||
            !address ||
            !city ||
            !state ||
            !zipCode ||
            !password
        ) {
            return res.status(400).json({ message: "All required fields missing" });
        }

        // Check if an OTP is already sent for this email
        const existingOtp = await OTPverification.findOne({ email: adminEmail });
        if (existingOtp) {
            return res.status(409).json({ message: "OTP already sent to this email. Please verify." });
        }

        const otpResult = await sendOtp({
            email: adminEmail, role: "COLLEGE", userData: {
                institutionName,
                institutionType,
                adminName,
                adminEmail,
                phoneNumber,
                address,
                city,
                state,
                zipCode,
                password: await bcrypt.hash(password, 10)
            }
        });

        // Send response indicating OTP was sent
        return res.status(200).json({
            message: "OTP sent successfully. Please verify your email to complete registration.",
            otpId: otpResult.otpId, // optional, for tracking
            adminEmail
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const CollegeLogin = async (req, res) => {
    try {
        const { institutionEmail, password } = req.body;

        if (!institutionEmail || !password) {
            return res.status(400).json({ message: "Email & password required" });
        }

        const existingCollege = await College.findOne({ adminEmail: institutionEmail });
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
                institutionEmail: existingCollege.adminEmail,
                role: "COLLEGE",
                institutionName: existingCollege.institutionName,
            },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token: jwtToken,
            College: {
                id: existingCollege._id,
                institutionEmail: existingCollege.adminEmail,
                role: "COLLEGE",
                institutionName: existingCollege.institutionName,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
