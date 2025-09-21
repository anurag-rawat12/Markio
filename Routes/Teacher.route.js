import express from 'express';
import { getTeacherById, getTeachers, getTeacherProfile } from '../Controllers/Teacher.controller.js';
import authorize from '../Middleware/auth.middleware.js';

const TeacherRouter = express.Router();

// Ping route (must be before parametric routes)
TeacherRouter.get('/ping', (req, res) => {
  res.json({ msg: "pong" });
});

// Get current teacher's profile (authenticated)
TeacherRouter.get('/profile', authorize, getTeacherProfile);

// List all teachers by college ID
TeacherRouter.get('/college/:id', authorize, getTeachers);

// Get teacher by ID (parametric route - must be last)
TeacherRouter.get('/:id', authorize, getTeacherById);

export default TeacherRouter;

