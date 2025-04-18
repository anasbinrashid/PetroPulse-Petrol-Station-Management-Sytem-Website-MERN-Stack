import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import AdminModel from '../models/admin/AdminModel';
import ReportModel from '../models/admin/ReportModel';
import RevenueModel from '../models/admin/RevenueModel';
import ExpenseModel from '../models/admin/ExpenseModel';
import MaintenanceModel from '../models/admin/MaintenanceModel';
import EmployeeModel from '../models/admin/EmployeeModel';
import AttendanceModel from '../models/admin/AttendanceModel';
import CustomerModel from '../models/admin/CustomerModel';
import FuelInventoryModel from '../models/admin/FuelInventoryModel';
import ProductModel from '../models/admin/ProductModel';
import SalesModel from '../models/admin/SalesModel';
import mongoose from 'mongoose';

/**
 * @desc    Get admin profile
 * @route   GET /api/admin/profile
 * @access  Private/Admin
 */
export const getAdminProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Fetching admin profile...');
    
    // Use req.user.id if you have authentication middleware that sets the user
    // For now, just fetch the first admin
    const admin = await AdminModel.findOne().select('-password');
    
    if (admin) {
      console.log(`Admin profile found: ${admin.name}`);
      res.json(admin);
    } else {
      console.log('Admin profile not found');
      res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ message: 'Error fetching admin profile', error: (error as Error).message });
  }
});

/**
 * @desc    Get all reports
 * @route   GET /api/admin/reports
 * @access  Private/Admin
 */
export const getReports = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Fetching reports...');
    
    const reports = await ReportModel.find({}).sort({ lastGenerated: -1 });
    
    console.log(`Found ${reports.length} reports`);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error: (error as Error).message });
  }
});

/**
 * @desc    Get report by ID
 * @route   GET /api/admin/reports/:id
 * @access  Private/Admin
 */
export const getReportById = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log(`Fetching report with ID: ${req.params.id}`);
    
    const report = await ReportModel.findById(req.params.id);
    
    if (report) {
      console.log(`Report found: ${report.title}`);
      res.json(report);
    } else {
      console.log('Report not found');
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Error fetching report', error: (error as Error).message });
  }
});

/**
 * @desc    Get financial data (revenue and expenses)
 * @route   GET /api/admin/finances
 * @access  Private/Admin
 */
export const getFinancialData = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Fetching financial data...');
    
    // Parse query parameters for date range
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Fetch revenue data
    const revenues = await RevenueModel.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    
    // Fetch expense data
    const expenses = await ExpenseModel.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    
    // Calculate summary statistics
    const totalRevenue = revenues.reduce((sum, record) => sum + record.amount, 0);
    const totalExpenses = expenses.reduce((sum, record) => sum + record.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    
    console.log(`Found ${revenues.length} revenue records and ${expenses.length} expense records`);
    console.log(`Total revenue: $${totalRevenue}, Total expenses: $${totalExpenses}, Net income: $${netIncome}`);
    
    res.json({
      revenues,
      expenses,
      summary: {
        totalRevenue,
        totalExpenses,
        netIncome,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({ message: 'Error fetching financial data', error: (error as Error).message });
  }
});

/**
 * @desc    Get maintenance tasks
 * @route   GET /api/admin/maintenance
 * @access  Private/Admin
 */
export const getMaintenanceTasks = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Fetching maintenance tasks...');
    
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    
    const filter: any = {};
    if (status) {
      filter.status = status;
      console.log(`Filtering by status: ${status}`);
    }
    if (priority) {
      filter.priority = priority;
      console.log(`Filtering by priority: ${priority}`);
    }
    
    const tasks = await MaintenanceModel.find(filter).sort({ dueDate: 1 });
    
    console.log(`Found ${tasks.length} maintenance tasks`);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching maintenance tasks:', error);
    res.status(500).json({ message: 'Error fetching maintenance tasks', error: (error as Error).message });
  }
});

/**
 * @desc    Get employees and attendance
 * @route   GET /api/admin/employees
 * @access  Private/Admin
 */
export const getEmployees = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Fetching employees...');
    
    const employees = await EmployeeModel.find({}).select('-password').sort({ lastName: 1, firstName: 1 });
    
    console.log(`Found ${employees.length} employees`);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error: (error as Error).message });
  }
});

/**
 * @desc    Get employee attendance
 * @route   GET /api/admin/employees/:id/attendance
 * @access  Private/Admin
 */
export const getEmployeeAttendance = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log(`Fetching attendance for employee ID: ${req.params.id}`);
    
    // Parse query parameters for date range
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // First check if employee exists
    const employee = await EmployeeModel.findById(req.params.id).select('-password');
    
    if (!employee) {
      console.log('Employee not found');
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    
    // Find attendance records for the employee
    const attendance = await AttendanceModel.find({
      employee: req.params.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    
    console.log(`Found ${attendance.length} attendance records for employee ${employee.firstName} ${employee.lastName}`);
    
    res.json({
      employee,
      attendance
    });
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    res.status(500).json({ message: 'Error fetching employee attendance', error: (error as Error).message });
  }
});

/**
 * @desc    Get all customers
 * @route   GET /api/admin/customers
 * @access  Private/Admin
 */
export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Fetching customers...');
    
    const customers = await CustomerModel.find({}).select('-password').sort({ lastName: 1, firstName: 1 });
    
    console.log(`Found ${customers.length} customers`);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers', error: (error as Error).message });
  }
});

/**
 * @desc    Get inventory (fuel and products)
 * @route   GET /api/admin/inventory
 * @access  Private/Admin
 */
export const getInventory = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Fetching inventory...');
    
    const fuelInventory = await FuelInventoryModel.find({});
    const products = await ProductModel.find({});
    
    console.log(`Found ${fuelInventory.length} fuel types and ${products.length} products`);
    
    res.json({
      fuel: fuelInventory,
      products
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Error fetching inventory', error: (error as Error).message });
  }
});

/**
 * @desc    Get sales data
 * @route   GET /api/admin/sales
 * @access  Private/Admin
 */
export const getSales = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Fetching sales data...');
    
    // Parse query parameters for date range
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Find sales records within date range
    const sales = await SalesModel.find({
      date: { $gte: startDate, $lte: endDate }
    })
    .populate('customer', 'firstName lastName email -_id')
    .populate('employee', 'firstName lastName -_id')
    .sort({ date: -1 });
    
    // Calculate summary statistics
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItems = sales.reduce((sum, sale) => sum + sale.items.length, 0);
    
    console.log(`Found ${sales.length} sales records with total value of $${totalSales.toFixed(2)}`);
    
    res.json({
      sales,
      summary: {
        totalSales,
        totalItems,
        totalTransactions: sales.length,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ message: 'Error fetching sales data', error: (error as Error).message });
  }
});

/**
 * @desc    Get dashboard summary data
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
export const getDashboardData = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Fetching dashboard summary data...');
    
    // Set date range for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set date range for this month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    console.log(`Today's date range: ${today.toISOString()} to ${tomorrow.toISOString()}`);
    console.log(`Month's date range: ${firstDayOfMonth.toISOString()} to ${lastDayOfMonth.toISOString()}`);
    
    // Get today's sales
    const todaySales = await SalesModel.find({
      date: { $gte: today, $lt: tomorrow }
    });
    
    // Get month's sales
    const monthSales = await SalesModel.find({
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });
    
    // Get fuel inventory status
    const fuelInventory = await FuelInventoryModel.find({});
    
    // Get low stock products
    const lowStockProducts = await ProductModel.find({
      $expr: { $lt: ["$quantity", "$reorderLevel"] }
    });
    
    // Get pending maintenance tasks
    const pendingMaintenance = await MaintenanceModel.find({
      status: { $in: ['pending', 'in_progress'] }
    }).sort({ priority: -1, dueDate: 1 }).limit(5);
    
    // Get recent customers
    const recentCustomers = await CustomerModel.find({})
      .sort({ lastVisit: -1 })
      .limit(5)
      .select('firstName lastName lastVisit totalSpent');
    
    // Calculate statistics
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);
    
    // Calculate fuel levels percentage
    const fuelLevels = fuelInventory.map(fuel => ({
      fuelType: fuel.fuelType,
      currentLevel: fuel.currentLevel,
      capacity: fuel.capacity,
      percentage: Math.round((fuel.currentLevel / fuel.capacity) * 100),
      status: fuel.status
    }));
    
    console.log(`Today's sales: ${todaySales.length}, Revenue: $${todayRevenue.toFixed(2)}`);
    console.log(`Month's sales: ${monthSales.length}, Revenue: $${monthRevenue.toFixed(2)}`);
    console.log(`Fuel inventory: ${fuelInventory.length} types`);
    console.log(`Low stock products: ${lowStockProducts.length}`);
    console.log(`Pending maintenance tasks: ${pendingMaintenance.length}`);
    
    res.json({
      sales: {
        today: {
          count: todaySales.length,
          revenue: todayRevenue
        },
        month: {
          count: monthSales.length,
          revenue: monthRevenue
        }
      },
      inventory: {
        fuel: fuelLevels,
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.map(p => ({
          id: p._id,
          name: p.name,
          quantity: p.quantity,
          reorderLevel: p.reorderLevel
        }))
      },
      maintenance: pendingMaintenance,
      customers: {
        total: await CustomerModel.countDocuments({}),
        recent: recentCustomers
      },
      employees: {
        total: await EmployeeModel.countDocuments({}),
        active: await EmployeeModel.countDocuments({ status: 'active' })
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: (error as Error).message });
  }
}); 