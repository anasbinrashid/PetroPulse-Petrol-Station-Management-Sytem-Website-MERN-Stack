import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
  getAllRevenue,
  getRevenueById,
  createRevenue,
  updateRevenue,
  deleteRevenue,
  getRevenueSummary
} from '../controllers/revenueController';

const router = express.Router();

// @desc    Get all revenue entries
// @route   GET /api/revenue
// @access  Private/Admin
router.get('/', protect, admin, getAllRevenue);

// @desc    Get revenue summary
// @route   GET /api/revenue/summary
// @access  Private/Admin
router.get('/summary', protect, admin, getRevenueSummary);

// @desc    Get revenue entry by ID
// @route   GET /api/revenue/:id
// @access  Private/Admin
router.get('/:id', protect, admin, getRevenueById);

// @desc    Create a new revenue entry
// @route   POST /api/revenue
// @access  Private/Admin
router.post('/', protect, admin, createRevenue);

// @desc    Update a revenue entry
// @route   PUT /api/revenue/:id
// @access  Private/Admin
router.put('/:id', protect, admin, updateRevenue);

// @desc    Delete a revenue entry
// @route   DELETE /api/revenue/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteRevenue);

export default router;
