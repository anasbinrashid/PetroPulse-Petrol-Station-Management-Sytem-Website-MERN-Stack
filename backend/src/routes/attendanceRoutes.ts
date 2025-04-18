import express from 'express';
import { protect, admin, employee } from '../middleware/authMiddleware';
import {
  getAllAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  clockIn,
  clockOut,
  getAttendanceSummary,
  getEmployeeAttendance
} from '../controllers/attendanceController';

const router = express.Router();

// Protected admin routes
router.route('/')
  .get(protect, admin, getAllAttendance)
  .post(protect, admin, createAttendance);

// Allow both admins and employees to access attendance summary
router.route('/summary')
  .get(protect, employee, getAttendanceSummary);

router.route('/:id')
  .get(protect, getAttendanceById)
  .put(protect, admin, updateAttendance)
  .delete(protect, admin, deleteAttendance);

// Employee specific routes
router.route('/employee/:employeeId')
  .get(protect, getEmployeeAttendance);

// Clock in/out routes (can be accessed by employees)
router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);

export default router;
