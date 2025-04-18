import express from 'express';
import {
  employeeLogin,
  getEmployeeProfile,
  getEmployeeSchedule,
  getEmployeeAttendance,
  getEmployeeEnhancedAttendance,
  getAttendanceMetrics,
  getEmployeePayroll,
  clockIn,
  clockOut,
  reportAttendance,
  updateEmployeeProfile
} from '../controllers/employeeDashboardController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/login', employeeLogin);

// Protected routes
router.get('/profile', protect, getEmployeeProfile);
router.put('/profile', protect, updateEmployeeProfile);
router.get('/schedule', protect, getEmployeeSchedule);

// Attendance routes
router.get('/attendance', protect, getEmployeeAttendance);
router.get('/attendance/enhanced', protect, getEmployeeEnhancedAttendance);
router.get('/attendance/metrics', protect, getAttendanceMetrics);
router.post('/attendance/report', protect, reportAttendance);
router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);

router.get('/payroll', protect, getEmployeePayroll);

export default router;
