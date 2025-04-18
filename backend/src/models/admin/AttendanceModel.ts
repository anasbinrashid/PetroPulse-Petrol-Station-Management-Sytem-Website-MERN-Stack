import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date;
  clockInTime: Date;
  clockOutTime?: Date;
  totalHours?: number;
  status: string;
  notes?: string;
  approvedBy?: mongoose.Types.ObjectId;
  location?: {
    name: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      index: true,
    },
    clockInTime: {
      type: Date,
      required: [true, 'Clock in time is required'],
    },
    clockOutTime: {
      type: Date,
    },
    totalHours: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['present', 'absent', 'late', 'half_day', 'holiday', 'weekend', 'leave'],
      default: 'present',
    },
    notes: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    location: {
      name: {
        type: String,
        trim: true,
        default: 'Main Station',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total hours when clocking out
AttendanceSchema.pre('save', function (next) {
  if (this.isModified('clockOutTime') && this.clockOutTime && this.clockInTime) {
    const clockOut = new Date(this.clockOutTime);
    const clockIn = new Date(this.clockInTime);
    
    // Calculate the difference in milliseconds
    const diffMs = clockOut.getTime() - clockIn.getTime();
    
    // Convert to hours (rounded to 2 decimal places)
    this.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  }
  next();
});

// Compound index for employee and date
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Prevent model compilation error by checking if it exists first
export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema); 