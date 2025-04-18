import mongoose, { Document, Schema } from 'mongoose';
import connectCustomerDB from '../../config/customerDb';

export interface IFuelPurchase extends Document {
  customerId: mongoose.Types.ObjectId;
  date: Date;
  fuelType: string;
  gallons: number;
  pricePerGallon: number;
  totalAmount: number;
  paymentMethod: string;
  stationLocation: string;
  loyaltyPointsEarned: number;
  transactionId: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const fuelPurchaseSchema: Schema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    fuelType: {
      type: String,
      required: true,
      enum: ['regular', 'premium', 'diesel', 'e85']
    },
    gallons: {
      type: Number,
      required: true,
      min: 0
    },
    pricePerGallon: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cash', 'credit', 'debit', 'app', 'loyalty']
    },
    stationLocation: {
      type: String,
      required: true
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    receiptUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Create and export the model
let FuelPurchaseModel: mongoose.Model<IFuelPurchase> | null = null;

// This function initializes the model with the customer database connection
export const initFuelPurchaseModel = async (): Promise<mongoose.Model<IFuelPurchase>> => {
  if (!FuelPurchaseModel) {
    const conn = await connectCustomerDB();
    FuelPurchaseModel = conn.model<IFuelPurchase>('FuelPurchase', fuelPurchaseSchema);
  }
  return FuelPurchaseModel;
};

// Export a dummy function for default export - actual model should be initialized through initFuelPurchaseModel
export default function getFuelPurchaseModel() {
  if (!FuelPurchaseModel) {
    throw new Error('FuelPurchase model not initialized. Please call initFuelPurchaseModel first.');
  }
  return FuelPurchaseModel;
} 