import mongoose, { Document, Schema } from 'mongoose';
import connectCustomerDB from '../../config/customerDb';

// Interface that matches the frontend Customer interface
export interface ICustomer extends Document {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: "new" | "regular" | "premium";
  loyaltyPoints: number;
  vehicle?: string;
  address?: string;
  lastVisit?: Date;
  memberSince: Date;
  notes?: string;
  customerType: "individual" | "business";
  membershipLevel: "basic" | "silver" | "gold" | "platinum";
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields for customer management
  totalSpent: number;
  purchaseHistory: Array<{
    date: Date;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
    total: number;
  }>;
  preferredPaymentMethod?: string;
  fuelPreference?: string;
  // Method to compare passwords
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const customerSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: false,
      trim: true
    },
    status: {
      type: String,
      enum: ['new', 'regular', 'premium'],
      default: 'new'
    },
    loyaltyPoints: {
      type: Number,
      default: 0
    },
    vehicle: {
      type: String,
      required: false
    },
    address: {
      type: String,
      required: false
    },
    lastVisit: {
      type: Date,
      default: null
    },
    memberSince: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      required: false
    },
    customerType: {
      type: String,
      enum: ['individual', 'business'],
      default: 'individual'
    },
    membershipLevel: {
      type: String,
      enum: ['basic', 'silver', 'gold', 'platinum'],
      default: 'basic'
    },
    password: {
      type: String,
      required: false,
      select: false
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    purchaseHistory: [
      {
        date: {
          type: Date,
          required: true
        },
        items: [
          {
            name: String,
            price: Number,
            quantity: Number
          }
        ],
        total: Number
      }
    ],
    preferredPaymentMethod: {
      type: String,
      required: false
    },
    fuelPreference: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Method to compare password (plain text)
customerSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return candidatePassword === this.password;
};

// Create indexes for faster queries
customerSchema.index({ lastName: 1, firstName: 1 });
customerSchema.index({ email: 1 }, { unique: true, sparse: true });
customerSchema.index({ membershipLevel: 1, loyaltyPoints: -1 });
customerSchema.index({ status: 1 });

// Create and export the model
let CustomerModel: mongoose.Model<ICustomer> | null = null;

// This function initializes the model with the customer database connection
export const initCustomerModel = async (): Promise<mongoose.Model<ICustomer>> => {
  if (!CustomerModel) {
    const conn = await connectCustomerDB();
    CustomerModel = conn.model<ICustomer>('Customer', customerSchema);
  }
  return CustomerModel;
};

// Export a dummy function for default export - actual model should be initialized through initCustomerModel
export default function getCustomerModel() {
  if (!CustomerModel) {
    throw new Error('Customer model not initialized. Please call initCustomerModel first.');
  }
  return CustomerModel;
} 