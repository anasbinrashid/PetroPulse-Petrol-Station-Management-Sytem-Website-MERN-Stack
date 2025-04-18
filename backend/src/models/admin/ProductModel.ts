import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
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
  location: string;
  isActive: boolean;
  tags?: string[];
  specifications?: Record<string, any>;
  discountPercentage?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['food', 'beverage', 'tobacco', 'automotive', 'household', 'personal_care', 'electronics', 'other'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 0,
      min: 0,
    },
    supplier: {
      type: String,
      required: [true, 'Supplier is required'],
      trim: true,
    },
    images: [{
      type: String,
    }],
    barcode: {
      type: String,
      trim: true,
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: 0,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      default: 'Main Store',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    specifications: {
      type: Schema.Types.Mixed,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculated fields
ProductSchema.virtual('profit').get(function (this: IProduct) {
  return this.price - this.cost;
});

ProductSchema.virtual('profitMargin').get(function (this: IProduct) {
  return this.price > 0 ? ((this.price - this.cost) / this.price) * 100 : 0;
});

ProductSchema.virtual('availabilityStatus').get(function (this: IProduct) {
  if (!this.isActive) return 'inactive';
  if (this.quantity <= 0) return 'out_of_stock';
  if (this.quantity < this.reorderLevel) return 'low_stock';
  return 'in_stock';
});

// Include virtuals in JSON output
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

// Indexes for faster queries
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1, quantity: -1 });
ProductSchema.index({ supplier: 1 });
ProductSchema.index({ isActive: 1, quantity: -1 });

// Prevent model compilation error by checking if it exists first
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema); 