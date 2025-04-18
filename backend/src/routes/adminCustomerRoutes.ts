import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateLoyaltyPoints
} from '../controllers/adminCustomerController';

const router = express.Router();

// @desc    Get all customers 
// @route   GET /api/admin/customers
// @access  Private/Admin
router.get('/', protect, admin, getAllCustomers);

// @desc    Get customer by ID
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
router.get('/:id', protect, admin, getCustomerById);

// @desc    Create new customer
// @route   POST /api/admin/customers
// @access  Private/Admin
router.post('/', protect, admin, createCustomer);

// @desc    Update customer
// @route   PUT /api/admin/customers/:id
// @access  Private/Admin
router.put('/:id', protect, admin, updateCustomer);

// @desc    Delete customer
// @route   DELETE /api/admin/customers/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteCustomer);

// @desc    Update customer loyalty points
// @route   PATCH /api/admin/customers/:id/loyalty
// @access  Private/Admin
router.patch('/:id/loyalty', protect, admin, updateLoyaltyPoints);

export default router; 