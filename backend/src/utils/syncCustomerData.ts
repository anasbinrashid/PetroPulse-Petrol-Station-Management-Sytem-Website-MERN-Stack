import mongoose from 'mongoose';
import connectDB from '../config/db';
import connectCustomerDB from '../config/customerDb';
import Customer from '../models/admin/CustomerModel';
import { initCustomerModel } from '../models/customerDB/CustomerModel';
import { initFuelPurchaseModel } from '../models/customerDB/FuelPurchaseModel';
import { initLoyaltyTransactionModel } from '../models/customerDB/LoyaltyModel';

// Synchronize customer data from main database to customer-specific database
const syncCustomerData = async () => {
  try {
    console.log('[Sync] Starting customer data synchronization...');
    
    // Connect to main database
    await connectDB();
    console.log('[Sync] Connected to main database');
    
    // Initialize customer-specific models
    const CustomerModel = await initCustomerModel();
    const FuelPurchaseModel = await initFuelPurchaseModel();
    const LoyaltyTransactionModel = await initLoyaltyTransactionModel();
    console.log('[Sync] Initialized customer-specific models');
    
    // Get all customers from main database
    const allCustomers = await Customer.find({});
    console.log(`[Sync] Found ${allCustomers.length} customers in main database`);
    
    // Synchronize each customer
    let customersCreated = 0;
    let customersUpdated = 0;
    
    for (const mainDbCustomer of allCustomers) {
      try {
        // Check if customer exists in customer-specific database
        const existingCustomer = await CustomerModel.findOne({ email: mainDbCustomer.email });
        
        // Map main database customer to customer-specific database format
        const customerData = {
          firstName: mainDbCustomer.firstName,
          lastName: mainDbCustomer.lastName,
          email: mainDbCustomer.email,
          password: mainDbCustomer.password,
          phone: mainDbCustomer.phone,
          status: mainDbCustomer.status || 'new',
          loyaltyPoints: mainDbCustomer.loyaltyPoints || 0,
          vehicle: mainDbCustomer.vehicle || null,
          address: mainDbCustomer.address || null,
          lastVisit: mainDbCustomer.lastVisit || null,
          memberSince: mainDbCustomer.registrationDate || mainDbCustomer.createdAt,
          notes: mainDbCustomer.notes || null,
          customerType: mainDbCustomer.customerType || 'individual',
          membershipLevel: mainDbCustomer.membershipLevel || 'basic',
          totalSpent: mainDbCustomer.totalSpent || 0,
          updatedAt: new Date()
        };
        
        if (existingCustomer) {
          // Update existing customer
          await CustomerModel.findByIdAndUpdate(existingCustomer._id, customerData, { new: true });
          customersUpdated++;
        } else {
          // Create new customer
          await CustomerModel.create({
            ...customerData,
            createdAt: new Date()
          });
          customersCreated++;
        }
      } catch (error: any) {
        console.error(`[Sync] Error synchronizing customer ${mainDbCustomer.email}:`, error.message);
      }
    }
    
    console.log(`[Sync] Created ${customersCreated} new customers`);
    console.log(`[Sync] Updated ${customersUpdated} existing customers`);
    console.log('[Sync] Customer data synchronization completed');
    
    // Disconnect from databases
    await mongoose.disconnect();
    console.log('[Sync] Disconnected from databases');
    
    process.exit(0);
  } catch (error: any) {
    console.error('[Sync] Error synchronizing customer data:', error.message);
    process.exit(1);
  }
};

// Run synchronization
syncCustomerData(); 