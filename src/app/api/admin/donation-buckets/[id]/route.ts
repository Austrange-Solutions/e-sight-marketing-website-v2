import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import { getAdminFromRequest } from '@/middleware/adminAuth';
import DonationBucket from '@/models/DonationBucket';
import Product from '@/models/productModel';

export const runtime = 'nodejs';

// PATCH - Update donation bucket
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    const { id } = await params;
    const body = await request.json();
    const { name, description, products, bucketQuantity, isActive } = body;

    const bucket = await DonationBucket.findById(id);
    if (!bucket) {
      return NextResponse.json(
        { success: false, message: 'Bucket not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (name !== undefined) bucket.name = name;
    if (description !== undefined) bucket.description = description;
    if (bucketQuantity !== undefined) bucket.bucketQuantity = bucketQuantity;
    if (isActive !== undefined) bucket.isActive = isActive;

    // Update products if provided
    if (products && products.length > 0) {
      const bucketProducts = await Promise.all(
        products.map(async (p: { productId: string; quantity: number }) => {
          const product = await Product.findById(p.productId).lean();
          if (!product) {
            throw new Error(`Product ${p.productId} not found`);
          }

          return {
            productId: (product as any)._id,
            productName: (product as any).name,
            productPrice: (product as any).price,
            quantity: p.quantity,
            subtotal: (product as any).price * p.quantity,
          };
        })
      );
      bucket.products = bucketProducts;
    }

    bucket.lastEditedBy = (adminData as any).userId;
    await bucket.save();

    const updatedBucket = await DonationBucket.findById(bucket._id)
      .populate('foundation', 'foundationName code')
      .populate('products.productId', 'name price image')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Bucket updated successfully',
      bucket: updatedBucket,
    });
  } catch (error) {
    console.error('Error updating bucket:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update bucket',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete donation bucket
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    const { id } = await params;

    const bucket = await DonationBucket.findByIdAndDelete(id);
    if (!bucket) {
      return NextResponse.json(
        { success: false, message: 'Bucket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bucket deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting bucket:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete bucket' },
      { status: 500 }
    );
  }
}
