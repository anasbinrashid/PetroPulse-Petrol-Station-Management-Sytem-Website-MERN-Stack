import mongoose, { Document, Schema } from 'mongoose';
import employeeDbConnection from '../../config/employeeDb';

export interface IEmployeeProfile extends Document {
  // Reference to the main Employee ID in the PetroPulse database
  mainEmployeeId: string;
  
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  
  // Additional Profile Info
  bio?: string;
  skills?: string[];
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    from: Date;
    to?: Date;
    current?: boolean;
    description?: string;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    location?: string;
    from: Date;
    to?: Date;
    current?: boolean;
    description?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expirationDate?: Date;
    credentialID?: string;
    credentialURL?: string;
  }>;
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  
  // Profile Settings
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeProfileSchema: Schema = new Schema(
  {
    mainEmployeeId: {
      type: String,
      required: [true, 'Main employee ID reference is required'],
      unique: true,
      index: true,
    },
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
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    education: [{
      institution: {
        type: String,
        required: true,
        trim: true,
      },
      degree: {
        type: String,
        required: true,
        trim: true,
      },
      fieldOfStudy: {
        type: String,
        trim: true,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        trim: true,
      },
    }],
    experience: [{
      title: {
        type: String,
        required: true,
        trim: true,
      },
      company: {
        type: String,
        required: true,
        trim: true,
      },
      location: {
        type: String,
        trim: true,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        trim: true,
      },
    }],
    certifications: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      issuingOrganization: {
        type: String,
        required: true,
        trim: true,
      },
      issueDate: {
        type: Date,
        required: true,
      },
      expirationDate: {
        type: Date,
      },
      credentialID: {
        type: String,
        trim: true,
      },
      credentialURL: {
        type: String,
        trim: true,
      },
    }],
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: 'en',
      },
    },
    socialMedia: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create model using the employee DB connection
const EmployeeProfileConnection = employeeDbConnection.then(connection => 
  connection.model<IEmployeeProfile>('EmployeeProfile', EmployeeProfileSchema)
);

export default EmployeeProfileConnection; 