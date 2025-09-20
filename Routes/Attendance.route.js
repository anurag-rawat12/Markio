import express from 'express';
import {
    initializeAttendance,
    markAttendance,
    getAttendanceStatus,
    getAttendanceStatusByCode
} from '../Controllers/Attendance.controller.js';
import authorize, { teacherOnly } from '../Middleware/auth.middleware.js';

const AttendanceRouter = express.Router();

// Route for teacher to initialize attendance session
AttendanceRouter.post('/initialize', authorize, teacherOnly, initializeAttendance);

// Route for students to mark attendance (simplified - just code and student ID)
AttendanceRouter.post('/mark', authorize, markAttendance);

// Route to get attendance session status by session ID (for teachers)
AttendanceRouter.get('/status/:sessionId', authorize, teacherOnly, getAttendanceStatus);

// Route to get attendance session info by code (for students to check before marking)
AttendanceRouter.get('/code/:code', authorize, getAttendanceStatusByCode);

export default AttendanceRouter;
