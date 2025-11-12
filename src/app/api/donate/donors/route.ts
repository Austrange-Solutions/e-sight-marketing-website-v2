import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const foundationFilter = searchParams.get("foundation") || "all";

    const skip = (page - 1) * limit;

    // Build query - only completed donations
    const query: any = { status: "completed" };

    if (foundationFilter !== "all") {
      query.foundation = foundationFilter;
    }

    // Fetch donations
    const donations = await Donation.find(query)
      .populate("foundation", "foundationName displayName code icon primaryColor")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalDonations = await Donation.countDocuments(query);
    const totalPages = Math.ceil(totalDonations / limit);

    // Calculate stats
    const statsAggregation = await Donation.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalDonations: { $sum: 1 },
          totalSticks: { $sum: "$sticksEquivalent" },
        },
      },
    ]);

    const stats = statsAggregation[0] || {
      totalAmount: 0,
      totalDonations: 0,
      totalSticks: 0,
    };

    // Get top donors (non-anonymous only)
    const topDonors = await Donation.aggregate([
      { $match: { ...query, isAnonymous: false } },
      {
        $group: {
          _id: "$email",
          donorName: { $first: "$donorName" },
          totalAmount: { $sum: "$amount" },
          donationCount: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
    ]);

    // Mask anonymous donations for public display
    const publicDonations = donations.map((donation: any) => ({
      _id: donation._id,
      donorName: donation.isAnonymous ? "Anonymous Donor" : donation.donorName,
      amount: donation.amount,
      sticksEquivalent: donation.sticksEquivalent,
      message: donation.message,
      foundation: donation.foundation,
      createdAt: donation.createdAt,
      isAnonymous: donation.isAnonymous,
    }));

    return NextResponse.json({
      success: true,
      donations: publicDonations,
      stats: {
        totalAmount: stats.totalAmount,
        totalDonations: stats.totalDonations,
        totalSticks: stats.totalSticks,
      },
      topDonors: topDonors.map((donor: any) => ({
        donorName: donor.donorName,
        totalAmount: donor.totalAmount,
        donationCount: donor.donationCount,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalDonations,
        limit,
      },
    });
  } catch (error: any) {
    console.error("Error fetching public donors:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch donors" },
      { status: 500 }
    );
  }
}
