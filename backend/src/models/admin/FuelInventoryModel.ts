import mongoose, { Document, Schema } from 'mongoose';

export interface IFuelInventory extends Document {
  fuelType: string;
  currentLevel: number;
  capacity: number;
  pricePerGallon: number;
  costPerGallon: number;
  supplier: string;
  tankNumber: string;
  lastRefillDate?: Date;
  lastRefillAmount?: number;
  reorderLevel: number;
  status: string;
  location: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FuelInventorySchema: Schema = new Schema(
  {
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: ['regular', 'premium', 'diesel', 'e85', 'other'],
      index: true,
    },
    currentLevel: {
      type: Number,
      required: [true, 'Current level is required'],
      min: 0,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [0, 'Capacity cannot be negative'],
    },
    pricePerGallon: {
      type: Number,
      required: [true, 'Price per gallon is required'],
      min: [0, 'Price cannot be negative'],
    },
    costPerGallon: {
      type: Number,
      required: [true, 'Cost per gallon is required'],
      min: [0, 'Cost cannot be negative'],
    },
    supplier: {
      type: String,
      required: [true, 'Supplier is required'],
      trim: true,
    },
    tankNumber: {
      type: String,
      required: [true, 'Tank number is required'],
      trim: true,
      unique: true,
    },
    lastRefillDate: {
      type: Date,
    },
    lastRefillAmount: {
      type: Number,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: 0,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['available', 'low', 'critical', 'maintenance', 'offline'],
      default: 'available',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      default: 'Main Station',
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Set status based on current level and reorder level
FuelInventorySchema.pre('save', function (next) {
  if (this.isModified('currentLevel') || this.isModified('reorderLevel')) {
    if (this.currentLevel <= 0) {
      this.status = 'offline';
    } else if (this.currentLevel < this.reorderLevel * 0.5) {
      this.status = 'critical';
    } else if (this.currentLevel < this.reorderLevel) {
      this.status = 'low';
    } else {
      this.status = 'available';
    }
  }
  next();
});

// Indexes for faster queries
FuelInventorySchema.index({ fuelType: 1, location: 1 });
FuelInventorySchema.index({ status: 1 });
FuelInventorySchema.index({ tankNumber: 1 }, { unique: true });

// Prevent model compilation error by checking if it exists first
export default mongoose.models.FuelInventory || mongoose.model<IFuelInventory>('FuelInventory', FuelInventorySchema); 