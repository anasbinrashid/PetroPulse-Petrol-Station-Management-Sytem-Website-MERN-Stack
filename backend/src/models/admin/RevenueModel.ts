import mongoose, { Document, Schema } from 'mongoose';

export interface IRevenue extends Document {
  date: Date;
  source: string;
  amount: number;
  category: string;
  description?: string;
  attachments?: string[];
  paymentMethod: string;
  recordedBy: mongoose.Types.ObjectId;
  transactionId?: string;
  isReconciled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RevenueSchema: Schema = new Schema(
  {
    date: {
      type: Date,
      required: [true, 'Revenue date is required'],
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      required: [true, 'Revenue source is required'],
      trim: true,
      enum: ['fuel', 'shop', 'services', 'loyalty', 'other'],
    },
    amount: {
      type: Number,
      required: [true, 'Revenue amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Revenue category is required'],
      enum: ['fuel_sales', 'merchandise', 'services', 'promotions', 'other'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    attachments: [{
      type: String, // URLs to receipts or other documents
    }],
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['cash', 'credit_card', 'debit_card', 'mobile', 'check', 'bank_transfer', 'other'],
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    transactionId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    isReconciled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
RevenueSchema.index({ date: -1 });
RevenueSchema.index({ source: 1, date: -1 });
RevenueSchema.index({ category: 1, date: -1 });

// Prevent model compilation error by checking if it exists first
export default mongoose.models.Revenue || mongoose.model<IRevenue>('Revenue', RevenueSchema); 