import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import Revenue from '../models/admin/RevenueModel';

/**
 * @desc    Get all revenue entries
 * @route   GET /api/revenue
 * @access  Private/Admin
 */
export const getAllRevenue = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching all revenue entries...');
    
    // Parse query parameters for filtering
    const filter: any = {};
    
    // Add date range filter if provided
    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string)
      };
      console.log(`Filtering by date range: ${req.query.startDate} to ${req.query.endDate}`);
    }
    
    // Add source filter if provided
    if (req.query.source) {
      filter.source = req.query.source;
      console.log(`Filtering by source: ${req.query.source}`);
    }
    
    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
      console.log(`Filtering by category: ${req.query.category}`);
    }
    
    // Add payment method filter if provided
    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod;
      console.log(`Filtering by payment method: ${req.query.paymentMethod}`);
    }
    
    // Get revenue entries with sorting
    const revenues = await Revenue.find(filter)
      .sort({ date: -1 });
    
    console.log(`Found ${revenues.length} revenue entries`);
    res.json(revenues);
  } catch (error) {
    console.error('Error fetching revenue entries:', error);
    res.status(500).json({ message: 'Error fetching revenue entries', error: (error as Error).message });
  }
});

/**
 * @desc    Get revenue entry by ID
 * @route   GET /api/revenue/:id
 * @access  Private/Admin
 */
export const getRevenueById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Fetching revenue entry with ID: ${req.params.id}`);
    
    const revenue = await Revenue.findById(req.params.id);
    
    if (revenue) {
      console.log(`Found revenue entry: ${revenue.source} - ${revenue.amount}`);
      res.json(revenue);
    } else {
      console.log('Revenue entry not found');
      res.status(404).json({ message: 'Revenue entry not found' });
    }
  } catch (error) {
    console.error('Error fetching revenue entry:', error);
    res.status(500).json({ message: 'Error fetching revenue entry', error: (error as Error).message });
  }
});

/**
 * @desc    Create new revenue entry
 * @route   POST /api/revenue
 * @access  Private/Admin
 */
export const createRevenue = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Creating new revenue entry:', req.body);
    
    const {
      date,
      source,
      amount,
      category,
      description,
      attachments,
      paymentMethod,
      transactionId,
      isReconciled
    } = req.body;
    
    // Set creator
    const adminId = req.user?._id;
    
    if (!source || !amount || !category || !paymentMethod) {
      console.log('Missing required fields');
      res.status(400).json({ message: 'Please provide source, amount, category, and payment method' });
      return;
    }
    
    const revenue = await Revenue.create({
      date: date ? new Date(date) : new Date(),
      source,
      amount,
      category,
      description,
      attachments,
      paymentMethod,
      recordedBy: adminId,
      transactionId,
      isReconciled: isReconciled || false
    });
    
    console.log(`Revenue entry created with ID: ${revenue._id}`);
    res.status(201).json(revenue);
  } catch (error) {
    console.error('Error creating revenue entry:', error);
    res.status(500).json({ message: 'Error creating revenue entry', error: (error as Error).message });
  }
});

/**
 * @desc    Update revenue entry
 * @route   PUT /api/revenue/:id
 * @access  Private/Admin
 */
export const updateRevenue = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Updating revenue entry with ID: ${req.params.id}`);
    
    const revenue = await Revenue.findById(req.params.id);
    
    if (!revenue) {
      console.log('Revenue entry not found');
      res.status(404).json({ message: 'Revenue entry not found' });
      return;
    }
    
    // Update revenue fields from request body
    const updatableFields = [
      'date', 'source', 'amount', 'category', 'description', 
      'attachments', 'paymentMethod', 'transactionId', 'isReconciled'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Handle date conversion
        if (field === 'date' && req.body[field]) {
          revenue[field] = new Date(req.body[field]);
        } else {
          revenue[field] = req.body[field];
        }
      }
    });
    
    const updatedRevenue = await revenue.save();
    
    console.log(`Revenue entry updated: ${updatedRevenue.source}`);
    res.json(updatedRevenue);
  } catch (error) {
    console.error('Error updating revenue entry:', error);
    res.status(500).json({ message: 'Error updating revenue entry', error: (error as Error).message });
  }
});

/**
 * @desc    Delete revenue entry
 * @route   DELETE /api/revenue/:id
 * @access  Private/Admin
 */
export const deleteRevenue = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Deleting revenue entry with ID: ${req.params.id}`);
    
    const revenue = await Revenue.findById(req.params.id);
    
    if (!revenue) {
      console.log('Revenue entry not found');
      res.status(404).json({ message: 'Revenue entry not found' });
      return;
    }
    
    await revenue.deleteOne();
    console.log('Revenue entry deleted');
    res.json({ message: 'Revenue entry removed' });
  } catch (error) {
    console.error('Error deleting revenue entry:', error);
    res.status(500).json({ message: 'Error deleting revenue entry', error: (error as Error).message });
  }
});

/**
 * @desc    Get revenue summary by category and source
 * @route   GET /api/revenue/summary
 * @access  Private/Admin
 */
export const getRevenueSummary = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching revenue summary...');
    
    // Parse query parameters for date range
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(new Date().setDate(new Date().getDate() - 30));
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();
    
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Aggregate revenue by category
    const categorySummary = await Revenue.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);
    
    // Aggregate revenue by source
    const sourceSummary = await Revenue.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$source',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);
    
    // Calculate total
    const total = categorySummary.reduce((sum, item) => sum + item.totalAmount, 0);
    
    console.log(`Generated revenue summary with ${categorySummary.length} categories and ${sourceSummary.length} sources`);
    res.json({
      categories: categorySummary,
      sources: sourceSummary,
      total,
      startDate,
      endDate
    });
  } catch (error) {
    console.error('Error generating revenue summary:', error);
    res.status(500).json({ message: 'Error generating revenue summary', error: (error as Error).message });
  }
}); 