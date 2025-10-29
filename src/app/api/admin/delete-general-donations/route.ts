import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getAdminFromRequest } from "@/middleware/adminAuth";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();
    const db = mongoose.connection.db;

    // Count "general" donations before deletion
    const countBefore = await db?.collection('donations').countDocuments({ foundation: 'general' });
    
    if (countBefore === 0) {
      return NextResponse.json({
        success: true,
        message: "No 'general' foundation donations found",
        deletedCount: 0
      });
    }

    // Get details of donations to be deleted
    const donationsToDelete = await db?.collection('donations')
      .find({ foundation: 'general' })
      .toArray();

    // Calculate total amount
    const totalAmount = donationsToDelete?.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0;

    // Delete "general" foundation donations
    const deleteResult = await db?.collection('donations').deleteMany({ foundation: 'general' });

    // Also delete the "general" foundation from foundations collection if it exists
    const generalFoundation = await db?.collection('foundations').findOne({ code: 'general' });
    let foundationDeleted = false;
    
    if (generalFoundation) {
      await db?.collection('foundations').deleteOne({ code: 'general' });
      foundationDeleted = true;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult?.deletedCount} 'general' foundation donations`,
      deletedCount: deleteResult?.deletedCount,
      totalAmount: totalAmount,
      foundationDeleted: foundationDeleted,
      deletedDonations: donationsToDelete?.map((d: any) => ({
        id: d._id.toString(),
        donorName: d.donorName,
        amount: d.amount,
        date: d.createdAt
      }))
    });

  } catch (error: any) {
    console.error("Error deleting general donations:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
