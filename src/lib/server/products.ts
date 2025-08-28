import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import mongoose from "mongoose";

export interface ServerProduct {
  _id: string;
  name: string;
  image: string;
  description: string;
  type?: 'basic' | 'pro' | 'max';
  price: number;
  details?: string[];
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  category: string;
}

// Helper function to check connection health
async function ensureHealthyConnection() {
  if (mongoose.connection.readyState !== 1) {
    console.log('Connection not ready, attempting to reconnect...');
    await connect();
  }
}

export async function getProducts(): Promise<ServerProduct[]> {
  const maxRetries = 2;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await ensureHealthyConnection();
      
      // Add timeout to the query itself with shorter timeout for faster failure
      const products = await Product.find({})
        .lean()
        .maxTimeMS(8000) // 8 second timeout for the query (reduced from 10s)
        .exec();
      
      // Convert MongoDB documents to plain objects
      return products.map((product: Record<string, unknown>) => ({
        _id: (product._id as mongoose.Types.ObjectId).toString(),
        name: product.name as string,
        image: product.image as string,
        description: (product.description as string) || '',
        type: product.type as 'basic' | 'pro' | 'max' | undefined,
        price: product.price as number,
        details: (product.details as string[]) || [],
        stock: (product.stock as number) || 0,
        status: (product.status as 'active' | 'inactive' | 'out_of_stock') || 'active',
        category: (product.category as string) || 'general'
      }));
    } catch (error) {
      lastError = error;
      console.error(`Failed to fetch products (attempt ${attempt}/${maxRetries}):`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        attempt: attempt
      });
      
      // If not the last attempt, wait a bit before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }
  }

  // Log final error after all retries failed
  console.error('All product fetch attempts failed:', {
    message: lastError instanceof Error ? lastError.message : 'Unknown error',
    name: lastError instanceof Error ? lastError.name : 'Unknown',
    stack: lastError instanceof Error ? lastError.stack : 'No stack trace',
    error: lastError
  });
  
  // Return empty array as fallback
  return [];
}
