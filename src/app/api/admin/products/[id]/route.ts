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

    // Note: Image deletion is now handled by dedicated /image endpoint during file uploads
    // This PUT endpoint only handles manual image URL changes and other field updates

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

    // First, get the product to check if it has an image
    const productToDelete = await Product.findById(id);
    
    if (!productToDelete) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete the product from database
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { error: "Failed to delete product from database" },
        { status: 500 }
      );
    }

    // If product had an image, delete it from S3
    if (productToDelete.image && productToDelete.image.includes('cloudfront.net')) {
      try {
        console.log('Deleting associated image from S3:', productToDelete.image);
        
        // Call the S3 delete endpoint internally
        const deleteImageResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aws/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cloudFrontUrl: productToDelete.image,
          }),
        });

        if (deleteImageResponse.ok) {
          console.log('Successfully deleted associated image from S3');
        } else {
          const errorData = await deleteImageResponse.json();
          console.error('Failed to delete image from S3:', errorData);
          // Don't fail the whole operation if image deletion fails
        }
      } catch (imageError) {
        console.error('Error deleting associated image:', imageError);
        // Don't fail the whole operation if image deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product and associated image deleted successfully",
      deletedImage: productToDelete.image ? true : false
    });

  } catch (error: unknown) {
    console.error("Product delete error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete product";
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 });
  }
}
