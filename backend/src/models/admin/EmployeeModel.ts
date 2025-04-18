import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  position: string;
  department: string;
  employeeId: string;
  hireDate: Date;
  salary: number;
  status: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber: string;
  };
  documents?: string[];
  profileImage?: string;
  notes?: string;
  permissions?: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const EmployeeSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: ['management', 'cashier', 'fuel_attendant', 'maintenance', 'stock', 'security', 'admin', 'other'],
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    hireDate: {
      type: Date,
      required: [true, 'Hire date is required'],
      default: Date.now,
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['active', 'on_leave', 'terminated', 'suspended'],
      default: 'active',
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
        default: 'United States',
      },
    },
    bankDetails: {
      accountName: {
        type: String,
        trim: true,
      },
      accountNumber: {
        type: String,
        trim: true,
      },
      bankName: {
        type: String,
        trim: true,
      },
      routingNumber: {
        type: String,
        trim: true,
      },
    },
    documents: [{
      type: String, // URLs to documents
    }],
    profileImage: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    permissions: [{
      type: String,
      enum: ['view_reports', 'edit_inventory', 'process_sales', 'manage_employees', 'admin_panel'],
    }],
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare password (plain text)
EmployeeSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return candidatePassword === this.password;
};

// Indexes for faster queries
EmployeeSchema.index({ lastName: 1, firstName: 1 });
EmployeeSchema.index({ department: 1, status: 1 });
EmployeeSchema.index({ employeeId: 1 }, { unique: true });

// Prevent model compilation error by checking if it exists first
export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema); 