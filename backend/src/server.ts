import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db';
import employeeDbConnection from './config/employeeDb';
import connectCustomerDB from './config/customerDb';

// Import routes
import userRoutes from './routes/userRoutes';
import fuelInventoryRoutes from './routes/fuelInventoryRoutes';
import productRoutes from './routes/productRoutes';
import salesRoutes from './routes/salesRoutes';
import revenueRoutes from './routes/revenueRoutes';
import employeeRoutes from './routes/employeeRoutes';
import customerRoutes from './routes/customerRoutes';
import customerDashboardRoutes from './routes/customerDashboardRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import reportsRouter from './routes/reports';
import adminRoutes from './routes/adminRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import expenseRoutes from './routes/expenseRoutes';
import adminEmployeeRoutes from './routes/adminEmployeeRoutes';
import adminCustomerRoutes from './routes/adminCustomerRoutes';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Get employee database connection
employeeDbConnection.then(() => {
  console.log('Employee database connection ready');
}).catch(err => {
  console.error('Error connecting to employee database:', err);
});

// Get customer database connection
connectCustomerDB().then(() => {
  console.log('Customer database connection ready');
}).catch(err => {
  console.error('Error connecting to customer database:', err);
});

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Enhanced request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/fuel-inventory', fuelInventoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportsRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/customer', customerDashboardRoutes);

// Register admin sub-routes
adminRoutes.use('/employees', adminEmployeeRoutes);
adminRoutes.use('/customers', adminCustomerRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('PetroPulse API is running...');
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`⚡️ Server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🧩 Admin dashboard API: http://localhost:${PORT}/api/admin`);
  console.log(`👷 Employee dashboard API: http://localhost:${PORT}/api/employee`);
  console.log(`🛒 Customer dashboard API: http://localhost:${PORT}/api/customer`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});
