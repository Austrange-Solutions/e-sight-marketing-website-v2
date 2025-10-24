import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getAdminFromRequest } from "@/middleware/adminAuth";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();
    const db = mongoose.connection.db;

    // 1. Get all foundations
    const foundations = await db?.collection('foundations').find({}).toArray();
    
    // 2. Sample donations with foundation field
    const donations = await db?.collection('donations').find({}).limit(20).toArray();
    
    // 3. Foundation distribution
    const distribution = await db?.collection('donations').aggregate([
      {
        $group: {
          _id: '$foundation',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]).toArray();

    // 4. Count "general" donations
    const generalCount = await db?.collection('donations').countDocuments({ foundation: 'general' });

    // 5. Check VSF ID
    const vsfFoundation = foundations?.find((f: any) => f.code === 'vsf');
    const cfFoundation = foundations?.find((f: any) => f.code === 'cf');

    return NextResponse.json({
      success: true,
      data: {
        foundations: foundations?.map((f: any) => ({
          id: f._id.toString(),
          code: f.code,
          name: f.name
        })),
        cfExists: !!cfFoundation,
        cfData: cfFoundation ? {
          id: cfFoundation._id.toString(),
          code: cfFoundation.code,
          name: cfFoundation.name
        } : null,
        vsfId: vsfFoundation?._id.toString(),
        isVsfIdCorrect: vsfFoundation?._id.toString().toLowerCase() === '68f8e0a93ee0be3ef2450503',
        sampleDonations: donations?.map((d: any) => ({
          id: d._id.toString(),
          foundation: d.foundation,
          foundationType: typeof d.foundation,
          amount: d.amount,
          donorName: d.donorName
        })),
        foundationDistribution: distribution?.map((d: any) => ({
          foundationValue: d._id,
          foundationType: typeof d._id,
          count: d.count,
          total: d.total
        })),
        generalDonationsCount: generalCount
      }
    });

  } catch (error: any) {
    console.error("Error in check-foundations:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
