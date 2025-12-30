import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import Review from '@/models/reviewModel';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/authOptions';
import { getUserFromToken } from '@/middleware/auth';
import mongoose from 'mongoose';
import User from '@/models/userModel';
import { validateAndSanitize, validateAndSanitizeWithWordLimit } from '@/lib/validation/xss';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const { id } = await params;

    if (!id) return NextResponse.json({ error: 'Product id required' }, { status: 400 });

    // find product by slug or id
    let product = await Product.findOne({ slug: id }).lean();
    if (!product) product = await Product.findById(id).lean();
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Normalize product in case lean() returns an array type in TS definitions
    if (Array.isArray(product)) product = product[0];
    const productId = (product as any)?._id ?? (product as any)?.id ?? id;

    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('[GET_REVIEWS_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) 
{
  try {
    await connect();

    // Try NextAuth session first (preferred)
    const session = await getServerSession(authOptions);
    let userData: any = null;
    if (session && session.user && session.user.id) {
      userData = session.user;
    } else {
      // Fallback to legacy JWT token auth for compatibility
      try {
        const tokenUser = await getUserFromToken(request as any);
        if (tokenUser && tokenUser.id) userData = tokenUser;
      } catch (err) {
        console.warn('[REVIEWS_AUTH_FALLBACK_ERROR]', err);
      }
    }

    if (!userData || !userData.id) {
      console.warn('[POST_REVIEW_UNAUTHENTICATED] No session or token present');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve a valid Mongo ObjectId for the `user` field
    let userId: any = null;
    const candidateId = String(userData.id || '');
    if (mongoose.Types.ObjectId.isValid(candidateId)) {
      userId = new mongoose.Types.ObjectId(candidateId);
    } else if ((userData as any).email) {
      // Lookup by email to get the ObjectId
      const existingUser = await User.findOne({ email: (userData as any).email }).select('_id').lean();
      if (existingUser && (existingUser as any)._id) {
        userId = (existingUser as any)._id;
      }
    }

    if (!userId) {
      console.warn('[POST_REVIEW_INVALID_USER] Could not resolve ObjectId for user', { candidateId, email: (userData as any).email });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Product id required' }, { status: 400 });

    const body = await request.json();
    const { rating, comment } = body;

    // Basic validation
    if (!comment || String(comment).trim().length < 3) {
      return NextResponse.json({ error: 'Comment is too short' }, { status: 400 });
    }
    const parsedRating = Number(rating) || 0;
    if (parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }

    // Sanitize comment to prevent XSS
    let sanitizedComment: string;
    try {
      sanitizedComment = validateAndSanitizeWithWordLimit(String(comment).trim(), {
        fieldName: 'comment',
        maxWords: 150,
        strict: true,
      });
    } catch (validationError) {
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Invalid characters in comment' },
        { status: 400 }
      );
    }

    // find product by slug or id
    let product = await Product.findOne({ slug: id }).lean();
    if (!product) product = await Product.findById(id).lean();
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Normalize product in case lean() returns an array type in TS definitions
    if (Array.isArray(product)) product = product[0];
    const productId = (product as any)?._id ?? (product as any)?.id ?? id;

    const review = await Review.create({
      product: productId,
      user: userId,
      username: (userData as any).name || (userData as any).username || (userData as any).email || 'Anonymous',
      rating: Math.min(5, Math.max(1, parsedRating)),
      comment: sanitizedComment,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error('[POST_REVIEW_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();

    // Auth: NextAuth first, fallback to legacy token
    const session = await getServerSession(authOptions);
    let userData: any = null;
    if (session && session.user && session.user.id) {
      userData = session.user;
    } else {
      try {
        const tokenUser = await getUserFromToken(request as any);
        if (tokenUser && tokenUser.id) userData = tokenUser;
      } catch (err) {
        console.warn('[DELETE_REVIEW_AUTH_FALLBACK_ERROR]', err);
      }
    }

    if (!userData || !userData.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve ObjectId for user
    let userId: any = null;
    const candidateId = String(userData.id || '');
    if (mongoose.Types.ObjectId.isValid(candidateId)) {
      userId = new mongoose.Types.ObjectId(candidateId);
    } else if ((userData as any).email) {
      const existingUser = await User.findOne({ email: (userData as any).email }).select('_id').lean();
      if (existingUser && (existingUser as any)._id) {
        userId = (existingUser as any)._id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Product id required' }, { status: 400 });

    const body = await request.json();
    const { reviewId } = body;
    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json({ error: 'Invalid review id' }, { status: 400 });
    }

    // Ensure product exists (slug or id)
    let product = await Product.findOne({ slug: id }).lean();
    if (!product) product = await Product.findById(id).lean();
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (Array.isArray(product)) product = product[0];
    const productId = (product as any)?._id ?? (product as any)?.id ?? id;

    const review = await Review.findById(reviewId);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    // Verify ownership and product match
    if (String(review.user) !== String(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (String(review.product) !== String(productId)) {
      return NextResponse.json({ error: 'Invalid product for this review' }, { status: 400 });
    }

    await Review.findByIdAndDelete(reviewId);

    return NextResponse.json({ success: true, message: 'Review deleted' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE_REVIEW_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
