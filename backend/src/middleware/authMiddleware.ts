import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Admin from '../models/admin/AdminModel';
import Employee from '../models/admin/EmployeeModel';
import Customer from '../models/admin/CustomerModel';
import { initCustomerModel } from '../models/customerDB/CustomerModel';

interface JwtPayload {
  id: string;
  userType: string;
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
  console.log(`[AuthMiddleware] Authorization header: ${req.headers.authorization ? 'Present' : 'Missing'}`);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log(`[AuthMiddleware] Token extracted: ${token ? token.substring(0, 15) + '...' : 'Missing'}`);
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;
      console.log(`[AuthMiddleware] Decoded token:`, JSON.stringify(decoded));
      
      if (!decoded.id || !decoded.userType) {
        throw new Error('Invalid token payload');
      }

      // Try to find user in appropriate collection based on userType
      let user = null;
      
      try {
        switch (decoded.userType) {
          case 'admin':
            console.log(`[AuthMiddleware] Checking admin collection for user ID: ${decoded.id}`);
            user = await Admin.findById(decoded.id).select('-password');
            break;
            
          case 'employee':
            console.log(`[AuthMiddleware] Checking employee collection for user ID: ${decoded.id}`);
            user = await Employee.findById(decoded.id).select('-password');
            break;
            
          case 'customer':
            console.log(`[AuthMiddleware] Checking customer collections for user ID: ${decoded.id}`);
            try {
              // Try customer-specific database first
              const CustomerModel = await initCustomerModel();
              user = await CustomerModel.findById(decoded.id).select('-password');
              
              // If not found, try admin's customer collection
              if (!user) {
                user = await Customer.findById(decoded.id).select('-password');
              }
            } catch (error) {
              console.error(`[AuthMiddleware] Error checking customer databases:`, error);
              // Fallback to admin's customer collection
              user = await Customer.findById(decoded.id).select('-password');
            }
            break;
            
          default:
            throw new Error('Invalid user type in token');
        }
        
        if (!user) {
          throw new Error('User not found');
        }
        
        // Add user type to the user object
        user = user.toObject();
        user.userType = decoded.userType;
        
        console.log(`[AuthMiddleware] User authenticated as: ${user.userType}, ID: ${user._id}`);
        req.user = user;
        next();
        
      } catch (error) {
        console.error(`[AuthMiddleware] Error finding user:`, error);
        res.status(401);
        throw new Error('User not found');
      }
      
    } catch (error) {
      console.error(`[AuthMiddleware] Token verification failed:`, error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    console.log(`[AuthMiddleware] No token provided in request`);
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
