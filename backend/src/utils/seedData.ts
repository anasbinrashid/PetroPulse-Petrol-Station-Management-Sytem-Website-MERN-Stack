
import dotenv from 'dotenv';
import connectDB from '../config/db';
import User from '../models/userModel';
import Admin from '../models/adminModel';
import Employee from '../models/employeeModel';
import Customer from '../models/customerModel';
import FuelInventory from '../models/fuelInventoryModel';
import Product from '../models/productModel';
import Revenue from '../models/revenueModel';
import Transaction from '../models/transactionModel';
import FuelSale from '../models/fuelSaleModel';
import Attendance from '../models/attendanceModel';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

dotenv.config();

// Connect to database
connectDB();

// Create seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Employee.deleteMany({});
    await Customer.deleteMany({});
    await FuelInventory.deleteMany({});
    await Product.deleteMany({});
    await Revenue.deleteMany({});
    await Transaction.deleteMany({});
    await FuelSale.deleteMany({});
    await Attendance.deleteMany({});

    console.log('Data cleared...');

    // Create admin
    const adminProfile = await Admin.create({
      name: 'Admin User',
      phone: '555-123-4567',
      role: 'System Administrator',
      permissions: ['all'],
    });

    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@petropulse.com',
      password: hashedAdminPassword,
      userType: 'admin',
      profileId: adminProfile._id,
    });

    // Create employee
    const employeeProfile = await Employee.create({
      name: 'John Smith',
      role: 'Station Manager',
      phone: '555-987-6543',
      address: '123 Main St, Anytown, USA',
      hireDate: new Date('2022-01-15'),
      status: 'active',
      shifts: 'day',
      emergencyContact: {
        name: 'Jane Smith',
        phone: '555-876-5432',
        relationship: 'Spouse',
      },
      salary: {
        baseAmount: 3500,
        currency: 'USD',
        paymentFrequency: 'monthly',
      },
    });

    const hashedEmployeePassword = await bcrypt.hash('employee123', 10);
    
    const employee = await User.create({
      name: 'John Smith',
      email: 'employee@petropulse.com',
      password: hashedEmployeePassword,
      userType: 'employee',
      profileId: employeeProfile._id,
    });

    // Create customer
    const customerProfile = await Customer.create({
      name: 'Robert Johnson',
      phone: '555-567-8901',
      email: 'customer@example.com',
      address: '456 Oak Ave, Anytown, USA',
      memberSince: new Date('2023-03-10'),
      status: 'regular',
      loyaltyPoints: 735,
      vehicles: [
        {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          licensePlate: 'ABC123',
        },
        {
          make: 'Honda',
          model: 'Civic',
          year: 2018,
          licensePlate: 'XYZ789',
        },
      ],
      paymentMethods: [
        {
          type: 'Credit Card',
          lastFour: '4567',
          isDefault: true,
        },
        {
          type: 'Fleet Card',
          lastFour: '8901',
          isDefault: false,
        },
      ],
    });

    const hashedCustomerPassword = await bcrypt.hash('customer123', 10);
    
    const customer = await User.create({
      name: 'Robert Johnson',
      email: 'customer@example.com',
      password: hashedCustomerPassword,
      userType: 'customer',
      profileId: customerProfile._id,
    });

    // Create fuel inventory
    const fuelInventory = await FuelInventory.insertMany([
      {
        fuelType: 'Regular Unleaded',
        currentLevel: 3500,
        capacity: 5000,
        pricePerGallon: 3.45,
        supplier: 'Global Fuels Inc.',
        lastDelivery: new Date('2023-06-25'),
        lastUpdated: new Date(),
        minimumLevel: 500,
        tankNumber: 1,
      },
      {
        fuelType: 'Premium Unleaded',
        currentLevel: 2800,
        capacity: 4000,
        pricePerGallon: 3.95,
        supplier: 'Global Fuels Inc.',
        lastDelivery: new Date('2023-06-23'),
        lastUpdated: new Date(),
        minimumLevel: 400,
        tankNumber: 2,
      },
      {
        fuelType: 'Diesel',
        currentLevel: 4200,
        capacity: 6000,
        pricePerGallon: 3.75,
        supplier: 'Global Fuels Inc.',
        lastDelivery: new Date('2023-06-20'),
        lastUpdated: new Date(),
        minimumLevel: 600,
        tankNumber: 3,
      },
    ]);

    // Create products
    const products = await Product.insertMany([
      {
        name: 'Water Bottle',
        category: 'Beverages',
        stock: 150,
        price: 1.99,
        cost: 0.75,
        supplier: 'National Distributors',
        barcode: '1234567890',
        minimumStock: 20,
        description: '500ml bottled water',
        imageUrl: 'water_bottle.jpg',
        isActive: true,
        lastRestocked: new Date('2023-06-15'),
      },
      {
        name: 'Potato Chips',
        category: 'Snacks',
        stock: 85,
        price: 2.49,
        cost: 1.25,
        supplier: 'National Distributors',
        barcode: '2345678901',
        minimumStock: 15,
        description: '150g potato chips, salted',
        imageUrl: 'chips.jpg',
        isActive: true,
        lastRestocked: new Date('2023-06-18'),
      },
      {
        name: 'Energy Drink',
        category: 'Beverages',
        stock: 65,
        price: 3.49,
        cost: 2.00,
        supplier: 'Beverage Supplies Inc.',
        barcode: '3456789012',
        minimumStock: 10,
        description: '250ml energy drink',
        imageUrl: 'energy_drink.jpg',
        isActive: true,
        lastRestocked: new Date('2023-06-20'),
      },
      {
        name: 'Motor Oil',
        category: 'Automotive',
        stock: 40,
        price: 24.99,
        cost: 15.50,
        supplier: 'Auto Parts Co.',
        barcode: '4567890123',
        minimumStock: 5,
        description: '5L motor oil, 10W-30',
        imageUrl: 'motor_oil.jpg',
        isActive: true,
        lastRestocked: new Date('2023-06-10'),
      },
      {
        name: 'Windshield Washer Fluid',
        category: 'Automotive',
        stock: 30,
        price: 4.99,
        cost: 2.25,
        supplier: 'Auto Parts Co.',
        barcode: '5678901234',
        minimumStock: 8,
        description: '1L windshield washer fluid',
        imageUrl: 'washer_fluid.jpg',
        isActive: true,
        lastRestocked: new Date('2023-06-12'),
      },
    ]);

    // Create revenue records
    const revenueRecords = await Revenue.insertMany([
      {
        date: new Date('2023-06-30'),
        source: 'fuel_sales',
        amount: 3450.75,
        category: 'Regular Unleaded',
        notes: 'End of month fuel sales',
      },
      {
        date: new Date('2023-06-30'),
        source: 'fuel_sales',
        amount: 2350.50,
        category: 'Premium Unleaded',
        notes: 'End of month fuel sales',
      },
      {
        date: new Date('2023-06-30'),
        source: 'fuel_sales',
        amount: 1987.25,
        category: 'Diesel',
        notes: 'End of month fuel sales',
      },
      {
        date: new Date('2023-06-30'),
        source: 'store_sales',
        amount: 1245.80,
        category: 'Food & Beverages',
        notes: 'End of month store sales',
      },
      {
        date: new Date('2023-06-30'),
        source: 'store_sales',
        amount: 980.45,
        category: 'Automotive Products',
        notes: 'End of month store sales',
      },
      {
        date: new Date('2023-06-30'),
        source: 'services',
        amount: 540.00,
        category: 'Car Wash',
        notes: 'End of month services',
      },
      {
        date: new Date('2023-05-31'),
        source: 'fuel_sales',
        amount: 3250.25,
        category: 'Regular Unleaded',
        notes: 'End of month fuel sales',
      },
      {
        date: new Date('2023-05-31'),
        source: 'fuel_sales',
        amount: 2150.75,
        category: 'Premium Unleaded',
        notes: 'End of month fuel sales',
      },
      {
        date: new Date('2023-05-31'),
        source: 'fuel_sales',
        amount: 1850.50,
        category: 'Diesel',
        notes: 'End of month fuel sales',
      },
      {
        date: new Date('2023-05-31'),
        source: 'store_sales',
        amount: 1120.90,
        category: 'Food & Beverages',
        notes: 'End of month store sales',
      },
    ]);

    // Create fuel sales for the customer
    // First create the transaction
    const transaction1 = await Transaction.create({
      transactionType: 'fuel',
      customerId: customerProfile._id,
      employeeId: employeeProfile._id,
      date: new Date('2023-06-30'),
      items: [
        {
          itemType: 'fuel',
          itemId: fuelInventory[0]._id, // Regular unleaded
          quantity: 13.2, // gallons
          unitPrice: 3.45,
          total: 45.54,
        },
      ],
      subtotal: 45.54,
      tax: 0, // No tax on fuel in this example
      total: 45.54,
      paymentMethod: 'Credit Card',
      paymentStatus: 'paid',
      loyaltyPointsEarned: 45,
      loyaltyPointsRedeemed: 0,
      notes: 'Regular purchase',
    });

    // Create the fuel sale
    const fuelSale1 = await FuelSale.create({
      transactionId: transaction1._id,
      fuelType: 'Regular Unleaded',
      gallons: 13.2,
      pricePerGallon: 3.45,
      total: 45.54,
      pumpNumber: 2,
      employeeId: employeeProfile._id,
      customerId: customerProfile._id,
      date: new Date('2023-06-30'),
      paymentMethod: 'Credit Card',
    });

    // Create more fuel sales
    const transaction2 = await Transaction.create({
      transactionType: 'fuel',
      customerId: customerProfile._id,
      employeeId: employeeProfile._id,
      date: new Date('2023-06-25'),
      items: [
        {
          itemType: 'fuel',
          itemId: fuelInventory[2]._id, // Diesel
          quantity: 23.3, // gallons
          unitPrice: 3.75,
          total: 87.38,
        },
      ],
      subtotal: 87.38,
      tax: 0,
      total: 87.38,
      paymentMethod: 'Fleet Card',
      paymentStatus: 'paid',
      loyaltyPointsEarned: 87,
      loyaltyPointsRedeemed: 0,
      notes: '',
    });

    const fuelSale2 = await FuelSale.create({
      transactionId: transaction2._id,
      fuelType: 'Diesel',
      gallons: 23.3,
      pricePerGallon: 3.75,
      total: 87.38,
      pumpNumber: 5,
      employeeId: employeeProfile._id,
      customerId: customerProfile._id,
      date: new Date('2023-06-25'),
      paymentMethod: 'Fleet Card',
    });

    const transaction3 = await Transaction.create({
      transactionType: 'fuel',
      customerId: customerProfile._id,
      employeeId: employeeProfile._id,
      date: new Date('2023-06-22'),
      items: [
        {
          itemType: 'fuel',
          itemId: fuelInventory[1]._id, // Premium unleaded
          quantity: 15.9, // gallons
          unitPrice: 3.95,
          total: 62.81,
        },
      ],
      subtotal: 62.81,
      tax: 0,
      total: 62.81,
      paymentMethod: 'Credit Card',
      paymentStatus: 'paid',
      loyaltyPointsEarned: 63,
      loyaltyPointsRedeemed: 0,
      notes: '',
    });

    const fuelSale3 = await FuelSale.create({
      transactionId: transaction3._id,
      fuelType: 'Premium Unleaded',
      gallons: 15.9,
      pricePerGallon: 3.95,
      total: 62.81,
      pumpNumber: 3,
      employeeId: employeeProfile._id,
      customerId: customerProfile._id,
      date: new Date('2023-06-22'),
      paymentMethod: 'Credit Card',
    });

    // Create employee attendance records
    const attendanceRecords = await Attendance.insertMany([
      {
        employeeId: employeeProfile._id,
        date: new Date(Date.now() - 86400000), // Yesterday
        clockIn: new Date(Date.now() - 86400000 + 8 * 3600000), // 8 AM yesterday
        clockOut: new Date(Date.now() - 86400000 + 16 * 3600000), // 4 PM yesterday
        status: 'present',
        hours: 8,
        notes: 'Regular shift',
        approvedBy: adminProfile._id,
      },
      {
        employeeId: employeeProfile._id,
        date: new Date(Date.now() - 2 * 86400000), // 2 days ago
        clockIn: new Date(Date.now() - 2 * 86400000 + 8 * 3600000), // 8 AM 2 days ago
        clockOut: new Date(Date.now() - 2 * 86400000 + 16 * 3600000), // 4 PM 2 days ago
        status: 'present',
        hours: 8,
        notes: 'Regular shift',
        approvedBy: adminProfile._id,
      },
      {
        employeeId: employeeProfile._id,
        date: new Date(Date.now() - 3 * 86400000), // 3 days ago
        clockIn: null,
        clockOut: null,
        status: 'absent',
        hours: 0,
        notes: 'Called in sick',
        approvedBy: adminProfile._id,
      },
      {
        employeeId: employeeProfile._id,
        date: new Date(Date.now() - 4 * 86400000), // 4 days ago
        clockIn: new Date(Date.now() - 4 * 86400000 + 8 * 3600000), // 8 AM 4 days ago
        clockOut: new Date(Date.now() - 4 * 86400000 + 16 * 3600000), // 4 PM 4 days ago
        status: 'present',
        hours: 8,
        notes: 'Regular shift',
        approvedBy: adminProfile._id,
      },
    ]);

    console.log('Data seeded successfully!');
    console.log('\nUser credentials for testing:');
    console.log('Admin: admin@petropulse.com / admin123');
    console.log('Employee: employee@petropulse.com / employee123');
    console.log('Customer: customer@example.com / customer123');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
