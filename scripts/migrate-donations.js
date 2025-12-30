/**
 * Database Migration Script
 * Purpose: Update existing donations to add foundation, platformFee, and netAmount fields
 * Run this script once to migrate old data
 */

import { connect } from '../src/dbConfig/dbConfig';
import Donation from '../src/models/Donation';

async function migrateDonations() {
  try {
    console.log('Starting donation migration...');
    
    // Connect to database
    await connect();
    console.log('Connected to database');

    // Find all donations without foundation field
    const donationsToUpdate = await Donation.find({
      $or: [
        { foundation: { $exists: false } },
        { foundation: null },
        { platformFee: { $exists: false } },
        { netAmount: { $exists: false } }
      ]
    });

    console.log(`Found ${donationsToUpdate.length} donations to update`);

    let updated = 0;
    let errors = 0;

    for (const donation of donationsToUpdate) {
      try {
        // Set default foundation if missing
        if (!donation.foundation) {
          donation.foundation = 'general';
        }

        // Calculate platform fee if missing
        if (!donation.platformFee) {
          donation.platformFee = Math.round(donation.amount * 0.02 * 100) / 100;
        }

        // Calculate net amount if missing
        if (!donation.netAmount) {
          const fee = donation.platformFee || Math.round(donation.amount * 0.02 * 100) / 100;
          donation.netAmount = Math.round((donation.amount - fee) * 100) / 100;
        }

        await donation.save();
        updated++;
        
        if (updated % 10 === 0) {
          console.log(`Progress: ${updated}/${donationsToUpdate.length} donations updated`);
        }
      } catch (error) {
        console.error('Error updating donation:', donation._id, error);
        errors++;
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Successfully updated: ${updated} donations`);
    console.log(`Errors: ${errors}`);
    console.log('=========================\n');

    // Show summary
    const summary = await Donation.aggregate([
      {
        $group: {
          _id: '$foundation',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalFees: { $sum: '$platformFee' },
          totalNet: { $sum: '$netAmount' }
        }
      }
    ]);

    console.log('Foundation Summary:');
    summary.forEach(item => {
      console.log(`\n${item._id || 'undefined'}:`);
      console.log(`  Donations: ${item.count}`);
      console.log(`  Total: ₹${item.totalAmount.toFixed(2)}`);
      console.log(`  Fees: ₹${item.totalFees.toFixed(2)}`);
      console.log(`  Net: ₹${item.totalNet.toFixed(2)}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateDonations();
