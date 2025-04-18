const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function createUserForAdmin() {
  try {
    // Connect to MongoDB
    const uri = "mongodb+srv://malikbruh102:waT0fau9iouoSn1p@cluster0.qz9wewf.mongodb.net/petropulse?retryWrites=true&w=majority";
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Import models
    const Admin = require('../models/admin/AdminModel');
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      userType: String,
      profileId: mongoose.Schema.Types.ObjectId,
      createdAt: Date,
      updatedAt: Date
    }));

    // Find the admin
    const admin = await Admin.findOne({ email: 'admin@petropulse.com' });
    if (!admin) {
      console.error('Admin not found!');
      return;
    }

    console.log('Found admin:', admin);

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@petropulse.com' });
    if (existingUser) {
      console.log('User for admin already exists:', existingUser);
      return;
    }

    // Create a new user that links to the admin
    const user = await User.create({
      name: admin.name,
      email: admin.email,
      password: admin.password, // Using same password
      userType: 'admin',
      profileId: admin._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Created new user for admin:', user);
    
  } catch (error) {
    console.error('Error creating user for admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createUserForAdmin(); 