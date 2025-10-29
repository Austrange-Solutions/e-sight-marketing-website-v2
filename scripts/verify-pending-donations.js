// Script to manually verify pending donations
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const donationSchema = new mongoose.Schema({
  donorName: String,
  email: String,
  phone: String,
  amount: Number,
  paymentId: String,
  orderId: String,
  status: String,
  foundation: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema);

async function verifyPendingDonations() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all pending donations
    const pendingDonations = await Donation.find({ status: 'pending' });
    console.log(`\n📋 Found ${pendingDonations.length} pending donations`);

    if (pendingDonations.length === 0) {
      console.log('✨ No pending donations to process');
      process.exit(0);
    }

    console.log('\n🔄 Updating pending donations to completed...\n');

    for (const donation of pendingDonations) {
      console.log(`Processing donation ${donation._id}:`);
      console.log(`  - Donor: ${donation.donorName}`);
      console.log(`  - Amount: ₹${donation.amount}`);
      console.log(`  - Order ID: ${donation.orderId || 'N/A'}`);
      
      // Update to completed with orderId as paymentId (sandbox mode)
      const updated = await Donation.findByIdAndUpdate(
        donation._id,
        {
          status: 'completed',
          paymentId: donation.orderId || `MANUAL_${Date.now()}`,
        },
        { new: true }
      );

      console.log(`  ✅ Updated to completed with paymentId: ${updated.paymentId}\n`);
    }

    console.log(`\n✅ Successfully updated ${pendingDonations.length} donations to completed!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyPendingDonations();
