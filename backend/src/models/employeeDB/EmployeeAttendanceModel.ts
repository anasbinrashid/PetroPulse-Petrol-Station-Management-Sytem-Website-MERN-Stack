import mongoose, { Document, Schema } from 'mongoose';
import employeeDbConnection from '../../config/employeeDb';

export interface IEmployeeAttendance extends Document {
  employeeId: string;
  date: Date;
  clockInTime: string;
  clockOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  totalHours?: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  notes?: string;
  leaveType?: 'sick' | 'vacation' | 'personal' | 'unpaid' | 'other';
  leaveReason?: string;
  isApproved: boolean;
  approvedBy?: string;
  // For employee-side attendance tracking
  selfReported: boolean;
  attachments?: string[];
  metrics?: {
    punctuality: number; // Score 1-5
    consistency: number; // Score 1-5
    consecutiveDays: number;
  };
  monthSummary?: {
    month: number;
    year: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leavesTaken: number;
    totalHours: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeAttendanceSchema: Schema = new Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    clockInTime: {
      type: String,
      validate: {
        validator: function(v: string) {
          // Validate time format (HH:MM)
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props: { value: string }) => `${props.value} is not a valid time format (HH:MM)!`
      }
    },
    clockOutTime: {
      type: String,
      validate: {
        validator: function(v: string) {
          // Validate time format (HH:MM)
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props: { value: string }) => `${props.value} is not a valid time format (HH:MM)!`
      }
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['present', 'absent', 'late', 'half_day', 'leave'],
      default: 'present',
    },
    totalHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    leaveType: {
      type: String,
      enum: ['sick', 'vacation', 'personal', 'unpaid', 'other'],
    },
    leaveReason: {
      type: String,
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    approvedBy: {
      type: String,
    },
    selfReported: {
      type: Boolean,
      default: false,
    },
    attachments: [{
      type: String, // URLs to attachments
    }],
    metrics: {
      punctuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      consistency: {
        type: Number,
        min: 1,
        max: 5,
      },
      consecutiveDays: {
        type: Number,
        default: 0,
      },
    },
    monthSummary: {
      month: {
        type: Number,
        min: 1,
        max: 12,
      },
      year: {
        type: Number,
      },
      presentDays: {
        type: Number,
        default: 0,
      },
      absentDays: {
        type: Number,
        default: 0,
      },
      lateDays: {
        type: Number,
        default: 0,
      },
      leavesTaken: {
        type: Number,
        default: 0,
      },
      totalHours: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for employee and date to ensure uniqueness
EmployeeAttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Add a pre-save hook to calculate total hours if both clock in and clock out are provided
EmployeeAttendanceSchema.pre('save', function(next) {
  const attendance = this as any;
  
  if (attendance.clockInTime && attendance.clockOutTime) {
    try {
      // Convert times to Date objects for calculation
      const dateStr = attendance.date.toISOString().split('T')[0];
      const clockIn = new Date(`${dateStr}T${attendance.clockInTime}:00`);
      const clockOut = new Date(`${dateStr}T${attendance.clockOutTime}:00`);
      
      // Calculate hours difference
      const diffMs = clockOut.getTime() - clockIn.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);
      
      // Round to 2 decimal places
      attendance.totalHours = Math.round(diffHrs * 100) / 100;
      
      // Update status if employee clocked in late (after 8:00 AM)
      const clockInHour = parseInt(attendance.clockInTime.split(':')[0]);
      const clockInMinute = parseInt(attendance.clockInTime.split(':')[1]);
      
      if (clockInHour > 8 || (clockInHour === 8 && clockInMinute > 0)) {
        attendance.status = 'late';
      }
    } catch (error) {
      console.error('Error calculating total hours:', error);
    }
  }
  
  next();
});

// Create model using the employee DB connection
const EmployeeAttendanceConnection = employeeDbConnection.then(connection => 
  connection.model<IEmployeeAttendance>('EmployeeAttendance', EmployeeAttendanceSchema)
);

export default EmployeeAttendanceConnection; 