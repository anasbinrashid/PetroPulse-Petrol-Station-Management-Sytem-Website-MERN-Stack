import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import Customer from '../models/admin/CustomerModel';

/**
 * @desc    Get all customers
 * @route   GET /api/admin/customers
 * @access  Private/Admin
 */
export const getAllCustomers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching all customers...');
    
    // Parse query parameters for filtering
    const filter: any = {};
    
    if (req.query.membershipLevel) {
      filter.membershipLevel = req.query.membershipLevel;
      console.log(`Filtering by membership level: ${req.query.membershipLevel}`);
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
      console.log(`Filtering by status: ${req.query.status}`);
    }
    
    if (req.query.customerType) {
      filter.customerType = req.query.customerType;
      console.log(`Filtering by customer type: ${req.query.customerType}`);
    }
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
      console.log(`Searching for: ${req.query.search}`);
    }
    
    // Get customers with sorting
    const customers = await Customer.find(filter)
      .select('-password')
      .sort({ lastName: 1, firstName: 1 });
    
    console.log(`Found ${customers.length} customers`);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers', error: (error as Error).message });
  }
});

/**
 * @desc    Get customer by ID
 * @route   GET /api/admin/customers/:id
 * @access  Private/Admin
 */
export const getCustomerById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Fetching customer with ID: ${req.params.id}`);
    
    const customer = await Customer.findById(req.params.id).select('-password');
    
    if (customer) {
      console.log(`Found customer: ${customer.firstName} ${customer.lastName}`);
      res.json(customer);
    } else {
      console.log('Customer not found');
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer', error: (error as Error).message });
  }
});

/**
 * @desc    Create new customer
 * @route   POST /api/admin/customers
 * @access  Private/Admin
 */
export const createCustomer = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Creating new customer:', req.body);
    
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      customerType,
      membershipLevel,
      totalSpent,
      address,
      paymentMethods,
      preferences,
      notes,
      status
    } = req.body;
    
    // Check for required fields
    if (!firstName || !lastName || !email || !password) {
      console.log('Missing required fields');
      res.status(400).json({ 
        message: 'Please provide all required fields: firstName, lastName, email, password' 
      });
      return;
    }
    
    // Check if customer with this email already exists
    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
      console.log('Customer with this email already exists');
      res.status(400).json({ message: 'Customer with this email already exists' });
      return;
    }
    
    // Create customer
    const customer = await Customer.create({
      firstName,
      lastName,
      email,
      password, // Store password directly
      phone,
      customerType: customerType || 'individual',
      loyaltyPoints: 0,
      membershipLevel: membershipLevel || 'bronze',
      registrationDate: new Date(),
      lastVisit: new Date(),
      totalSpent: totalSpent || 0,
      address,
      paymentMethods,
      preferences,
      notes,
      status: status || 'active'
    });
    
    if (customer) {
      console.log(`Customer created with ID: ${customer._id}`);
      res.status(201).json({
        _id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        customerType: customer.customerType,
        membershipLevel: customer.membershipLevel,
        registrationDate: customer.registrationDate,
        status: customer.status
      });
    } else {
      console.log('Invalid customer data');
      res.status(400).json({ message: 'Invalid customer data' });
    }
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Error creating customer', error: (error as Error).message });
  }
});

/**
 * @desc    Update customer
 * @route   PUT /api/admin/customers/:id
 * @access  Private/Admin
 */
export const updateCustomer = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Updating customer with ID: ${req.params.id}`);
    
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      console.log('Customer not found');
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    
    // Update customer fields from request body
    const updatableFields = [
      'firstName', 'lastName', 'email', 'password', 'phone', 'customerType',
      'membershipLevel', 'totalSpent', 'address', 'paymentMethods', 'preferences',
      'notes', 'status', 'loyaltyPoints', 'profileImage'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        customer[field] = req.body[field];
      }
    });
    
    // Update lastVisit if specified
    if (req.body.lastVisit) {
      customer.lastVisit = new Date(req.body.lastVisit);
    }
    
    const updatedCustomer = await customer.save();
    
    console.log(`Customer updated: ${updatedCustomer.firstName} ${updatedCustomer.lastName}`);
    res.json({
      _id: updatedCustomer._id,
      firstName: updatedCustomer.firstName,
      lastName: updatedCustomer.lastName,
      email: updatedCustomer.email,
      phone: updatedCustomer.phone,
      customerType: updatedCustomer.customerType,
      membershipLevel: updatedCustomer.membershipLevel,
      totalSpent: updatedCustomer.totalSpent,
      loyaltyPoints: updatedCustomer.loyaltyPoints,
      status: updatedCustomer.status,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Error updating customer', error: (error as Error).message });
  }
});

/**
 * @desc    Delete customer
 * @route   DELETE /api/admin/customers/:id
 * @access  Private/Admin
 */
export const deleteCustomer = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Deleting customer with ID: ${req.params.id}`);
    
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      console.log('Customer not found');
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    
    // Delete the customer record
    await customer.deleteOne();
    console.log('Customer deleted');
    res.json({ message: 'Customer removed successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer', error: (error as Error).message });
  }
});

/**
 * @desc    Update customer loyalty points
 * @route   PATCH /api/admin/customers/:id/loyalty
 * @access  Private/Admin
 */
export const updateLoyaltyPoints = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Updating loyalty points for customer ID: ${req.params.id}`);
    
    const { points, operation } = req.body;
    
    if (points === undefined || !operation) {
      console.log('Missing required fields');
      res.status(400).json({ message: 'Please provide points and operation (add, subtract, or set)' });
      return;
    }
    
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      console.log('Customer not found');
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    
    // Update loyalty points based on operation
    const pointsValue = Number(points);
    
    if (isNaN(pointsValue)) {
      console.log('Invalid points value');
      res.status(400).json({ message: 'Points must be a number' });
      return;
    }
    
    switch (operation) {
      case 'add':
        customer.loyaltyPoints += pointsValue;
        break;
      case 'subtract':
        customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - pointsValue);
        break;
      case 'set':
        customer.loyaltyPoints = Math.max(0, pointsValue);
        break;
      default:
        console.log('Invalid operation');
        res.status(400).json({ message: 'Operation must be add, subtract, or set' });
        return;
    }
    
    // Maybe update membership level based on points
    if (customer.loyaltyPoints >= 5000) {
      customer.membershipLevel = 'platinum';
    } else if (customer.loyaltyPoints >= 2000) {
      customer.membershipLevel = 'gold';
    } else if (customer.loyaltyPoints >= 1000) {
      customer.membershipLevel = 'silver';
    }
    
    await customer.save();
    
    console.log(`Updated loyalty points for ${customer.firstName} ${customer.lastName}: ${customer.loyaltyPoints}`);
    console.log(`Membership level: ${customer.membershipLevel}`);
    
    res.json({
      _id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      loyaltyPoints: customer.loyaltyPoints,
      membershipLevel: customer.membershipLevel,
      message: 'Loyalty points updated successfully'
    });
  } catch (error) {
    console.error('Error updating loyalty points:', error);
    res.status(500).json({ message: 'Error updating loyalty points', error: (error as Error).message });
  }
}); 