import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Foundation from "@/models/Foundation";
import { getAdminFromRequest } from "@/middleware/adminAuth";

export const runtime = "nodejs";

// GET: Fetch all foundations (with stats)
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await connect();

    // Fetch all foundations sorted by priority
    const foundations = await Foundation.find()
      .sort({ priority: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      foundations,
      count: foundations.length,
    });
  } catch (error: any) {
    console.error("Error fetching foundations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch foundations" },
      { status: 500 }
    );
  }
}

// POST: Create new foundation
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await connect();

    const body = await request.json();
    const {
      foundationName,
      code,
      foundationSharePercent,
      companySharePercent,
      displayName,
      tagline,
      description,
      logoUrl,
      icon,
      primaryColor,
      contactEmail,
      contactPhone,
      website,
      isActive,
      minimumDonation,
    } = body;

    // Validate required fields
    if (!foundationName || !foundationSharePercent) {
      return NextResponse.json(
        { error: "Foundation name and foundation share percentage are required" },
        { status: 400 }
      );
    }

    // Generate code if not provided
    let finalCode = code?.trim().toLowerCase();
    if (!finalCode) {
      finalCode = Foundation.generateCode(foundationName);
    }

    // Check if code is unique
    const isUnique = await Foundation.isCodeUnique(finalCode);
    if (!isUnique) {
      return NextResponse.json(
        { error: `Foundation code "${finalCode}" already exists. Please choose a different code.` },
        { status: 400 }
      );
    }

    // Calculate company share if not provided
    const calculatedCompanyShare = companySharePercent ?? (100 - foundationSharePercent);

    // Validate percentages sum to 100
    const sum = foundationSharePercent + calculatedCompanyShare;
    if (Math.abs(sum - 100) > 0.01) {
      return NextResponse.json(
        {
          error: `Foundation share (${foundationSharePercent}%) + Company share (${calculatedCompanyShare}%) must equal 100%`,
        },
        { status: 400 }
      );
    }

    // Get next available priority
    const priority = await Foundation.getNextPriority();

    // Create foundation
    const foundation = await Foundation.create({
      foundationName,
      code: finalCode,
      foundationSharePercent,
      companySharePercent: calculatedCompanyShare,
      displayName: displayName?.trim() || undefined,
      tagline: tagline?.trim() || undefined,
      description: description?.trim() || undefined,
      logoUrl: logoUrl?.trim() || undefined,
      icon: icon?.trim() || "❤️",
      primaryColor: primaryColor?.trim() || "#10b981",
      contactEmail: contactEmail?.trim().toLowerCase() || undefined,
      contactPhone: contactPhone?.trim() || undefined,
      website: website?.trim() || undefined,
      isActive: isActive ?? false, // Default inactive
      priority,
      minimumDonation: minimumDonation || 1,
      stats: {
        totalDonations: 0,
        totalAmount: 0,
        donorCount: 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Foundation created successfully",
        foundation,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating foundation:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Foundation code already exists. Please choose a different code." },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(", ");
      return NextResponse.json({ error: messages }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to create foundation" },
      { status: 500 }
    );
  }
}
