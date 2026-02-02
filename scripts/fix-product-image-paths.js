/**
 * Fix product image paths to match current S3/CloudFront structure
 * This script updates product images from old paths to new ones
 */

const mongoose = require("mongoose");
require("dotenv").config();

// Simple product schema
const productSchema = new mongoose.Schema({
  name: String,
  image: String,
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

// Order schema to update order items too
const orderSchema = new mongoose.Schema({
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    image: String,
    name: String,
  }],
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

async function fixImagePaths() {
  try {
    console.log("🔄 Starting image path fix...\n");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get current CloudFront domain from env
    const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || 
                            process.env.CLOUDFRONT_DOMAIN || 
                            "https://d2z15s8mxf9k1i.cloudfront.net";

    console.log(`📍 Current CloudFront Domain: ${cloudFrontDomain}\n`);

    // Strategy 1: Check current image paths in database
    console.log("📊 Analyzing current product images...");
    const products = await Product.find({}).select("name image");
    
    console.log(`\nFound ${products.length} products:\n`);
    
    for (const product of products) {
      console.log(`  Product: ${product.name}`);
      console.log(`  Current image: ${product.image}`);
      
      // Check if it has old CloudFront domain
      if (product.image && product.image.includes("dw9tsoyfcyk5k.cloudfront.net")) {
        console.log(`  ⚠️  Has OLD CloudFront domain`);
      }
      
      console.log("");
    }

    // Ask user for confirmation before updating
    console.log("\n" + "=".repeat(80));
    console.log("SUGGESTED FIXES:");
    console.log("=".repeat(80) + "\n");
    
    console.log("Option 1: Replace old CloudFront domain with new one");
    console.log("  - Changes: dw9tsoyfcyk5k.cloudfront.net → d2z15s8mxf9k1i.cloudfront.net");
    console.log("  - Keeps the same S3 path: e-sight-ecommerce-product-images/*\n");

    console.log("Option 2: Update to use new S3 bucket/prefix");
    console.log("  - Changes path from: e-sight-ecommerce-product-images/*");
    console.log("  - To: maceazy-marketing/*\n");

    console.log("Option 3: Check what files actually exist in S3");
    console.log("  - Need to verify actual file locations in AWS\n");

    console.log("\nTo apply Option 1 automatically, uncomment the code below and run again.\n");

    // UNCOMMENT THIS SECTION TO APPLY OPTION 1:
    /*
    console.log("Applying Option 1: Replacing old CloudFront domain...\n");
    
    let updatedProducts = 0;
    for (const product of products) {
      if (product.image && product.image.includes("dw9tsoyfcyk5k.cloudfront.net")) {
        const newImage = product.image.replace(
          "dw9tsoyfcyk5k.cloudfront.net",
          "d2z15s8mxf9k1i.cloudfront.net"
        );
        
        await Product.findByIdAndUpdate(product._id, { image: newImage });
        console.log(`✅ Updated ${product.name}`);
        console.log(`   From: ${product.image}`);
        console.log(`   To:   ${newImage}\n`);
        updatedProducts++;
      }
    }

    // Also update order items
    console.log("\n📦 Updating order item images...");
    const orders = await Order.find({ "items.image": { $exists: true } });
    let updatedOrders = 0;
    
    for (const order of orders) {
      let hasChanges = false;
      for (const item of order.items) {
        if (item.image && item.image.includes("dw9tsoyfcyk5k.cloudfront.net")) {
          item.image = item.image.replace(
            "dw9tsoyfcyk5k.cloudfront.net",
            "d2z15s8mxf9k1i.cloudfront.net"
          );
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        await order.save();
        updatedOrders++;
      }
    }

    console.log(`\n✅ Summary:`);
    console.log(`   Products updated: ${updatedProducts}`);
    console.log(`   Orders updated: ${updatedOrders}`);
    */

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run the script
fixImagePaths();
