import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  date: Date;
  vendor: string;
  amount: number;
  category: string;
  description?: string;
  attachments?: string[];
  paymentMethod: string;
  recordedBy: mongoose.Types.ObjectId;
  invoiceNumber?: string;
  receiptNumber?: string;
  isReconciled: boolean;
  isPaid: boolean;
  dueDate?: Date;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
      index: true,
    },
    vendor: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: ['fuel_purchase', 'inventory', 'utility', 'salary', 'maintenance', 'rent', 'marketing', 'taxes', 'insurance', 'other'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    attachments: [{
      type: String, // URLs to receipts, invoices, etc.
    }],
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'other'],
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    receiptNumber: {
      type: String,
      trim: true,
    },
    isReconciled: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    dueDate: {
      type: Date,
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1, date: -1 });
ExpenseSchema.index({ vendor: 1, date: -1 });
ExpenseSchema.index({ isPaid: 1, dueDate: 1 }, { sparse: true });

// Prevent model compilation error by checking if it exists first
export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema); 