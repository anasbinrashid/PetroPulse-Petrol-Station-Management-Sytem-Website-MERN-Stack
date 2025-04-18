
import mongoose, { Document, Schema } from 'mongoose';

export interface IFuelSale extends Document {
  transactionId: mongoose.Types.ObjectId;
  fuelType: string;
  gallons: number;
  pricePerGallon: number;
  total: number;
  pumpNumber: number;
  employeeId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  date: Date;
  paymentMethod: string;
}

const fuelSaleSchema: Schema = new Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    fuelType: {
      type: String,
      required: true,
    },
    gallons: {
      type: Number,
      required: true,
    },
    pricePerGallon: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    pumpNumber: {
      type: Number,
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FuelSale = mongoose.model<IFuelSale>('FuelSale', fuelSaleSchema);

export default FuelSale;
