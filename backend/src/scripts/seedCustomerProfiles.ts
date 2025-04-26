import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectCustomerDB from '../config/customerDb';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config();

// Status options for customers
const statuses = ['new', 'regular', 'premium'];

// Vehicle options for seed data
const vehicles = [
  'Toyota Camry',
  'Honda Civic',
  'Ford F-150',
  'Chevrolet Silverado',
  'Nissan Altima',
  'Tesla Model 3',
  'BMW 3 Series',
  'Mercedes C-Class',
  'Audi A4',
  'Lexus RX',
  'Subaru Outback',
  'Jeep Wrangler',
  'Volkswagen Golf',
  'Kia Sorento',
  'Hyundai Tucson'
];

// Get a random item from an array
const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// Generate a random date within the last year for last visit
const getRandomLastVisit = () => {
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const timeDiff = now.getTime() - oneYearAgo.getTime();
  const randomTime = Math.random() * timeDiff;
  return new Date(oneYearAgo.getTime() + randomTime);
};

// Generate a random date within the last 3 years for member since date
const getRandomMemberSince = () => {
  const now = new Date();
  const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
  const timeDiff = now.getTime() - threeYearsAgo.getTime();
  const randomTime = Math.random() * timeDiff;
  return new Date(threeYearsAgo.getTime() + randomTime);
};

// Generate random loyalty points (0-5000)
const getRandomLoyaltyPoints = () => Math.floor(Math.random() * 5000);

// Seed customer data
const seedCustomerProfiles = async () => {
  try {
    console.log('Connecting to customer database...');
    const connection = await connectCustomerDB();
    console.log('Connected to customer database');

    // Get the Customer model
    const CustomerModel = connection.model('Customer');
    
    // Get all customer profiles
    const customers = await CustomerModel.find({});
    console.log(`Found ${customers.length} customer profiles to update`);

    // Update existing customers with missing fields
    for (const customer of customers) {
      let updated = false;
      
      // Set status if not already set
      if (!customer.status) {
        customer.status = getRandomItem(statuses);
        updated = true;
      }
      
      // Set vehicle if not already set
      if (!customer.vehicle) {
        customer.vehicle = getRandomItem(vehicles);
        updated = true;
      }
      
      // Set lastVisit if not already set
      if (!customer.lastVisit) {
        customer.lastVisit = getRandomLastVisit();
        updated = true;
      }
      
      // Set memberSince if not already set
      if (!customer.memberSince) {
        customer.memberSince = getRandomMemberSince();
        updated = true;
      }
      
      // Set loyaltyPoints if not already set
      if (!customer.loyaltyPoints) {
        customer.loyaltyPoints = getRandomLoyaltyPoints();
        updated = true;
      }
      
      // Save if any updates were made
      if (updated) {
        await customer.save();
        console.log(`Updated profile for ${customer.firstName} ${customer.lastName}`);
      }
    }

    console.log(`Successfully updated ${customers.length} customer profiles`);
    
    // Create some new customers if none exist
    if (customers.length === 0) {
      console.log('No existing customers found. Creating sample customer profiles...');
      
      const sampleCustomers = [
        {
          firstName: 'Michael',
          lastName: 'Johnson',
          email: 'michael.johnson@example.com',
          phone: '555-123-4567',
          status: 'premium',
          loyaltyPoints: 2500,
          vehicle: 'BMW 5 Series',
          lastVisit: new Date(2023, 4, 15),
          memberSince: new Date(2021, 2, 10),
          customerType: 'individual',
          membershipLevel: 'gold'
        },
        {
          firstName: 'Jennifer',
          lastName: 'Lopez',
          email: 'jennifer.lopez@example.com',
          phone: '555-987-6543',
          status: 'regular',
          loyaltyPoints: 870,
          vehicle: 'Toyota Prius',
          lastVisit: new Date(2023, 5, 20),
          memberSince: new Date(2022, 0, 5),
          customerType: 'individual',
          membershipLevel: 'silver'
        },
        {
          firstName: 'David',
          lastName: 'Wilson',
          email: 'david.wilson@example.com',
          phone: '555-456-7890',
          status: 'new',
          loyaltyPoints: 150,
          vehicle: 'Ford Explorer',
          lastVisit: new Date(2023, 5, 28),
          memberSince: new Date(2023, 5, 1),
          customerType: 'individual',
          membershipLevel: 'basic'
        },
        {
          firstName: 'Jessica',
          lastName: 'Brown',
          email: 'jessica.brown@example.com',
          phone: '555-222-3333',
          status: 'premium',
          loyaltyPoints: 3200,
          vehicle: 'Audi Q5',
          lastVisit: new Date(2023, 5, 25),
          memberSince: new Date(2020, 9, 15),
          customerType: 'individual',
          membershipLevel: 'platinum'
        },
        {
          firstName: 'Robert',
          lastName: 'Garcia',
          email: 'robert.garcia@example.com',
          phone: '555-444-5555',
          status: 'regular',
          loyaltyPoints: 950,
          vehicle: 'Honda CR-V',
          lastVisit: new Date(2023, 5, 18),
          memberSince: new Date(2021, 11, 20),
          customerType: 'individual',
          membershipLevel: 'silver'
        }
      ];

      await CustomerModel.insertMany(sampleCustomers);
      console.log(`Created ${sampleCustomers.length} sample customer profiles`);
    }

    console.log('Customer database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding customer database:', error);
    process.exit(1);
  }
};

// Execute the seeding
seedCustomerProfiles(); 