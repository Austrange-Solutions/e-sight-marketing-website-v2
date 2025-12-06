import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Product slug is required" },
        { status: 400 }
      );
    }

    // Try to find by slug first, fallback to _id for backward compatibility
    let product = await Product.findOne({ slug: id }).lean();
    
    if (!product) {
      // Fallback to _id if slug not found
      product = await Product.findById(id).lean();
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      product 
    });
  } catch (error) {
    console.error("[GET_PRODUCT_ERROR]", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch product" 
      },
      { status: 500 }
    );
  }
}
