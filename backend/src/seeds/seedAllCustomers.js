const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the backend/.env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Main seed function
async function seedAllCustomers() {
  console.log('Starting customer database seed process...');
  
  // Get connection URI from env or use default
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('Error: MONGODB_URI environment variable is not defined');
    console.log('Please ensure you have a .env file in the backend directory with MONGODB_URI defined');
    process.exit(1);
  }
  
  // Create customer database URI
  const customerDbUri = uri.replace(/\/[^/]+(\?|$)/, '/petropulse-customers$1');
  
  console.log(`Connecting to customer database at: ${customerDbUri.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`);
  
  const client = new MongoClient(customerDbUri);
  
  try {
    await client.connect();
    console.log('Connected to customer database');
    
    // Get reference to the database
    const db = client.db();
    
    // Seed customers
    await seedCustomers(db);
    
    // Seed fuel purchases
    await seedFuelPurchases(db);
    
    // Seed loyalty transactions
    await seedLoyaltyTransactions(db);
    
    console.log('Customer database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding customer database:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

// Helper to create ObjectIds
function createObjectId() {
  return new mongoose.Types.ObjectId();
}

// Helper to generate random date in the last 30-365 days
function randomPastDate(daysAgo = 365) {
  const today = new Date();
  const pastDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  return new Date(pastDate.getTime() + Math.random() * (today.getTime() - pastDate.getTime()));
}

// Helper to generate random number
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Seed Customers
async function seedCustomers(db) {
  const collection = db.collection('customers');
  
  // Clear existing data
  await collection.deleteMany({});
  console.log('Cleared existing customer data');
  
  const customerData = [];
  const customerIds = [];
  
  // Sample customer data
  const firstNames = ['John', 'Emma', 'Michael', 'Olivia', 'William', 'Sophia', 'James', 'Ava', 'Robert', 'Isabella', 
                      'David', 'Mia', 'Joseph', 'Charlotte', 'Daniel', 'Amelia', 'Matthew', 'Harper', 'Andrew', 'Evelyn'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                     'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  
  const vehicles = [
    'Honda Civic 2020', 'Toyota Camry 2019', 'Ford F-150 2021', 'Chevrolet Silverado 2018', 'Tesla Model 3',
    'BMW X5 2022', 'Audi Q5 2021', 'Hyundai Tucson 2020', 'Nissan Altima 2019', 'Jeep Wrangler 2022',
    'Subaru Outback 2021', 'Kia Telluride 2022', 'Mazda CX-5 2020', 'Volkswagen Tiguan 2021', 'Lexus RX 2019'
  ];
  
  const statuses = ['new', 'regular', 'premium'];
  const membershipLevels = ['basic', 'silver', 'gold', 'platinum'];
  const customerTypes = ['individual', 'business'];
  const fuelPreferences = ['regular', 'premium', 'diesel', null];
  const paymentMethods = ['credit', 'debit', 'cash', 'app', null];
  
  // Generate 30 customers with varied data
  for (let i = 0; i < 30; i++) {
    const customerId = createObjectId();
    customerIds.push(customerId);
    
    const membershipIndex = Math.floor(Math.random() * membershipLevels.length);
    const membershipLevel = membershipLevels[membershipIndex];
    
    // Assign status based on membership level
    let status;
    if (membershipLevel === 'platinum' || membershipLevel === 'gold') {
      status = 'premium';
    } else if (membershipLevel === 'silver') {
      status = Math.random() > 0.5 ? 'premium' : 'regular';
    } else if (membershipLevel === 'basic') {
      status = Math.random() > 0.7 ? 'regular' : 'new';
    }
    
    // Generate loyalty points based on membership level
    let loyaltyPoints;
    if (membershipLevel === 'platinum') {
      loyaltyPoints = randomNumber(5000, 15000);
    } else if (membershipLevel === 'gold') {
      loyaltyPoints = randomNumber(2000, 4999);
    } else if (membershipLevel === 'silver') {
      loyaltyPoints = randomNumber(1000, 1999);
    } else {
      loyaltyPoints = randomNumber(0, 999);
    }
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber(1, 999)}@example.com`;
    
    // Generate more varied registration dates
    const memberSince = randomPastDate(randomNumber(30, 1095)); // 30 days to 3 years ago
    
    // Vary last visit dates - some recent, some not
    let lastVisit = null;
    if (Math.random() > 0.1) { // 90% chance of having visited
      if (status === 'premium' || status === 'regular') {
        lastVisit = randomPastDate(30); // Within last month
      } else {
        lastVisit = randomPastDate(90); // Within last 3 months
      }
    }
    
    // Generate random total spent based on membership level
    let totalSpent;
    if (membershipLevel === 'platinum') {
      totalSpent = randomNumber(5000, 20000);
    } else if (membershipLevel === 'gold') {
      totalSpent = randomNumber(2000, 5000);
    } else if (membershipLevel === 'silver') {
      totalSpent = randomNumber(1000, 2000);
    } else {
      totalSpent = randomNumber(100, 1000);
    }
    
    // Create customer record
    const customer = {
      _id: customerId,
      firstName,
      lastName,
      email,
      password: "customer123", // Adding a default plain text password
      phone: `${randomNumber(100, 999)}-${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`,
      status,
      loyaltyPoints,
      vehicle: Math.random() > 0.2 ? vehicles[Math.floor(Math.random() * vehicles.length)] : null,
      address: `${randomNumber(100, 9999)} ${['Main', 'Oak', 'Maple', 'Cedar', 'Pine'][Math.floor(Math.random() * 5)]} ${['St', 'Rd', 'Ave', 'Blvd', 'Ln'][Math.floor(Math.random() * 5)]}, ${['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)]}, ${['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)]} ${randomNumber(10000, 99999)}`,
      lastVisit,
      memberSince,
      notes: Math.random() > 0.7 ? `Customer notes for ${firstName} ${lastName}` : null,
      customerType: customerTypes[Math.floor(Math.random() * customerTypes.length)],
      membershipLevel,
      totalSpent,
      purchaseHistory: [], // Will be populated in seedFuelPurchases
      preferredPaymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      fuelPreference: fuelPreferences[Math.floor(Math.random() * fuelPreferences.length)],
      createdAt: memberSince,
      updatedAt: new Date()
    };
    
    customerData.push(customer);
  }
  
  // Insert customer data
  const result = await collection.insertMany(customerData);
  console.log(`${result.insertedCount} customers inserted successfully`);
  
  return customerIds;
}

// Seed Fuel Purchases
async function seedFuelPurchases(db) {
  const collection = db.collection('fuelpurchases');
  
  // Clear existing data
  await collection.deleteMany({});
  console.log('Cleared existing fuel purchase data');
  
  // Get all customers
  const customers = await db.collection('customers').find({}).toArray();
  
  const fuelPurchaseData = [];
  const fuelTypes = ['regular', 'premium', 'diesel', 'e85'];
  const paymentMethods = ['cash', 'credit', 'debit', 'app', 'loyalty'];
  const stationLocations = ['Main Street Station', 'Highway 101 Station', 'Downtown Station', 'West Side Station', 'Airport Station'];
  
  // Generate purchase records for each customer
  for (const customer of customers) {
    // Generate between 1-20 purchases per customer, more for premium/regular
    const purchaseCount = customer.status === 'premium' ? randomNumber(10, 20) :
                          customer.status === 'regular' ? randomNumber(5, 15) :
                          randomNumber(1, 5);
    
    for (let i = 0; i < purchaseCount; i++) {
      const purchaseDate = randomPastDate(180); // Within last 6 months
      
      // Determine fuel type preference
      let fuelType;
      if (customer.fuelPreference) {
        fuelType = customer.fuelPreference;
      } else {
        fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];
      }
      
      // Determine payment method
      let paymentMethod;
      if (customer.preferredPaymentMethod) {
        paymentMethod = customer.preferredPaymentMethod;
      } else {
        paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      }
      
      const gallons = parseFloat((randomNumber(5, 20) + Math.random()).toFixed(2));
      
      const pricePerGallon = fuelType === 'regular' ? 3.499 :
                            fuelType === 'premium' ? 3.999 :
                            fuelType === 'diesel' ? 3.799 : 3.299;
                            
      const totalAmount = parseFloat((gallons * pricePerGallon).toFixed(2));
      
      // Calculate loyalty points (1 point per dollar spent, rounded)
      const loyaltyPointsEarned = Math.round(totalAmount);
      
      const purchase = {
        _id: createObjectId(),
        customerId: customer._id,
        date: purchaseDate,
        fuelType,
        gallons,
        pricePerGallon,
        totalAmount,
        paymentMethod,
        stationLocation: stationLocations[Math.floor(Math.random() * stationLocations.length)],
        loyaltyPointsEarned,
        transactionId: `TX-${Date.now()}-${randomNumber(10000, 99999)}`,
        receiptUrl: Math.random() > 0.5 ? `https://receipts.petropulse.com/${Date.now()}` : null,
        createdAt: purchaseDate,
        updatedAt: purchaseDate
      };
      
      fuelPurchaseData.push(purchase);
      
      // Update customer's purchase history array in memory
      const purchaseForHistory = {
        date: purchaseDate,
        items: [{
          name: `${fuelType.charAt(0).toUpperCase() + fuelType.slice(1)} Fuel`,
          price: pricePerGallon,
          quantity: gallons
        }],
        total: totalAmount
      };
      
      if (!customer.purchaseHistory) {
        customer.purchaseHistory = [];
      }
      
      customer.purchaseHistory.push(purchaseForHistory);
    }
  }
  
  // Insert purchase data
  const result = await collection.insertMany(fuelPurchaseData);
  console.log(`${result.insertedCount} fuel purchases inserted successfully`);
  
  // Update customers with purchase history
  for (const customer of customers) {
    if (customer.purchaseHistory && customer.purchaseHistory.length > 0) {
      // Sort purchases by date, newest first
      customer.purchaseHistory.sort((a, b) => b.date - a.date);
      
      // Update customer record
      await db.collection('customers').updateOne(
        { _id: customer._id },
        { $set: { purchaseHistory: customer.purchaseHistory } }
      );
    }
  }
  
  console.log(`Updated ${customers.length} customers with purchase history`);
}

// Seed Loyalty Transactions
async function seedLoyaltyTransactions(db) {
  const collection = db.collection('loyaltytransactions');
  
  // Clear existing data
  await collection.deleteMany({});
  console.log('Cleared existing loyalty transaction data');
  
  // Get all customers and purchases
  const customers = await db.collection('customers').find({}).toArray();
  const fuelPurchases = await db.collection('fuelpurchases').find({}).toArray();
  
  const loyaltyTransactionData = [];
  const transactionTypes = ['earn', 'redeem', 'adjust', 'expire'];
  const sources = ['purchase', 'promotion', 'referral', 'admin', 'expiration', 'reward'];
  
  // Group purchases by customer
  const purchasesByCustomer = {};
  for (const purchase of fuelPurchases) {
    const customerId = purchase.customerId.toString();
    if (!purchasesByCustomer[customerId]) {
      purchasesByCustomer[customerId] = [];
    }
    purchasesByCustomer[customerId].push(purchase);
  }
  
  // Generate loyalty transactions for each customer
  for (const customer of customers) {
    const customerId = customer._id.toString();
    const customerPurchases = purchasesByCustomer[customerId] || [];
    
    // Start with 0 balance
    let pointsBalance = 0;
    
    // Create transactions based on purchases (earn points)
    for (const purchase of customerPurchases) {
      const earnPoints = purchase.loyaltyPointsEarned;
      pointsBalance += earnPoints;
      
      const transaction = {
        _id: createObjectId(),
        customerId: customer._id,
        date: purchase.date,
        type: 'earn',
        points: earnPoints,
        source: 'purchase',
        description: `Earned points for fuel purchase (${purchase.gallons.toFixed(2)} gallons of ${purchase.fuelType})`,
        relatedPurchaseId: purchase._id,
        balance: pointsBalance,
        createdAt: purchase.date,
        updatedAt: purchase.date
      };
      
      loyaltyTransactionData.push(transaction);
    }
    
    // Add random transactions (promotions, redemptions, etc.)
    // More transactions for premium customers
    const additionalTransactionCount = 
      customer.status === 'premium' ? randomNumber(3, 10) :
      customer.status === 'regular' ? randomNumber(1, 5) :
      randomNumber(0, 2);
    
    for (let i = 0; i < additionalTransactionCount; i++) {
      const transactionDate = randomPastDate(90); // Within last 3 months
      
      // Random transaction type weighted - mostly earn, some redemptions
      const typeRandom = Math.random();
      let type, points, source, description;
      
      if (typeRandom < 0.6) { // 60% chance of earn
        type = 'earn';
        points = randomNumber(10, 100);
        source = sources[Math.floor(Math.random() * 3)]; // purchase, promotion, referral
        description = source === 'purchase' ? 'Earned points from in-store purchase' :
                     source === 'promotion' ? 'Earned points from special promotion' : 
                     'Earned points from customer referral';
      } else if (typeRandom < 0.9 && pointsBalance >= 100) { // 30% chance of redeem if enough points
        type = 'redeem';
        points = -Math.min(pointsBalance, randomNumber(100, 500));
        source = 'reward';
        description = `Redeemed points for ${Math.abs(points) >= 500 ? 'free fuel' : 
                      Math.abs(points) >= 200 ? 'discount' : 'store merchandise'}`;
      } else { // 10% chance of adjust/expire
        type = Math.random() > 0.5 ? 'adjust' : 'expire';
        points = type === 'adjust' ? randomNumber(-50, 50) : -Math.min(pointsBalance, randomNumber(10, 100));
        source = type === 'adjust' ? 'admin' : 'expiration';
        description = type === 'adjust' ? 'Points adjusted by administrator' : 'Points expired';
      }
      
      // Update balance
      pointsBalance += points;
      if (pointsBalance < 0) pointsBalance = 0; // Ensure balance doesn't go negative
      
      const transaction = {
        _id: createObjectId(),
        customerId: customer._id,
        date: transactionDate,
        type,
        points,
        source,
        description,
        balance: pointsBalance,
        createdAt: transactionDate,
        updatedAt: transactionDate
      };
      
      loyaltyTransactionData.push(transaction);
    }
    
    // Ensure final loyalty balance matches customer record
    if (pointsBalance !== customer.loyaltyPoints) {
      // Add adjustment to match
      const adjustmentPoints = customer.loyaltyPoints - pointsBalance;
      const adjustmentDate = new Date(); // Today
      
      const adjustmentTransaction = {
        _id: createObjectId(),
        customerId: customer._id,
        date: adjustmentDate,
        type: 'adjust',
        points: adjustmentPoints,
        source: 'admin',
        description: 'System balance adjustment',
        balance: customer.loyaltyPoints,
        createdAt: adjustmentDate,
        updatedAt: adjustmentDate
      };
      
      loyaltyTransactionData.push(adjustmentTransaction);
    }
  }
  
  // Sort all transactions by date
  loyaltyTransactionData.sort((a, b) => a.date - b.date);
  
  // Insert loyalty transaction data
  const result = await collection.insertMany(loyaltyTransactionData);
  console.log(`${result.insertedCount} loyalty transactions inserted successfully`);
}

// Run the seed function
seedAllCustomers().catch(console.error); 