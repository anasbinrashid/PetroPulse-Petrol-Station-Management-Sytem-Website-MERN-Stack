import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeAttendance,
  addEmployeeAttendance,
  updateAttendanceRecord
} from '../controllers/adminEmployeeController';

const router = express.Router();

// @desc    Get all employees 
// @route   GET /api/admin/employees
// @access  Private/Admin
router.get('/', protect, admin, getAllEmployees);

// @desc    Get employee by ID
// @route   GET /api/admin/employees/:id
// @access  Private/Admin
router.get('/:id', protect, admin, getEmployeeById);

// @desc    Create new employee
// @route   POST /api/admin/employees
// @access  Private/Admin
router.post('/', protect, admin, createEmployee);

// @desc    Update employee
// @route   PUT /api/admin/employees/:id
// @access  Private/Admin
router.put('/:id', protect, admin, updateEmployee);

// @desc    Delete employee
// @route   DELETE /api/admin/employees/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteEmployee);

// @desc    Get employee attendance records
// @route   GET /api/admin/employees/:id/attendance
// @access  Private/Admin
router.get('/:id/attendance', protect, admin, getEmployeeAttendance);

// @desc    Add attendance record for employee
// @route   POST /api/admin/employees/:id/attendance
// @access  Private/Admin
router.post('/:id/attendance', protect, admin, addEmployeeAttendance);

// @desc    Update attendance record
// @route   PUT /api/admin/employees/:id/attendance/:attendanceId
// @access  Private/Admin
router.put('/:id/attendance/:attendanceId', protect, admin, updateAttendanceRecord);

export default router; 