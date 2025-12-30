/**
 * Migration script to update product images from UploadedImage references to direct CloudFront URLs
 * Run this script once to migrate existing data
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Product schema (simplified for migration)
const productSchema = new mongoose.Schema({
  name: String,
  image: String, // This will store the direct CloudFront URL
  // ... other fields
}, { timestamps: true });

// UploadedImage schema (for reading existing data)
const uploadedImageSchema = new mongoose.Schema({
  cloudFrontUrl: String,
  s3Key: String,
  filename: String,
  // ... other fields
});

const Product = mongoose.model('Product', productSchema);
const UploadedImage = mongoose.model('UploadedImage', uploadedImageSchema);

async function migrateProductImages() {
  try {
    console.log('🔄 Starting image migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to process`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      try {
        // Check if image field already contains a CloudFront URL
        if (product.image && (product.image.includes('cloudfront.net') || product.image.includes('https://'))) {
          console.log(`⏭️  Skipping ${product.name} - already has CloudFront URL`);
          skippedCount++;
          continue;
        }

        // If image field contains an UploadedImage ID, try to resolve it
        if (product.image && mongoose.Types.ObjectId.isValid(product.image)) {
          const uploadedImage = await UploadedImage.findById(product.image);
          
          if (uploadedImage && uploadedImage.cloudFrontUrl) {
            // Update product with CloudFront URL
            await Product.findByIdAndUpdate(product._id, {
              image: uploadedImage.cloudFrontUrl
            });
            
            console.log(`✅ Migrated ${product.name}: ${uploadedImage.cloudFrontUrl}`);
            migratedCount++;
          } else {
            console.log(`⚠️  Could not find UploadedImage for ${product.name}`);
          }
        } else {
          console.log(`⚠️  Product ${product.name} has unusual image format: ${product.image}`);
        }
      } catch (error) {
        console.error('❌ Error processing product:', product.name, error.message);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Migrated: ${migratedCount} products`);
    console.log(`   ⏭️  Skipped: ${skippedCount} products`);
    console.log(`   📦 Total: ${products.length} products`);

    // Optional: Show stats about UploadedImage collection
    const uploadedImageCount = await UploadedImage.countDocuments();
    console.log(`\n📸 UploadedImage collection stats:`);
    console.log(`   📊 Total images: ${uploadedImageCount}`);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Update your upload APIs to store CloudFront URLs directly in products');
    console.log('   2. Consider keeping UploadedImage collection for audit/cleanup purposes');
    console.log('   3. Test that product images load correctly');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run migration
if (require.main === module) {
  migrateProductImages();
}

module.exports = { migrateProductImages };