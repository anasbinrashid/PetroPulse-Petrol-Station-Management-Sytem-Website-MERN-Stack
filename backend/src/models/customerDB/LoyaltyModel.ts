import mongoose, { Document, Schema } from 'mongoose';
import connectCustomerDB from '../../config/customerDb';

export interface ILoyaltyTransaction extends Document {
  customerId: mongoose.Types.ObjectId;
  date: Date;
  type: 'earn' | 'redeem' | 'adjust' | 'expire';
  points: number;
  source: string;
  description: string;
  relatedPurchaseId?: mongoose.Types.ObjectId;
  staffId?: mongoose.Types.ObjectId;
  balance: number;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const loyaltyTransactionSchema: Schema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    type: {
      type: String,
      required: true,
      enum: ['earn', 'redeem', 'adjust', 'expire']
    },
    points: {
      type: Number,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    relatedPurchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FuelPurchase'
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    balance: {
      type: Number,
      required: true
    },
    expiryDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Create index for efficient querying
loyaltyTransactionSchema.index({ customerId: 1, date: -1 });

// Create and export the model
let LoyaltyTransactionModel: mongoose.Model<ILoyaltyTransaction> | null = null;

// This function initializes the model with the customer database connection
export const initLoyaltyTransactionModel = async (): Promise<mongoose.Model<ILoyaltyTransaction>> => {
  if (!LoyaltyTransactionModel) {
    const conn = await connectCustomerDB();
    LoyaltyTransactionModel = conn.model<ILoyaltyTransaction>('LoyaltyTransaction', loyaltyTransactionSchema);
  }
  return LoyaltyTransactionModel;
};

// Export a dummy function for default export - actual model should be initialized through initLoyaltyTransactionModel
export default function getLoyaltyTransactionModel() {
  if (!LoyaltyTransactionModel) {
    throw new Error('LoyaltyTransaction model not initialized. Please call initLoyaltyTransactionModel first.');
  }
  return LoyaltyTransactionModel;
} 