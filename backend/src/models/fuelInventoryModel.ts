
import mongoose, { Document, Schema } from 'mongoose';

export interface IFuelInventory extends Document {
  fuelType: string;
  currentLevel: number;
  capacity: number;
  pricePerGallon: number;
  supplier: string;
  lastDelivery: Date;
  lastUpdated: Date;
  minimumLevel: number;
  tankNumber: number;
}

const fuelInventorySchema: Schema = new Schema(
  {
    fuelType: {
      type: String,
      required: true,
    },
    currentLevel: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    pricePerGallon: {
      type: Number,
      required: true,
    },
    supplier: {
      type: String,
    },
    lastDelivery: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    minimumLevel: {
      type: Number,
      default: 100,
    },
    tankNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FuelInventory = mongoose.model<IFuelInventory>('FuelInventory', fuelInventorySchema);

export default FuelInventory;
