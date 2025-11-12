import mongoose, { Schema, Document } from 'mongoose';

export interface IDonationBucket extends Document {
  name: string;
  description?: string;
  foundation?: mongoose.Types.ObjectId; // Optional - foundation-agnostic buckets
  products: Array<{
    productId: mongoose.Types.ObjectId;
    productName: string;
    productPrice: number;
    quantity: number;
    subtotal: number;
  }>;
  totalPrice: number;
  bucketQuantity: number; // How many of these buckets to create
  totalBucketValue: number; // totalPrice × bucketQuantity
  
  // Pool allocation controls
  poolAllocationPercent: number; // % of total pool allocated to this bucket (0-100)
  bucketFillPercent: number; // % of bucket target filled by pool (0-100)
  
  isActive: boolean; // Manual control to enable/disable bucket
  createdBy: mongoose.Types.ObjectId;
  lastEditedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DonationBucketSchema = new Schema<IDonationBucket>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    foundation: {
      type: Schema.Types.ObjectId,
      ref: 'Foundation',
      required: false, // Optional - foundation-agnostic buckets
    },
    poolAllocationPercent: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    bucketFillPercent: {
      type: Number,
      required: true,
      default: 100, // Default: 100% of bucket filled by pool
      min: 0,
      max: 100,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        productPrice: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    bucketQuantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    totalBucketValue: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total price before saving
DonationBucketSchema.pre('save', function (next) {
  // Calculate subtotal for each product
  this.products.forEach((product) => {
    product.subtotal = product.productPrice * product.quantity;
  });

  // Calculate total price of one bucket
  this.totalPrice = this.products.reduce(
    (sum, product) => sum + product.subtotal,
    0
  );

  // Calculate total value (price × quantity of buckets)
  this.totalBucketValue = this.totalPrice * this.bucketQuantity;

  next();
});

// Force delete cached model to ensure schema updates are applied
if (mongoose.models.DonationBucket) {
  delete mongoose.models.DonationBucket;
}

const DonationBucket = mongoose.model<IDonationBucket>('DonationBucket', DonationBucketSchema);

export default DonationBucket;
