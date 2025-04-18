// Product interface matching the backend model
export interface Product {
  _id?: string;  // Optional to support new products being created
  name: string;
  sku: string;
  category: string;
  description?: string;
  price: number;
  cost: number;
  quantity: number;
  supplier: string;
  images?: string[];
  barcode?: string;
  reorderLevel: number;
  location?: string;
  isActive: boolean;
  tags?: string[];
  specifications?: Record<string, any>;
  discountPercentage?: number;
  createdAt?: Date;
  updatedAt?: Date;
} 