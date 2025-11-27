import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Donation from '@/models/Donation';
import CSRDonation from '@/models/CSRDonation';
import DonationBucket from '@/models/DonationBucket';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Public endpoint for donation pool progress
export async function GET() {
  try {
    await connect();

    // Fetch completed online donations
    const onlineDonations = await Donation.find({ status: 'completed' }).lean();
    const totalOnlineAmount = onlineDonations.reduce((sum, d) => sum + d.amount, 0);

    // Fetch verified/received CSR donations
    const csrDonations = await CSRDonation.find({
      status: { $in: ['verified', 'received', 'certificate_issued'] },
    }).lean();
    const totalCSRAmount = csrDonations.reduce((sum, d) => sum + d.amount, 0);

    // Total pool
    const totalPoolAmount = totalOnlineAmount + totalCSRAmount;

    // Fetch active donation buckets
    const buckets = await DonationBucket.find({ isActive: true })
      .populate('foundation', 'name')
      .lean();
    
    // Calculate total bucket value (considering bucketFillPercent)
    const totalBucketValue = buckets.reduce((sum, b) => {
      const fillPercent = (b.bucketFillPercent || 100) / 100;
      return sum + (b.totalBucketValue * fillPercent);
    }, 0);

    // Calculate pool fill percentage
    const poolFillPercentage = totalBucketValue > 0
      ? Math.round((totalPoolAmount / totalBucketValue) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      progress: {
        totalPoolAmount,
        totalBucketValue,
        poolFillPercentage: Math.min(poolFillPercentage, 100), // Cap at 100%
        onlineAmount: totalOnlineAmount,
        csrAmount: totalCSRAmount,
        bucketCount: buckets.length,
        buckets: buckets.map(b => {
          const fillPercent = (b.bucketFillPercent || 100) / 100;
          const allocationPercent = (b.poolAllocationPercent || 0) / 100;
          const allocatedAmount = totalPoolAmount * allocationPercent;
          const targetValue = b.totalBucketValue * fillPercent;
          const bucketFillPercentage = targetValue > 0 ? Math.min((allocatedAmount / targetValue) * 100, 100) : 0;

          return {
            name: b.name,
            description: b.description,
            foundation: b.foundation,
            totalBucketValue: b.totalBucketValue,
            targetValue,
            allocatedAmount,
            bucketFillPercentage: Math.round(bucketFillPercentage),
            poolAllocationPercent: b.poolAllocationPercent || 0,
            bucketFillPercent: b.bucketFillPercent || 100,
            bucketQuantity: b.bucketQuantity,
            products: b.products,
          };
        }),
      },
    });
  } catch (error) {
    console.error('Error fetching pool progress:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch pool progress',
      },
      { status: 500 }
    );
  }
}
