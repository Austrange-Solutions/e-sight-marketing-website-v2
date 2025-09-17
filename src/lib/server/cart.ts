import { connect } from "@/dbConfig/dbConfig";
import { initializeModels } from "@/lib/initModels";

export interface ServerCartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  stock: number;
}

export async function getServerCart(userId: string): Promise<ServerCartItem[]> {
  try {
    await connect();
    await initializeModels();
    
    // Import models after ensuring connection and initialization
    const Cart = (await import('@/models/cartModel')).default;

    const cart = await Cart.findOne({ userId }).populate('items.productId').lean();

    if (!cart) {
      return [];
    }

    // Type assertion for Mongoose lean() result
    const cartData = cart as unknown as {
      items?: Array<{
        productId: {
          _id: { toString(): string };
          name: string;
          price: number;
          image: string;
          stock: number;
        };
        quantity: number;
      }>;
    };
    
    if (!cartData.items) {
      return [];
    }

    // Transform cart items to match client interface
    return cartData.items.map((item) => ({
      productId: item.productId._id.toString(),
      quantity: item.quantity,
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      stock: item.productId.stock || 0,
    }));
  } catch (error) {
    console.error('Failed to fetch server cart:', error);
    return [];
  }
}
