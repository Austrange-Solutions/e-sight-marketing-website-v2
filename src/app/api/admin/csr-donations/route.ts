import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import CSRDonation from "@/models/CSRDonation";
import Foundation from "@/models/Foundation";
import { getAdminFromRequest } from "@/middleware/adminAuth";
import mongoose from "mongoose";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - List all CSR donations with filtering
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const foundation = searchParams.get('foundation');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (foundation && foundation !== 'all') {
      query.foundation = foundation;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Fetch CSR donations with populated references
    const csrDonations = await CSRDonation.find(query)
      .populate('foundation', 'foundationName displayName code')
      .populate('createdBy', 'username email')
      .populate('lastEditedBy', 'username email')
      .populate('auditLog.editedBy', 'username email')
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      csrDonations,
    });
  } catch (error) {
    console.error("Error fetching CSR donations:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch CSR donations" },
      { status: 500 }
    );
  }
}

// POST - Create new CSR donation
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const body = await request.json();
    const { 
      companyName, 
      amount, 
      numberOfPeople, 
      foundation, 
      date,
      notes,
      platformFee,
      foundationShare,
      companyShare,
    } = body;

    // Validation
    if (!companyName || !amount || !numberOfPeople || !foundation) {
      return NextResponse.json(
        { success: false, message: "Company name, amount, number of people, and foundation are required" },
        { status: 400 }
      );
    }

    // Verify foundation exists - try by code first, then ObjectId if valid
    let foundationDoc;
    
    // First, try to find by code (most common case)
    foundationDoc = await Foundation.findOne({ 
      code: foundation,
      isActive: true 
    });
    
    // If not found by code and value looks like ObjectId, try by _id
    if (!foundationDoc && mongoose.Types.ObjectId.isValid(foundation)) {
      foundationDoc = await Foundation.findOne({ 
        _id: foundation,
        isActive: true 
      });
    }

    if (!foundationDoc) {
      return NextResponse.json(
        { success: false, message: "Invalid foundation selection or foundation is not active" },
        { status: 400 }
      );
    }

    // Auto-calculate breakdown if not provided
    let calculatedPlatformFee = platformFee;
    let calculatedFoundationShare = foundationShare;
    let calculatedCompanyShare = companyShare;

    if (!platformFee || !foundationShare || !companyShare) {
      // Use foundation's percentages for calculation
      const platformFeePercent = foundationDoc.platformFeePercent || 10;
      calculatedPlatformFee = Math.round(amount * (platformFeePercent / 100) * 100) / 100;
      
      const afterPlatformFee = Math.round((amount - calculatedPlatformFee) * 100) / 100;
      calculatedFoundationShare = Math.round(afterPlatformFee * (foundationDoc.foundationSharePercent / 100) * 100) / 100;
      calculatedCompanyShare = Math.round((afterPlatformFee - calculatedFoundationShare) * 100) / 100;
    }

    // Create CSR donation
    const csrDonation = await CSRDonation.create({
      companyName,
      amount,
      numberOfPeople,
      foundation: foundationDoc._id,
      platformFee: calculatedPlatformFee,
      foundationShare: calculatedFoundationShare,
      companyShare: calculatedCompanyShare,
      date: date ? new Date(date) : new Date(),
      status: 'pending',
      notes: notes || '',
      createdBy: adminData.id,
      auditLog: [{
        editedBy: adminData.id,
        editedAt: new Date(),
        changes: [{
          field: 'created',
          oldValue: null,
          newValue: 'CSR Donation created'
        }]
      }]
    });

    // Populate references before returning
    await csrDonation.populate('foundation', 'foundationName displayName code');
    await csrDonation.populate('createdBy', 'username email');

    return NextResponse.json({
      success: true,
      csrDonation,
      message: "CSR donation created successfully"
    });
  } catch (error) {
    console.error("Error creating CSR donation:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to create CSR donation" },
      { status: 500 }
    );
  }
}
