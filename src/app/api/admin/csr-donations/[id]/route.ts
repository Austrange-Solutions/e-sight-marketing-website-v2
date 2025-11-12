import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import CSRDonation from "@/models/CSRDonation";
import Foundation from "@/models/Foundation";
import { getAdminFromRequest } from "@/middleware/adminAuth";
import mongoose from "mongoose";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PATCH - Update CSR donation with audit logging
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const { id } = await params;
    const body = await request.json();

    // Fetch existing CSR donation
    const existingDonation = await CSRDonation.findById(id);
    if (!existingDonation) {
      return NextResponse.json(
        { success: false, message: "CSR donation not found" },
        { status: 404 }
      );
    }

    // Track changes for audit log
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    // Fields that can be updated
    const updateableFields = [
      'companyName',
      'amount',
      'numberOfPeople',
      'foundation',
      'platformFee',
      'foundationShare',
      'companyShare',
      'date',
      'status',
      'notes'
    ];

    const updateData: any = {};

    for (const field of updateableFields) {
      if (body[field] !== undefined && body[field] !== existingDonation[field]) {
        // Special handling for foundation (might be code or ObjectId)
        if (field === 'foundation') {
          // Try by code first
          let foundationDoc = await Foundation.findOne({
            code: body[field],
            isActive: true
          });
          
          // If not found by code and looks like ObjectId, try by _id
          if (!foundationDoc && mongoose.Types.ObjectId.isValid(body[field])) {
            foundationDoc = await Foundation.findOne({
              _id: body[field],
              isActive: true
            });
          }
          
          if (!foundationDoc) {
            return NextResponse.json(
              { success: false, message: "Invalid foundation selection" },
              { status: 400 }
            );
          }
          
          updateData.foundation = foundationDoc._id;
          
          // Get foundation name for audit log
          const oldFoundation = await Foundation.findById(existingDonation.foundation);
          changes.push({
            field: 'foundation',
            oldValue: oldFoundation?.foundationName || existingDonation.foundation,
            newValue: foundationDoc.foundationName
          });
        } 
        // Special handling for date
        else if (field === 'date') {
          updateData.date = new Date(body[field]);
          changes.push({
            field: 'date',
            oldValue: existingDonation.date,
            newValue: updateData.date
          });
        }
        else {
          updateData[field] = body[field];
          changes.push({
            field,
            oldValue: existingDonation[field],
            newValue: body[field]
          });
        }
      }
    }

    // Only update if there are changes
    if (changes.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes detected",
        csrDonation: existingDonation
      });
    }

    // Add to audit log
    updateData.lastEditedBy = adminData.id;
    updateData.$push = {
      auditLog: {
        editedBy: adminData.id,
        editedAt: new Date(),
        changes
      }
    };

    // Update the donation
    const updatedDonation = await CSRDonation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('foundation', 'foundationName displayName code')
      .populate('createdBy', 'username email')
      .populate('lastEditedBy', 'username email')
      .populate('auditLog.editedBy', 'username email');

    return NextResponse.json({
      success: true,
      csrDonation: updatedDonation,
      message: "CSR donation updated successfully",
      changes
    });
  } catch (error) {
    console.error("Error updating CSR donation:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update CSR donation" },
      { status: 500 }
    );
  }
}

// DELETE - Delete CSR donation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const { id } = await params;

    // Check if CSR donation exists
    const csrDonation = await CSRDonation.findById(id);
    if (!csrDonation) {
      return NextResponse.json(
        { success: false, message: "CSR donation not found" },
        { status: 404 }
      );
    }

    // Delete the donation
    await CSRDonation.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "CSR donation deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting CSR donation:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to delete CSR donation" },
      { status: 500 }
    );
  }
}
