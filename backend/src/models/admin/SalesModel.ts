import mongoose, { Document, Schema } from 'mongoose';

export interface ISaleItem {
  product: mongoose.Types.ObjectId | string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: string; // 'fuel' or 'product'
}

export interface ISale extends Document {
  saleId: string;
  date: Date;
  customer?: mongoose.Types.ObjectId;
  employee: mongoose.Types.ObjectId;
  items: ISaleItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  refundReference?: string;
  isRefunded: boolean;
  transactionType: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema: Schema = new Schema(
  {
    saleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    items: [{
      product: {
        type: Schema.Types.ObjectId,
        refPath: 'items.type',
        required: true,
      },
      productName: {
        type: String,
        required: true,
        trim: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [0.01, 'Quantity must be greater than 0'],
      },
      unitPrice: {
        type: Number,
        required: true,
        min: [0, 'Unit price cannot be negative'],
      },
      total: {
        type: Number,
        required: true,
        min: [0, 'Total cannot be negative'],
      },
      type: {
        type: String,
        required: true,
        enum: ['FuelInventory', 'Product'],
        default: 'Product',
      },
    }],
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    tax: {
      type: Number,
      required: true,
      min: [0, 'Tax cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cash', 'credit_card', 'debit_card', 'mobile_payment', 'loyalty_points', 'check', 'account', 'other'],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['paid', 'pending', 'failed', 'refunded', 'partially_refunded'],
      default: 'paid',
    },
    notes: {
      type: String,
      trim: true,
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyPointsRedeemed: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundReference: {
      type: String,
      trim: true,
    },
    isRefunded: {
      type: Boolean,
      default: false,
    },
    transactionType: {
      type: String,
      required: true,
      enum: ['purchase', 'refund', 'exchange'],
      default: 'purchase',
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique sale ID before saving
SaleSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get the count of sales today to create a sequential number
    const today = new Date(date.setHours(0, 0, 0, 0));
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const count = await mongoose.model('Sale').countDocuments({
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });
    
    // Format: YYMMDD-XXXX where XXXX is a sequential number for the day
    this.saleId = `${year}${month}${day}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Indexes for faster queries
SaleSchema.index({ date: -1 });
SaleSchema.index({ customer: 1, date: -1 });
SaleSchema.index({ employee: 1, date: -1 });
SaleSchema.index({ paymentMethod: 1, date: -1 });
SaleSchema.index({ paymentStatus: 1 });
SaleSchema.index({ transactionType: 1, date: -1 });

// Prevent model compilation error by checking if it exists first
export default mongoose.models.Sales || mongoose.model<ISale>('Sales', SaleSchema); 