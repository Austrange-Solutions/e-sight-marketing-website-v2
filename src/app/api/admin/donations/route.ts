import { NextRequest, NextResponse } from "next/server";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";
import Foundation from "@/models/Foundation";
import mongoose from "mongoose";
import { getAdminFromRequest } from "@/middleware/adminAuth";

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const adminData = getAdminFromRequest(req);
    if (!adminData) {
      console.log('Admin auth failed for donations GET');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    console.log('DB connected for donations fetch');

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status"); // pending, completed, failed
    const foundation = searchParams.get("foundation"); // vsf, cf
    const search = searchParams.get("search"); // search by name or email

    console.log('Query params:', { page, limit, status, foundation, search });

    // Build query
    const query: Record<string, unknown> = {};

    if (status && ["pending", "completed", "failed"].includes(status)) {
      query.status = status;
    }

    if (foundation) {
      // Support both foundation code and ObjectId
      if (mongoose.Types.ObjectId.isValid(foundation)) {
        query.foundation = foundation; // ObjectId
      } else {
        // Find foundation by code
        const foundationDoc = await Foundation.findOne({ code: foundation });
        if (foundationDoc) {
          query.foundation = foundationDoc._id;
        }
      }
    }

    if (search) {
      query.$or = [
        { donorName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch donations with pagination and populate foundation details
    const [donations, total] = await Promise.all([
      Donation.find(query)
        .populate('foundation', '_id foundationName code displayName icon primaryColor logoUrl') // Populate foundation with _id
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Donation.countDocuments(query),
    ]);

    // Calculate totals
    const totals = await Donation.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          totalPlatformFee: { $sum: "$platformFee" },
          totalNetAmount: { $sum: "$netAmount" },
        },
      },
    ]);

    // Calculate foundation totals with full details
    const foundationTotalsRaw = await Donation.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$foundation",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          totalPlatformFee: { $sum: "$platformFee" },
          totalFoundationAmount: { $sum: "$foundationAmount" },
          totalCompanyAmount: { $sum: "$companyAmount" },
        },
      },
    ]);

    console.log('Foundation totals raw:', foundationTotalsRaw.map(ft => ({ _id: ft._id, type: typeof ft._id })));

    // Separate ObjectIds and string codes
    const foundationObjectIds = foundationTotalsRaw
      .filter(ft => ft._id && mongoose.Types.ObjectId.isValid(ft._id) && typeof ft._id !== 'string')
      .map(ft => ft._id);
    
    const foundationCodes = foundationTotalsRaw
      .filter(ft => ft._id && typeof ft._id === 'string')
      .map(ft => ft._id);

    console.log('Foundation ObjectIds:', foundationObjectIds);
    console.log('Foundation codes (strings):', foundationCodes);

    // Fetch foundations by both ObjectId and code
    const foundationsByObjectId = foundationObjectIds.length > 0
      ? await Foundation.find({ _id: { $in: foundationObjectIds } }).lean()
      : [];
    
    const foundationsByCode = foundationCodes.length > 0
      ? await Foundation.find({ code: { $in: foundationCodes } }).lean()
      : [];

    const allFoundations = [...foundationsByObjectId, ...foundationsByCode];
    console.log('Fetched foundations:', allFoundations.length);
    
    // Map foundation totals with full details
    const foundationTotalsMap = foundationTotalsRaw.map(ft => {
      // Try to find by ObjectId first, then by code
      let foundation = allFoundations.find(f => f._id.toString() === ft._id?.toString());
      if (!foundation && typeof ft._id === 'string') {
        foundation = allFoundations.find(f => f.code === ft._id);
      }
      
      return {
        foundationId: ft._id,
        foundationName: foundation?.foundationName || "Unknown",
        foundationCode: foundation?.code || (typeof ft._id === 'string' ? ft._id : ""),
        displayName: foundation?.displayName || foundation?.foundationName || (typeof ft._id === 'string' ? ft._id.toUpperCase() : "Unknown"),
        icon: foundation?.icon || "❤️",
        primaryColor: foundation?.primaryColor || "#10b981",
        count: ft.count,
        totalAmount: ft.totalAmount,
        totalPlatformFee: ft.totalPlatformFee,
        totalFoundationAmount: ft.totalFoundationAmount,
        totalCompanyAmount: ft.totalCompanyAmount,
      };
    });

    const completedTotals = totals.find((t) => t._id === "completed") || { 
      count: 0, 
      totalAmount: 0, 
      totalPlatformFee: 0, 
      totalNetAmount: 0 
    };

    const stats = {
      total: total,
      completed: completedTotals.count,
      pending: totals.find((t) => t._id === "pending")?.count || 0,
      failed: totals.find((t) => t._id === "failed")?.count || 0,
      totalRevenue: completedTotals.totalAmount,
      totalPlatformFees: completedTotals.totalPlatformFee,
      totalNetAmount: completedTotals.totalNetAmount,
      byFoundation: foundationTotalsMap, // Dynamic foundation stats
    };

    console.log('Returning donations:', {
      count: donations.length,
      total,
      stats: {
        total: stats.total,
        completed: stats.completed,
        pending: stats.pending,
        byFoundationCount: foundationTotalsMap.length
      },
      sampleFoundationData: donations.slice(0, 2).map(d => ({
        id: d._id,
        foundation: d.foundation,
        foundationType: typeof d.foundation
      }))
    });

    return NextResponse.json({
      success: true,
      donations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch donations",
      },
      { status: 500 }
    );
  }
}
