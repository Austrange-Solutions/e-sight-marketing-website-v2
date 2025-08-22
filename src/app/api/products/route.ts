import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";

export async function GET() {
  try {
    await connect();

    const products = await Product.find({}).lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("[GET_PRODUCTS_ERROR]", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const reqBody = await request.json();
    const { name, image, description, type, price, details, stock, category, tax } = reqBody;

    // Validate required fields (description and details are now optional)
    if (!name || !image || !type || !price) {
      return NextResponse.json(
        { error: "Name, image, type, and price are required" },
        { status: 400 }
      );
    }

    // Validate details array if provided
    if (details && (!Array.isArray(details) || details.length > 8)) {
      return NextResponse.json(
        { error: "Details must be an array with maximum 8 items" },
        { status: 400 }
      );
    }

    // Create new product with enhanced fields
    const newProduct = new Product({
      name,
      image,
      description,
      type,
      price,
      details,
      stock: stock || 0,
      category: category || 'Other',
      tax: tax || { type: '0%', value: 0, label: 'No Tax' }
    });

    const savedProduct = await newProduct.save();
    
    return NextResponse.json(savedProduct, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connect(); // Make sure this is included

    const reqBody = await request.json();
    const { _id, name, image, description, type, price, details, stock, category, tax } = reqBody;

    // Validate required fields (description and details are now optional)
    if (!_id || !name || !image || !type || !price) {
      return NextResponse.json(
        { error: "ID, name, image, type, and price are required" },
        { status: 400 }
      );
    }

    // Validate details array if provided
    if (details && (!Array.isArray(details) || details.length > 8)) {
      return NextResponse.json(
        { error: "Details must be an array with maximum 8 items" },
        { status: 400 }
      );
    }

    // Prepare update object
    const updateData: Record<string, unknown> = {
      name,
      image,
      description,
      type,
      price,
      details
    };

    // Add optional fields if provided
    if (stock !== undefined) updateData.stock = stock;
    if (category) updateData.category = category;
    if (tax) updateData.tax = tax;

    // Find and update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true } // Added runValidators
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    console.error("[PUT_PRODUCTS_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connect(); // Make sure this is included

    const reqBody = await request.json();
    const { _id } = reqBody;

    if (!_id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the product
    const deletedProduct = await Product.findByIdAndDelete(_id);

    if (!deletedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[DELETE_PRODUCTS_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}