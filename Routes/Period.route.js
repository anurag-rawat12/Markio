import express from "express";
import mongoose from "mongoose";
import Period from "../Models/Period.js";

const periodRouter = express.Router();

function isNowWithinPeriod(startHHmm, endHHmm, now = new Date()) {
  if (!startHHmm || !endHHmm) return true;
  const [sh, sm] = String(startHHmm).split(':').map(Number);
  const [eh, em] = String(endHHmm).split(':').map(Number);
  const start = new Date(now); start.setHours(sh, sm || 0, 0, 0);
  const end = new Date(now);   end.setHours(eh, em || 0, 0, 0);
  return now >= start && now <= end;
}

function pickLimit(p) {
  // Adapt to your schema: TotalStudent is the teacher-entered limit
  return p?.TotalStudent ?? p?.presentCountTarget ?? p?.expectedPresent ?? p?.expectedCount ?? p?.maxMarks ?? p?.limit ?? null;
}

function countMarked(p) {
  // Adapt to your schema: TotalAttendanceMarked or attendedStudents array length
  if (typeof p?.TotalAttendanceMarked === 'number') return p.TotalAttendanceMarked;
  if (Array.isArray(p?.attendedStudents)) return p.attendedStudents.length;
  if (typeof p?.markedCount === 'number') return p.markedCount;
  if (Array.isArray(p?.markedStudents)) return p.markedStudents.length;
  if (typeof p?.attendanceCount === 'number') return p.attendanceCount;
  if (Array.isArray(p?.studentsMarked)) return p.studentsMarked.length;
  if (typeof p?.count === 'number') return p.count;
  return 0;
}

// GET /api/periods/current?branchId=...
// GET /api/periods/live?branchId=...
// GET /api/periods/active?branchId=...
async function getCurrentLivePeriod(req, res) {
  try {
    if (!Period) return res.status(500).json({ message: 'Period model not available' });
    const { branchId } = req.query;
    // Note: branchId filtering disabled for now since your schema uses timetableId
    // You can re-enable by populating timetableId and filtering by timetableId.branchId
    
    // Find active periods with attendance codes
    const periods = await Period.find({ 
      sessionStatus: 'active',
      'activeCode.code': { $exists: true }
    })
      .populate('timetableId') // populate to potentially filter by branch later
      .sort({ createdAt: -1 })
      .lean();
    
    // Optional: filter by branchId if timetableId has branch info
    let filteredPeriods = periods;
    if (branchId) {
      filteredPeriods = periods.filter(p => {
        // Adjust this condition based on your TimeTable schema structure
        return p.timetableId?.branchId && String(p.timetableId.branchId) === String(branchId);
      });
    }

    const now = new Date();
    // Filter by time window and check if code hasn't expired
    const live = filteredPeriods.find(p => {
      const codeExpired = p.activeCode?.expiresAt && new Date(p.activeCode.expiresAt) < now;
      return isNowWithinPeriod(p.startTime, p.endTime, now) && p.activeCode?.code && !codeExpired;
    });

    // Always 200 with { period: null } when none
    if (!live) return res.json({ period: null });

    return res.json({
      period: {
        ...live,
        // Normalize field names for frontend
        id: live._id,
        code: live.activeCode?.code,
        presentCountTarget: pickLimit(live),
        markedCount: countMarked(live),
        expired: live.sessionStatus === 'expired' || (live.activeCode?.expiresAt && new Date(live.activeCode.expiresAt) < now)
      }
    });
  } catch (e) {
    console.error('getCurrentLivePeriod error', e);
    return res.status(500).json({ message: 'Internal error' });
  }
}

// POST /api/periods/:periodId/mark  body: { code, studentId }
async function markAttendanceForPeriod(req, res) {
  try {
    if (!Period) return res.status(500).json({ message: 'Period model not available' });
    const { periodId } = req.params;
    const { code, studentId } = req.body;

    if (!periodId || !studentId) {
      return res.status(400).json({ message: 'periodId and studentId are required' });
    }

    const period = await Period.findById(periodId);
    if (!period) return res.status(404).json({ message: 'Period not found' });
    
    // Check session status and code expiration
    const now = new Date();
    const codeExpired = period.activeCode?.expiresAt && new Date(period.activeCode.expiresAt) < now;
    if (period.sessionStatus === 'expired' || period.sessionStatus === 'completed' || codeExpired) {
      return res.status(400).json({ message: 'Attendance code expired' });
    }

    if (period.activeCode?.code && code && String(period.activeCode.code) !== String(code)) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    if (!isNowWithinPeriod(period.startTime, period.endTime)) {
      return res.status(400).json({ message: 'Attendance window closed' });
    }

    const limit = pickLimit(period) || 0;
    const sid = new mongoose.Types.ObjectId(studentId);

    // Check if student already marked using your schema
    const alreadyMarked = period.attendedStudents.some(s => String(s.studentId) === String(studentId));
    if (alreadyMarked) {
      return res.status(409).json({ message: 'Already marked', markedCount: countMarked(period), limit });
    }

    // Check limit using your schema
    if (limit > 0 && period.TotalAttendanceMarked >= limit) {
      // Mark as completed if limit reached
      await Period.findByIdAndUpdate(period._id, { sessionStatus: 'completed' });
      return res.status(400).json({ message: 'Attendance code expired', markedCount: period.TotalAttendanceMarked, limit });
    }

    const query = {
      _id: period._id,
      sessionStatus: 'active',
      'attendedStudents.studentId': { $ne: sid },
    };
    if (limit > 0) query.$expr = { $lt: ['$TotalAttendanceMarked', limit] };
    if (period.activeCode?.code && code) query['activeCode.code'] = code;

    const updated = await Period.findOneAndUpdate(
      query,
      { 
        $push: { attendedStudents: { studentId: sid, markedAt: new Date() } },
        $inc: { TotalAttendanceMarked: 1 }
      },
      { new: true }
    );

    if (!updated) {
      const fresh = await Period.findById(period._id).lean();
      const markedNow = countMarked(fresh);
      const codeExpired = fresh.activeCode?.expiresAt && new Date(fresh.activeCode.expiresAt) < new Date();
      if (fresh?.sessionStatus !== 'active' || codeExpired || (limit > 0 && markedNow >= limit)) {
        return res.status(400).json({ message: 'Attendance code expired', markedCount: markedNow, limit });
      }
      const already = Array.isArray(fresh?.attendedStudents) && fresh.attendedStudents.some(s => String(s.studentId) === String(studentId));
      if (already) return res.status(409).json({ message: 'Already marked', markedCount: markedNow, limit });
      return res.status(400).json({ message: 'Failed to mark attendance' });
    }

    const markedNow = countMarked(updated);
    if (limit > 0 && markedNow >= limit && updated.sessionStatus === 'active') {
      await Period.updateOne({ _id: updated._id }, { $set: { sessionStatus: 'completed' } });
    }

    return res.json({
      ok: true,
      periodId: String(updated._id),
      markedCount: markedNow,
      limit,
      expired: limit > 0 && markedNow >= limit
    });
  } catch (e) {
    console.error('markAttendanceForPeriod error', e);
    return res.status(500).json({ message: 'Internal error' });
  }
}

// Aliases expected by the frontend
periodRouter.get('/current', getCurrentLivePeriod);
periodRouter.get('/live', getCurrentLivePeriod);
periodRouter.get('/active', getCurrentLivePeriod);

// Per-period mark endpoint
periodRouter.post('/:periodId/mark', markAttendanceForPeriod);

export default periodRouter;
