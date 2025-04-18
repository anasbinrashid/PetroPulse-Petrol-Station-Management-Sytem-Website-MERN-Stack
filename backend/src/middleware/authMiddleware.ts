import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Admin from '../models/admin/AdminModel';
import Employee from '../models/admin/EmployeeModel';
import Customer from '../models/admin/CustomerModel';
import { initCustomerModel } from '../models/customerDB/CustomerModel';

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;
  console.log(`[DEBUG][AuthMiddleware] Authorization header: ${req.headers.authorization ? 'Present' : 'Missing'}`);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log(`[DEBUG][AuthMiddleware] Token extracted: ${token ? token.substring(0, 15) + '...' : 'Missing'}`);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;
      console.log(`[DEBUG][AuthMiddleware] Decoded token:`, JSON.stringify(decoded));
      
      // Try to find user in each collection and add userType
      let user = null;
      
      // Check admin collection
      console.log(`[DEBUG][AuthMiddleware] Checking admin collection for user ID: ${decoded.id}`);
      const admin = await Admin.findById(decoded.id).select('-password') as any;
      if (admin) {
        console.log(`[DEBUG][AuthMiddleware] User found in admin collection`);
        user = admin;
        user.userType = 'admin';
      }
      
      // Check employee collection
      if (!user) {
        console.log(`[DEBUG][AuthMiddleware] Checking employee collection for user ID: ${decoded.id}`);
        const employee = await Employee.findById(decoded.id).select('-password') as any;
        if (employee) {
          console.log(`[DEBUG][AuthMiddleware] User found in employee collection`);
          user = employee;
          user.userType = 'employee';
        }
      }
      
      // Check customer-specific database first
      if (!user) {
        console.log(`[DEBUG][AuthMiddleware] Checking customer-specific database for user ID: ${decoded.id}`);
        try {
          // Initialize customer model with petropulse-customers DB connection
          const CustomerModel = await initCustomerModel();
          
          // Find customer by ID in customer-specific database
          const customerFromCustomerDB = await CustomerModel.findById(decoded.id) as any;
          
          if (customerFromCustomerDB) {
            console.log(`[DEBUG][AuthMiddleware] User found in customer-specific database`);
            user = customerFromCustomerDB;
            user.userType = 'customer';
          }
        } catch (error) {
          console.error(`[DEBUG][AuthMiddleware] Error checking customer-specific database: ${error}`);
          console.log(`[DEBUG][AuthMiddleware] Falling back to admin database for customer authentication`);
        }
      }
      
      // Check admin's customer collection as fallback
      if (!user) {
        console.log(`[DEBUG][AuthMiddleware] Checking admin customer collection for user ID: ${decoded.id}`);
        const customer = await Customer.findById(decoded.id).select('-password') as any;
        if (customer) {
          console.log(`[DEBUG][AuthMiddleware] User found in admin customer collection`);
          user = customer;
          user.userType = 'customer';
        }
      }
      
      if (!user) {
        console.log(`[DEBUG][AuthMiddleware] No user found for ID: ${decoded.id}`);
        res.status(401);
        throw new Error('User not found');
      }
      
      console.log(`[DEBUG][AuthMiddleware] User authenticated as: ${user.userType}, ID: ${user._id}`);
      req.user = user;
      next();
    } catch (error: any) {
      console.error(`[DEBUG][AuthMiddleware] Authentication error: ${error.message}`);
      console.error(`[DEBUG][AuthMiddleware] Error stack: ${error.stack}`);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else if (!token) {
    console.log(`[DEBUG][AuthMiddleware] No token provided in request`);
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

export const employee = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user.userType === 'employee' || req.user.userType === 'admin')) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an employee');
  }
};

export const customer = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.userType === 'customer') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a customer');
  }
};
