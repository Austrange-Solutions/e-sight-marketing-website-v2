import mongoose from "mongoose";

export type TProduct = {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  description: string;
  type: "basic" | "pro" | "max";
  price: number;
  details: string[];
  category: string;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  tax: {
    type: "percentage" | "fixed";
    value: number;
    label: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema<TProduct>({
  name: {
    type: String,
    required: [true, "Please provide a product name"],
  },
  slug: {
    type: String,
    unique: true,
    index: true,
  },
  image: {
    type: String,
    required: [true, "Please provide a product image URL"],
  },
  description: {
    type: String,
    required: false, // Made description optional
    default: "", // Default to empty string if not provided
  },
  type: {
    type: String,
    enum: ["basic", "pro", "max"],
    required: [true, "Please provide a product type"],
  },
  price: {
    type: Number,
    required: [true, "Please provide a product price"],
    min: [0, "Price cannot be negative"],
  },
  details: {
    type: [String], // list of product feature points
    required: false, // Made details optional
    default: [], // Default to empty array if not provided
  },
  category: {
    type: String,
    required: [true, "Please provide a product category"],
    enum: ["Electronics", "Accessories", "Home", "Sports", "Health", "Other"],
    default: "Other",
  },
  stock: {
    type: Number,
    required: [true, "Please provide stock quantity"],
    min: [0, "Stock cannot be negative"],
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "out_of_stock"],
    default: "active",
  },
  tax: {
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    value: {
      type: Number,
      min: [0, "Tax value cannot be negative"],
      default: 18, // 18% GST default
    },
    label: {
      type: String,
      default: "GST",
    },
  },
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
});

// Pre-save middleware to update status based on stock
productSchema.pre('save', function(next) {
  if (this.stock === 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock' && this.stock > 0) {
    this.status = 'active';
  }
  next();
});

// Pre-save middleware to generate slug from name
productSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
  next();
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;