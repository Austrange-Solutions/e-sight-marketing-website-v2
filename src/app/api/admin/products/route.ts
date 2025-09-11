import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/middleware/adminAuth";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const products = await Product.find({});
    return NextResponse.json({ products }, { status: 200 });
  } catch (error: unknown) {
    console.error("Product fetch error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    
  const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received create data:', body); // Debug log
    
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

    // Create new product (with optional description and details)
    const newProduct = new Product({
      name,
      description: description || "", // Default to empty string if not provided
      price,
      category,
      image,
      type,
      stock: stock || 0,
      status: status || 'active',
      details: details || [], // Default to empty array if not provided
      tax: { type: 'percentage', value: 18, label: 'GST (18%)' }, // Default tax
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedProduct = await newProduct.save();

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product: savedProduct
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("Product create error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 });
  }
}
