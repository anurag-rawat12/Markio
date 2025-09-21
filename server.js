import express from 'express';
import { PORT } from './Config/env.config.js';
import connectDB from './Database/database.js';
import CollegeAuthRouter from './Routes/CollegeAuth.route.js';
import { StudentAuthRouter, TeacherAuthRouter } from './Routes/UserAuth.route.js';
import CollegeRouter from './Routes/College.route.js';
import TimetableRouter from './Routes/Timetable.route.js';
import BranchRouter from './Routes/Branch.route.js';
import AttendanceRouter from './Routes/Attendance.route.js';
import cors from 'cors';
import OTProuter from './Routes/OTP.route.js';
import TeacherRouter from './Routes/Teacher.route.js';

const app = express();

app.use(express.json());

app.use(cors({
  origin: ["http://localhost:5173"],  // frontend URLs
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // if sending JWT or cookies
}));

app.use('/api/teacher-auth', TeacherAuthRouter);
app.use('/api/student-auth', StudentAuthRouter);

app.use('/api/college-auth', CollegeAuthRouter);
app.use('/api/colleges', CollegeRouter);
app.use('/api/timetables', TimetableRouter);
app.use('/api/branches', BranchRouter);
app.use('/api/attendance', AttendanceRouter);
app.use('/api/otp', OTProuter);
app.use('/api/teachers', TeacherRouter);



app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
  
  // Initialize attendance data transfer scheduler
  // initializeAttendanceScheduler();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});
