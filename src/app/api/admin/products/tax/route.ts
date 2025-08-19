import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import { NextRequest, NextResponse } from "next/server";
import { getAdminFromToken } from "@/middleware/adminAuth";

export async function PATCH(request: NextRequest) {
  try {
    await connect();
    
    const adminData = getAdminFromToken(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, tax } = body;

    if (!productId || !tax) {
      return NextResponse.json(
        { error: "Product ID and tax are required" },
        { status: 400 }
      );
    }

    if (tax.value < 0) {
      return NextResponse.json(
        { error: "Tax value cannot be negative" },
        { status: 400 }
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { tax },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tax updated successfully",
      product: updatedProduct,
    });

  } catch (error: unknown) {
    console.error("Tax update error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update tax";
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 });
  }
}
