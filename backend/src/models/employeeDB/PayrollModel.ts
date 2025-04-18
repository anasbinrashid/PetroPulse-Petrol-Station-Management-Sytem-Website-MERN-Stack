import mongoose, { Document, Schema } from 'mongoose';
import employeeDbConnection from '../../config/employeeDb';

export interface IPayroll extends Document {
  employeeId: string;
  payPeriod: {
    startDate: Date;
    endDate: Date;
  };
  earnings: {
    regularHours: number;
    regularPay: number;
    overtimeHours: number;
    overtimePay: number;
    bonuses?: number;
    commissions?: number;
    tips?: number;
    otherEarnings?: Array<{
      description: string;
      amount: number;
    }>;
    grossPay: number;
  };
  deductions: {
    taxes: {
      federal: number;
      state: number;
      local?: number;
      fica: number;
      medicare: number;
    };
    benefits?: {
      healthInsurance?: number;
      dentalInsurance?: number;
      visionInsurance?: number;
      retirement401k?: number;
      otherBenefits?: Array<{
        description: string;
        amount: number;
      }>;
    };
    garnishments?: Array<{
      description: string;
      amount: number;
      reference: string;
    }>;
    otherDeductions?: Array<{
      description: string;
      amount: number;
    }>;
    totalDeductions: number;
  };
  netPay: number;
  paymentDetails?: {
    paymentMethod: 'direct_deposit' | 'check' | 'cash';
    bankAccount?: string; // Last 4 digits only
    checkNumber?: string;
    paymentDate: Date;
    status: 'pending' | 'processed' | 'completed';
  };
  ytdTotals?: {
    grossPay: number;
    taxes: number;
    deductions: number;
    netPay: number;
  };
  notes?: string;
  approvedBy: string;
  status: 'draft' | 'pending' | 'approved' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

const PayrollSchema: Schema = new Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      index: true,
    },
    payPeriod: {
      startDate: {
        type: Date,
        required: [true, 'Pay period start date is required'],
      },
      endDate: {
        type: Date,
        required: [true, 'Pay period end date is required'],
      },
    },
    earnings: {
      regularHours: {
        type: Number,
        required: [true, 'Regular hours are required'],
        min: 0,
      },
      regularPay: {
        type: Number,
        required: [true, 'Regular pay is required'],
        min: 0,
      },
      overtimeHours: {
        type: Number,
        default: 0,
        min: 0,
      },
      overtimePay: {
        type: Number,
        default: 0,
        min: 0,
      },
      bonuses: {
        type: Number,
        default: 0,
        min: 0,
      },
      commissions: {
        type: Number,
        default: 0,
        min: 0,
      },
      tips: {
        type: Number,
        default: 0,
        min: 0,
      },
      otherEarnings: [{
        description: {
          type: String,
          required: true,
          trim: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      }],
      grossPay: {
        type: Number,
        required: [true, 'Gross pay is required'],
        min: 0,
      },
    },
    deductions: {
      taxes: {
        federal: {
          type: Number,
          required: [true, 'Federal tax is required'],
          min: 0,
        },
        state: {
          type: Number,
          required: [true, 'State tax is required'],
          min: 0,
        },
        local: {
          type: Number,
          default: 0,
          min: 0,
        },
        fica: {
          type: Number,
          required: [true, 'FICA tax is required'],
          min: 0,
        },
        medicare: {
          type: Number,
          required: [true, 'Medicare tax is required'],
          min: 0,
        },
      },
      benefits: {
        healthInsurance: {
          type: Number,
          default: 0,
          min: 0,
        },
        dentalInsurance: {
          type: Number,
          default: 0,
          min: 0,
        },
        visionInsurance: {
          type: Number,
          default: 0,
          min: 0,
        },
        retirement401k: {
          type: Number,
          default: 0,
          min: 0,
        },
        otherBenefits: [{
          description: {
            type: String,
            required: true,
            trim: true,
          },
          amount: {
            type: Number,
            required: true,
            min: 0,
          },
        }],
      },
      garnishments: [{
        description: {
          type: String,
          required: true,
          trim: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        reference: {
          type: String,
          trim: true,
        },
      }],
      otherDeductions: [{
        description: {
          type: String,
          required: true,
          trim: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      }],
      totalDeductions: {
        type: Number,
        required: [true, 'Total deductions are required'],
        min: 0,
      },
    },
    netPay: {
      type: Number,
      required: [true, 'Net pay is required'],
      min: 0,
    },
    paymentDetails: {
      paymentMethod: {
        type: String,
        enum: ['direct_deposit', 'check', 'cash'],
        default: 'direct_deposit',
      },
      bankAccount: {
        type: String,
        trim: true,
      },
      checkNumber: {
        type: String,
        trim: true,
      },
      paymentDate: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['pending', 'processed', 'completed'],
        default: 'pending',
      },
    },
    ytdTotals: {
      grossPay: {
        type: Number,
        default: 0,
        min: 0,
      },
      taxes: {
        type: Number,
        default: 0,
        min: 0,
      },
      deductions: {
        type: Number,
        default: 0,
        min: 0,
      },
      netPay: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: String,
      required: [true, 'Approver is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'paid'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Create composite index for employee and pay period
PayrollSchema.index({ employeeId: 1, 'payPeriod.startDate': 1, 'payPeriod.endDate': 1 }, { unique: true });

// Pre-save middleware to calculate gross and net pay
PayrollSchema.pre('save', function(next) {
  const payroll = this as IPayroll;
  
  // Calculate gross pay
  let grossPay = payroll.earnings.regularPay + payroll.earnings.overtimePay;
  if (payroll.earnings.bonuses) grossPay += payroll.earnings.bonuses;
  if (payroll.earnings.commissions) grossPay += payroll.earnings.commissions;
  if (payroll.earnings.tips) grossPay += payroll.earnings.tips;
  
  if (payroll.earnings.otherEarnings && payroll.earnings.otherEarnings.length > 0) {
    payroll.earnings.otherEarnings.forEach(earning => {
      grossPay += earning.amount;
    });
  }
  
  payroll.earnings.grossPay = Math.round(grossPay * 100) / 100;
  
  // Calculate total deductions
  let totalDeductions = 0;
  
  // Tax deductions
  totalDeductions += payroll.deductions.taxes.federal;
  totalDeductions += payroll.deductions.taxes.state;
  if (payroll.deductions.taxes.local) totalDeductions += payroll.deductions.taxes.local;
  totalDeductions += payroll.deductions.taxes.fica;
  totalDeductions += payroll.deductions.taxes.medicare;
  
  // Benefit deductions
  if (payroll.deductions.benefits) {
    if (payroll.deductions.benefits.healthInsurance) totalDeductions += payroll.deductions.benefits.healthInsurance;
    if (payroll.deductions.benefits.dentalInsurance) totalDeductions += payroll.deductions.benefits.dentalInsurance;
    if (payroll.deductions.benefits.visionInsurance) totalDeductions += payroll.deductions.benefits.visionInsurance;
    if (payroll.deductions.benefits.retirement401k) totalDeductions += payroll.deductions.benefits.retirement401k;
    
    if (payroll.deductions.benefits.otherBenefits && payroll.deductions.benefits.otherBenefits.length > 0) {
      payroll.deductions.benefits.otherBenefits.forEach(benefit => {
        totalDeductions += benefit.amount;
      });
    }
  }
  
  // Garnishment deductions
  if (payroll.deductions.garnishments && payroll.deductions.garnishments.length > 0) {
    payroll.deductions.garnishments.forEach(garnishment => {
      totalDeductions += garnishment.amount;
    });
  }
  
  // Other deductions
  if (payroll.deductions.otherDeductions && payroll.deductions.otherDeductions.length > 0) {
    payroll.deductions.otherDeductions.forEach(deduction => {
      totalDeductions += deduction.amount;
    });
  }
  
  payroll.deductions.totalDeductions = Math.round(totalDeductions * 100) / 100;
  
  // Calculate net pay
  payroll.netPay = Math.round((payroll.earnings.grossPay - payroll.deductions.totalDeductions) * 100) / 100;
  
  next();
});

// Create model using the employee DB connection
const PayrollConnection = employeeDbConnection.then(connection => 
  connection.model<IPayroll>('Payroll', PayrollSchema)
);

export default PayrollConnection; 