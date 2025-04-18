
import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  stock: number;
  price: number;
  cost: number;
  supplier: string;
  barcode: string;
  minimumStock: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  lastRestocked: Date;
}

const productSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    supplier: {
      type: String,
    },
    barcode: {
      type: String,
    },
    minimumStock: {
      type: Number,
      default: 5,
    },
    description: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastRestocked: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
