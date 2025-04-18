import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  customerType: string;
  loyaltyPoints: number;
  membershipLevel: string;
  registrationDate: Date;
  lastVisit?: Date;
  totalSpent: number;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethods?: {
    type: string;
    cardLastFour?: string;
    expiryDate?: string;
    isDefault: boolean;
  }[];
  preferences?: {
    fuelType: string;
    preferredPayment: string;
    receivePromotions: boolean;
    contactMethod: string;
  };
  notes?: string;
  profileImage?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const CustomerSchema: Schema = new Schema(
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
      trim: true,
    },
    customerType: {
      type: String,
      required: true,
      enum: ['individual', 'business', 'fleet'],
      default: 'individual',
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    membershipLevel: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'none'],
      default: 'bronze',
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    lastVisit: {
      type: Date,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
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
    paymentMethods: [{
      type: {
        type: String,
        enum: ['credit_card', 'debit_card', 'mobile_wallet', 'loyalty_card', 'other'],
      },
      cardLastFour: {
        type: String,
        trim: true,
      },
      expiryDate: {
        type: String,
        trim: true,
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
    }],
    preferences: {
      fuelType: {
        type: String,
        enum: ['regular', 'premium', 'diesel', 'electric', 'none'],
        default: 'regular',
      },
      preferredPayment: {
        type: String,
        enum: ['cash', 'card', 'mobile', 'account', 'none'],
        default: 'none',
      },
      receivePromotions: {
        type: Boolean,
        default: true,
      },
      contactMethod: {
        type: String,
        enum: ['email', 'sms', 'both', 'none'],
        default: 'email',
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'banned'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare password (plain text)
CustomerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return candidatePassword === this.password;
};

// Indexes for faster queries
CustomerSchema.index({ lastName: 1, firstName: 1 });
CustomerSchema.index({ email: 1 }, { unique: true });
CustomerSchema.index({ membershipLevel: 1, loyaltyPoints: -1 });
CustomerSchema.index({ customerType: 1 });

// Prevent model compilation error by checking if it exists first
export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema); 