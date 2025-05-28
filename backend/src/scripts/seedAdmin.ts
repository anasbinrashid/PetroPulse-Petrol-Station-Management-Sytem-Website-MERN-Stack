import mongoose from 'mongoose';
import Admin from '../models/admin/AdminModel';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    // Ensure MONGO_URI is set
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in the environment variables.');
    }
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create admin data
    const adminData = {
      name: 'Admin User',
      email: 'admin@petropulse.com',
      password: 'admin123', // This will be automatically hashed by the pre-save hook
      role: 'admin',
      phone: '+1234567890',
      settings: {
        notificationsEnabled: true,
        twoFactorAuth: false,
        theme: 'system'
      }
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create new admin
    const admin = await Admin.create(adminData);
    console.log('Admin created successfully:', {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

// Run the seed function
seedAdmin(); 