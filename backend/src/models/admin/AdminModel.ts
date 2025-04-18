import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  profileImage?: string;
  lastLogin?: Date;
  settings: {
    notificationsEnabled: boolean;
    twoFactorAuth: boolean;
    theme: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const AdminSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
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
    role: {
      type: String,
      enum: ['superadmin', 'admin'],
      default: 'admin',
    },
    phone: {
      type: String,
      required: false,
    },
    profileImage: {
      type: String,
      required: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    settings: {
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
      twoFactorAuth: {
        type: Boolean,
        default: false,
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare password (plain text)
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return candidatePassword === this.password;
};

// Prevent model compilation error by checking if it exists first
export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema); 