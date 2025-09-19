import express from 'express';
import { PORT } from './Config/env.config.js';
import connectDB from './Database/database.js';
import CollegeAuthRouter from './Routes/CollegeAuth.route.js';
import UserAuthRouter from './Routes/UserAuth.route.js';
import CollegeRouter from './Routes/College.route.js';
import TimetableRouter from './Routes/Timetable.route.js';
import BranchRouter from './Routes/Branch.route.js';

const app = express();

app.use(express.json());

app.use('/api/college-auth', CollegeAuthRouter);
app.use('/api/user-auth', UserAuthRouter);
app.use('/api/colleges', CollegeRouter);
app.use('/api/timetables', TimetableRouter);
app.use('/api/branches', BranchRouter);


app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB()
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});
