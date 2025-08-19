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
    const { productId, stock } = body;

    if (!productId || stock === undefined) {
      return NextResponse.json(
        { error: "Product ID and stock are required" },
        { status: 400 }
      );
    }

    if (stock < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { 
        stock,
        status: stock === 0 ? 'out_of_stock' : 'active'
      },
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
      message: "Stock updated successfully",
      product: updatedProduct,
    });

  } catch (error: unknown) {
    console.error("Stock update error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update stock";
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 });
  }
}
