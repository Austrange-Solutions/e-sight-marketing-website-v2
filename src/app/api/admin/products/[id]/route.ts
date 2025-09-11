import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/middleware/adminAuth";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    
  const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Received update data:', body); // Debug log
    
    const {
      name,
      description,
      price,
      category,
      image,
      type,
      stock,
      status,
      details
    } = body;

    // Validate required fields with specific error messages (description and details are now optional)
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (price === undefined || price === null) missingFields.push('price');
    if (!category) missingFields.push('category');
    if (!image) missingFields.push('image');
    if (!type) missingFields.push('type');
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields); // Debug log
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate details array if provided (now optional)
    if (details && (!Array.isArray(details) || details.length > 8)) {
      return NextResponse.json(
        { error: "Details must be an array with maximum 8 items" },
        { status: 400 }
      );
    }

    // Get the existing product to preserve tax field
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description: description || "", // Default to empty string if not provided
        price,
        category,
        image,
        type,
        stock: stock || 0,
        status: status || 'active',
        details: details || [], // Default to empty array if not provided
        tax: existingProduct.tax, // Preserve existing tax
        updatedAt: new Date()
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
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error: unknown) {
    console.error("Product update error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    
  const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error: unknown) {
    console.error("Product delete error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete product";
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 });
  }
}
