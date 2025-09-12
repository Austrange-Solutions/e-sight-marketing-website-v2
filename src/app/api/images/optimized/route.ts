/**
 * Optimized Image Upload API - Stores CloudFront URLs directly in products
 * This approach eliminates the need for the UploadedImage collection
 */

import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import { getAdminFromRequest } from "@/middleware/adminAuth";

// POST: Upload image and get CloudFront URL (for new products)
export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { file, filename, fileType, productId } = body;

    if (!file || !filename) {
      return NextResponse.json(
        { error: "File and filename are required" },
        { status: 400 }
      );
    }

    // Upload to S3/CloudFront (call your existing AWS upload API)
    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aws/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file,
        filename,
        fileType,
        folder: 'products' // organize images in folders
      }),
    });

    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.json();
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.error}` },
        { status: 500 }
      );
    }

    const uploadResult = await uploadResponse.json();
    const cloudFrontUrl = uploadResult.cloudFrontUrl;

    // If productId is provided, update the product directly
    if (productId) {
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          image: cloudFrontUrl,
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

      console.log(`✅ Product ${productId} image updated with CloudFront URL: ${cloudFrontUrl}`);
      
      return NextResponse.json({
        success: true,
        message: "Image uploaded and product updated successfully",
        cloudFrontUrl,
        product: updatedProduct,
        uploadDetails: {
          s3Key: uploadResult.s3Key,
          filename: uploadResult.filename,
          fileSize: uploadResult.fileSize
        }
      });
    }

    // If no productId, just return the CloudFront URL for later use
    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      cloudFrontUrl,
      uploadDetails: {
        s3Key: uploadResult.s3Key,
        filename: uploadResult.filename,
        fileSize: uploadResult.fileSize
      }
    });

  } catch (error: unknown) {
    console.error("❌ Optimized image upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 });
  }
}

// GET: Get product image URL (for frontend use)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    await connect();
    
    const params = await context.params;
    const { productId } = params;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId, 'name image');
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      productName: product.name,
      imageUrl: product.image,
      hasImage: !!product.image
    });

  } catch (error: unknown) {
    console.error("❌ Get product image error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get product image";
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 });
  }
}