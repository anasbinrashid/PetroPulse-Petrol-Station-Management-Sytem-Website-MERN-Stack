import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Transaction from '../models/transactionModel';
import FuelSale from '../models/fuelSaleModel';
import Customer from '../models/admin/CustomerModel';
import { initCustomerModel } from '../models/customerDB/CustomerModel';
import mongoose from 'mongoose';

// @desc    Get all sales transactions
// @route   GET /api/sales
// @access  Private/Admin
export const getSales = asyncHandler(async (req: Request, res: Response) => {
  const transactions = await Transaction.find({}).sort({ date: -1 });
  res.json(transactions);
});

// @desc    Get a single transaction
// @route   GET /api/sales/:id
// @access  Private
export const getTransactionById = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findById(req.params.id);
  
  if (transaction) {
    res.json(transaction);
  } else {
    res.status(404);
    throw new Error('Transaction not found');
  }
});

// @desc    Create a new transaction
// @route   POST /api/sales
// @access  Private
export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const {
    transactionType,
    customerId,
    employeeId,
    items,
    subtotal,
    tax,
    total,
    paymentMethod,
    paymentStatus,
    loyaltyPointsEarned,
    loyaltyPointsRedeemed,
    notes
  } = req.body;
  
  // Create transaction
  const transaction = await Transaction.create({
    transactionType,
    customerId,
    employeeId,
    date: new Date(),
    items,
    subtotal,
    tax,
    total,
    paymentMethod,
    paymentStatus,
    loyaltyPointsEarned,
    loyaltyPointsRedeemed,
    notes
  });
  
  // If it's a fuel sale, create a fuel sale record
  if (transactionType === 'fuel' && items.length > 0) {
    const fuelItem = items[0]; // Assume first item is the fuel
    
    await FuelSale.create({
      transactionId: transaction._id,
      fuelType: fuelItem.itemType === 'fuel' ? 'Regular Unleaded' : 'Unknown', // This should come from your fuel inventory
      gallons: fuelItem.quantity,
      pricePerGallon: fuelItem.unitPrice,
      total: fuelItem.total,
      pumpNumber: req.body.pumpNumber || 1,
      employeeId,
      customerId,
      date: new Date(),
      paymentMethod
    });
  }
  
  // If a customer is associated, update their loyalty points
  if (customerId && (loyaltyPointsEarned || loyaltyPointsRedeemed)) {
    // Try to find and update customer in customer-specific database first
    let customerUpdated = false;
    try {
      // Initialize customer model with petropulse-customers DB connection
      const CustomerModel = await initCustomerModel();
      
      // Find customer by ID in customer-specific database
      const customerFromCustomerDB = await CustomerModel.findById(customerId);
      
      if (customerFromCustomerDB) {
        console.log(`[DEBUG][SalesController] Updating loyalty points for customer in customer-specific database: ${customerId}`);
        customerFromCustomerDB.loyaltyPoints = (customerFromCustomerDB.loyaltyPoints || 0) + 
          (loyaltyPointsEarned || 0) - (loyaltyPointsRedeemed || 0);
        await customerFromCustomerDB.save();
        customerUpdated = true;
      }
    } catch (error) {
      console.error(`[DEBUG][SalesController] Error updating customer in customer-specific database: ${error}`);
      console.log(`[DEBUG][SalesController] Falling back to admin database for customer update`);
    }
    
    // If customer was not updated in customer-specific DB, try the admin database
    if (!customerUpdated) {
      const customer = await Customer.findById(customerId);
      
      if (customer) {
        console.log(`[DEBUG][SalesController] Updating loyalty points for customer in admin database: ${customerId}`);
        customer.loyaltyPoints = (customer.loyaltyPoints || 0) + 
          (loyaltyPointsEarned || 0) - (loyaltyPointsRedeemed || 0);
        await customer.save();
      }
    }
  }
  
  res.status(201).json(transaction);
});

// @desc    Get fuel purchases by customer
// @route   GET /api/sales/fuel-purchases/:customerId
// @access  Private
export const getFuelPurchasesByCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.params.customerId;
  
  // Try to find customer in customer-specific database first
  let customer = null;
  try {
    // Initialize customer model with petropulse-customers DB connection
    const CustomerModel = await initCustomerModel();
    
    // Find customer by ID in customer-specific database
    customer = await CustomerModel.findById(customerId);
    
    if (customer) {
      console.log(`[DEBUG][SalesController] Customer found in customer-specific database: ${customerId}`);
    } else {
      console.log(`[DEBUG][SalesController] Customer not found in customer-specific database, checking admin DB as fallback: ${customerId}`);
      // Fallback to admin database
      customer = await Customer.findById(customerId);
    }
  } catch (error) {
    console.error(`[DEBUG][SalesController] Error checking customer-specific database: ${error}`);
    console.log(`[DEBUG][SalesController] Falling back to admin database for customer lookup`);
    // Fallback to admin database
    customer = await Customer.findById(customerId);
  }
  
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  
  // Get all fuel sales for the customer
  const fuelSales = await FuelSale.find({ customerId }).sort({ date: -1 });
  
  // Generate monthly data for charts
  const monthlyData: any[] = [];
  const monthMap: { [key: string]: any } = {};
  
  fuelSales.forEach(sale => {
    const date = new Date(sale.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = {
        month: monthName,
        regular: 0,
        premium: 0,
        diesel: 0
      };
    }
    
    // Add gallons to the appropriate fuel type
    if (sale.fuelType.toLowerCase().includes('regular')) {
      monthMap[monthKey].regular += sale.gallons;
    } else if (sale.fuelType.toLowerCase().includes('premium')) {
      monthMap[monthKey].premium += sale.gallons;
    } else if (sale.fuelType.toLowerCase().includes('diesel')) {
      monthMap[monthKey].diesel += sale.gallons;
    }
  });
  
  // Convert the month map to an array and sort by date
  Object.keys(monthMap).forEach(key => {
    monthlyData.push(monthMap[key]);
  });
  
  // Calculate payment method breakdown
  const paymentMethods: { [key: string]: number } = {};
  fuelSales.forEach(sale => {
    const method = sale.paymentMethod;
    paymentMethods[method] = (paymentMethods[method] || 0) + 1;
  });
  
  // Convert payment methods to array for pie chart
  const paymentMethodsArray = Object.keys(paymentMethods).map(method => ({
    name: method,
    value: (paymentMethods[method] / fuelSales.length) * 100
  }));
  
  // Calculate totals
  const totalSpent = fuelSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalGallons = fuelSales.reduce((sum, sale) => sum + sale.gallons, 0);
  
  res.json({
    fuelSales,
    monthlyData,
    paymentMethods: paymentMethodsArray,
    totalSpent,
    totalGallons
  });
});

// @desc    Get sales report
// @route   GET /api/sales/report
// @access  Private/Admin
export const getSalesReport = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  
  let dateFilter = {};
  
  if (startDate && endDate) {
    dateFilter = {
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    };
  }
  
  // Get all transactions in the date range
  const transactions = await Transaction.find(dateFilter).sort({ date: -1 });
  
  // Get all fuel sales in the date range
  const fuelSales = await FuelSale.find(dateFilter).sort({ date: -1 });
  
  // Calculate totals
  const totalSales = transactions.reduce((sum, tx) => sum + tx.total, 0);
  const totalFuelSales = fuelSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalGallons = fuelSales.reduce((sum, sale) => sum + sale.gallons, 0);
  
  // Group transactions by type
  const salesByType = transactions.reduce((acc: { [key: string]: number }, tx) => {
    acc[tx.transactionType] = (acc[tx.transactionType] || 0) + tx.total;
    return acc;
  }, {});
  
  // Group fuel sales by fuel type
  const salesByFuelType = fuelSales.reduce((acc: { [key: string]: any }, sale) => {
    if (!acc[sale.fuelType]) {
      acc[sale.fuelType] = {
        gallons: 0,
        revenue: 0
      };
    }
    acc[sale.fuelType].gallons += sale.gallons;
    acc[sale.fuelType].revenue += sale.total;
    return acc;
  }, {});
  
  // Group transactions by day for time series data
  const salesByDay: { [key: string]: number } = {};
  transactions.forEach(tx => {
    const dateStr = new Date(tx.date).toISOString().split('T')[0];
    salesByDay[dateStr] = (salesByDay[dateStr] || 0) + tx.total;
  });
  
  // Convert to array for charts
  const timeSeriesData = Object.keys(salesByDay).map(date => ({
    date,
    amount: salesByDay[date]
  }));
  
  res.json({
    totalSales,
    totalFuelSales,
    totalGallons,
    salesByType,
    salesByFuelType,
    timeSeriesData,
    transactionCount: transactions.length
  });
});
