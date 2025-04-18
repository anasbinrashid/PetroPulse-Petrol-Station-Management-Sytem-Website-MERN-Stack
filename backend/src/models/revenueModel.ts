
import mongoose, { Document, Schema } from 'mongoose';

export interface IRevenue extends Document {
  date: Date;
  source: 'fuel_sales' | 'store_sales' | 'services';
  amount: number;
  category: string;
  notes: string;
}

const revenueSchema: Schema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    source: {
      type: String,
      required: true,
      enum: ['fuel_sales', 'store_sales', 'services'],
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Revenue = mongoose.model<IRevenue>('Revenue', revenueSchema);

export default Revenue;
