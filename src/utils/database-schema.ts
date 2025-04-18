
/**
 * Database Schema Definition for PetroPulse
 * 
 * This file outlines the database schema design for the PetroPulse application.
 * It represents collections/tables and their relationships for MongoDB implementation.
 */

export const DatabaseSchema = {
  // USERS RELATED COLLECTIONS
  users: {
    _id: "ObjectId",
    email: "String (unique, indexed)",
    passwordHash: "String",
    userType: "String (enum: 'admin', 'employee', 'customer')",
    createdAt: "Date",
    updatedAt: "Date",
    lastLogin: "Date"
  },
  
  admins: {
    _id: "ObjectId",
    userId: "ObjectId (ref: users)",
    name: "String",
    phone: "String",
    role: "String",
    permissions: "Array<String>",
  },
  
  employees: {
    _id: "ObjectId",
    userId: "ObjectId (ref: users)",
    name: "String",
    role: "String (e.g., 'Station Manager', 'Cashier', etc.)",
    phone: "String",
    address: "String",
    hireDate: "Date",
    status: "String (enum: 'Active', 'On Leave', 'Inactive')",
    shifts: "String (enum: 'Morning', 'Day', 'Evening', 'Night')",
    emergencyContact: {
      name: "String",
      phone: "String",
      relationship: "String"
    },
    salary: {
      baseAmount: "Number",
      currency: "String",
      paymentFrequency: "String"
    },
    documents: "Array<Object>"
  },
  
  customers: {
    _id: "ObjectId",
    userId: "ObjectId (ref: users)",
    name: "String",
    phone: "String",
    email: "String",
    address: "String",
    memberSince: "Date",
    status: "String (enum: 'Regular', 'Premium', 'New')",
    loyaltyPoints: "Number",
    vehicles: "Array<Object>",
    paymentMethods: "Array<Object>",
    preferences: "Object"
  },
  
  // INVENTORY RELATED COLLECTIONS
  fuelInventory: {
    _id: "ObjectId",
    fuelType: "String",
    currentLevel: "Number",
    capacity: "Number",
    pricePerGallon: "Number",
    supplier: "String",
    lastDelivery: "Date",
    lastUpdated: "Date",
    minimumLevel: "Number",
    stationId: "ObjectId (ref: stations)",
    tankNumber: "Number"
  },
  
  products: {
    _id: "ObjectId",
    name: "String",
    category: "String",
    stock: "Number",
    price: "Number",
    cost: "Number",
    supplier: "String",
    barcode: "String",
    minimumStock: "Number",
    description: "String",
    imageUrl: "String",
    isActive: "Boolean",
    lastRestocked: "Date"
  },
  
  suppliers: {
    _id: "ObjectId",
    name: "String",
    contactPerson: "String",
    email: "String",
    phone: "String",
    address: "String",
    supplierType: "String (enum: 'Fuel', 'Product', 'Both')",
    paymentTerms: "String",
    activeContract: "Boolean"
  },
  
  // TRANSACTION RELATED COLLECTIONS
  transactions: {
    _id: "ObjectId",
    transactionType: "String (enum: 'Fuel', 'Product', 'Service')",
    customerId: "ObjectId (ref: customers)",
    employeeId: "ObjectId (ref: employees)",
    stationId: "ObjectId (ref: stations)",
    date: "Date",
    items: "Array<Object>",
    subtotal: "Number",
    tax: "Number",
    total: "Number",
    paymentMethod: "String",
    paymentStatus: "String",
    loyaltyPointsEarned: "Number",
    loyaltyPointsRedeemed: "Number",
    notes: "String"
  },
  
  fuelSales: {
    _id: "ObjectId",
    transactionId: "ObjectId (ref: transactions)",
    fuelType: "String",
    gallons: "Number",
    pricePerGallon: "Number",
    total: "Number",
    pumpNumber: "Number",
    employeeId: "ObjectId (ref: employees)",
    customerId: "ObjectId (ref: customers)",
    date: "Date",
    paymentMethod: "String"
  },
  
  productSales: {
    _id: "ObjectId",
    transactionId: "ObjectId (ref: transactions)",
    productId: "ObjectId (ref: products)",
    quantity: "Number",
    pricePerUnit: "Number",
    total: "Number",
    date: "Date",
    employeeId: "ObjectId (ref: employees)",
    customerId: "ObjectId (ref: customers)"
  },
  
  // FINANCE RELATED COLLECTIONS
  revenue: {
    _id: "ObjectId",
    date: "Date",
    source: "String (enum: 'Fuel Sales', 'Store Sales', 'Services')",
    amount: "Number",
    category: "String",
    notes: "String",
    stationId: "ObjectId (ref: stations)"
  },
  
  expenses: {
    _id: "ObjectId",
    date: "Date",
    description: "String",
    category: "String",
    amount: "Number",
    paymentMethod: "String",
    status: "String (enum: 'Paid', 'Pending', 'Upcoming')",
    vendor: "String",
    receiptUrl: "String",
    approvedBy: "ObjectId (ref: employees)",
    stationId: "ObjectId (ref: stations)"
  },
  
  invoices: {
    _id: "ObjectId",
    invoiceNumber: "String",
    customerId: "ObjectId (ref: customers)",
    date: "Date",
    dueDate: "Date",
    items: "Array<Object>",
    subtotal: "Number",
    tax: "Number",
    total: "Number",
    status: "String (enum: 'Paid', 'Pending', 'Overdue')",
    notes: "String"
  },
  
  // EMPLOYEE MANAGEMENT COLLECTIONS
  shifts: {
    _id: "ObjectId",
    employeeId: "ObjectId (ref: employees)",
    date: "Date",
    startTime: "Date",
    endTime: "Date",
    role: "String",
    stationId: "ObjectId (ref: stations)",
    status: "String (enum: 'Scheduled', 'Completed', 'Missed')",
    notes: "String"
  },
  
  attendance: {
    _id: "ObjectId",
    employeeId: "ObjectId (ref: employees)",
    date: "Date",
    clockIn: "Date",
    clockOut: "Date",
    status: "String (enum: 'Present', 'Absent', 'Late')",
    hours: "Number",
    notes: "String",
    approvedBy: "ObjectId (ref: employees)"
  },
  
  payroll: {
    _id: "ObjectId",
    employeeId: "ObjectId (ref: employees)",
    period: {
      startDate: "Date",
      endDate: "Date"
    },
    baseSalary: "Number",
    overtimeHours: "Number",
    overtimePay: "Number",
    bonuses: "Number",
    deductions: "Number",
    netPay: "Number",
    paymentDate: "Date",
    paymentMethod: "String",
    status: "String (enum: 'Processing', 'Paid', 'Pending')",
    notes: "String"
  },
  
  // MAINTENANCE RELATED COLLECTIONS
  maintenanceTasks: {
    _id: "ObjectId",
    title: "String",
    description: "String",
    status: "String (enum: 'Scheduled', 'In Progress', 'Completed')",
    priority: "String (enum: 'Low', 'Medium', 'High', 'Critical')",
    assignedTo: "ObjectId (ref: employees)",
    dueDate: "Date",
    completedDate: "Date",
    createdBy: "ObjectId (ref: employees)",
    stationId: "ObjectId (ref: stations)",
    equipmentId: "ObjectId (ref: equipment)",
    notes: "String"
  },
  
  equipment: {
    _id: "ObjectId",
    name: "String",
    type: "String",
    serialNumber: "String",
    manufacturer: "String",
    model: "String",
    purchaseDate: "Date",
    warrantyExpiration: "Date",
    lastMaintenance: "Date",
    maintenanceSchedule: "String",
    status: "String (enum: 'Operational', 'Needs Maintenance', 'Out of Service')",
    stationId: "ObjectId (ref: stations)",
    notes: "String"
  },
  
  // STATION RELATED COLLECTIONS
  stations: {
    _id: "ObjectId",
    name: "String",
    address: "String",
    phone: "String",
    email: "String",
    manager: "ObjectId (ref: employees)",
    openingHours: "Object",
    status: "String (enum: 'Open', 'Closed', 'Under Maintenance')",
    facilities: "Array<String>",
    coordinates: {
      latitude: "Number",
      longitude: "Number"
    }
  },
  
  // ANALYTICAL DATA COLLECTIONS
  reports: {
    _id: "ObjectId",
    type: "String",
    title: "String",
    period: {
      startDate: "Date",
      endDate: "Date"
    },
    data: "Object",
    createdBy: "ObjectId (ref: employees)",
    createdAt: "Date",
    stationId: "ObjectId (ref: stations)",
    format: "String",
    status: "String"
  }
};

export default DatabaseSchema;
