import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import adminEmployeeRoutes from './adminEmployeeRoutes';
import adminCustomerRoutes from './adminCustomerRoutes';
import maintenanceRoutes from './maintenanceRoutes';
import expenseRoutes from './expenseRoutes';
import revenueRoutes from './revenueRoutes';
import {
  getAdminProfile,
  getReports,
  getReportById,
  getDashboardData,
  getInventory,
  getSales,
  getEmployeeDbProfiles,
  getCustomerDbProfiles,
} from '../controllers/adminController';

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(protect);
router.use(admin);

// Admin profile
router.get('/profile', getAdminProfile);

// Reports
router.get('/reports', getReports);
router.get('/reports/:id', getReportById);

// Dashboard
router.get('/dashboard', getDashboardData);

// Inventory
router.get('/inventory', getInventory);

// Sales
router.get('/sales', getSales);

// Direct access to employee and customer databases
router.get('/employee-db/profiles', getEmployeeDbProfiles);
router.get('/customer-db/profiles', getCustomerDbProfiles);

// Use specialized routers for more complex resources
router.use('/employees', adminEmployeeRoutes);
router.use('/customers', adminCustomerRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/expenses', expenseRoutes);
router.use('/revenue', revenueRoutes);

export default router; 