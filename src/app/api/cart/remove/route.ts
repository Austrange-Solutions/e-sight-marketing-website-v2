// app/api/cart/remove/route.ts
import { connect } from "@/dbConfig/dbConfig";
import Cart from "@/models/cartModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function DELETE(request: NextRequest) {
  try {
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Find cart containing this item and remove it
    const cart = await Cart.findOneAndUpdate(
      { "items._id": itemId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    if (!cart) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error removing item';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}