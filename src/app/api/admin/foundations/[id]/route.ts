import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Foundation from "@/models/Foundation";
import Donation from "@/models/Donation";
import { getAdminFromRequest } from "@/middleware/adminAuth";

export const runtime = "nodejs";

// GET: Fetch single foundation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const foundation = await Foundation.findById(id).lean();

    if (!foundation) {
      return NextResponse.json(
        { error: "Foundation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      foundation,
    });
  } catch (error: any) {
    console.error("Error fetching foundation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch foundation" },
      { status: 500 }
    );
  }
}

// PATCH: Update foundation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
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
      priority,
      minimumDonation,
    } = body;

    // Check if foundation exists
    const foundation = await Foundation.findById(id);
    if (!foundation) {
      return NextResponse.json(
        { error: "Foundation not found" },
        { status: 404 }
      );
    }

    // If code is being changed, check uniqueness
    if (code && code.toLowerCase() !== foundation.code) {
      const isUnique = await Foundation.isCodeUnique(code.toLowerCase(), id);
      if (!isUnique) {
        return NextResponse.json(
          { error: `Foundation code "${code}" already exists. Please choose a different code.` },
          { status: 400 }
        );
      }
      foundation.code = code.toLowerCase();
    }

    // Update fields if provided
    if (foundationName !== undefined) foundation.foundationName = foundationName;
    if (foundationSharePercent !== undefined) foundation.foundationSharePercent = foundationSharePercent;
    if (companySharePercent !== undefined) foundation.companySharePercent = companySharePercent;
    
    // Optional fields (can be set to empty)
    if (displayName !== undefined) foundation.displayName = displayName || undefined;
    if (tagline !== undefined) foundation.tagline = tagline || undefined;
    if (description !== undefined) foundation.description = description || undefined;
    if (logoUrl !== undefined) foundation.logoUrl = logoUrl || undefined;
    if (icon !== undefined) foundation.icon = icon || "❤️";
    if (primaryColor !== undefined) foundation.primaryColor = primaryColor || "#10b981";
    if (contactEmail !== undefined) foundation.contactEmail = contactEmail?.toLowerCase() || undefined;
    if (contactPhone !== undefined) foundation.contactPhone = contactPhone || undefined;
    if (website !== undefined) foundation.website = website || undefined;
    if (isActive !== undefined) foundation.isActive = isActive;
    if (priority !== undefined) foundation.priority = priority;
    if (minimumDonation !== undefined) foundation.minimumDonation = minimumDonation;

    // Auto-calculate company share if foundation share changed and company share not explicitly provided
    if (foundationSharePercent !== undefined && companySharePercent === undefined) {
      foundation.companySharePercent = 100 - foundationSharePercent;
    }

    // Validate percentages
    try {
      foundation.validatePercentages();
    } catch (validationError: any) {
      return NextResponse.json(
        { error: validationError.message },
        { status: 400 }
      );
    }

    await foundation.save();

    return NextResponse.json({
      success: true,
      message: "Foundation updated successfully",
      foundation,
    });
  } catch (error: any) {
    console.error("Error updating foundation:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(", ");
      return NextResponse.json({ error: messages }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update foundation" },
      { status: 500 }
    );
  }
}

// DELETE: Delete foundation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if foundation exists
    const foundation = await Foundation.findById(id);
    if (!foundation) {
      return NextResponse.json(
        { error: "Foundation not found" },
        { status: 404 }
      );
    }

    // Check if foundation has donations
    const donationCount = await Donation.countDocuments({ foundation: id });

    if (donationCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete foundation. It has ${donationCount} associated donation(s). Please deactivate instead.`,
          donationCount,
        },
        { status: 400 }
      );
    }

    // Delete foundation
    await Foundation.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Foundation deleted successfully",
      deletedFoundation: {
        id: foundation._id,
        name: foundation.foundationName,
        code: foundation.code,
      },
    });
  } catch (error: any) {
    console.error("Error deleting foundation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete foundation" },
      { status: 500 }
    );
  }
}
