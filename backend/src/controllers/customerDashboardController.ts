import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { initCustomerModel, ICustomer } from '../models/customerDB/CustomerModel';
import { initFuelPurchaseModel } from '../models/customerDB/FuelPurchaseModel';
import { initLoyaltyTransactionModel } from '../models/customerDB/LoyaltyModel';

// Helper for typed async handler to improve TypeScript support
const typedAsyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => {
  return asyncHandler(async (req: Request, res: Response) => {
    return await fn(req, res);
  });
};

/**
 * @desc    Get customer profile data with enhanced details
 * @route   GET /api/customer/profile
 * @access  Private/Customer
 */
export const getCustomerProfile = typedAsyncHandler(async (req: Request, res: Response) => {
  try {
    // Get customer ID from authenticated user
    const customerId = req.user?._id;
    
    if (!customerId) {
      return res.status(401).json({ message: 'Not authorized, no customer ID found' });
    }
    
    // Initialize customer model
    const CustomerModel = await initCustomerModel();
    
    // Find customer by ID
    const customer = await CustomerModel.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Return customer profile
    res.json({
      _id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      loyaltyPoints: customer.loyaltyPoints,
      vehicle: customer.vehicle,
      address: customer.address,
      lastVisit: customer.lastVisit,
      memberSince: customer.memberSince,
      customerType: customer.customerType,
      membershipLevel: customer.membershipLevel,
      totalSpent: customer.totalSpent,
    });
  } catch (error: any) {
    console.error('Error getting customer profile:', error.message);
    res.status(500).json({ message: 'Error retrieving customer profile' });
  }
});

/**
 * @desc    Update customer profile
 * @route   PUT /api/customer/profile
 * @access  Private/Customer
 */
export const updateCustomerProfile = typedAsyncHandler(async (req: Request, res: Response) => {
  try {
    // Get customer ID from authenticated user
    const customerId = req.user?._id;
    
    if (!customerId) {
      return res.status(401).json({ message: 'Not authorized, no customer ID found' });
    }
    
    // Initialize customer model
    const CustomerModel = await initCustomerModel();
    
    // Find customer by ID
    const customer = await CustomerModel.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Update allowed fields only
    const updatableFields = ['firstName', 'lastName', 'phone', 'vehicle', 'address'] as const;
    type UpdatableField = typeof updatableFields[number];
    
    // Type-safe update of fields
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        (customer as any)[field] = req.body[field];
      }
    }
    
    // Save updated customer
    const updatedCustomer = await customer.save();
    
    // Return updated profile
    res.json({
      _id: updatedCustomer._id,
      firstName: updatedCustomer.firstName,
      lastName: updatedCustomer.lastName,
      email: updatedCustomer.email,
      phone: updatedCustomer.phone,
      vehicle: updatedCustomer.vehicle,
      address: updatedCustomer.address,
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating customer profile:', error.message);
    res.status(500).json({ message: 'Error updating customer profile' });
  }
});

/**
 * @desc    Get customer fuel purchase history
 * @route   GET /api/customer/fuel-purchases
 * @access  Private/Customer
 */
export const getFuelPurchases = typedAsyncHandler(async (req: Request, res: Response) => {
  try {
    // Get customer ID from authenticated user
    const customerId = req.user?._id;
    
    if (!customerId) {
      return res.status(401).json({ message: 'Not authorized, no customer ID found' });
    }
    
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Initialize models
    const FuelPurchaseModel = await initFuelPurchaseModel();
    
    // Get total count for pagination
    const total = await FuelPurchaseModel.countDocuments({ customerId });
    
    // Find purchases for customer with pagination
    const purchases = await FuelPurchaseModel.find({ customerId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate total gallons and amount
    const totalStats = await FuelPurchaseModel.aggregate([
      { $match: { customerId: customerId } },
      { $group: {
          _id: null,
          totalGallons: { $sum: '$gallons' },
          totalAmount: { $sum: '$totalAmount' },
          totalPurchases: { $sum: 1 }
        }
      }
    ]);
    
    const stats = totalStats.length > 0 ? totalStats[0] : { totalGallons: 0, totalAmount: 0, totalPurchases: 0 };
    
    // Return purchases with pagination info
    res.json({
      purchases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalGallons: parseFloat(stats.totalGallons.toFixed(2)),
        totalAmount: parseFloat(stats.totalAmount.toFixed(2)),
        totalPurchases: stats.totalPurchases,
        averageAmount: stats.totalPurchases > 0 ? parseFloat((stats.totalAmount / stats.totalPurchases).toFixed(2)) : 0
      }
    });
  } catch (error: any) {
    console.error('Error getting fuel purchases:', error.message);
    res.status(500).json({ message: 'Error retrieving fuel purchase history' });
  }
});

/**
 * @desc    Get customer loyalty transaction history
 * @route   GET /api/customer/loyalty
 * @access  Private/Customer
 */
export const getLoyaltyTransactions = typedAsyncHandler(async (req: Request, res: Response) => {
  try {
    // Get customer ID from authenticated user
    const customerId = req.user?._id;
    
    if (!customerId) {
      return res.status(401).json({ message: 'Not authorized, no customer ID found' });
    }
    
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Initialize models
    const LoyaltyTransactionModel = await initLoyaltyTransactionModel();
    const CustomerModel = await initCustomerModel();
    
    // Get customer for current points balance
    const customer = await CustomerModel.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Get total count for pagination
    const total = await LoyaltyTransactionModel.countDocuments({ customerId });
    
    // Find transactions for customer with pagination
    const transactions = await LoyaltyTransactionModel.find({ customerId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate loyalty statistics
    const stats = await LoyaltyTransactionModel.aggregate([
      { $match: { customerId: customerId } },
      { $group: {
          _id: "$type",
          totalPoints: { $sum: "$points" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format stats into a more usable structure
    const statsObj = {
      earned: 0,
      redeemed: 0,
      expired: 0,
      adjusted: 0
    };
    
    stats.forEach(stat => {
      if (stat._id === 'earn') {
        statsObj.earned = stat.totalPoints;
      } else if (stat._id === 'redeem') {
        statsObj.redeemed = Math.abs(stat.totalPoints);
      } else if (stat._id === 'expire') {
        statsObj.expired = Math.abs(stat.totalPoints);
      } else if (stat._id === 'adjust') {
        statsObj.adjusted = stat.totalPoints;
      }
    });
    
    // Return transactions with pagination info and stats
    res.json({
      currentBalance: customer.loyaltyPoints,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: statsObj
    });
  } catch (error: any) {
    console.error('Error getting loyalty transactions:', error.message);
    res.status(500).json({ message: 'Error retrieving loyalty transaction history' });
  }
});

/**
 * @desc    Get customer dashboard summary
 * @route   GET /api/customer/dashboard
 * @access  Private/Customer
 */
export const getDashboardSummary = typedAsyncHandler(async (req: Request, res: Response) => {
  try {
    // Get customer ID from authenticated user
    const customerId = req.user?._id;
    
    if (!customerId) {
      return res.status(401).json({ message: 'Not authorized, no customer ID found' });
    }
    
    // Initialize models
    const CustomerModel = await initCustomerModel();
    const FuelPurchaseModel = await initFuelPurchaseModel();
    const LoyaltyTransactionModel = await initLoyaltyTransactionModel();
    
    // Get customer details
    const customer = await CustomerModel.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Get recent fuel purchases
    const recentPurchases = await FuelPurchaseModel.find({ customerId })
      .sort({ date: -1 })
      .limit(5);
    
    // Get purchase statistics for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentStats = await FuelPurchaseModel.aggregate([
      { 
        $match: { 
          customerId: customerId,
          date: { $gte: thirtyDaysAgo }
        } 
      },
      { 
        $group: {
          _id: null,
          purchaseCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          totalGallons: { $sum: '$gallons' }
        }
      }
    ]);
    
    // Get all-time purchase stats
    const allTimeStats = await FuelPurchaseModel.aggregate([
      { 
        $match: { 
          customerId: customerId
        } 
      },
      { 
        $group: {
          _id: null,
          purchaseCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          totalGallons: { $sum: '$gallons' }
        }
      }
    ]);
    
    // Get monthly purchase data (for charts)
    const currentYear = new Date().getFullYear();
    const monthlyData = await FuelPurchaseModel.aggregate([
      {
        $match: {
          customerId: customerId,
          date: {
            $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
            $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$date" },
          regular: {
            $sum: {
              $cond: [
                { $eq: ["$fuelType", "regular"] },
                "$gallons",
                0
              ]
            }
          },
          premium: {
            $sum: {
              $cond: [
                { $eq: ["$fuelType", "premium"] },
                "$gallons",
                0
              ]
            }
          },
          diesel: {
            $sum: {
              $cond: [
                { $eq: ["$fuelType", "diesel"] },
                "$gallons",
                0
              ]
            }
          },
          totalAmount: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format monthly data
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const formattedMonthlyData = monthlyData.map(month => ({
      month: months[month._id - 1],
      regular: parseFloat(month.regular.toFixed(2)),
      premium: parseFloat(month.premium.toFixed(2)),
      diesel: parseFloat(month.diesel.toFixed(2)),
      totalAmount: parseFloat(month.totalAmount.toFixed(2))
    }));
    
    // Get payment method breakdown
    const paymentMethods = await FuelPurchaseModel.aggregate([
      {
        $match: {
          customerId: customerId
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          value: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: "$_id",
          value: { $round: ["$value", 2] },
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Get loyalty point activity
    const recentLoyalty = await LoyaltyTransactionModel.find({ customerId })
      .sort({ date: -1 })
      .limit(5);
    
    // Calculate loyalty points expiring soon (demo purposes)
    const expiringPoints = Math.floor(Math.random() * 100); // Simulated value
    
    // Return dashboard summary
    res.json({
      customerInfo: {
        name: `${customer.firstName} ${customer.lastName}`,
        memberSince: customer.memberSince,
        status: customer.status,
        membershipLevel: customer.membershipLevel,
        loyaltyPoints: customer.loyaltyPoints,
        expiringPoints
      },
      recentActivity: {
        purchases: recentPurchases,
        loyalty: recentLoyalty
      },
      statistics: {
        last30Days: recentStats.length > 0 ? {
          purchaseCount: recentStats[0].purchaseCount,
          totalSpent: parseFloat(recentStats[0].totalSpent.toFixed(2)),
          totalGallons: parseFloat(recentStats[0].totalGallons.toFixed(2)),
          averageTransaction: parseFloat((recentStats[0].totalSpent / recentStats[0].purchaseCount).toFixed(2))
        } : {
          purchaseCount: 0,
          totalSpent: 0,
          totalGallons: 0,
          averageTransaction: 0
        },
        allTime: {
          totalVisits: allTimeStats.length > 0 ? allTimeStats[0].purchaseCount : 0,
          totalSpent: allTimeStats.length > 0 ? parseFloat(allTimeStats[0].totalSpent.toFixed(2)) : 0,
          totalGallons: allTimeStats.length > 0 ? parseFloat(allTimeStats[0].totalGallons.toFixed(2)) : 0,
          membershipProgress: customer.membershipLevel === 'platinum' ? 100 :
                              customer.membershipLevel === 'gold' ? 75 :
                              customer.membershipLevel === 'silver' ? 50 : 25
        }
      },
      // Include data for charts
      monthlyData: formattedMonthlyData,
      paymentMethods: paymentMethods
    });
  } catch (error: any) {
    console.error('Error getting dashboard summary:', error.message);
    res.status(500).json({ message: 'Error retrieving dashboard summary' });
  }
});

/**
 * @desc    Update customer password
 * @route   PUT /api/customer/password
 * @access  Private/Customer
 */
export const updateCustomerPassword = typedAsyncHandler(async (req: Request, res: Response) => {
  try {
    // Get customer ID from authenticated user
    const customerId = req.user?._id;
    
    if (!customerId) {
      return res.status(401).json({ message: 'Not authorized, no customer ID found' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    
    // Initialize customer model
    const CustomerModel = await initCustomerModel();
    
    // Find customer by ID and include password field
    const customer = await CustomerModel.findById(customerId).select('+password');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Verify current password using plain text comparison
    const isMatch = await customer.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password with plain text
    customer.password = newPassword;
    await customer.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Error updating customer password:', error.message);
    res.status(500).json({ message: 'Error updating password' });
  }
}); 