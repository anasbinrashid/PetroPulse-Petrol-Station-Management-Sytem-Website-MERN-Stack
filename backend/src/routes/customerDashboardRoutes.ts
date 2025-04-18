import express from 'express';
import { protect, customer } from '../middleware/authMiddleware';
import {
  getCustomerProfile,
  updateCustomerProfile,
  getFuelPurchases,
  getLoyaltyTransactions,
  getDashboardSummary,
  updateCustomerPassword
} from '../controllers/customerDashboardController';

const router = express.Router();

// Base route: /api/customer

// @desc    Get customer profile data with enhanced details
// @route   GET /api/customer/profile
// @access  Private/Customer
router.get('/profile', protect, customer, getCustomerProfile);

// @desc    Update customer profile
// @route   PUT /api/customer/profile
// @access  Private/Customer
router.put('/profile', protect, customer, updateCustomerProfile);

// @desc    Update customer password
// @route   PUT /api/customer/password
// @access  Private/Customer
router.put('/password', protect, customer, updateCustomerPassword);

// @desc    Get customer fuel purchase history
// @route   GET /api/customer/fuel-purchases
// @access  Private/Customer
router.get('/fuel-purchases', protect, customer, getFuelPurchases);

// @desc    Get customer loyalty transaction history
// @route   GET /api/customer/loyalty
// @access  Private/Customer
router.get('/loyalty', protect, customer, getLoyaltyTransactions);

// @desc    Get customer dashboard summary
// @route   GET /api/customer/dashboard
// @access  Private/Customer
router.get('/dashboard', protect, customer, getDashboardSummary);

export default router; 