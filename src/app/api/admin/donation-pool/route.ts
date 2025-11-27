import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import { getAdminFromRequest } from '@/middleware/adminAuth';
import Donation from '@/models/Donation';
import CSRDonation from '@/models/CSRDonation';
import DonationBucket from '@/models/DonationBucket';
import Foundation from '@/models/Foundation';

export const runtime = 'nodejs';

// GET - Aggregated donation pool statistics
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    // Get query parameters for date filtering
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'all';
    const customStartDate = searchParams.get('startDate');
    const customEndDate = searchParams.get('endDate');

    // Build date query
    let dateQuery: any = {};
    const now = new Date();
    
    if (dateRange !== 'all') {
      switch (dateRange) {
        case 'today':
          dateQuery = {
            createdAt: {
              $gte: new Date(now.setHours(0, 0, 0, 0)),
              $lt: new Date(now.setHours(23, 59, 59, 999)),
            },
          };
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - 7);
          dateQuery = { createdAt: { $gte: weekStart } };
          break;
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateQuery = { createdAt: { $gte: monthStart } };
          break;
        case 'year':
          const yearStart = new Date(now.getFullYear(), 0, 1);
          dateQuery = { createdAt: { $gte: yearStart } };
          break;
        case 'custom':
          if (customStartDate && customEndDate) {
            dateQuery = {
              createdAt: {
                $gte: new Date(customStartDate),
                $lte: new Date(customEndDate),
              },
            };
          }
          break;
      }
    }

    // Fetch all foundations (exclude 'general')
    const foundations = await Foundation.find({ code: { $ne: 'general' } }).lean();

    // Fetch online donations (no user reference - has direct fields like donorName, email)
    const onlineDonations = await Donation.find({
      status: 'completed',
      ...dateQuery,
    })
      .populate('foundation', 'foundationName code')
      .lean();

    // Fetch CSR donations
    const csrDonations = await CSRDonation.find({
      status: { $in: ['verified', 'received', 'certificate_issued'] },
      ...dateQuery,
    })
      .populate('foundation', 'foundationName code')
      .populate('createdBy', 'username email')
      .lean();

    // Fetch active donation buckets
    const buckets = await DonationBucket.find({ isActive: true })
      .populate('foundation', 'foundationName code')
      .populate('products.productId', 'name price image')
      .lean();

    // Calculate totals
    const totalOnlineAmount = onlineDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalCSRAmount = csrDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalPoolAmount = totalOnlineAmount + totalCSRAmount;

    // Calculate company share from online donations
    const totalOnlineCompanyShare = onlineDonations.reduce((sum, d) => sum + (d.companyAmount || 0), 0);

    // Calculate online donor count (unique donors by email)
    const uniqueOnlineDonors = new Set(
      onlineDonations.map((d) => d.email).filter(Boolean)
    );
    const onlineDonorCount = uniqueOnlineDonors.size;

    // Calculate CSR stats
    const csrCompanyCount = csrDonations.length;
    const totalBeneficiaries = csrDonations.reduce(
      (sum, d) => sum + (d.numberOfPeople || 0),
      0
    );

    // Calculate foundation-wise breakdown
    const foundationBreakdown = foundations.map((foundation) => {
      const foundationCode = foundation.code;

      // Online donations for this foundation
      const foundationOnlineDonations = onlineDonations.filter(
        (d) => {
          if (typeof d.foundation === 'object' && d.foundation !== null) {
            return (d.foundation as any).code === foundationCode;
          }
          return d.foundation === foundationCode;
        }
      );
      const onlineAmount = foundationOnlineDonations.reduce((sum, d) => sum + d.amount, 0);
      const onlineDonorCountForFoundation = new Set(
        foundationOnlineDonations.map((d) => d.email).filter(Boolean)
      ).size;

      // CSR donations for this foundation
      const foundationCSRDonations = csrDonations.filter(
        (d) => {
          if (typeof d.foundation === 'object' && d.foundation !== null) {
            return (d.foundation as any).code === foundationCode;
          }
          return d.foundation === foundationCode;
        }
      );
      const csrAmount = foundationCSRDonations.reduce((sum, d) => sum + d.amount, 0);
      const csrCompanyCountForFoundation = foundationCSRDonations.length;
      const csrBeneficiaries = foundationCSRDonations.reduce(
        (sum, d) => sum + (d.numberOfPeople || 0),
        0
      );

      // Total for this foundation
      const totalAmount = onlineAmount + csrAmount;

      // Calculate fee breakdown (using average percentages)
      const avgPlatformFee = totalAmount > 0
        ? foundationOnlineDonations.reduce((sum, d) => sum + (d.platformFee || 0), 0) +
          foundationCSRDonations.reduce((sum, d) => sum + (d.platformFee || 0), 0)
        : 0;
      const avgFoundationShare = totalAmount > 0
        ? foundationOnlineDonations.reduce((sum, d) => sum + (d.foundationAmount || 0), 0) +
          foundationCSRDonations.reduce((sum, d) => sum + (d.foundationShare || 0), 0)
        : 0;
      const avgCompanyShare = totalAmount > 0
        ? foundationOnlineDonations.reduce((sum, d) => sum + (d.companyAmount || 0), 0) +
          foundationCSRDonations.reduce((sum, d) => sum + (d.companyShare || 0), 0)
        : 0;

      return {
        foundation: {
          _id: foundation._id,
          name: foundation.foundationName,
          code: foundation.code,
        },
        totalAmount,
        online: {
          amount: onlineAmount,
          donorCount: onlineDonorCountForFoundation,
          donations: foundationOnlineDonations.map((d) => ({
            _id: d._id,
            amount: d.amount,
            donor: d.isAnonymous ? 'Anonymous' : d.donorName,
            donorName: d.donorName,
            email: d.email || '',
            phone: d.phone || '',
            isAnonymous: d.isAnonymous || false,
            message: d.message || '',
            address: d.address || '',
            city: d.city || '',
            state: d.state || '',
            pan: d.pan || '',
            date: d.createdAt,
            platformFee: d.platformFee,
            foundationShare: d.foundationAmount,
            companyShare: d.companyAmount,
          })),
        },
        csr: {
          amount: csrAmount,
          companyCount: csrCompanyCountForFoundation,
          beneficiaries: csrBeneficiaries,
          donations: foundationCSRDonations.map((d) => ({
            _id: d._id,
            companyName: d.companyName,
            amount: d.amount,
            numberOfPeople: d.numberOfPeople,
            date: d.createdAt,
            status: d.status,
            platformFee: d.platformFee,
            foundationShare: d.foundationShare,
            companyShare: d.companyShare,
          })),
        },
        feeBreakdown: {
          platformFee: avgPlatformFee,
          foundationShare: avgFoundationShare,
          companyShare: avgCompanyShare,
        },
      };
    });

    // Calculate total bucket value
    const totalBucketValue = buckets.reduce((sum, b) => sum + b.totalBucketValue, 0);

    // Calculate pool fill percentage
    const poolFillPercentage = totalBucketValue > 0
      ? Math.round((totalPoolAmount / totalBucketValue) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      pool: {
        totalAmount: totalPoolAmount,
        totalBucketValue,
        poolFillPercentage,
        online: {
          amount: totalOnlineAmount,
          companyShare: totalOnlineCompanyShare,
          donorCount: onlineDonorCount,
          percentage: totalPoolAmount > 0 
            ? Math.round((totalOnlineAmount / totalPoolAmount) * 100)
            : 0,
        },
        csr: {
          amount: totalCSRAmount,
          companyCount: csrCompanyCount,
          beneficiaries: totalBeneficiaries,
          percentage: totalPoolAmount > 0
            ? Math.round((totalCSRAmount / totalPoolAmount) * 100)
            : 0,
        },
        foundationBreakdown,
        buckets: buckets.map((b) => ({
          _id: b._id,
          name: b.name,
          description: b.description,
          foundation: b.foundation,
          totalPrice: b.totalPrice,
          bucketQuantity: b.bucketQuantity,
          totalBucketValue: b.totalBucketValue,
          products: b.products,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching donation pool:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch donation pool',
      },
      { status: 500 }
    );
  }
}
