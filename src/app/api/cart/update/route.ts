// app/api/cart/update/route.ts
import { connect } from "@/dbConfig/dbConfig";
import Cart from "@/models/cartModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function PUT(request: NextRequest) {
  try {
    const { itemId, quantity } = await request.json();

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    // Find cart containing this item
    const cart = await Cart.findOne({ "items._id": itemId });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Update the quantity
    const itemIndex = cart.items.findIndex(
      (item: { _id: { toString: () => string; }; }) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error updating cart';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}