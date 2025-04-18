import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
  getAllMaintenanceTasks,
  getMaintenanceTaskById,
  createMaintenanceTask,
  updateMaintenanceTask,
  deleteMaintenanceTask,
  updateMaintenanceStatus
} from '../controllers/maintenanceController';

const router = express.Router();

// @desc    Get all maintenance tasks
// @route   GET /api/maintenance
// @access  Public
router.get('/', getAllMaintenanceTasks);

// @desc    Get maintenance task by ID
// @route   GET /api/maintenance/:id
// @access  Private/Admin
router.get('/:id', protect, admin, getMaintenanceTaskById);

// @desc    Create a new maintenance task
// @route   POST /api/maintenance
// @access  Private/Admin
router.post('/', protect, admin, createMaintenanceTask);

// @desc    Update a maintenance task
// @route   PUT /api/maintenance/:id
// @access  Private/Admin
router.put('/:id', protect, admin, updateMaintenanceTask);

// @desc    Delete a maintenance task
// @route   DELETE /api/maintenance/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteMaintenanceTask);

// @desc    Update maintenance task status
// @route   PATCH /api/maintenance/:id/status
// @access  Private/Admin
router.patch('/:id/status', protect, admin, updateMaintenanceStatus);

export default router; 