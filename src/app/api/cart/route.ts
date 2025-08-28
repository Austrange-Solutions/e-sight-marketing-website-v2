import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Cart from "@/models/cartModel";
import Product from "@/models/productModel";
import { getUserFromToken } from "@/middleware/auth";
import mongoose from "mongoose";

// Type definitions for better TypeScript support
interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    image: string;
    status: string;
    stock: number;
  };
  quantity: number;
}

interface RawCartItem {
  productId: string;
  quantity: number;
}

interface PopulatedCart {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
  save: (options?: { session?: mongoose.ClientSession }) => Promise<PopulatedCart>;
}

interface RawCart {
  _id: string;
  userId: string;
  items: RawCartItem[];
  createdAt: Date;
  updatedAt: Date;
  save: (options?: { session?: mongoose.ClientSession }) => Promise<RawCart>;
}

interface ProductDocument {
  _id: string;
  name: string;
  price: number;
  image: string;
  status: string;
  stock: number;
}

// Connect to database
connect();

// GET - Fetch user's cart with populated product details
export async function GET(request: NextRequest) {
  try {
    const userData = await getUserFromToken(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await Cart.findOne({ userId: userData.id })
      .populate({
        path: 'items.productId',
        select: 'name price image stock status category'
      })
      .lean() as PopulatedCart | null;

    if (!cart) {
      return NextResponse.json({ items: [], totalItems: 0, totalAmount: 0 });
    }

    // Filter out items with deleted or inactive products
    const validItems = cart.items.filter((item: CartItem) => 
      item.productId && item.productId.status === 'active'
    );

    // Calculate totals
    const totalItems = validItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
    const totalAmount = validItems.reduce((sum: number, item: CartItem) => 
      sum + (item.quantity * item.productId.price), 0
    );

    return NextResponse.json({
      items: validItems,
      totalItems,
      totalAmount,
      cartId: cart._id
    });

  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST - Enhanced cart operations with proper error handling
export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  
  try {
    const userData = await getUserFromToken(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, productId, quantity = 1 } = await request.json();

    if (!action || !productId) {
      return NextResponse.json(
        { error: "Action and productId are required" },
        { status: 400 }
      );
    }

    // Validate quantity
    if (quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    // Use transaction for data consistency
    const result = await session.withTransaction(async () => {
      // Check product availability and get latest stock
      const product = await Product.findById(productId).session(session);
      if (!product) {
        throw new Error("Product not found");
      }

      if (product.status !== 'active') {
        throw new Error("Product is not available");
      }

      // Find or create cart
      let cart = await Cart.findOne({ userId: userData.id }).session(session);
      if (!cart) {
        cart = new Cart({ userId: userData.id, items: [] });
      }

      // Handle different actions
      switch (action) {
        case 'add':
          return await handleAddToCart(cart, product, quantity, session);
        
        case 'remove':
          return await handleRemoveFromCart(cart, productId, session);
        
        case 'update':
          return await handleUpdateQuantity(cart, product, quantity, session);
        
        default:
          throw new Error("Invalid action");
      }
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Cart operation error:", error);
    
    // Return specific error messages
    const errorMessage = error instanceof Error ? error.message : "Cart operation failed";
    const statusCode = getErrorStatusCode(errorMessage);
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  } finally {
    await session.endSession();
  }
}

// Helper function to add item to cart
async function handleAddToCart(cart: RawCart, product: ProductDocument, quantity: number, session: mongoose.ClientSession) {
  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item: RawCartItem) => item.productId.toString() === product._id.toString()
  );

  if (existingItemIndex !== -1) {
    // Update existing item
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    
    // Check stock availability
    if (newQuantity > product.stock) {
      throw new Error(`Only ${product.stock} items available. You currently have ${cart.items[existingItemIndex].quantity} in cart.`);
    }
    
    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item
    if (quantity > product.stock) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }
    
    cart.items.push({
      productId: product._id,
      quantity: quantity
    });
  }

  await cart.save({ session });
  
  // Return updated cart summary
  const totalItems = cart.items.reduce((sum: number, item: RawCartItem) => sum + item.quantity, 0);
  
  return {
    success: true,
    message: "Item added to cart successfully",
    totalItems,
    cartId: cart._id
  };
}

// Helper function to remove item from cart
async function handleRemoveFromCart(cart: RawCart, productId: string, session: mongoose.ClientSession) {
  const itemIndex = cart.items.findIndex(
    (item: RawCartItem) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw new Error("Item not found in cart");
  }

  cart.items.splice(itemIndex, 1);
  await cart.save({ session });

  const totalItems = cart.items.reduce((sum: number, item: RawCartItem) => sum + item.quantity, 0);

  return {
    success: true,
    message: "Item removed from cart successfully",
    totalItems,
    cartId: cart._id
  };
}

// Helper function to update item quantity
async function handleUpdateQuantity(cart: RawCart, product: ProductDocument, quantity: number, session: mongoose.ClientSession) {
  const itemIndex = cart.items.findIndex(
    (item: RawCartItem) => item.productId.toString() === product._id.toString()
  );

  if (itemIndex === -1) {
    throw new Error("Item not found in cart");
  }

  // Check stock availability
  if (quantity > product.stock) {
    throw new Error(`Only ${product.stock} items available in stock`);
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save({ session });

  const totalItems = cart.items.reduce((sum: number, item: RawCartItem) => sum + item.quantity, 0);

  return {
    success: true,
    message: "Cart updated successfully",
    totalItems,
    cartId: cart._id
  };
}

// Helper function to determine appropriate HTTP status code
function getErrorStatusCode(errorMessage: string): number {
  if (errorMessage.includes('not found')) return 404;
  if (errorMessage.includes('not available') || errorMessage.includes('stock')) return 400;
  if (errorMessage.includes('Unauthorized')) return 401;
  return 500;
}

// DELETE - Clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const userData = await getUserFromToken(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Cart.findOneAndDelete({ userId: userData.id });

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully"
    });

  } catch (error) {
    console.error("Cart clear error:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}