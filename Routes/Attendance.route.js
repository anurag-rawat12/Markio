import express from 'express';
import {
    initializeAttendance,
    markAttendance,
    getAttendanceStatus,
    getAttendanceStatusByCode,
    checkExistingSession,
    getPresentStudents,
    completeAttendanceSession,
    endAttendanceSession
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

// Route to check for existing active attendance session
AttendanceRouter.post('/check-existing', authorize, teacherOnly, checkExistingSession);

// Route to get present students list for a session
AttendanceRouter.get('/present-students/:sessionId', authorize, teacherOnly, getPresentStudents);

// Route to complete attendance session
AttendanceRouter.post('/complete/:sessionId', authorize, teacherOnly, completeAttendanceSession);

// Route to end attendance session (teacher manually ending)
AttendanceRouter.post('/end/:sessionId', authorize, teacherOnly, endAttendanceSession);

export default AttendanceRouter;
