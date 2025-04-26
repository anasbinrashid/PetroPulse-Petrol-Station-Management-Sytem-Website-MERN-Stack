// This script creates sample sales data by making API calls
// This approach doesn't require direct MongoDB access
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:5000/api';
let authToken = '';

const PRODUCTS = [
  { name: 'Coffee', price: 2.99 },
  { name: 'Bottled Water', price: 1.99 },
  { name: 'Chips', price: 3.49 },
  { name: 'Candy Bar', price: 1.29 },
  { name: 'Energy Drink', price: 3.99 }
];

const FUEL_TYPES = [
  { type: 'Regular', price: 3.59 },
  { type: 'Premium', price: 3.99 },
  { type: 'Diesel', price: 3.79 }
];

const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Cash', 'Mobile Pay'];

// Helper to generate a date within the past 30 days
const getRandomDate = (daysBack = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
};

// Login and get auth token
async function login() {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email: 'admin@petropulse.com',
      password: 'admin123'
    });
    
    if (response.data && response.data.token) {
      authToken = response.data.token;
      console.log('Successfully logged in');
      return true;
    } else {
      console.error('Failed to get auth token');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    return false;
  }
}

// Create a transaction
async function createTransaction(transaction) {
  try {
    const response = await axios.post(`${API_URL}/sales`, transaction, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Generate a random fuel transaction
function generateFuelTransaction() {
  const fuelType = FUEL_TYPES[Math.floor(Math.random() * FUEL_TYPES.length)];
  const quantity = parseFloat((5 + Math.random() * 15).toFixed(2)); // 5-20 gallons
  const unitPrice = fuelType.price;
  const total = parseFloat((quantity * unitPrice).toFixed(2));
  const subtotal = parseFloat((total / 1.06).toFixed(2)); // Assuming 6% tax
  const tax = parseFloat((total - subtotal).toFixed(2));
  
  return {
    transactionType: 'fuel',
    date: getRandomDate(),
    items: [
      {
        itemType: 'fuel',
        quantity,
        unitPrice,
        total: total,
        fuelType: fuelType.type
      }
    ],
    subtotal,
    tax,
    total,
    paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
    paymentStatus: 'paid',
    loyaltyPointsEarned: Math.floor(total * 10), // 10 points per dollar
    notes: `${quantity} gallons of ${fuelType.type} fuel`
  };
}

// Generate a random product transaction
function generateProductTransaction() {
  const numItems = 1 + Math.floor(Math.random() * 3); // 1-3 items
  const items = [];
  let subtotal = 0;
  
  for (let i = 0; i < numItems; i++) {
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const quantity = 1 + Math.floor(Math.random() * 2); // 1-2 quantity
    const itemTotal = parseFloat((product.price * quantity).toFixed(2));
    subtotal += itemTotal;
    
    items.push({
      itemType: 'product',
      name: product.name,
      quantity,
      unitPrice: product.price,
      total: itemTotal
    });
  }
  
  const tax = parseFloat((subtotal * 0.06).toFixed(2)); // 6% tax
  const total = parseFloat((subtotal + tax).toFixed(2));
  
  return {
    transactionType: 'product',
    date: getRandomDate(),
    items,
    subtotal,
    tax,
    total,
    paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
    paymentStatus: 'paid',
    loyaltyPointsEarned: Math.floor(total * 5) // 5 points per dollar for products
  };
}

// Generate a random service transaction
function generateServiceTransaction() {
  const servicePrice = parseFloat((20 + Math.random() * 80).toFixed(2)); // $20-$100 service
  const subtotal = servicePrice;
  const tax = parseFloat((subtotal * 0.06).toFixed(2)); // 6% tax
  const total = parseFloat((subtotal + tax).toFixed(2));
  
  return {
    transactionType: 'service',
    date: getRandomDate(),
    items: [
      {
        itemType: 'product', // Services are tracked as products in this schema
        name: 'Car Wash Service',
        quantity: 1,
        unitPrice: servicePrice,
        total: servicePrice
      }
    ],
    subtotal,
    tax,
    total,
    paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
    paymentStatus: Math.random() > 0.9 ? 'pending' : 'paid', // 90% paid, 10% pending
    loyaltyPointsEarned: Math.floor(total * 2), // 2 points per dollar for services
    notes: 'Service transaction'
  };
}

// Main function to generate and create transactions
async function seedSalesData(count = 50) {
  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('Failed to login. Cannot continue.');
    return;
  }
  
  let successCount = 0;
  
  // Create fuel transactions (60% of total)
  for (let i = 0; i < Math.floor(count * 0.6); i++) {
    const transaction = generateFuelTransaction();
    const result = await createTransaction(transaction);
    if (result) successCount++;
    
    // Add a small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Create product transactions (30% of total)
  for (let i = 0; i < Math.floor(count * 0.3); i++) {
    const transaction = generateProductTransaction();
    const result = await createTransaction(transaction);
    if (result) successCount++;
    
    // Add a small delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Create service transactions (10% of total)
  for (let i = 0; i < Math.floor(count * 0.1); i++) {
    const transaction = generateServiceTransaction();
    const result = await createTransaction(transaction);
    if (result) successCount++;
    
    // Add a small delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`Successfully created ${successCount} out of ${count} transactions`);
}

// Execute the script
console.log('Starting to seed sales data...');
seedSalesData(30)
  .then(() => console.log('Completed seeding sales data'))
  .catch(err => console.error('Error during seeding:', err)); 