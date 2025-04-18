import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import { 
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} from '../controllers/expenseController';

const router = express.Router();

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private/Admin
router.get('/', protect, admin, getAllExpenses);

// @desc    Get expense summary by category
// @route   GET /api/expenses/summary
// @access  Private/Admin
router.get('/summary', protect, admin, getExpenseSummary);

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private/Admin
router.get('/:id', protect, admin, getExpenseById);

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private/Admin
router.post('/', protect, admin, createExpense);

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private/Admin
router.put('/:id', protect, admin, updateExpense);

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteExpense);

export default router; 