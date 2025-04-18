
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Customer from '../models/customerModel';
import User from '../models/userModel';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private/Admin
export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const customers = await Customer.find({});
  res.json(customers);
});

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
export const getCustomerById = asyncHandler(async (req: Request, res: Response) => {
  const customer = await Customer.findById(req.params.id);
  
  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private/Admin
export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, address, status, vehicles, paymentMethods } = req.body;
  
  // Check if email already exists in users collection
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }
  
  // Create customer
  const customer = await Customer.create({
    name,
    email,
    phone,
    address,
    memberSince: new Date(),
    status: status || 'regular',
    loyaltyPoints: 0,
    vehicles,
    paymentMethods
  });
  
  if (customer) {
    res.status(201).json(customer);
  } else {
    res.status(400);
    throw new Error('Invalid customer data');
  }
});

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, address, status, loyaltyPoints, vehicles, paymentMethods } = req.body;
  
  const customer = await Customer.findById(req.params.id);
  
  if (customer) {
    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;
    customer.status = status || customer.status;
    
    if (loyaltyPoints !== undefined) {
      customer.loyaltyPoints = loyaltyPoints;
    }
    
    if (vehicles) {
      customer.vehicles = vehicles;
    }
    
    if (paymentMethods) {
      customer.paymentMethods = paymentMethods;
    }
    
    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await Customer.findById(req.params.id);
  
  if (customer) {
    // Also remove user associated with this customer
    const user = await User.findOne({ email: customer.email });
    if (user) {
      await user.deleteOne();
    }
    
    await customer.deleteOne();
    res.json({ message: 'Customer removed' });
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});
