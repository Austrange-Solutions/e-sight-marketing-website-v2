// Simple script to seed default foundations
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const foundationSchema = new mongoose.Schema({
  foundationName: String,
  code: String,
  displayName: String,
  tagline: String,
  description: String,
  foundationSharePercent: Number,
  companySharePercent: Number,
  platformFeePercent: Number,
  icon: String,
  primaryColor: String,
  isActive: Boolean,
  priority: Number,
  minimumDonation: Number,
  stats: {
    totalDonations: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    donorCount: { type: Number, default: 0 },
  },
}, { timestamps: true });

const Foundation = mongoose.models.Foundation || mongoose.model('Foundation', foundationSchema);

const defaultFoundations = [
  {
    foundationName: "Vishnu Shakti Foundation",
    code: "vsf",
    displayName: "VSF",
    tagline: "Empowering Lives Through Light",
    description: "Vishnu Shakti Foundation works to provide assistive devices and support to visually impaired individuals.",
    foundationSharePercent: 65,
    companySharePercent: 35,
    platformFeePercent: 12,
    icon: "💚",
    primaryColor: "#10b981",
    isActive: true,
    priority: 1,
    minimumDonation: 1,
    stats: {
      totalDonations: 0,
      totalAmount: 0,
      donorCount: 0,
    },
  },
  {
    foundationName: "Chetana Foundation",
    code: "cf",
    displayName: "CF",
    tagline: "Awakening Possibilities",
    description: "Chetana Foundation focuses on education and empowerment of differently-abled individuals.",
    foundationSharePercent: 70,
    companySharePercent: 30,
    platformFeePercent: 10,
    icon: "💜",
    primaryColor: "#8b5cf6",
    isActive: true,
    priority: 2,
    minimumDonation: 1,
    stats: {
      totalDonations: 0,
      totalAmount: 0,
      donorCount: 0,
    },
  },
];

async function seedFoundations() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if foundations already exist
    const existingCount = await Foundation.countDocuments();
    console.log(`Found ${existingCount} existing foundations`);

    if (existingCount > 0) {
      console.log('⚠️  Foundations already exist. Skipping seed.');
      console.log('Use "node scripts/check-foundations.js" to view existing foundations.');
      process.exit(0);
    }

    // Insert default foundations
    console.log('Inserting default foundations...');
    const result = await Foundation.insertMany(defaultFoundations);
    console.log(`✅ Successfully created ${result.length} foundations:`);
    result.forEach(f => {
      console.log(`   - ${f.displayName} (${f.code})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedFoundations();
