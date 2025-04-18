import mongoose, { Document, Schema } from 'mongoose';

export interface IMaintenance extends Document {
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  dueDate?: Date;
  completedDate?: Date;
  estimatedCost?: number;
  actualCost?: number;
  attachments?: string[];
  notes?: string[];
  vendorInfo?: {
    name: string;
    contact: string;
    email?: string;
  };
  equipment?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Maintenance task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Maintenance task description is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['pending', 'in_progress', 'completed', 'cancelled', 'deferred'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['equipment', 'facility', 'vehicle', 'it_systems', 'safety', 'cleaning', 'calibration', 'inspection', 'other'],
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    completedDate: {
      type: Date,
    },
    estimatedCost: {
      type: Number,
      min: 0,
    },
    actualCost: {
      type: Number,
      min: 0,
    },
    attachments: [{
      type: String, // URLs to images, documents, etc.
    }],
    notes: [{
      type: String,
      trim: true,
    }],
    vendorInfo: {
      name: {
        type: String,
        trim: true,
      },
      contact: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    equipment: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
MaintenanceSchema.index({ status: 1, dueDate: 1 });
MaintenanceSchema.index({ category: 1, status: 1 });
MaintenanceSchema.index({ assignedTo: 1, status: 1 });

// Prevent model compilation error by checking if it exists first
export default mongoose.models.Maintenance || mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema); 