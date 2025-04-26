const mongoose = require('mongoose');
require('dotenv').config();

// Log connection information for debugging
const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/petropulse';
console.log(`Attempting to connect to MongoDB with connection string: ${connectionString}`);

// Connect to MongoDB with explicit options
mongoose.connect(connectionString, {
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected for seeding...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define the Transaction model schema to match your existing model
const transactionSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      required: true,
      enum: ['fuel', 'product', 'service'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    items: [
      {
        itemType: {
          type: String,
          required: true,
          enum: ['fuel', 'product'],
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'paid',
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
    },
    loyaltyPointsRedeemed: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

// Generate a random ObjectId
const generateObjectId = () => new mongoose.Types.ObjectId();

// Generate random date within last 30 days
const getRandomDate = (daysBack = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
};

// Sample payment methods
const paymentMethods = ['Credit Card', 'Debit Card', 'Cash', 'Mobile Pay'];

// Sample products with IDs
const products = [
  { id: generateObjectId(), name: 'Coffee', price: 2.99 },
  { id: generateObjectId(), name: 'Snack Bar', price: 1.49 },
  { id: generateObjectId(), name: 'Bottled Water', price: 1.99 },
  { id: generateObjectId(), name: 'Chips', price: 3.49 },
  { id: generateObjectId(), name: 'Candy', price: 1.29 },
];

// Sample fuel types
const fuelTypes = [
  { id: generateObjectId(), type: 'Regular', price: 3.59 },
  { id: generateObjectId(), type: 'Premium', price: 3.99 },
  { id: generateObjectId(), type: 'Diesel', price: 3.79 },
];

// Generate sample transactions
const generateTransactions = (count) => {
  const transactions = [];
  
  // Generate some fuel transactions
  for (let i = 0; i < Math.floor(count * 0.6); i++) {
    const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];
    const quantity = parseFloat((5 + Math.random() * 15).toFixed(2)); // 5-20 gallons
    const unitPrice = fuelType.price;
    const total = parseFloat((quantity * unitPrice).toFixed(2));
    const subtotal = parseFloat((total / 1.06).toFixed(2)); // Assuming 6% tax
    const tax = parseFloat((total - subtotal).toFixed(2));
    
    transactions.push({
      transactionType: 'fuel',
      customerId: generateObjectId(),
      employeeId: generateObjectId(),
      date: getRandomDate(),
      items: [
        {
          itemType: 'fuel',
          itemId: fuelType.id,
          quantity,
          unitPrice,
          total,
        }
      ],
      subtotal,
      tax,
      total,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentStatus: 'paid',
      loyaltyPointsEarned: Math.floor(total * 10), // 10 points per dollar
      loyaltyPointsRedeemed: 0,
      notes: `${quantity} gallons of ${fuelType.type} fuel`,
    });
  }
  
  // Generate some product transactions
  for (let i = 0; i < Math.floor(count * 0.3); i++) {
    const numItems = 1 + Math.floor(Math.random() * 3); // 1-3 items
    const items = [];
    let subtotal = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = 1 + Math.floor(Math.random() * 2); // 1-2 quantity
      const itemTotal = parseFloat((product.price * quantity).toFixed(2));
      subtotal += itemTotal;
      
      items.push({
        itemType: 'product',
        itemId: product.id,
        quantity,
        unitPrice: product.price,
        total: itemTotal,
      });
    }
    
    const tax = parseFloat((subtotal * 0.06).toFixed(2)); // 6% tax
    const total = parseFloat((subtotal + tax).toFixed(2));
    
    transactions.push({
      transactionType: 'product',
      customerId: generateObjectId(),
      employeeId: generateObjectId(),
      date: getRandomDate(),
      items,
      subtotal,
      tax,
      total,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentStatus: 'paid',
      loyaltyPointsEarned: Math.floor(total * 5), // 5 points per dollar for products
      loyaltyPointsRedeemed: 0,
    });
  }
  
  // Generate some service transactions
  for (let i = 0; i < Math.floor(count * 0.1); i++) {
    const servicePrice = parseFloat((20 + Math.random() * 80).toFixed(2)); // $20-$100 service
    const subtotal = servicePrice;
    const tax = parseFloat((subtotal * 0.06).toFixed(2)); // 6% tax
    const total = parseFloat((subtotal + tax).toFixed(2));
    
    transactions.push({
      transactionType: 'service',
      customerId: generateObjectId(),
      employeeId: generateObjectId(),
      date: getRandomDate(),
      items: [
        {
          itemType: 'product', // Services are tracked as products in this schema
          itemId: generateObjectId(),
          quantity: 1,
          unitPrice: servicePrice,
          total: servicePrice,
        }
      ],
      subtotal,
      tax,
      total,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentStatus: Math.random() > 0.9 ? 'pending' : 'paid', // 90% paid, 10% pending
      loyaltyPointsEarned: Math.floor(total * 2), // 2 points per dollar for services
      loyaltyPointsRedeemed: 0,
      notes: 'Service transaction',
    });
  }
  
  return transactions;
};

// Seed data
const seedDatabase = async () => {
  try {
    // Delete existing data first
    await Transaction.deleteMany({});
    console.log('Existing transactions deleted');
    
    // Generate and insert sample transactions
    const sampleTransactions = generateTransactions(50); // Generate 50 sample transactions
    const result = await Transaction.insertMany(sampleTransactions);
    
    console.log(`${result.length} sample transactions added to the database`);
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase(); 