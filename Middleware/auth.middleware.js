import jwt from "jsonwebtoken";
import College from "../Models/Colleges.js";
import Teacher from "../Models/Teachers.js";
import Student from "../Models/Students.js";
import { JWT_SECRET } from "../Config/env.config.js";

const authorize = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    let userOrCollege;
    console.log(decoded);

    if (decoded.role === "COLLEGE") {
      userOrCollege = await College.findById(decoded.id).select("-password");
    } else if (decoded.role === "TEACHER") {
      userOrCollege = await Teacher.findById(decoded.id).select("-password");
    } else if (decoded.role === "STUDENT") {
      userOrCollege = await Student.findById(decoded.id).select("-password");
    } else {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid role" });
    }

    if (!userOrCollege) {
      return res.status(401).json({ success: false, message: "Unauthorized: Account not found" });
    }

    req.user = userOrCollege;
    req.role = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized", error: error.message });
  }
};

export default authorize;

// Allow only colleges
export const collegeOnly = (req, res, next) => {

  console.log("inside college only ")
  if (req.role !== "COLLEGE") {
    return res.status(403).json({ success: false, message: "Access denied: College only" });
  }
  next();
};

// Allow only teachers
export const teacherOnly = (req, res, next) => {
  if (req.role !== "TEACHER") {
    return res.status(403).json({ success: false, message: "Access denied: Teacher only" });
  }
  next();
};

// Allow only students
export const studentOnly = (req, res, next) => {
  if (req.role !== "STUDENT") {
    return res.status(403).json({ success: false, message: "Access denied: Student only" });
  }
  next();
};

// Allow multiple roles
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};
