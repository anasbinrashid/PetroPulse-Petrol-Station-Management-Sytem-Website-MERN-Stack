import mongoose, { Document, Schema } from 'mongoose';
import employeeDbConnection from '../../config/employeeDb';

export interface ISchedule extends Document {
  employeeId: string;
  weekStartDate: Date;
  shifts: Array<{
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string;
    endTime: string;
    breakTime?: number; // in minutes
    isOffDay: boolean;
    notes?: string;
  }>;
  totalHours: number;
  status: 'pending' | 'approved' | 'published';
  swapRequests?: Array<{
    requestedBy: string;
    originalShift: {
      day: string;
      date: Date;
      startTime: string;
      endTime: string;
    };
    targetShift: {
      day: string;
      date: Date;
      startTime: string;
      endTime: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    requestDate: Date;
    responseDate?: Date;
    notes?: string;
  }>;
  timeOffRequests?: Array<{
    startDate: Date;
    endDate: Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requestDate: Date;
    responseDate?: Date;
    approvedBy?: string;
  }>;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema: Schema = new Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      index: true,
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required'],
      index: true,
    },
    shifts: [{
      day: {
        type: String,
        required: true,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
      startTime: {
        type: String,
        validate: {
          validator: function(v: string) {
            // Validate time format (HH:MM)
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: (props: { value: string }) => `${props.value} is not a valid time format (HH:MM)!`
        }
      },
      endTime: {
        type: String,
        validate: {
          validator: function(v: string) {
            // Validate time format (HH:MM)
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: (props: { value: string }) => `${props.value} is not a valid time format (HH:MM)!`
        }
      },
      breakTime: {
        type: Number,
        min: 0,
        max: 240, // max 4 hours in minutes
      },
      isOffDay: {
        type: Boolean,
        default: false,
      },
      notes: {
        type: String,
        trim: true,
      }
    }],
    totalHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'published'],
      default: 'pending',
    },
    swapRequests: [{
      requestedBy: {
        type: String,
        required: true,
      },
      originalShift: {
        day: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
      targetShift: {
        day: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      requestDate: {
        type: Date,
        default: Date.now,
      },
      responseDate: {
        type: Date,
      },
      notes: {
        type: String,
        trim: true,
      },
    }],
    timeOffRequests: [{
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      reason: {
        type: String,
        required: true,
        trim: true,
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      requestDate: {
        type: Date,
        default: Date.now,
      },
      responseDate: {
        type: Date,
      },
      approvedBy: {
        type: String,
      },
    }],
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indices for faster lookups
ScheduleSchema.index({ employeeId: 1, weekStartDate: 1 }, { unique: true });

// Pre-save hook to calculate total hours
ScheduleSchema.pre('save', function(next) {
  const schedule = this as ISchedule;
  let totalHours = 0;
  
  schedule.shifts.forEach(shift => {
    if (!shift.isOffDay && shift.startTime && shift.endTime) {
      const [startHour, startMinute] = shift.startTime.split(':').map(Number);
      const [endHour, endMinute] = shift.endTime.split(':').map(Number);
      
      let hours = endHour - startHour;
      let minutes = endMinute - startMinute;
      
      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }
      
      // Subtract break time if any
      if (shift.breakTime) {
        const breakHours = shift.breakTime / 60;
        hours -= Math.floor(breakHours);
        minutes -= (breakHours - Math.floor(breakHours)) * 60;
        
        if (minutes < 0) {
          hours -= 1;
          minutes += 60;
        }
      }
      
      totalHours += hours + (minutes / 60);
    }
  });
  
  schedule.totalHours = Math.round(totalHours * 100) / 100;
  next();
});

// Create model using the employee DB connection
const ScheduleConnection = employeeDbConnection.then(connection => 
  connection.model<ISchedule>('Schedule', ScheduleSchema)
);

export default ScheduleConnection; 