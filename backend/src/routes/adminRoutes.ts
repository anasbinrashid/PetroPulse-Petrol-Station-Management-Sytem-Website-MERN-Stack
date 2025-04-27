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
  createCustomerInDb,
  updateCustomerInDb,
  deleteCustomerInDb,
  updateCustomerStatusInDb,
  updateCustomerLoyaltyInDb,
  createEmployeeInDb,
  updateEmployeeInDb,
  deleteEmployeeInDb,
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

// Add CRUD operations for customer database
router.post('/customer-db/create', createCustomerInDb);
router.put('/customer-db/update/:id', updateCustomerInDb);
router.delete('/customer-db/delete/:id', deleteCustomerInDb);
router.patch('/customer-db/update-status/:id', updateCustomerStatusInDb);
router.patch('/customer-db/update-loyalty/:id', updateCustomerLoyaltyInDb);

// Add CRUD operations for employee database
router.post('/employee-db/create', createEmployeeInDb);
router.put('/employee-db/update/:id', updateEmployeeInDb);
router.delete('/employee-db/delete/:id', deleteEmployeeInDb);

// Use specialized routers for more complex resources
router.use('/employees', adminEmployeeRoutes);
router.use('/customers', adminCustomerRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/expenses', expenseRoutes);
router.use('/revenue', revenueRoutes);

export default router; 