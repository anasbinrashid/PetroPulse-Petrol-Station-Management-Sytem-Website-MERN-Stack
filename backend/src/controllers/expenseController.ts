import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import Expense from '../models/admin/ExpenseModel';

/**
 * @desc    Get all expenses
 * @route   GET /api/expenses
 * @access  Private/Admin
 */
export const getAllExpenses = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching all expenses...');
    
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
    
    // Add vendor filter if provided
    if (req.query.vendor) {
      filter.vendor = { $regex: req.query.vendor, $options: 'i' };
      console.log(`Filtering by vendor: ${req.query.vendor}`);
    }
    
    // Get expenses with sorting
    const expenses = await Expense.find(filter)
      .sort({ date: -1 });
    
    console.log(`Found ${expenses.length} expenses`);
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Error fetching expenses', error: (error as Error).message });
  }
});

/**
 * @desc    Get expense by ID
 * @route   GET /api/expenses/:id
 * @access  Private/Admin
 */
export const getExpenseById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Fetching expense with ID: ${req.params.id}`);
    
    const expense = await Expense.findById(req.params.id);
    
    if (expense) {
      console.log(`Found expense: ${expense.description || expense.category} - ${expense.amount}`);
      res.json(expense);
    } else {
      console.log('Expense not found');
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Error fetching expense', error: (error as Error).message });
  }
});

/**
 * @desc    Create new expense
 * @route   POST /api/expenses
 * @access  Private/Admin
 */
export const createExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Creating new expense:', req.body);
    
    const {
      date,
      vendor,
      amount,
      category,
      description,
      attachments,
      paymentMethod,
      invoiceNumber,
      receiptNumber,
      isReconciled,
      isPaid,
      dueDate,
      tags
    } = req.body;
    
    // Set creator
    const adminId = req.user?._id;
    
    if (!vendor || !amount || !category || !paymentMethod) {
      console.log('Missing required fields');
      res.status(400).json({ message: 'Please provide vendor, amount, category, and payment method' });
      return;
    }
    
    const expense = await Expense.create({
      date: date ? new Date(date) : new Date(),
      vendor,
      amount,
      category,
      description,
      attachments,
      paymentMethod,
      recordedBy: adminId,
      invoiceNumber,
      receiptNumber,
      isReconciled: isReconciled || false,
      isPaid: isPaid !== undefined ? isPaid : true,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags
    });
    
    console.log(`Expense created with ID: ${expense._id}`);
    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Error creating expense', error: (error as Error).message });
  }
});

/**
 * @desc    Update expense
 * @route   PUT /api/expenses/:id
 * @access  Private/Admin
 */
export const updateExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Updating expense with ID: ${req.params.id}`);
    
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      console.log('Expense not found');
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    
    // Update expense fields from request body
    const updatableFields = [
      'date', 'vendor', 'amount', 'category', 'description', 
      'attachments', 'paymentMethod', 'invoiceNumber', 'receiptNumber',
      'isReconciled', 'isPaid', 'dueDate', 'tags'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Handle date conversions
        if ((field === 'date' || field === 'dueDate') && req.body[field]) {
          expense[field] = new Date(req.body[field]);
        } else {
          expense[field] = req.body[field];
        }
      }
    });
    
    const updatedExpense = await expense.save();
    
    console.log(`Expense updated: ${updatedExpense.description || updatedExpense.category}`);
    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Error updating expense', error: (error as Error).message });
  }
});

/**
 * @desc    Delete expense
 * @route   DELETE /api/expenses/:id
 * @access  Private/Admin
 */
export const deleteExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Deleting expense with ID: ${req.params.id}`);
    
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      console.log('Expense not found');
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    
    await expense.deleteOne();
    console.log('Expense deleted');
    res.json({ message: 'Expense removed' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Error deleting expense', error: (error as Error).message });
  }
});

/**
 * @desc    Get expense summary by category
 * @route   GET /api/expenses/summary
 * @access  Private/Admin
 */
export const getExpenseSummary = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching expense summary...');
    
    // Parse query parameters for date range
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(new Date().setDate(new Date().getDate() - 30));
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();
    
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Aggregate expenses by category
    const summary = await Expense.aggregate([
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
    
    // Calculate total
    const total = summary.reduce((sum, item) => sum + item.totalAmount, 0);
    
    console.log(`Generated expense summary with ${summary.length} categories`);
    res.json({
      categories: summary,
      total,
      startDate,
      endDate
    });
  } catch (error) {
    console.error('Error generating expense summary:', error);
    res.status(500).json({ message: 'Error generating expense summary', error: (error as Error).message });
  }
}); 