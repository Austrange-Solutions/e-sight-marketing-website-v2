import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Product from "@/models/productModel";
import Order from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";
import { getAdminFromToken } from "@/middleware/adminAuth";

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const adminData = getAdminFromToken(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalUsers, totalProducts, totalOrders, revenueData] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}   