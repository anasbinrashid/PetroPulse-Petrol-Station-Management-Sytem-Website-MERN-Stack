// Define common types for API responses and data models
import { Product } from './product';

// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Authentication response types
export interface UserProfile {
  _id: string;
  name?: string;
  role?: string;
  loyaltyPoints?: number;
  [key: string]: any; // Allow for other profile properties
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  userType: 'admin' | 'employee' | 'customer';
  profile?: UserProfile;
  token: string;
}

// Fuel inventory types
export interface FuelInventory {
  _id?: string;
  fuelType: string;
  currentLevel: number;
  capacity: number;
  pricePerGallon: number;
  costPerGallon: number;
  supplier: string;
  tankNumber: string;
  lastRefillDate?: string;
  lastRefillAmount?: number;
  reorderLevel: number;
  status: 'available' | 'low' | 'critical' | 'maintenance' | 'offline';
  location: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Revenue transaction types
export interface RevenueTransaction {
  _id?: string;
  id?: string; // Adding optional id property for mock data
  date: string;
  source: string;
  amount: number;
  category: string;
}

// Product inventory types - now imported from product.ts

// Sales transaction types
export interface SalesTransaction {
  _id?: string;
  date: string;
  type: string;
  amount: number;
  paymentMethod: string;
  pumpNumber?: number;
}

// Employee types
export interface Employee {
  _id?: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  hireDate: string;
  status: 'active' | 'inactive';
}

// Customer fuel purchases response type
export interface CustomerFuelPurchaseResponse {
  fuelSales: any[];
  monthlyData: any[];
  paymentMethods: any[];
  totalSpent: number;
  totalGallons: number;
}

// Employee attendance response type
export interface EmployeeAttendanceResponse {
  records: any[];
  summary: {
    totalHours: number;
    weeklyHours: number;
    monthlyHours: number;
    [key: string]: any;
  };
}
