import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email: string;
  address: string;
  memberSince: Date;
  status: 'regular' | 'premium' | 'new';
  loyaltyPoints: number;
  vehicles: Array<{
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  }>;
  paymentMethods: Array<{
    type: string;
    lastFour: string;
    isDefault: boolean;
  }>;
}

const customerSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    memberSince: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['regular', 'premium', 'new'],
      default: 'new',
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    vehicles: [
      {
        make: String,
        model: String,
        year: Number,
        licensePlate: String,
      },
    ],
    paymentMethods: [
      {
        type: String,
        lastFour: String,
        isDefault: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);

export default Customer;
