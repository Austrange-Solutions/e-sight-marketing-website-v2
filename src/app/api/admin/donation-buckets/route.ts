import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import { getAdminFromRequest } from '@/middleware/adminAuth';
import DonationBucket from '@/models/DonationBucket';
import Product from '@/models/productModel';
import Foundation from '@/models/Foundation';

export const runtime = 'nodejs';

// GET - List all donation buckets
export async function GET(request: NextRequest) {
  try {
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    const buckets = await DonationBucket.find()
      .populate('foundation', 'foundationName code')
      .populate('products.productId', 'name price image stock')
      .populate('createdBy', 'username')
      .populate('lastEditedBy', 'username')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      buckets,
    });
  } catch (error) {
    console.error('Error fetching donation buckets:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch buckets' },
      { status: 500 }
    );
  }
}

// POST - Create new donation bucket
export async function POST(request: NextRequest) {
  try {
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    const body = await request.json();
    const { 
      name, 
      description, 
      foundation, 
      products, 
      bucketQuantity,
      poolAllocationPercent,
      bucketFillPercent,
      isActive
    } = body;

    // Validation
    if (!name || !products || products.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: name and products are required' },
        { status: 400 }
      );
    }

    // Verify foundation if provided (optional now)
    if (foundation) {
      const foundationDoc = await Foundation.findById(foundation);
      if (!foundationDoc) {
        return NextResponse.json(
          { success: false, message: 'Foundation not found' },
          { status: 404 }
        );
      }
    }

    // Fetch product details and build products array
    const bucketProducts = await Promise.all(
      products.map(async (p: { productId: string; quantity: number }) => {
        const product = await Product.findById(p.productId).lean() as any;
        if (!product) {
          throw new Error(`Product ${p.productId} not found`);
        }

        return {
          productId: product._id,
          productName: product.name,
          productPrice: product.price,
          quantity: p.quantity,
          subtotal: product.price * p.quantity,
        };
      })
    );

    // Create bucket
    const bucket = await DonationBucket.create({
      name,
      description: description || '',
      foundation: foundation || undefined, // Optional foundation
      products: bucketProducts,
      bucketQuantity: bucketQuantity || 1,
      poolAllocationPercent: poolAllocationPercent || 0,
      bucketFillPercent: bucketFillPercent !== undefined ? bucketFillPercent : 100,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: adminData.id,
    });

    const populatedBucket = await DonationBucket.findById(bucket._id)
      .populate('foundation', 'foundationName code')
      .populate('products.productId', 'name price image')
      .populate('createdBy', 'username')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Donation bucket created successfully',
      bucket: populatedBucket,
    });
  } catch (error) {
    console.error('Error creating donation bucket:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create bucket',
      },
      { status: 500 }
    );
  }
}
