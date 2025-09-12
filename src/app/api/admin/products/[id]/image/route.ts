import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import { getAdminFromRequest } from "@/middleware/adminAuth";

// PATCH: Update product image (delete old, save new)
export async function PATCH(
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
    const { newImageUrl } = body;

    if (!newImageUrl) {
      return NextResponse.json(
        { error: "New image URL is required" },
        { status: 400 }
      );
    }

    // Get the existing product to check for old image
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete old image from S3 if it exists and is different
    if (existingProduct.image && existingProduct.image !== newImageUrl && existingProduct.image.includes('cloudfront.net')) {
      try {
        console.log('🗑️ DELETING old image from S3:', existingProduct.image);
        
        // Call the S3 delete endpoint internally
        const deleteImageResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aws/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cloudFrontUrl: existingProduct.image,
          }),
        });

        if (deleteImageResponse.ok) {
          const deleteResult = await deleteImageResponse.json();
          console.log('✅ SUCCESS: Old image deleted from S3 - Key:', deleteResult.s3Key);
        } else {
          const errorData = await deleteImageResponse.json();
          console.error('❌ FAILED to delete old image from S3:', errorData);
          // Don't return error here - continue with update even if old image deletion fails
          console.log('⚠️ WARNING: Continuing with image update despite deletion failure');
        }
      } catch (imageError) {
        console.error('❌ ERROR deleting old image:', imageError);
        // Don't return error here - continue with update even if old image deletion fails
        console.log('⚠️ WARNING: Continuing with image update despite deletion error');
      }
    }

    // Update product with new image URL
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        image: newImageUrl,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Failed to update product image" },
        { status: 500 }
      );
    }

    console.log('✅ Product image updated successfully');

    return NextResponse.json({
      success: true,
      message: existingProduct.image !== newImageUrl ? "Image updated successfully (old image deleted)" : "Image updated successfully",
      product: updatedProduct,
      oldImage: existingProduct.image,
      newImage: newImageUrl,
      imageChanged: existingProduct.image !== newImageUrl
    });

  } catch (error: unknown) {
    console.error("❌ Product image update error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update product image";
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 });
  }
}