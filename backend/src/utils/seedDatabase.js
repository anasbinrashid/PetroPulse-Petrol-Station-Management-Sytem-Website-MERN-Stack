const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");

async function seedDatabase() {
  const uri = "mongodb+srv://malikbruh102:waT0fau9iouoSn1p@cluster0.qz9wewf.mongodb.net/petropulse?retryWrites=true&w=majority"; // Replace with your MongoDB connection string
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    // Reference to our database
    const db = client.db("petropulse");

    // 1. Seed Admin collection
    await seedAdmins(db);
    
    // 2. Seed Reports collection
    await seedReports(db);
    
    // 3. Seed Financial data
    await seedRevenue(db);
    await seedExpenses(db);
    
    // 4. Seed Maintenance data
    await seedMaintenance(db);
    
    // 5. Seed Employees and Attendance data
    const employeeIds = await seedEmployees(db);
    await seedAttendance(db, employeeIds);
    
    // 6. Seed Customers data
    const customerIds = await seedCustomers(db);
    
    // 7. Seed Inventory data
    await seedFuelInventory(db);
    const productIds = await seedProducts(db);
    
    // 8. Seed Sales data
    await seedSales(db, customerIds, employeeIds, productIds);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

// Helper to generate random date in the last 30 days
function randomRecentDate() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
  return new Date(thirtyDaysAgo.getTime() + Math.random() * (today.getTime() - thirtyDaysAgo.getTime()));
}

// Helper to generate a random number between min and max
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to create ObjectIds
function createObjectId() {
  return new mongoose.Types.ObjectId();
}

async function seedAdmins(db) {
  const collection = db.collection("admins");
  
  // Clear existing data
  await collection.deleteMany({});
  
  const adminData = {
    name: "Admin User",
    email: "admin@petropulse.com",
    password: "admin123", // Plain text password
    role: "admin",
    phone: "555-123-4567",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    lastLogin: new Date(),
    settings: {
      notificationsEnabled: true,
      twoFactorAuth: false,
      theme: "light",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await collection.insertOne(adminData);
  console.log(`${result.insertedCount} admin inserted with ID: ${result.insertedId}`);
  return result.insertedId;
}

async function seedReports(db) {
  const collection = db.collection("reports");
  
  // Clear existing data
  await collection.deleteMany({});
  
  const adminId = (await db.collection("admins").findOne({}))._id;

    const dummyReports = [
      {
        title: "Financial Overview",
        category: "financial",
        description: "A summary of financial performance.",
        lastGenerated: new Date(),
      createdBy: adminId,
      data: { revenue: 100000, expenses: 50000, profit: 50000, growthRate: 15 },
      insights: ["Revenue increased by 15% compared to last month", "Expenses reduced by 5%"],
      isPublished: true,
      scheduleFrequency: "monthly",
      createdAt: new Date(),
      updatedAt: new Date(),
      },
      {
        title: "Inventory Status",
        category: "inventory",
        description: "Current inventory levels and stock details.",
        lastGenerated: new Date(),
      createdBy: adminId,
      data: { itemsInStock: 1500, itemsOutOfStock: 50, ordersPending: 20 },
      insights: ["Fuel levels are optimal", "5 products need reordering"],
      isPublished: true,
      scheduleFrequency: "weekly",
      createdAt: new Date(),
      updatedAt: new Date(),
      },
      {
        title: "Personnel Report",
        category: "personnel",
        description: "Employee performance and attendance.",
        lastGenerated: new Date(),
      createdBy: adminId,
      data: { totalEmployees: 20, activeEmployees: 18, onLeave: 2, performance: 92 },
      insights: ["Overall attendance improved by 3%", "Two new hires this month"],
      isPublished: true,
      scheduleFrequency: "monthly",
      createdAt: new Date(),
      updatedAt: new Date(),
      },
      {
        title: "Marketing Campaigns",
        category: "marketing",
        description: "Performance of recent marketing campaigns.",
        lastGenerated: new Date(),
      createdBy: adminId,
      data: { campaigns: 5, leadsGenerated: 300, conversionRate: 15, roi: 250 },
      insights: ["Loyalty program sign-ups increased by 25%", "Social media campaign outperformed expectations"],
      isPublished: true,
      scheduleFrequency: "quarterly",
      createdAt: new Date(),
      updatedAt: new Date(),
      },
      {
        title: "Operational Efficiency",
        category: "operations",
        description: "Metrics on operational performance.",
        lastGenerated: new Date(),
      createdBy: adminId,
      data: { efficiency: 85, downtime: 5, costPerTransaction: 1.25 },
      insights: ["Pumping system efficiency improved after maintenance", "New POS system reduced transaction time by 15%"],
      isPublished: true,
      scheduleFrequency: "weekly",
      createdAt: new Date(),
      updatedAt: new Date(),
      },
      {
        title: "Sales Report",
        category: "financial",
        description: "Detailed sales data for the last quarter.",
        lastGenerated: new Date(),
      createdBy: adminId,
      data: { totalSales: 50000, fuelSales: 35000, productSales: 15000, topProducts: ["Premium Fuel", "Energy Drinks", "Cigarettes"] },
      insights: ["Premium fuel sales up 10%", "Convenience store sales increased during evening hours"],
      isPublished: true,
      scheduleFrequency: "monthly",
      createdAt: new Date(),
      updatedAt: new Date(),
      },
      {
        title: "Customer Feedback",
        category: "marketing",
        description: "Analysis of customer feedback and reviews.",
        lastGenerated: new Date(),
      createdBy: adminId,
      data: { positiveFeedback: 90, negativeFeedback: 10, averageRating: 4.2 },
      insights: ["Cleanliness received highest praise", "Wait times received some complaints"],
      isPublished: true,
      scheduleFrequency: "monthly",
      createdAt: new Date(),
      updatedAt: new Date(),
      },
      {
        title: "Supply Chain Report",
        category: "operations",
        description: "Details on supply chain performance.",
        lastGenerated: new Date(),
      createdBy: adminId,
      data: { deliveriesOnTime: 95, delays: 5, supplierPerformance: 92 },
      insights: ["Main fuel supplier reliability at 98%", "One delivery delay due to weather"],
      isPublished: true,
      scheduleFrequency: "monthly",
      createdAt: new Date(),
      updatedAt: new Date(),
      },
      {
        title: "Budget Allocation",
        category: "financial",
        description: "Overview of budget allocation and usage.",
        lastGenerated: new Date(),
      createdBy: adminId,
      data: { allocated: 100000, used: 75000, remaining: 25000, categories: { operations: 40000, marketing: 15000, maintenance: 20000 } },
      insights: ["Under budget by 5% this quarter", "Marketing expenses returned 3x investment"],
      isPublished: true,
      scheduleFrequency: "quarterly",
      createdAt: new Date(),
      updatedAt: new Date(),
      },
      {
        title: "Training Programs",
        category: "personnel",
        description: "Details of employee training programs.",
        lastGenerated: new Date(),
      createdBy: adminId,
      data: { programs: 3, participants: 15, completionRate: 95, satisfactionScore: 4.5 },
      insights: ["Safety training completion at 100%", "Customer service skills improved by 20%"],
      isPublished: true,
      scheduleFrequency: "quarterly",
      createdAt: new Date(),
      updatedAt: new Date(),
      },
    ];

    const result = await collection.insertMany(dummyReports);
    console.log(`${result.insertedCount} reports inserted successfully.`);
}

async function seedRevenue(db) {
  const collection = db.collection("revenues");
  
  // Clear existing data
  await collection.deleteMany({});
  
  const adminId = (await db.collection("admins").findOne({}))._id;
  
  const revenueData = [];
  
  const sources = ['fuel', 'shop', 'services', 'loyalty', 'other'];
  const categories = ['fuel_sales', 'merchandise', 'services', 'promotions', 'other'];
  const paymentMethods = ['cash', 'credit_card', 'debit_card', 'mobile', 'check', 'bank_transfer'];
  
  // Generate 10 revenue entries
  for (let i = 0; i < 10; i++) {
    const date = randomRecentDate();
    const source = sources[Math.floor(Math.random() * sources.length)];
    const category = source === 'fuel' ? 'fuel_sales' : categories[Math.floor(Math.random() * categories.length)];
    const amount = source === 'fuel' ? randomNumber(1000, 5000) : randomNumber(100, 1000);
    
    revenueData.push({
      date,
      source,
      amount,
      category,
      description: `Revenue from ${source} - ${date.toLocaleDateString()}`,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      recordedBy: adminId,
      transactionId: `REV-${Date.now()}-${i}`,
      isReconciled: Math.random() > 0.3, // 70% reconciled
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  const result = await collection.insertMany(revenueData);
  console.log(`${result.insertedCount} revenue records inserted successfully.`);
}

async function seedExpenses(db) {
  const collection = db.collection("expenses");
  
  // Clear existing data
  await collection.deleteMany({});
  
  const adminId = (await db.collection("admins").findOne({}))._id;
  
  const expenseData = [];
  
  const vendors = ['Fuel Supplier Inc.', 'Snack Distributors', 'Maintenance Services Co.', 'Utility Company', 'Marketing Agency'];
  const categories = ['fuel_purchase', 'inventory', 'utility', 'salary', 'maintenance', 'rent', 'marketing', 'taxes', 'insurance', 'other'];
  const paymentMethods = ['cash', 'credit_card', 'debit_card', 'check', 'bank_transfer'];
  
  // Generate 10 expense entries
  for (let i = 0; i < 10; i++) {
    const date = randomRecentDate();
    const category = categories[Math.floor(Math.random() * categories.length)];
    const vendor = category === 'fuel_purchase' ? 'Fuel Supplier Inc.' : vendors[Math.floor(Math.random() * vendors.length)];
    const amount = category === 'fuel_purchase' ? randomNumber(5000, 20000) : randomNumber(100, 3000);
    
    expenseData.push({
      date,
      vendor,
      amount,
      category,
      description: `Payment to ${vendor} for ${category} - ${date.toLocaleDateString()}`,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      recordedBy: adminId,
      invoiceNumber: `INV-${Date.now().toString().substring(7)}-${i}`,
      receiptNumber: `REC-${Date.now().toString().substring(7)}-${i}`,
      isReconciled: Math.random() > 0.2, // 80% reconciled
      isPaid: Math.random() > 0.1, // 90% paid
      dueDate: new Date(date.getTime() + (15 * 24 * 60 * 60 * 1000)), // Due in 15 days
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  const result = await collection.insertMany(expenseData);
  console.log(`${result.insertedCount} expense records inserted successfully.`);
}

async function seedMaintenance(db) {
  const collection = db.collection("maintenances");
  
  // Clear existing data
  await collection.deleteMany({});
  
  const adminId = (await db.collection("admins").findOne({}))._id;
  
  const maintenanceData = [];
  
  const titles = [
    'Fuel Pump #1 Maintenance', 
    'Store AC Repair', 
    'Lighting Replacement', 
    'Security Camera Installation', 
    'POS System Update',
    'Bathroom Renovation',
    'Parking Lot Repair',
    'Tank Inspection',
    'Fire Safety Equipment Check',
    'Air Compressor Maintenance'
  ];
  
  const statuses = ['pending', 'in_progress', 'completed', 'cancelled', 'deferred'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const categories = ['equipment', 'facility', 'vehicle', 'it_systems', 'safety', 'cleaning', 'calibration', 'inspection', 'other'];
  
  // Generate 10 maintenance tasks
  for (let i = 0; i < 10; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const dueDate = new Date(Date.now() + randomNumber(1, 30) * 24 * 60 * 60 * 1000); // Due in 1-30 days
    const completedDate = status === 'completed' ? randomRecentDate() : null;
    const estimatedCost = randomNumber(100, 5000);
    const actualCost = status === 'completed' ? estimatedCost + randomNumber(-500, 500) : null;

    maintenanceData.push({
      title: titles[i],
      description: `Detailed description for ${titles[i]}. This task requires attention and should be completed by the due date.`,
      status,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      createdBy: adminId,
      dueDate,
      completedDate,
      estimatedCost,
      actualCost,
      notes: [`Initial assessment on ${new Date().toLocaleDateString()}`, `Follow-up scheduled`],
      vendorInfo: {
        name: 'ServicePro Maintenance',
        contact: '555-987-6543',
        email: 'service@servicepro.example'
      },
      equipment: 'Various equipment',
      location: 'Main Station',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  const result = await collection.insertMany(maintenanceData);
  console.log(`${result.insertedCount} maintenance records inserted successfully.`);
}

async function seedEmployees(db) {
  const collection = db.collection("employees");
  
  // Clear existing data
  await collection.deleteMany({});
  
  const employeeData = [];
  const employeeIds = [];
  
  const positions = ['Manager', 'Cashier', 'Fuel Attendant', 'Maintenance', 'Security', 'Stock Clerk'];
  const departments = ['management', 'cashier', 'fuel_attendant', 'maintenance', 'security', 'stock'];
  
  // Generate 10 employees
  for (let i = 0; i < 10; i++) {
    const empId = createObjectId();
    employeeIds.push(empId);
    
    const position = positions[Math.floor(Math.random() * positions.length)];
    const department = departments[positions.indexOf(position)];
    const salary = position === 'Manager' ? randomNumber(50000, 70000) : randomNumber(25000, 45000);
    
    employeeData.push({
      _id: empId,
      firstName: `Employee${i + 1}`,
      lastName: `LastName${i + 1}`,
      email: `employee${i + 1}@petropulse.com`,
      password: "password123", // Plain text password
      phone: `555-${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`,
      position,
      department,
      employeeId: `EMP-${1000 + i}`,
      hireDate: new Date(Date.now() - randomNumber(30, 1000) * 24 * 60 * 60 * 1000), // Hired between 30-1000 days ago
      salary,
      status: Math.random() > 0.2 ? 'active' : 'on_leave', // 80% active
      emergencyContact: {
        name: `Contact${i + 1}`,
        relationship: 'Family',
        phone: `555-${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`,
      },
      address: {
        street: `${randomNumber(100, 999)} Main St`,
        city: 'Anytown',
        state: 'CA',
        zipCode: `9${randomNumber(1000, 9999)}`,
        country: 'United States',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  const result = await collection.insertMany(employeeData);
  console.log(`${result.insertedCount} employees inserted successfully.`);
  return employeeIds;
}

async function seedAttendance(db, employeeIds) {
  const collection = db.collection("attendances");
  
  // Clear existing data
  await collection.deleteMany({});
  
  const attendanceData = [];
  const adminId = (await db.collection("admins").findOne({}))._id;
  
  // Generate attendance records for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0); // Start of day
    
    // For each employee
    for (const empId of employeeIds) {
      // Skip weekends for some employees
      if ((date.getDay() === 0 || date.getDay() === 6) && Math.random() > 0.3) continue;
      
      const clockInTime = new Date(date);
      clockInTime.setHours(8 + randomNumber(0, 1), randomNumber(0, 59), 0, 0);
      
      const clockOutTime = new Date(date);
      clockOutTime.setHours(17 + randomNumber(0, 1), randomNumber(0, 59), 0, 0);
      
      const diffMs = clockOutTime.getTime() - clockInTime.getTime();
      const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
      
      attendanceData.push({
        employee: empId,
        date: new Date(date),
        clockInTime,
        clockOutTime,
        totalHours,
        status: Math.random() > 0.1 ? 'present' : (Math.random() > 0.5 ? 'late' : 'half_day'),
        notes: 'Regular shift',
        approvedBy: adminId,
        location: {
          name: 'Main Station',
          coordinates: [-122.4194, 37.7749],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
  
  const result = await collection.insertMany(attendanceData);
  console.log(`${result.insertedCount} attendance records inserted successfully.`);
}

async function seedCustomers(db) {
  const collection = db.collection("customers");
  
  // Clear existing data
  await collection.deleteMany({});
  
  const customerData = [];
  const customerIds = [];
  
  const membershipLevels = ['bronze', 'silver', 'gold', 'platinum', 'bronze'];
  const customerTypes = ['individual', 'business', 'fleet', 'individual', 'individual'];
  
  // Generate 10 customers
  for (let i = 0; i < 10; i++) {
    const custId = createObjectId();
    customerIds.push(custId);
    
    const membershipLevel = membershipLevels[Math.floor(Math.random() * membershipLevels.length)];
    const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)];
    const loyaltyPoints = membershipLevel === 'bronze' ? randomNumber(0, 500) : 
                         membershipLevel === 'silver' ? randomNumber(501, 2000) :
                         membershipLevel === 'gold' ? randomNumber(2001, 5000) : randomNumber(5001, 10000);
    
    customerData.push({
      _id: custId,
      firstName: `Customer${i + 1}`,
      lastName: `LastName${i + 1}`,
      email: `customer${i + 1}@example.com`,
      password: "customer123", // Plain text password
      phone: `555-${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`,
      customerType,
      loyaltyPoints,
      membershipLevel,
      registrationDate: new Date(Date.now() - randomNumber(1, 365) * 24 * 60 * 60 * 1000),
      lastVisit: randomRecentDate(),
      totalSpent: randomNumber(100, 5000),
      address: {
        street: `${randomNumber(100, 999)} Oak St`,
        city: 'Anytown',
        state: 'CA',
        zipCode: `9${randomNumber(1000, 9999)}`,
        country: 'United States',
      },
      preferences: {
        fuelType: ['regular', 'premium', 'diesel'][Math.floor(Math.random() * 3)],
        preferredPayment: ['cash', 'card', 'mobile'][Math.floor(Math.random() * 3)],
        receivePromotions: Math.random() > 0.3,
        contactMethod: ['email', 'sms', 'both'][Math.floor(Math.random() * 3)],
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  const result = await collection.insertMany(customerData);
  console.log(`${result.insertedCount} customers inserted successfully.`);
  return customerIds;
}

async function seedFuelInventory(db) {
  const collection = db.collection("fuelinventories");
  
  // Clear existing data
  await collection.deleteMany({});
  
  const fuelTypes = ['regular', 'premium', 'diesel', 'e85'];
  const fuelData = [];
  
  // Create a record for each fuel type
  for (let i = 0; i < fuelTypes.length; i++) {
    const capacity = randomNumber(10000, 20000);
    const currentLevel = randomNumber(capacity * 0.3, capacity * 0.9);
    const reorderLevel = capacity * 0.3;
    
    fuelData.push({
      fuelType: fuelTypes[i],
      currentLevel,
      capacity,
      pricePerGallon: fuelTypes[i] === 'regular' ? 3.499 : 
                      fuelTypes[i] === 'premium' ? 3.999 :
                      fuelTypes[i] === 'diesel' ? 3.799 : 3.299,
      costPerGallon: fuelTypes[i] === 'regular' ? 2.80 : 
                    fuelTypes[i] === 'premium' ? 3.25 :
                    fuelTypes[i] === 'diesel' ? 3.00 : 2.60,
      supplier: 'Fuel Distributor Inc.',
      tankNumber: `TANK-${100 + i}`,
      lastRefillDate: randomRecentDate(),
      lastRefillAmount: randomNumber(5000, 10000),
      reorderLevel,
      status: currentLevel < reorderLevel ? 'low' : 'available',
      location: 'Main Station',
      notes: `Regular maintenance performed on ${new Date().toLocaleDateString()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  const result = await collection.insertMany(fuelData);
  console.log(`${result.insertedCount} fuel inventory records inserted successfully.`);
}

async function seedProducts(db) {
  const collection = db.collection("products");
  
  // Clear existing data
  await collection.deleteMany({});
  
  const productData = [];
  const productIds = [];
  
  const categories = ['food', 'beverage', 'tobacco', 'automotive', 'household', 'personal_care', 'electronics', 'other'];
  const products = [
    { name: 'Energy Drink', category: 'beverage', price: 3.99, cost: 1.99 },
    { name: 'Potato Chips', category: 'food', price: 2.49, cost: 1.20 },
    { name: 'Cigarettes', category: 'tobacco', price: 8.99, cost: 6.50 },
    { name: 'Motor Oil', category: 'automotive', price: 12.99, cost: 8.50 },
    { name: 'Wiper Fluid', category: 'automotive', price: 4.99, cost: 2.25 },
    { name: 'Air Freshener', category: 'household', price: 2.99, cost: 1.50 },
    { name: 'Hand Sanitizer', category: 'personal_care', price: 3.49, cost: 1.20 },
    { name: 'Candy Bar', category: 'food', price: 1.49, cost: 0.80 },
    { name: 'Soda', category: 'beverage', price: 1.99, cost: 0.90 },
    { name: 'USB Cable', category: 'electronics', price: 9.99, cost: 4.50 }
  ];
  
  for (let i = 0; i < products.length; i++) {
    const prodId = createObjectId();
    productIds.push(prodId);
    const product = products[i];
    const quantity = randomNumber(10, 100);
    const reorderLevel = 15;
    
    productData.push({
      _id: prodId,
      name: product.name,
      sku: `SKU-${1000 + i}`,
      category: product.category,
      description: `Description for ${product.name}`,
      price: product.price,
      cost: product.cost,
      quantity,
      supplier: 'General Distributors Inc.',
      barcode: `BAR-${90000000 + i}`,
      reorderLevel,
      location: 'Main Store',
      isActive: true,
      tags: [product.category, 'in-store'],
      specifications: { weight: `${randomNumber(1, 10)} oz`, dimensions: '5x5x2 inches' },
      discountPercentage: Math.random() > 0.8 ? randomNumber(5, 20) : 0, // 20% chance of discount
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  const result = await collection.insertMany(productData);
  console.log(`${result.insertedCount} products inserted successfully.`);
  return productIds;
}

async function seedSales(db, customerIds, employeeIds, productIds) {
  const collection = db.collection("sales");
  
  // Clear existing data
  await collection.deleteMany({});
  
  const salesData = [];
  const paymentMethods = ['cash', 'credit_card', 'debit_card', 'mobile_payment'];
  
  // Get fuel inventory for reference
  const fuelInventory = await db.collection("fuelinventories").find({}).toArray();
  
  // Generate 10 sales
  for (let i = 0; i < 10; i++) {
    const date = randomRecentDate();
    const customer = customerIds[Math.floor(Math.random() * customerIds.length)];
    const employee = employeeIds[Math.floor(Math.random() * employeeIds.length)];
    
    // Decide if this is a fuel sale, product sale, or both
    const includesFuel = Math.random() > 0.3; // 70% chance of fuel purchase
    const includesProducts = Math.random() > 0.2; // 80% chance of product purchase
    
    const items = [];
    let subtotal = 0;
    
    // Add fuel purchase
    if (includesFuel) {
      const fuelItem = fuelInventory[Math.floor(Math.random() * fuelInventory.length)];
      const gallons = parseFloat((randomNumber(5, 20) + Math.random()).toFixed(2));
      const unitPrice = fuelItem.pricePerGallon;
      const fuelTotal = parseFloat((gallons * unitPrice).toFixed(2));
      
      subtotal += fuelTotal;
      items.push({
        product: fuelItem._id,
        productName: `${fuelItem.fuelType.charAt(0).toUpperCase() + fuelItem.fuelType.slice(1)} Fuel`,
        quantity: gallons,
        unitPrice,
        total: fuelTotal,
        type: 'FuelInventory'
      });
    }
    
    // Add product purchases
    if (includesProducts) {
      const numProducts = randomNumber(1, 4);
      const selectedProducts = [];
      
      // Select random products, avoiding duplicates
      while (selectedProducts.length < numProducts && selectedProducts.length < productIds.length) {
        const randomProduct = productIds[Math.floor(Math.random() * productIds.length)];
        if (!selectedProducts.includes(randomProduct)) {
          selectedProducts.push(randomProduct);
        }
      }
      
      // Get details of selected products
      const productDetails = await db.collection("products").find({ _id: { $in: selectedProducts } }).toArray();
      
      for (const product of productDetails) {
        const quantity = randomNumber(1, 3);
        const productTotal = parseFloat((product.price * quantity).toFixed(2));
        
        subtotal += productTotal;
        items.push({
          product: product._id,
          productName: product.name,
          quantity,
          unitPrice: product.price,
          total: productTotal,
          type: 'Product'
        });
      }
    }
    
    const tax = parseFloat((subtotal * 0.0725).toFixed(2)); // 7.25% tax
    const discount = Math.random() > 0.8 ? parseFloat((subtotal * 0.05).toFixed(2)) : 0; // 20% chance of 5% discount
    const total = parseFloat((subtotal + tax - discount).toFixed(2));
    
    const saleDate = new Date();
    const yearStr = saleDate.getFullYear().toString().slice(-2);
    const monthStr = (saleDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = saleDate.getDate().toString().padStart(2, '0');
    const saleId = `${yearStr}${monthStr}${dayStr}-${(i + 1).toString().padStart(4, '0')}`;
    
    salesData.push({
      saleId,
      date,
      customer,
      employee,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentStatus: 'paid',
      loyaltyPointsEarned: Math.floor(total),
      transactionType: 'purchase',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  const result = await collection.insertMany(salesData);
  console.log(`${result.insertedCount} sales records inserted successfully.`);
}

seedDatabase();