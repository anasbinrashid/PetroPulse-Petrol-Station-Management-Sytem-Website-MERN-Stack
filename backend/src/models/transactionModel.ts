
import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  transactionType: 'fuel' | 'product' | 'service';
  customerId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  items: Array<{
    itemType: 'fuel' | 'product';
    itemId: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  loyaltyPointsEarned: number;
  loyaltyPointsRedeemed: number;
  notes: string;
}

const transactionSchema: Schema = new Schema(
  {
    transactionType: {
      type: String,
      required: true,
      enum: ['fuel', 'product', 'service'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    items: [
      {
        itemType: {
          type: String,
          required: true,
          enum: ['fuel', 'product'],
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'items.itemType',
        },
        quantity: {
          type: Number,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'paid',
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
    },
    loyaltyPointsRedeemed: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
