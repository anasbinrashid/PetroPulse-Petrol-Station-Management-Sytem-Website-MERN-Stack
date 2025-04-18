import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel';
import Admin from '../models/admin/AdminModel';
import Employee from '../models/admin/EmployeeModel';
import Customer from '../models/admin/CustomerModel';
import { initCustomerModel } from '../models/customerDB/CustomerModel'; 
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const authUser = asyncHandler(async (req: Request, res: Response) => {
  console.log("Login payload:", req.body);
  const { email, password } = req.body;

  // First try the admin collection
  let user = null;
  let userType = "";
  let profile = null;
  let userId = "";

  // Check in admin collection
  const admin = await Admin.findOne({ email }) as any;
  if (admin) {
    const isMatch = await admin.comparePassword(password);
    if (isMatch) {
      user = admin;
      userType = "admin";
      profile = admin;
      userId = admin._id;
      console.log("Admin login successful:", admin.email);
    } else {
      console.log("Admin password mismatch");
    }
  }
  
  // If not found in admin, check in employee collection
  if (!user) {
    const employee = await Employee.findOne({ email }) as any;
    if (employee) {
      const isMatch = await employee.comparePassword(password);
      if (isMatch) {
        user = employee;
        userType = "employee";
        profile = employee;
        userId = employee._id;
        console.log("Employee login successful:", employee.email);
      } else {
        console.log("Employee password mismatch");
      }
    }
  }
  
  // If not found in employee, check in customer-specific database first 
  if (!user) {
    try {
      // Initialize customer model with petropulse-customers DB connection
      const CustomerModel = await initCustomerModel();
      
      // Find customer by email in customer-specific DB and include password field
      const customerFromCustomerDB = await CustomerModel.findOne({ email }).select('+password') as any;
      
      if (customerFromCustomerDB) {
        // Compare passwords using the comparePassword method
        const isMatch = await customerFromCustomerDB.comparePassword(password);
        
        if (isMatch) {
          user = customerFromCustomerDB;
          userType = "customer";
          profile = customerFromCustomerDB;
          userId = customerFromCustomerDB._id;
          console.log("Customer login successful from customer-specific DB:", customerFromCustomerDB.email);
        } else {
          console.log("Customer password mismatch from customer-specific DB");
        }
      } else {
        console.log("Customer not found in customer-specific DB, checking admin DB as fallback");
      }
    } catch (error) {
      console.error("Error connecting to customer-specific database:", error);
      console.log("Falling back to admin database for customer authentication");
    }
  }
  
  // If still not found, check the admin database's customer collection as fallback
  if (!user) {
    const customer = await Customer.findOne({ email }) as any;
    if (customer) {
      const isMatch = await customer.comparePassword(password);
      if (isMatch) {
        user = customer;
        userType = "customer";
        profile = customer;
        userId = customer._id;
        console.log("Customer login successful from admin DB:", customer.email);
      } else {
        console.log("Customer password mismatch from admin DB");
      }
    }
  }

  if (user) {
    // Format name based on user type (Admin has name, others have firstName/lastName)
    const name = userType === 'admin' 
      ? user.name 
      : `${user.firstName} ${user.lastName}`;
      
    res.json({
      _id: userId,
      name: name,
      email: user.email,
      userType: userType,
      profile: profile,
      token: generateToken(userId),
    });
  } else {
    console.log("Authentication failed: Invalid email or password");
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, name, email, password, userType, ...profileData } = req.body;

  // Check if user exists in any collection
  let userExists = false;
  const adminExists = await Admin.findOne({ email }) as any;
  const employeeExists = await Employee.findOne({ email }) as any;
  const customerExists = await Customer.findOne({ email }) as any;
  
  if (adminExists || employeeExists || customerExists) {
    userExists = true;
  }

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  let user = null;
  let profile = null;
  let userId = '';

  // Create user directly in the appropriate collection
  if (userType === 'admin') {
    const adminData = {
      name: name || 'Admin User',
      email,
      password,
      role: profileData.role || 'admin',
      phone: profileData.phone || '',
      ...profileData
    };
    
    const newAdmin = await Admin.create(adminData) as any;
    user = newAdmin;
    profile = newAdmin;
    userId = newAdmin._id;
  } 
  else if (userType === 'employee') {
    const employeeData = {
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      password,
      phone: profileData.phone || '',
      position: profileData.position || 'Staff',
      department: profileData.department || 'other',
      employeeId: profileData.employeeId || Date.now().toString(),
      hireDate: new Date(),
      salary: profileData.salary || 0,
      status: 'active',
      ...profileData
    };
    
    const newEmployee = await Employee.create(employeeData) as any;
    user = newEmployee;
    profile = newEmployee;
    userId = newEmployee._id;
  } 
  else if (userType === 'customer') {
    const customerData = {
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      password,
      phone: profileData.phone || '',
      customerType: profileData.customerType || 'individual',
      loyaltyPoints: 0,
      membershipLevel: 'bronze',
      registrationDate: new Date(),
      totalSpent: 0,
      status: 'active',
      ...profileData
    };
    
    const newCustomer = await Customer.create(customerData) as any;
    user = newCustomer;
    profile = newCustomer;
    userId = newCustomer._id;
  }

  if (user) {
    // Format name based on user type
    const userName = userType === 'admin' 
      ? user.name 
      : `${user.firstName} ${user.lastName}`;
      
    res.status(201).json({
      _id: userId,
      name: userName,
      email: user.email,
      userType: userType,
      profile: profile,
      token: generateToken(userId),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  // Extract user type and ID from the token via the protect middleware
  const userType = req.user.userType;
  const userId = req.user._id;
  
  let user: any = null;
  
  // Get user from the appropriate collection
  if (userType === 'admin') {
    user = await Admin.findById(userId) as any;
  } 
  else if (userType === 'employee') {
    user = await Employee.findById(userId) as any;
  } 
  else if (userType === 'customer') {
    user = await Customer.findById(userId) as any;
  }

  if (user) {
    // Format name based on user type
    const name = userType === 'admin' 
      ? user.name 
      : `${user.firstName} ${user.lastName}`;
    
    res.json({
      _id: userId,
      name: name,
      email: user.email,
      userType: userType,
      profile: user,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  // Extract user type and ID from the token via the protect middleware
  const userType = req.user.userType;
  const userId = req.user._id;
  
  let user: any = null;
  let updatedUser: any = null;
  
  // Remove sensitive fields from update data
  const { 
    password, 
    firstName, 
    lastName, 
    name, 
    email, 
    ...profileData 
  } = req.body;
  
  // Update the appropriate collection
  if (userType === 'admin') {
    user = await Admin.findById(userId) as any;
    
    if (user) {
      // Update admin data
      user.name = name || user.name;
      user.email = email || user.email;
      if (password) user.password = password;
      
      // Update other fields
      Object.keys(profileData).forEach(key => {
        user[key] = profileData[key];
      });
      
      updatedUser = await user.save();
    }
  } 
  else if (userType === 'employee') {
    user = await Employee.findById(userId) as any;
    
    if (user) {
      // Update employee data
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.email = email || user.email;
      if (password) user.password = password;
      
      // Update other fields
      Object.keys(profileData).forEach(key => {
        user[key] = profileData[key];
      });
      
      updatedUser = await user.save();
    }
  } 
  else if (userType === 'customer') {
    user = await Customer.findById(userId) as any;
    
    if (user) {
      // Update customer data
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.email = email || user.email;
      if (password) user.password = password;
      
      // Update other fields
      Object.keys(profileData).forEach(key => {
        user[key] = profileData[key];
      });
      
      updatedUser = await user.save();
    }
  }

  if (updatedUser) {
    // Format name based on user type
    const formattedName = userType === 'admin' 
      ? updatedUser.name 
      : `${updatedUser.firstName} ${updatedUser.lastName}`;
    
    res.json({
      _id: userId,
      name: formattedName,
      email: updatedUser.email,
      userType: userType,
      profile: updatedUser,
      token: generateToken(userId),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  // Get users from all collections
  const admins = await Admin.find({}).select('-password') as any[];
  const employees = await Employee.find({}).select('-password') as any[];
  const customers = await Customer.find({}).select('-password') as any[];
  
  // Format data for consistent response
  const formattedAdmins = admins.map(admin => ({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    userType: 'admin',
    role: admin.role,
    createdAt: admin.createdAt
  }));
  
  const formattedEmployees = employees.map(emp => ({
    _id: emp._id,
    name: `${emp.firstName} ${emp.lastName}`,
    email: emp.email,
    userType: 'employee',
    role: emp.position,
    department: emp.department,
    createdAt: emp.createdAt
  }));
  
  const formattedCustomers = customers.map(cust => ({
    _id: cust._id,
    name: `${cust.firstName} ${cust.lastName}`,
    email: cust.email,
    userType: 'customer',
    membershipLevel: cust.membershipLevel,
    totalSpent: cust.totalSpent,
    createdAt: cust.createdAt
  }));
  
  // Combine all users
  const allUsers = [
    ...formattedAdmins,
    ...formattedEmployees,
    ...formattedCustomers
  ];
  
  res.json(allUsers);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { userType } = req.body;
  
  let deleted = false;
  
  // Try to delete from the appropriate collection
  if (userType === 'admin') {
    const result = await Admin.findByIdAndDelete(id);
    deleted = !!result;
  } 
  else if (userType === 'employee') {
    const result = await Employee.findByIdAndDelete(id);
    deleted = !!result;
  } 
  else if (userType === 'customer') {
    const result = await Customer.findByIdAndDelete(id);
    deleted = !!result;
  }
  
  // If userType wasn't specified, try all collections
  if (!userType) {
    // Try admin collection
    let result = await Admin.findByIdAndDelete(id);
    if (result) {
      deleted = true;
    } else {
      // Try employee collection
      result = await Employee.findByIdAndDelete(id);
      if (result) {
        deleted = true;
      } else {
        // Try customer collection
        result = await Customer.findByIdAndDelete(id);
        if (result) {
          deleted = true;
        }
      }
    }
  }
  
  if (deleted) {
    res.json({ message: 'User deleted' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
