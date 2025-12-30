import { NextRequest, NextResponse } from "next/server";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Find all donations that need migration
    const donationsToUpdate = await Donation.find({
      $or: [
        { foundation: { $exists: false } },
        { foundation: null },
        { platformFee: { $exists: false } },
        { netAmount: { $exists: false } },
      ],
    });

    let updated = 0;
    let errors = 0;

    for (const donation of donationsToUpdate) {
      try {
        // Set default foundation if missing
        if (!donation.foundation) {
          donation.foundation = "general";
        }

        // Calculate platform fee if missing
        if (!donation.platformFee) {
          donation.platformFee = Math.round(donation.amount * 0.02 * 100) / 100;
        }

        // Note: netAmount field is deprecated - now using foundationAmount and companyAmount
        // if (!donation.netAmount) {
        //   const fee = donation.platformFee || Math.round(donation.amount * 0.02 * 100) / 100;
        //   donation.netAmount = Math.round((donation.amount - fee) * 100) / 100;
        // }

        await donation.save();
        updated++;
      } catch (error) {
        console.error("Error updating donation:", donation._id, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration complete: ${updated} donations updated, ${errors} errors`,
      updated,
      errors,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Migration failed",
      },
      { status: 500 }
    );
  }
}
