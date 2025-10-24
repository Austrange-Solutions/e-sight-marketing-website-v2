/**
 * Migration Script: Convert Hardcoded Foundations to Dynamic System
 * 
 * This script:
 * 1. Creates Foundation documents for VSF and CF in database
 * 2. Updates existing Donation documents to reference Foundation ObjectIds
 * 3. Preserves all existing donation data
 * 
 * Run with: bun run scripts/migrate-foundations-to-dynamic.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

// Foundation Schema (inline for migration)
const FoundationSchema = new mongoose.Schema(
  {
    foundationName: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, lowercase: true },
    foundationSharePercent: { type: Number, required: true },
    companySharePercent: { type: Number, required: true },
    platformFeePercent: { type: Number, default: 10 }, // Added platform fee
    displayName: { type: String, trim: true },
    tagline: { type: String, trim: true },
    description: { type: String, trim: true },
    logoUrl: { type: String },
    icon: { type: String, default: "❤️" },
    primaryColor: { type: String, default: "#10b981" },
    contactEmail: { type: String },
    contactPhone: { type: String },
    website: { type: String },
    isActive: { type: Boolean, default: false },
    priority: { type: Number, default: 999 },
    minimumDonation: { type: Number, default: 1 },
    stats: {
      totalDonations: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      donorCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Foundation = mongoose.models.Foundation || mongoose.model("Foundation", FoundationSchema);

// Donation Schema (simplified for migration)
const DonationSchema = new mongoose.Schema({
  foundation: { type: mongoose.Schema.Types.Mixed }, // String or ObjectId
  // ... other fields
});

const Donation = mongoose.models.Donation || mongoose.model("Donation", DonationSchema);

// Hardcoded foundation data to migrate
const foundationsToMigrate = [
  {
    code: "vsf",
    foundationName: "Vishnu Shakti Foundation",
    displayName: "VSF",
    tagline: "Empowering visually impaired individuals",
    description: "Supporting accessibility initiatives and empowering people with visual disabilities through technology and community programs.",
    icon: "💚",
    primaryColor: "#10b981", // Emerald green
    foundationSharePercent: 65,
    companySharePercent: 35,
    platformFeePercent: 12, // VSF platform fee
    isActive: false, // Inactive by default - admin must activate
    priority: 1,
    minimumDonation: 1,
  },
  {
    code: "cf",
    foundationName: "Chetana Foundation",
    displayName: "CF",
    tagline: "Supporting accessibility initiatives",
    description: "Dedicated to creating an inclusive society by providing resources, training, and support for people with disabilities.",
    icon: "💜",
    primaryColor: "#8b5cf6", // Violet
    foundationSharePercent: 75,
    companySharePercent: 25,
    platformFeePercent: 8, // CF platform fee
    isActive: false, // Inactive by default - admin must activate
    priority: 2,
    minimumDonation: 1,
  },
];

async function migrate() {
  try {
    console.log("🚀 Starting Foundation Migration...\n");

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Step 1: Create Foundation documents
    console.log("📝 Step 1: Creating Foundation documents...");
    const createdFoundations = {};

    for (const foundationData of foundationsToMigrate) {
      // Check if foundation already exists
      let foundation = await Foundation.findOne({ code: foundationData.code });

      if (foundation) {
        console.log(`   ⚠️  Foundation "${foundationData.code}" already exists, skipping...`);
        createdFoundations[foundationData.code] = foundation._id;
      } else {
        foundation = await Foundation.create(foundationData);
        createdFoundations[foundationData.code] = foundation._id;
        console.log(`   ✅ Created foundation: ${foundationData.foundationName} (${foundationData.code})`);
        console.log(`      ObjectId: ${foundation._id}`);
      }
    }

    console.log("\n");

    // Step 2: Update existing donations
    console.log("📝 Step 2: Updating existing donations...");

    // Count donations to migrate
    const vsfDonations = await Donation.countDocuments({ foundation: "vsf" });
    const cfDonations = await Donation.countDocuments({ foundation: "cf" });
    const totalToMigrate = vsfDonations + cfDonations;

    console.log(`   Found ${vsfDonations} VSF donations and ${cfDonations} CF donations`);
    console.log(`   Total donations to migrate: ${totalToMigrate}\n`);

    if (totalToMigrate === 0) {
      console.log("   ℹ️  No donations to migrate.\n");
    } else {
      // Update VSF donations
      if (vsfDonations > 0) {
        const vsfResult = await Donation.updateMany(
          { foundation: "vsf" },
          { $set: { foundation: createdFoundations["vsf"] } }
        );
        console.log(`   ✅ Updated ${vsfResult.modifiedCount} VSF donations to reference ObjectId`);
      }

      // Update CF donations
      if (cfDonations > 0) {
        const cfResult = await Donation.updateMany(
          { foundation: "cf" },
          { $set: { foundation: createdFoundations["cf"] } }
        );
        console.log(`   ✅ Updated ${cfResult.modifiedCount} CF donations to reference ObjectId`);
      }

      console.log("\n");
    }

    // Step 3: Calculate and update foundation stats
    console.log("📝 Step 3: Calculating foundation statistics...");

    for (const code of ["vsf", "cf"]) {
      const foundationId = createdFoundations[code];

      // Aggregate donation stats
      const stats = await Donation.aggregate([
        { $match: { foundation: foundationId, status: "completed" } },
        {
          $group: {
            _id: null,
            totalDonations: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
            uniqueDonors: { $addToSet: "$email" },
          },
        },
      ]);

      if (stats.length > 0) {
        const { totalDonations, totalAmount, uniqueDonors } = stats[0];
        await Foundation.updateOne(
          { _id: foundationId },
          {
            $set: {
              "stats.totalDonations": totalDonations,
              "stats.totalAmount": totalAmount,
              "stats.donorCount": uniqueDonors.length,
            },
          }
        );
        console.log(`   ✅ ${code.toUpperCase()}: ${totalDonations} donations, ₹${totalAmount.toLocaleString("en-IN")}, ${uniqueDonors.length} unique donors`);
      } else {
        console.log(`   ℹ️  ${code.toUpperCase()}: No completed donations found`);
      }
    }

    console.log("\n");

    // Step 4: Verification
    console.log("📝 Step 4: Verification...");

    const allFoundations = await Foundation.find().sort({ priority: 1 });
    console.log(`   ✅ Total foundations in database: ${allFoundations.length}`);

    for (const foundation of allFoundations) {
      console.log(`\n   📌 ${foundation.foundationName} (${foundation.code})`);
      console.log(`      Status: ${foundation.isActive ? "✅ Active" : "❌ Inactive"}`);
      console.log(`      Priority: ${foundation.priority}`);
      console.log(`      Foundation Share: ${foundation.foundationSharePercent}%`);
      console.log(`      Company Share: ${foundation.companySharePercent}%`);
      console.log(`      Icon: ${foundation.icon}`);
      console.log(`      Color: ${foundation.primaryColor}`);
      console.log(`      Stats: ${foundation.stats.totalDonations} donations, ₹${foundation.stats.totalAmount.toLocaleString("en-IN")}`);
    }

    console.log("\n\n✅ Migration completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("   1. Verify foundations appear in admin panel");
    console.log("   2. Check donation page displays all active foundations");
    console.log("   3. Test creating a new donation with each foundation");
    console.log("   4. Verify donation stats are accurate\n");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB\n");
  }
}

// Run migration
migrate()
  .then(() => {
    console.log("🎉 Migration script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration script failed:", error);
    process.exit(1);
  });
