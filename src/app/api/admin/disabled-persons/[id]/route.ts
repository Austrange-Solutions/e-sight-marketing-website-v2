import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { connect as __ensureConnect } from "@/dbConfig/dbConfig";
import DisabledPerson from "@/models/disabledPersonModel";
import { getAdminFromRequest } from "@/middleware/adminAuth";
import { sendDisabledStatusUpdateEmail } from "@/helpers/resendEmail";
import mongoose from "mongoose";

// GET - Get individual disabled person details (Admin only)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await __ensureConnect();
  try {
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const person = await DisabledPerson.findById(id).lean();

    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, person }, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to fetch person details:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch data";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PATCH - Update verification status (Admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await __ensureConnect();
  try {
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();

    // Allow admins to update several groups of fields: personal, guardian, address, disability, and status
    const {
      verificationStatus,
      adminNotes,
      rejectionReason,
      personalUpdates,
      guardianUpdates,
      addressUpdates,
      disabilityUpdates,
    } = body;

    const validStatuses = ["pending", "under_review", "verified", "rejected"];
    if (verificationStatus && !validStatuses.includes(verificationStatus)) {
      return NextResponse.json({ error: "Invalid verification status" }, { status: 400 });
    }

    const person = await DisabledPerson.findById(id);
    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    // Apply personal updates
    if (personalUpdates) {
      const allowed = ["fullName", "email", "phone", "dateOfBirth", "gender", "alternatePhone"];
      allowed.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(personalUpdates, key)) {
          // @ts-ignore
          person[key] = personalUpdates[key];
        }
      });
    }

    // Apply guardian updates
    if (guardianUpdates) {
      const gAllowed = ["guardianName", "guardianEmail", "guardianPhone", "guardianRelation"];
      gAllowed.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(guardianUpdates, key)) {
          // @ts-ignore
          person[key] = guardianUpdates[key];
        }
      });
    }

    // Apply address updates
    if (addressUpdates) {
      const aAllowed = ["address", "addressLine2", "city", "state", "pincode"];
      aAllowed.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(addressUpdates, key)) {
          // @ts-ignore
          person[key] = addressUpdates[key];
        }
      });
    }

    // Apply disability updates
    if (disabilityUpdates) {
      const dAllowed = ["disabilityType", "disabilityPercentage", "disabilityDescription", "medicalConditions", "assistiveDevicesUsed"];
      dAllowed.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(disabilityUpdates, key)) {
          // @ts-ignore
          person[key] = disabilityUpdates[key];
        }
      });
    }

    // Update status if provided
    if (verificationStatus) {
      person.verificationStatus = verificationStatus;
    }
    if (adminNotes) person.adminNotes = adminNotes;
    if (rejectionReason) person.rejectionReason = rejectionReason;

    // Add to verification history when status changed
    if (verificationStatus) {
      person.verificationHistory.push({
        status: verificationStatus,
        updatedBy: adminData.username || adminData.email,
        updatedAt: new Date(),
        comments: adminNotes || rejectionReason,
      });
    }

    await person.save();

    // Send email notification
    try {
      if (verificationStatus !== "pending") {
        await sendDisabledStatusUpdateEmail(
          person.email,
          person.fullName,
          person._id.toString(),
          verificationStatus as "under_review" | "verified" | "rejected",
          adminNotes || rejectionReason,
          person.guardianEmail
        );
      }
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
      // Don't fail the update if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Status updated successfully",
        person,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Failed to update status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update status";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
