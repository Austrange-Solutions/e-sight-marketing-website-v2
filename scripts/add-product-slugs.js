// Script to add slugs to existing products
// Run with: node scripts/add-product-slugs.js

const mongoose = require('mongoose');
require('dotenv').config();

const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  // ... other fields
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function addSlugs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let updated = 0;
    for (const product of products) {
      if (!product.slug) {
        // Generate slug from name
        const slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        
        product.slug = slug;
        await product.save();
        updated++;
        console.log(`Updated ${product.name} with slug: ${slug}`);
      }
    }

    console.log(`\nMigration complete! Updated ${updated} products.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addSlugs();
