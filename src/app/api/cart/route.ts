// app/api/cart/route.ts
import { connect } from "@/dbConfig/dbConfig";
import Cart from "@/models/cartModel";
import Product from "@/models/productModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/middleware/auth";

connect();

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    // Get user from token instead of request body
    const userData = await getUserFromToken(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    // Validate input
    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Find user's cart or create one
    let cart = await Cart.findOne({ userId: userData.id });

    if (!cart) {
      cart = new Cart({ userId: userData.id, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item: { productId: { toString: () => string; }; }) => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity if already in cart
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error adding to cart';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  try {
    await connect();
    
    // Get user from token instead of query parameter
    const userData = await getUserFromToken(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await Cart.findOne({ userId: userData.id }).populate({
      path: "items.productId",
      model: "Product",
    });

    if (!cart) {
      return NextResponse.json({ cart: { items: [] } });
    }

    return NextResponse.json({ cart });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching cart';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}