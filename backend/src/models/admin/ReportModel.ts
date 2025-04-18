import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  title: string;
  category: string;
  description: string;
  lastGenerated: Date;
  createdBy: mongoose.Types.ObjectId;
  data: any;
  insights?: string[];
  isPublished: boolean;
  scheduleFrequency?: string;
  nextGenerationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Report category is required'],
      enum: ['financial', 'inventory', 'personnel', 'marketing', 'operations'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
    },
    lastGenerated: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    insights: [{
      type: String,
    }],
    isPublished: {
      type: Boolean,
      default: true,
    },
    scheduleFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'none'],
      default: 'none',
    },
    nextGenerationDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ReportSchema.index({ category: 1, lastGenerated: -1 });
ReportSchema.index({ title: 'text', description: 'text' });

// Prevent model compilation error by checking if it exists first
export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema); 